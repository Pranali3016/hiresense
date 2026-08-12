import json
import logging
import re
from typing import List, Dict, Any, Optional
import httpx
from groq import Groq
from google import genai
from google.genai import types
from app.core.config import settings

logger = logging.getLogger(__name__)


# -------------------------------------------------------------
# Dedicated Free Multi-LLM Callers
# -------------------------------------------------------------

def _call_cerebras_llm(prompt: str, json_mode: bool = True, max_tokens: int = 1500) -> Optional[str]:
    """Execute LLM call using Cerebras Cloud (llama3.1-70b / llama3.1-8b) - 1M free tokens/day."""
    if not settings.cerebras_api_key or settings.cerebras_api_key.startswith("your_"):
        return None
    for model_name in ["llama3.1-70b", "llama3.1-8b", "llama-3.3-70b"]:
        try:
            headers = {
                "Authorization": f"Bearer {settings.cerebras_api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "You are HireSense Enterprise Recruiter AI, an expert technical hiring advisor and talent intelligence engine."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"} if json_mode else None,
                "temperature": 0.2,
                "max_tokens": max_tokens
            }
            with httpx.Client(timeout=15.0) as client:
                resp = client.post("https://api.cerebras.ai/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                elif resp.status_code == 404:
                    continue  # Try next model
                else:
                    logger.warning(f"[Cerebras LLM] HTTP {resp.status_code}: {resp.text}")
                    return None
        except Exception as e:
            logger.warning(f"[Cerebras LLM] Call failed on {model_name}: {e}")
            continue
    return None


def _call_openrouter_llm(prompt: str, json_mode: bool = True, max_tokens: int = 1500) -> Optional[str]:
    """Execute LLM call using OpenRouter Free Models (deepseek-r1:free, llama-3.2-3b:free)."""
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("your_"):
        return None
    for model_slug in [
        "deepseek/deepseek-r1:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "qwen/qwen-2.5-coder-32b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free"
    ]:
        try:
            headers = {
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://hiresense.ai",
                "X-Title": "HireSense Recruiter"
            }
            payload = {
                "model": model_slug,
                "messages": [
                    {"role": "system", "content": "You are HireSense Enterprise Recruiter AI, an expert technical hiring advisor and talent intelligence engine."},
                    {"role": "user", "content": prompt}
                ],
                "response_format": {"type": "json_object"} if json_mode else None,
                "temperature": 0.2,
                "max_tokens": max_tokens
            }
            with httpx.Client(timeout=20.0) as client:
                resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                elif resp.status_code in [404, 400]:
                    continue  # Try next free model slug
                else:
                    logger.warning(f"[OpenRouter LLM] HTTP {resp.status_code}: {resp.text}")
                    return None
        except Exception as e:
            logger.warning(f"[OpenRouter LLM] Call failed on {model_slug}: {e}")
            continue
    return None


def _call_sambanova_llm(prompt: str, json_mode: bool = True, max_tokens: int = 1500) -> Optional[str]:
    """Execute LLM call using SambaNova Cloud (Meta-Llama-3.3-70B-Instruct)."""
    if not settings.sambanova_api_key or settings.sambanova_api_key.startswith("your_"):
        return None
    try:
        headers = {
            "Authorization": f"Bearer {settings.sambanova_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "Meta-Llama-3.3-70B-Instruct",
            "messages": [
                {"role": "system", "content": "You are HireSense Enterprise Recruiter AI, an expert technical hiring advisor and talent intelligence engine."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"} if json_mode else None,
            "temperature": 0.2,
            "max_tokens": max_tokens
        }
        with httpx.Client(timeout=20.0) as client:
            resp = client.post("https://api.sambanova.ai/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.warning(f"[SambaNova LLM] HTTP {resp.status_code}: {resp.text}")
                return None
    except Exception as e:
        logger.warning(f"[SambaNova LLM] Call failed: {e}")
        return None


def _call_groq_llm(prompt: str, json_mode: bool = True, max_tokens: int = 1500) -> Optional[str]:
    """Execute LLM call using Groq (llama-3.3-70b-versatile)."""
    if not settings.groq_api_key or settings.groq_api_key.startswith("your_"):
        return None
    try:
        client = Groq(api_key=settings.groq_api_key, timeout=20.0, max_retries=2)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are HireSense Enterprise Recruiter AI, an expert technical hiring advisor and talent intelligence engine."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"} if json_mode else None,
            temperature=0.3,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"[Groq LLM] Call failed: {e}")
        return None


def _call_gemini_llm(prompt: str, json_mode: bool = True) -> Optional[str]:
    """Fallback LLM call using Gemini Flash."""
    api_key = settings.gemini_api_key or settings.google_api_key
    if not api_key or api_key.startswith("your_"):
        return None
    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            response_mime_type="application/json" if json_mode else "text/plain",
            temperature=0.3
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=config
        )
        return response.text.strip()
    except Exception as e:
        logger.warning(f"[Gemini LLM] Call failed: {e}")
        return None


def _execute_recruiter_router(prompt: str, priority: str = "cerebras", json_mode: bool = True, max_tokens: int = 1500) -> Optional[str]:
    """
    Ultra-fast intelligent routing across distinct free LLM providers:
    Priority: Groq (0.4s) -> Cerebras (0.3s) -> Gemini (0.8s) -> OpenRouter -> Rule Engine
    """
    callers = {
        "groq": lambda: _call_groq_llm(prompt, json_mode, max_tokens),
        "cerebras": lambda: _call_cerebras_llm(prompt, json_mode, max_tokens),
        "gemini": lambda: _call_gemini_llm(prompt, json_mode),
        "openrouter": lambda: _call_openrouter_llm(prompt, json_mode, max_tokens),
        "sambanova": lambda: _call_sambanova_llm(prompt, json_mode, max_tokens)
    }

    # Fast priority order ensuring sub-second response
    if priority == "groq":
        order = ["groq", "cerebras", "gemini", "openrouter"]
    elif priority == "cerebras":
        order = ["cerebras", "groq", "gemini", "openrouter"]
    elif priority == "openrouter":
        order = ["groq", "openrouter", "cerebras", "gemini"]
    else:
        order = ["groq", "cerebras", "gemini", "openrouter"]
    
    for provider in order:
        try:
            res = callers[provider]()
            if res:
                return res
        except Exception:
            continue
    return None


# -------------------------------------------------------------
# 1. AI Smart Job Description Builder & Optimizer (Priority: Cerebras)
# -------------------------------------------------------------

def generate_smart_jd(job_title: str, experience_level: str = "Mid-Level", industry: str = "Technology", raw_notes: str = "") -> dict:
    """Generate structured, high-conversion Job Description with Must-Have and Nice-to-Have skills."""
    prompt = f"""
You are an expert Chief People Officer and Technical Talent Recruiter.
Create a high-impact, realistic Job Description based on these parameters:
- Job Title: "{job_title}"
- Target Experience Level: "{experience_level}"
- Industry / Domain: "{industry}"
- Custom Notes / Must-Haves: "{raw_notes or 'Standard industry best practices'}"

Return ONLY valid JSON with this exact schema:
{{
  "job_title": "{job_title}",
  "experience_level": "{experience_level}",
  "summary": "<2-3 sentence executive summary of role and impact>",
  "responsibilities": ["<responsibility 1>", "<responsibility 2>", "<responsibility 3>", "<responsibility 4>", "<responsibility 5>"],
  "must_have_skills": ["<core tech skill 1>", "<core tech skill 2>", "<core tech skill 3>", "<core tech skill 4>", "<core tech skill 5>"],
  "nice_to_have_skills": ["<bonus skill 1>", "<bonus skill 2>", "<bonus skill 3>"],
  "estimated_salary_range": "<Realistic compensation benchmark, e.g. ₹15 - ₹28 LPA or $120k - $160k>",
  "ats_realism_score": 95,
  "formatted_jd_text": "<Full clean text ready to paste into job portals>"
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="cerebras", json_mode=True)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "summary" in data and "responsibilities" in data:
                return data
        except Exception:
            pass

    # Deterministic High-Quality Fallback
    title_clean = job_title.strip().title() or "Software Engineer"
    must_haves = ["Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "Git"]
    if "frontend" in title_clean.lower() or "react" in title_clean.lower():
        must_haves = ["React", "TypeScript", "JavaScript", "Tailwind CSS", "Redux/Zustand", "HTML/CSS"]
    elif "data" in title_clean.lower() or "ai" in title_clean.lower() or "ml" in title_clean.lower():
        must_haves = ["Python", "SQL", "Pandas", "Scikit-Learn", "Machine Learning", "PyTorch"]

    return {
        "job_title": title_clean,
        "experience_level": experience_level,
        "summary": f"We are seeking a talented {title_clean} ({experience_level}) to join our engineering team. You will lead development of scalable features, collaborate cross-functionally, and deliver mission-critical software solutions.",
        "responsibilities": [
            f"Design, build, and maintain production-grade modules for our core {industry} applications.",
            "Write clean, maintainable, and well-tested code following modern architectural best practices.",
            "Collaborate with product managers, designers, and engineering teammates to scope and deliver sprint goals.",
            "Conduct thorough code reviews and mentor junior developers on engineering excellence.",
            "Optimize application performance, scalability, and security across the deployment lifecycle."
        ],
        "must_have_skills": must_haves,
        "nice_to_have_skills": ["Kubernetes", "AWS Cloud", "CI/CD Pipelines", "GraphQL", "Microservices"],
        "estimated_salary_range": "₹12 - ₹24 LPA (Commensurate with experience)",
        "ats_realism_score": 92,
        "formatted_jd_text": f"""Job Title: {title_clean}
Experience Level: {experience_level}
Industry: {industry}

Role Overview:
We are looking for an exceptional {title_clean} to design, implement, and optimize scalable software systems.

Key Responsibilities:
- Build and maintain core application features and public APIs.
- Deliver test-driven, maintainable, and high-performance code.
- Collaborate with agile cross-functional teams.

Required Technical Skills:
{', '.join(must_haves)}

Nice-to-Have Skills:
Kubernetes, AWS Cloud, CI/CD Pipelines, GraphQL"""
    }


# -------------------------------------------------------------
# 2. Gap-Targeted Interview Questions Generator (Priority: SambaNova)
# -------------------------------------------------------------

def generate_gap_targeted_questions(
    candidate_name: str,
    matched_skills: List[str],
    missing_skills: List[str],
    job_title: str,
    job_description: str
) -> dict:
    """Generate technical & behavioral questions probing the candidate's exact skill gaps."""
    if not missing_skills:
        missing_skills = ["System Architecture", "Production Scaling", "Error Handling"]

    missing_str = ", ".join(missing_skills[:6])
    matched_str = ", ".join(matched_skills[:8])

    prompt = f"""
You are an expert Technical Interviewer and Hiring Bar Raiser for the role of "{job_title}".
Candidate Name: {candidate_name}
Matched Skills: [{matched_str}]
Identified Missing Skills / Gaps: [{missing_str}]
Job Context: {job_description[:600]}

Generate 5 deeply targeted technical and architectural interview questions specifically designed to PROBE their MISSING SKILLS ({missing_str}) to assess if they can quickly ramp up, understand core principles, or have transferable fundamentals.

Return ONLY valid JSON with this exact structure:
{{
  "candidate_name": "{candidate_name}",
  "target_role": "{job_title}",
  "probed_gaps": {json.dumps(missing_skills[:6])},
  "questions": [
    {{
      "gap_targeted": "<Missing skill name>",
      "question": "<Deep, practical interview question>",
      "why_ask_this": "<Recruiter tip on what this question uncovers>",
      "expected_good_answer": "<Key concepts and signals of a strong candidate>",
      "red_flags": "<Warning signs, superficial buzzwords, or poor practices to watch out for>"
    }}
  ]
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="sambanova", json_mode=True, max_tokens=1800)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "questions" in data and isinstance(data["questions"], list) and len(data["questions"]) > 0:
                return data
        except Exception:
            pass

    # High quality fallback
    questions = []
    for gap in missing_skills[:5]:
        gap_clean = gap.strip().title()
        questions.append({
            "gap_targeted": gap_clean,
            "question": f"Given your strong foundation in {matched_str[:30] or 'software development'}, how have you approached picking up or working with {gap_clean} in practical scenarios, and how would you apply it here?",
            "why_ask_this": f"Tests whether the candidate understands the core engineering problem that {gap_clean} solves rather than just textbook syntax.",
            "expected_good_answer": f"Candidate clearly explains the trade-offs of {gap_clean}, describes analogous tools they used, and shows a fast learning trajectory with concrete examples.",
            "red_flags": "Defensiveness, guessing false facts, or inability to explain basic architectural concepts."
        })

    return {
        "candidate_name": candidate_name,
        "target_role": job_title,
        "probed_gaps": missing_skills[:5],
        "questions": questions
    }


# -------------------------------------------------------------
# 3. Candidate Pool RAG Chat Engine (Priority: OpenRouter)
# -------------------------------------------------------------

def chat_candidate_pool_rag(
    query: str,
    job_title: str,
    job_description: str,
    candidates: List[Dict[str, Any]],
    chat_history: Optional[List[Dict[str, str]]] = None
) -> dict:
    """Answer natural language recruiter queries grounded across all uploaded candidate resumes in the batch."""
    candidate_summaries = []
    for idx, c in enumerate(candidates, 1):
        name = c.get("candidate_name", f"Candidate #{idx}")
        score = c.get("overall_score", 0)
        yoe = c.get("years_of_experience", 0)
        level = c.get("seniority_level", "Mid")
        matched = ", ".join(c.get("matched_skills", [])[:10])
        missing = ", ".join(c.get("missing_skills", [])[:6])
        resume_snippet = (c.get("resume_text") or c.get("explanation") or "")[:400]

        summary = f"""[Candidate #{idx}: {name}]
- Match Score: {score}%
- Experience: {yoe} YOE ({level})
- Matched Skills: {matched}
- Missing Skills: {missing}
- Resume Highlights: {resume_snippet}"""
        candidate_summaries.append(summary)

    context_str = "\n\n".join(candidate_summaries)

    prompt = f"""
You are the HireSense Talent Intelligence Assistant.
The recruiter is asking questions about candidates in their screening batch for the role "{job_title}".

CANDIDATE BATCH DATA:
{context_str}

RECRUITER QUERY:
"{query}"

INSTRUCTIONS:
1. Answer the query thoroughly, objectively, and accurately based ONLY on the candidates provided above.
2. Explicitly cite candidate names and their scores/skills when recommending or comparing them.
3. If no candidate matches a specific requirement, state it clearly without making up facts.
4. Format the answer with clean markdown bullet points, bold names, and actionable hiring advice.

Return ONLY valid JSON with this schema:
{{
  "answer": "<Comprehensive markdown answer with candidate citations>",
  "cited_candidate_ids": [<IDs or numbers of candidates mentioned>],
  "top_recommendation": "<Candidate Name or 'None'>"
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="openrouter", json_mode=True, max_tokens=1500)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "answer" in data:
                return data
        except Exception:
            pass

    # Smart retrieval fallback
    query_lower = query.lower()
    matching_candidates = []
    for c in candidates:
        name = c.get("candidate_name", "Candidate")
        skills = [s.lower() for s in c.get("matched_skills", [])]
        raw_text = (c.get("resume_text") or "").lower()
        
        words = [w for w in re.findall(r'\w+', query_lower) if len(w) > 2]
        matched_words = [w for w in words if w in skills or w in raw_text]
        if matched_words or "top" in query_lower or "best" in query_lower or "compare" in query_lower:
            matching_candidates.append(c)

    if not matching_candidates:
        matching_candidates = candidates[:3]

    top_name = candidates[0].get("candidate_name", "Candidate #1") if candidates else "None"
    lines = [f"### Candidate Insights for: *\"{query}\"*\n"]
    for c in matching_candidates[:4]:
        lines.append(f"- **{c.get('candidate_name')}** ({c.get('overall_score')}% Match, {c.get('seniority_level', 'Mid')})")
        lines.append(f"  - **Key Matched Skills**: {', '.join(c.get('matched_skills', [])[:6]) or 'General tech skills'}")
        if c.get("missing_skills"):
            lines.append(f"  - **Skill Gaps**: {', '.join(c.get('missing_skills', [])[:4])}")

    lines.append(f"\n**AI Verdict**: **{top_name}** currently holds the strongest overall alignment with the job description.")

    return {
        "answer": "\n".join(lines),
        "cited_candidate_ids": [c.get("id") for c in matching_candidates[:4] if c.get("id")],
        "top_recommendation": top_name
    }


# -------------------------------------------------------------
# 4. AI 1-Click Outreach & Interview Invite Email Generator (Priority: Cerebras)
# -------------------------------------------------------------

def generate_outreach_email(
    candidate_name: str,
    job_title: str,
    email_type: str = "invitation",  # 'invitation' | 'rejection_feedback'
    matched_skills: Optional[List[str]] = None,
    missing_skills: Optional[List[str]] = None,
    company_name: str = "HireSense"
) -> dict:
    """Generate personalized outreach email (Interview Invitation or Constructive Feedback)."""
    matched_str = ", ".join(matched_skills[:5]) if matched_skills else "relevant engineering skills"
    missing_str = ", ".join(missing_skills[:3]) if missing_skills else "certain niche framework requirements"

    prompt = f"""
You are a senior Talent Acquisition Lead at {company_name}.
Draft a personalized, professional email to candidate "{candidate_name}" for the role of "{job_title}".
Email Type: "{email_type}" (Options: "invitation" for next round interview, or "rejection_feedback" for polite, constructive feedback).
Candidate Strengths: [{matched_str}]
Candidate Growth Gaps: [{missing_str}]

Return ONLY valid JSON with this schema:
{{
  "subject": "<Compelling, professional email subject>",
  "body": "<Polished, warm email body text with proper paragraphs>"
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="cerebras", json_mode=True, max_tokens=1000)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "subject" in data and "body" in data:
                return data
        except Exception:
            pass

    # Fallback email drafts
    first_name = candidate_name.split()[0] if candidate_name else "Candidate"
    if email_type == "invitation":
        return {
            "subject": f"Interview Invitation: {job_title} at {company_name}",
            "body": f"""Hi {first_name},

Thank you for your interest in the {job_title} role at {company_name}.

We were very impressed by your background and your strong experience with {matched_str}. Based on your profile, we would love to invite you to a 30-minute introductory technical discussion to learn more about your past projects and share more details about our engineering roadmap.

Please let us know your availability over the next few days, or reply with your preferred time slots.

Looking forward to speaking with you!

Warm regards,
Talent Acquisition Team
{company_name}"""
        }
    else:
        return {
            "subject": f"Update regarding your application for {job_title} at {company_name}",
            "body": f"""Hi {first_name},

Thank you for taking the time to share your resume for the {job_title} role at {company_name}.

We truly appreciate the opportunity to review your profile. While we were impressed by your work in {matched_str}, we have decided to proceed with candidates whose experience more closely aligns with our immediate requirements in {missing_str}.

We will keep your resume in our talent network for upcoming openings that match your skill set. We wish you the absolute best in your career journey.

Warm regards,
Talent Acquisition Team
{company_name}"""
        }


# -------------------------------------------------------------
# 5. AI 30-Second Candidate Elevator Pitch (Priority: Cerebras)
# -------------------------------------------------------------

def generate_candidate_pitch(
    candidate_name: str,
    resume_text: str,
    job_title: str,
    matched_skills: List[str],
    missing_skills: List[str]
) -> dict:
    """Generate concise 30-second executive summary & hiring pitch."""
    matched_str = ", ".join(matched_skills[:8])
    missing_str = ", ".join(missing_skills[:5])
    snippet = resume_text[:600] if resume_text else "Technical background in engineering."

    prompt = f"""
You are an executive talent scout.
Generate a concise 30-second Executive Pitch for candidate "{candidate_name}" being evaluated for "{job_title}".
Matched Skills: [{matched_str}]
Missing Skills: [{missing_str}]
Resume Highlights: {snippet}

Return ONLY valid JSON with this schema:
{{
  "one_line_hook": "<1 punchy sentence summarizing why this candidate is compelling or their core focus>",
  "top_strengths": ["<Standout strength 1>", "<Standout strength 2>", "<Standout strength 3>"],
  "ramp_up_areas": ["<Skill or domain to ramp up on 1>", "<Area 2>"],
  "hiring_verdict": "<Strong Hire | Solid Contender | High Potential | Backup Candidate>",
  "talking_points": "<2-sentence brief for the hiring manager before interviewing>"
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="cerebras", json_mode=True, max_tokens=1000)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "one_line_hook" in data and "top_strengths" in data:
                return data
        except Exception:
            pass

    # Deterministic fallback
    verdict = "Strong Hire" if len(matched_skills) >= 5 else "Solid Contender"
    return {
        "one_line_hook": f"{candidate_name} brings hands-on experience in {matched_str[:40] or 'core software engineering'} with immediate project readiness.",
        "top_strengths": [
            f"Strong technical alignment with {matched_str[:35] or 'key stack requirements'}.",
            "Demonstrated capability in building software modules and problem-solving.",
            "Solid foundational knowledge suitable for cross-functional collaboration."
        ],
        "ramp_up_areas": [
            f"Familiarity with {missing_str[:35] or 'secondary tools'} required for the role."
        ],
        "hiring_verdict": verdict,
        "talking_points": f"Focus the interview on their hands-on work with {matched_str[:30]} and evaluate their ramp-up speed for {missing_str[:25]}."
    }


# -------------------------------------------------------------
# 6. Enterprise Interview Scorecard & Evaluation Rubric Generator (Priority: Cerebras)
# -------------------------------------------------------------

def generate_interview_scorecard_rubric(
    candidate_name: str,
    job_title: str,
    matched_skills: List[str],
    missing_skills: List[str],
    job_description: str = ""
) -> dict:
    """Generate a comprehensive standardized interview evaluation rubric with 1-5 rating criteria."""
    matched_str = ", ".join(matched_skills[:8])
    missing_str = ", ".join(missing_skills[:5])

    prompt = f"""
You are a Principal Hiring Bar Raiser creating a standardized Interview Scorecard for "{job_title}".
Candidate: {candidate_name}
Demonstrated Skills: [{matched_str}]
Identified Skill Gaps: [{missing_str}]
Job Context: {job_description[:400]}

Generate a 1-page structured evaluation rubric. Return ONLY valid JSON with this exact schema:
{{
  "candidate_name": "{candidate_name}",
  "job_title": "{job_title}",
  "rubric_title": "Technical & Behavioral Interview Scorecard",
  "technical_rubrics": [
    {{
      "competency": "<Core Must-Have Skill or Architecture Domain>",
      "probing_question": "<Exact technical scenario question to ask>",
      "score_1_unacceptable": "<Clear signal of failing candidate>",
      "score_3_competent": "<Signal of acceptable baseline candidate>",
      "score_5_exceptional": "<Signal of elite domain expert>"
    }}
  ],
  "behavioral_rubrics": [
    {{
      "competency": "Problem Solving & Execution",
      "probing_question": "Describe a complex engineering roadblock you faced. How did you diagnose and unblock it under pressure?",
      "look_for": "Structured root cause analysis, clear metrics, accountability."
    }},
    {{
      "competency": "Collaboration & Cross-Functional Alignment",
      "probing_question": "Tell me about a technical disagreement you had with a product manager or teammate. How was it resolved?",
      "look_for": "Empathy, business rationale, constructive communication."
    }}
  ],
  "decision_scale": [
    {{"label": "Strong Hire", "description": "Exceeds bar across all core technical domains; would raise team velocity immediately."}},
    {{"label": "Hire", "description": "Meets bar on core competencies with manageable ramp-up on minor gaps."}},
    {{"label": "Hold / Potential", "description": "Solid fundamentals but needs deeper probe on system architecture."}},
    {{"label": "No Hire", "description": "Critical gaps in required core stack or inability to explain foundational concepts."}}
  ]
}}
"""
    raw_res = _execute_recruiter_router(prompt, priority="cerebras", json_mode=True, max_tokens=1800)
    if raw_res:
        try:
            data = json.loads(raw_res)
            if "technical_rubrics" in data and len(data["technical_rubrics"]) > 0:
                return data
        except Exception:
            pass

    # Deterministic fallback
    competencies = (matched_skills[:3] + missing_skills[:2]) if (matched_skills or missing_skills) else ["Core Engineering", "System Design", "Databases"]
    tech_rubrics = []
    for c in competencies[:4]:
        c_name = c.strip().title()
        tech_rubrics.append({
            "competency": c_name,
            "probing_question": f"How have you designed, debugged, or deployed applications leveraging {c_name} in production environments?",
            "score_1_unacceptable": f"Cannot explain basic concepts or lifecycle of {c_name}.",
            "score_3_competent": f"Good practical understanding of {c_name}, standard syntax and libraries.",
            "score_5_exceptional": f"Deep architectural mastery, performance tuning, failure modes, and best practices in {c_name}."
        })

    return {
        "candidate_name": candidate_name,
        "job_title": job_title,
        "rubric_title": "Technical & Behavioral Interview Scorecard",
        "technical_rubrics": tech_rubrics,
        "behavioral_rubrics": [
            {
                "competency": "Problem Solving & Execution",
                "probing_question": "Describe a complex engineering roadblock you faced. How did you diagnose and unblock it under pressure?",
                "look_for": "Structured root cause analysis, clear metrics, accountability."
            },
            {
                "competency": "Collaboration & Ownership",
                "probing_question": "Tell me about a technical disagreement you had with a product manager or teammate. How was it resolved?",
                "look_for": "Empathy, business rationale, constructive communication."
            }
        ],
        "decision_scale": [
            {"label": "Strong Hire", "description": "Exceeds bar across all core technical domains; would raise team velocity immediately."},
            {"label": "Hire", "description": "Meets bar on core competencies with manageable ramp-up on minor gaps."},
            {"label": "Hold / Potential", "description": "Solid fundamentals but needs deeper probe on system architecture."},
            {"label": "No Hire", "description": "Critical gaps in required core stack or inability to explain foundational concepts."}
        ]
    }
