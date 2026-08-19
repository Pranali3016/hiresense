import re
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)


def calculate_skills_score(resume_skills: list, required_skills: list) -> dict:
    if not required_skills:
        return {"score": 50, "matched": [], "missing": []}
    resume_skills_lower = [s.lower() for s in resume_skills]
    matched = []
    missing = []
    for skill in required_skills:
        if skill.lower() in resume_skills_lower:
            matched.append(skill)
        else:
            missing.append(skill)
    score = (len(matched) / len(required_skills)) * 100
    return {"score": round(score, 1), "matched": matched, "missing": missing}


def calculate_experience_score(candidate_years: int, required_years: int, seniority: str) -> dict:
    if seniority == "junior" and candidate_years == 0:
        return {"score": 75, "note": "Entry level role - fresher eligible"}
    if required_years == 0:
        return {"score": 70, "note": "No specific experience requirement"}
    if candidate_years >= required_years:
        return {"score": 100, "note": f"Meets {required_years} year requirement"}
    elif candidate_years >= required_years * 0.6:
        score = (candidate_years / required_years) * 100
        return {"score": round(score), "note": "Slightly below requirement"}
    else:
        return {"score": 40, "note": "Below experience requirement"}


def calculate_overall_score(skills_score: float, experience_score: float) -> float:
    weighted = (skills_score * 0.70) + (experience_score * 0.30)
    return round(weighted, 1)


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=1, max=3),
    retry=retry_if_exception_type(Exception),
    reraise=True
)
def _invoke_groq_chain(chain, payload: dict) -> str:
    return chain.invoke(payload)


def generate_explanation_with_groq(
    resume_data: dict,
    jd_data: dict,
    matched_skills: list,
    missing_skills: list,
    overall_score: float
) -> str:
    """
    Generate an AI score explanation using Groq LLM.
    Protected with a 15-second timeout, 2 retries on transient network errors,
    and a reliable rule-based fallback if the API is unavailable.
    """
    if not settings.groq_api_key or settings.groq_api_key.startswith("your_"):
        return generate_rule_based_explanation(jd_data, matched_skills, missing_skills, overall_score)

    groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
    prompt = PromptTemplate(
        input_variables=["job_title", "overall_score", "matched_skills", "missing_skills", "experience_years", "required_experience"],
        template="""You are an expert career advisor helping a job seeker understand their resume match.

Job Role: {job_title}
Overall Match Score: {overall_score}/100
Matched Skills: {matched_skills}
Missing Skills: {missing_skills}
Candidate Experience: {experience_years} years
Required Experience: {required_experience} years

Write a 3-4 sentence analysis that:
1. States the overall match score, using EXACTLY {overall_score} as given above -- do not calculate, estimate, or state a different number
2. Highlights the strongest matching skills
3. Points out the most critical missing skills
4. Gives one specific actionable tip to improve the score

Be direct, encouraging, and specific. Write in paragraph form. No bullet points. You must use the exact score {overall_score} provided -- never invent or recompute your own score."""
    )

    for model_name in groq_models:
        try:
            llm = ChatGroq(
                model=model_name,
                api_key=settings.groq_api_key,
                temperature=0.3,
                request_timeout=12.0,
                max_retries=1
            )
            chain = prompt | llm | StrOutputParser()
            explanation = _invoke_groq_chain(chain, {
                "job_title": jd_data.get("job_title", "this role")[:60],
                "overall_score": overall_score,
                "matched_skills": ", ".join(matched_skills[:8]) if matched_skills else "none",
                "missing_skills": ", ".join(missing_skills[:5]) if missing_skills else "none",
                "experience_years": resume_data.get("experience_years", 0),
                "required_experience": jd_data.get("required_experience_years", 0)
            })
            explanation = explanation.strip()
            explanation = re.sub(r'\d+(\.\d+)?\s*/\s*100', f'{overall_score}/100', explanation)
            return explanation
        except Exception as e:
            logger.warning(f"Groq explanation ({model_name}) failed: {e}")
            continue

    return generate_rule_based_explanation(jd_data, matched_skills, missing_skills, overall_score)


def generate_rule_based_explanation(
    jd_data: dict,
    matched_skills: list,
    missing_skills: list,
    overall_score: float
) -> str:
    job_title = jd_data.get("job_title", "this role")[:50]
    top_matched = matched_skills[:3]
    top_missing = missing_skills[:3]
    if overall_score >= 80:
        opening = f"You are a strong match for {job_title} with a score of {overall_score}/100."
    elif overall_score >= 60:
        opening = f"You are a good match for {job_title} with a score of {overall_score}/100."
    elif overall_score >= 40:
        opening = f"You are a partial match for {job_title} with a score of {overall_score}/100."
    else:
        opening = f"You have a low match for {job_title} with a score of {overall_score}/100."
    strength = f"Your strongest assets are {', '.join(top_matched)}." if top_matched else ""
    gap = f"The most important skills to build are {', '.join(top_missing)}." if top_missing else "You have covered all required skills."
    tip = f"Start with {missing_skills[0]} first — it will give you the highest return on learning time." if missing_skills else "Polish your resume bullet points to highlight measurable impact."
    return f"{opening} {strength} {gap} {tip}"


def get_verdict(score: float) -> str:
    if score >= 80:
        return "Strong Match - Apply immediately"
    elif score >= 60:
        return "Good Match - Worth applying"
    elif score >= 40:
        return "Partial Match - Build missing skills first"
    else:
        return "Low Match - Significant skill gaps to address"


def score_resume_against_jd(resume_data: dict, jd_data: dict) -> dict:
    skills_result = calculate_skills_score(
        resume_data.get("skills", []),
        jd_data.get("required_skills", [])
    )
    experience_result = calculate_experience_score(
        resume_data.get("experience_years", 0),
        jd_data.get("required_experience_years", 0),
        jd_data.get("seniority_level", "mid")
    )
    overall_score = calculate_overall_score(skills_result["score"], experience_result["score"])
    explanation = generate_explanation_with_groq(
        resume_data,
        jd_data,
        skills_result["matched"],
        skills_result["missing"],
        overall_score
    )
    return {
        "overall_score": overall_score,
        "skills_score": skills_result["score"],
        "experience_score": experience_result["score"],
        "matched_skills": skills_result["matched"],
        "missing_skills": skills_result["missing"],
        "experience_note": experience_result["note"],
        "explanation": explanation,
        "verdict": get_verdict(overall_score)
    }
