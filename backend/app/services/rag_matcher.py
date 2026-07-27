from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Compute cosine similarity between two vectors."""
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def _get_tfidf_vectors(texts: list[str]) -> np.ndarray:
    """Turn a list of texts into comparable word-importance vectors."""
    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform(texts)
    return vectors.toarray()


def semantic_match_score(resume_text: str, job_description: str) -> dict:
    """
    Use TF-IDF (keyword-weighted) similarity to compute textual overlap
    between resume and job description. Lightweight alternative to
    embedding-based semantic search — no heavy ML models required.
    """
    vectors = _get_tfidf_vectors([resume_text[:2000], job_description[:2000]])
    overall_similarity = cosine_similarity(vectors[0], vectors[1])

    resume_sentences = [s.strip() for s in resume_text.split('\n') if len(s.strip()) > 20][:20]
    jd_sentences = [s.strip() for s in job_description.split('\n') if len(s.strip()) > 20][:10]

    top_matches = []

    if resume_sentences and jd_sentences:
        all_sentences = jd_sentences + resume_sentences
        all_vectors = _get_tfidf_vectors(all_sentences)
        jd_vectors = all_vectors[:len(jd_sentences)]
        resume_vectors = all_vectors[len(jd_sentences):]

        for i, jd_sent in enumerate(jd_sentences):
            best_score = 0
            best_resume_sent = ""
            for j, res_sent in enumerate(resume_sentences):
                score = cosine_similarity(jd_vectors[i], resume_vectors[j])
                if score > best_score:
                    best_score = score
                    best_resume_sent = res_sent
            if best_score > 0.15:
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
