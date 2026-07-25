from sentence_transformers import SentenceTransformer
import numpy as np

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def semantic_match_score(resume_text: str, job_description: str) -> dict:
    """
    Use sentence embeddings to compute semantic similarity
    between resume and job description.
    This is RAG — we embed both documents and find similarity.
    """
    resume_embedding = get_model().encode(resume_text[:2000])
    jd_embedding = get_model().encode(job_description[:2000])
    overall_similarity = cosine_similarity(resume_embedding, jd_embedding)

    resume_sentences = [s.strip() for s in resume_text.split('\n') if len(s.strip()) > 20][:20]
    jd_sentences = [s.strip() for s in job_description.split('\n') if len(s.strip()) > 20][:10]

    top_matches = []
    for jd_sent in jd_sentences:
        jd_emb = get_model().encode(jd_sent)
        best_score = 0
        best_resume_sent = ""
        for res_sent in resume_sentences:
            res_emb = get_model().encode(res_sent)
            score = cosine_similarity(jd_emb, res_emb)
            if score > best_score:
                best_score = score
                best_resume_sent = res_sent
        if best_score > 0.3:
            top_matches.append({
                "jd_requirement": jd_sent[:100],
                "resume_match": best_resume_sent[:100],
                "similarity": round(best_score * 100, 1)
            })

    top_matches = sorted(top_matches, key=lambda x: x["similarity"], reverse=True)[:5]
    semantic_score = round(overall_similarity * 100, 1)

    return {
        "semantic_score": semantic_score,
        "top_matches": top_matches,
        "interpretation": get_semantic_interpretation(semantic_score)
    }

def get_semantic_interpretation(score: float) -> str:
    if score >= 70:
        return "Your resume language strongly aligns with this job description"
    elif score >= 50:
        return "Your resume partially aligns with this job description"
    elif score >= 30:
        return "Your resume has some alignment but could be tailored more"
    else:
        return "Consider rewriting your resume to match this job description language"
