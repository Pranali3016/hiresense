import fitz  # PyMuPDF
import spacy
import re
from typing import Optional

# Load spaCy model
_nlp = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except Exception:
            _nlp = None
    return _nlp

# Common tech skills list to match against
TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "sql", "nosql",
    "react", "angular", "vue", "nodejs", "fastapi", "django", "flask",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "docker", "kubernetes", "aws", "gcp", "azure", "git", "github",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "langchain", "openai", "huggingface", "lstm", "cnn", "transformer", "llm", "rag", "genai", "generative ai",
    "rest api", "graphql", "microservices", "agile", "scrum",
    "data analysis", "data science", "artificial intelligence",
    "neural network", "reinforcement learning", "mlops",
    "html", "css", "linux", "bash", "spark", "hadoop", "tableau", "powerbi"
]

SECTION_KEYWORDS = {
    'summary', 'objective', 'education', 'experience', 'projects', 'skills',
    'technical skills', 'certifications', 'profile', 'contact', 'phone',
    'email', 'curriculum vitae', 'cv', 'resume', 'about me', 'work experience',
    'professional summary', 'languages', 'achievements', 'declaration', 'hobbies'
}

ROLE_KEYWORDS = {
    'developer', 'engineer', 'scientist', 'designer', 'director', 'architect',
    'specialist', 'analyst', 'consultant', 'intern', 'lead', 'manager',
    'full stack', 'data science', 'machine learning', 'ai/ml', 'software',
    'data', 'product', 'associate', 'fresher', 'student'
}

SKILL_TITLES = {
    'machine learning', 'deep learning', 'data science', 'python developer',
    'software engineer', 'web developer', 'full stack developer', 'frontend developer',
    'backend developer', 'devops engineer', 'cloud architect'
}


def clean_extracted_name(raw_name: str) -> str:
    """Sanitize name string, remove symbols, job titles, and normalize casing."""
    if not raw_name:
        return ""
    
    # Strip pipe or delimiter separated titles (e.g. "Pranali Hagare | Python Developer")
    if "|" in raw_name:
        raw_name = raw_name.split("|")[0]
    if " - " in raw_name:
        raw_name = raw_name.split(" - ")[0]
    if " • " in raw_name:
        raw_name = raw_name.split(" • ")[0]

    # Remove non-alphabetic characters (preserving dots, hyphens, and apostrophes)
    name = re.sub(r"[^\w\s\.\'-]", " ", raw_name)
    name = re.sub(r"\s+", " ", name).strip()
    
    words = name.split()
    clean_words = []
    for w in words:
        w_lower = w.lower()
        if w_lower in ROLE_KEYWORDS or w_lower in SECTION_KEYWORDS:
            break
        clean_words.append(w)
    
    if len(clean_words) >= 1:
        return " ".join(clean_words).title()
    return name.title()


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file or raw text bytes."""
    text = ""
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text() + "\n"
    except Exception:
        text = file_bytes.decode('utf-8', errors='ignore')
    return text.strip()


def extract_skills(text: str) -> list[str]:
    """Extract tech skills from resume text."""
    text_lower = text.lower()
    found_skills = []
    for skill in TECH_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
    return found_skills


def extract_email(text: str) -> Optional[str]:
    """Extract email address from text."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group() if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    pattern = r'[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}'
    match = re.search(pattern, text)
    return match.group() if match else None


def extract_name(text: str, filename: str = "", email: Optional[str] = None) -> Optional[str]:
    """
    Multi-strategy enterprise candidate name extraction:
    1. Email prefix matching in top header
    2. Header line pattern analysis (first 1-5 non-empty lines)
    3. spaCy Named Entity Recognition (NER) with role sanitization
    4. Filename clean fallback
    """
    top_chunk = text[:1000]
    top_lines = [l.strip() for l in top_chunk.splitlines() if l.strip()]

    # Strategy 1: Email-guided search in header
    if email:
        prefix = email.split('@')[0].lower()
        clean_prefix = re.sub(r'[0-9_\.\+-]', ' ', prefix).strip()
        email_parts = [p for p in clean_prefix.split() if len(p) >= 3]
        if email_parts:
            for line in top_lines[:8]:
                if '@' in line or 'http' in line or 'www.' in line:
                    continue
                line_lower = line.lower()
                if any(p in line_lower for p in email_parts):
                    cand = clean_extracted_name(line)
                    if cand and 1 <= len(cand.split()) <= 4:
                        return cand

    # Strategy 2: First valid line heuristic
    for line in top_lines[:6]:
        if len(line) < 2 or len(line) > 50:
            continue
        if '@' in line or 'http' in line or 'www.' in line or re.search(r'\d{5,}', line):
            continue
        line_lower = line.lower().strip(': ')
        if line_lower in SECTION_KEYWORDS or line_lower in ROLE_KEYWORDS or line_lower in SKILL_TITLES:
            continue
        
        # Check if line consists purely of alphabetic name characters
        cleaned = re.sub(r"[^\w\s\.\'-]", " ", line).strip()
        if cleaned:
            words = cleaned.split()
            if 1 <= len(words) <= 4:
                # Discard common skill lines
                if cleaned.lower() not in SKILL_TITLES:
                    return clean_extracted_name(cleaned)

    # Strategy 3: spaCy Named Entity Recognition (PERSON)
    nlp = get_nlp()
    if nlp:
        try:
            doc = nlp(top_chunk[:500])
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    clean = clean_extracted_name(ent.text)
                    if clean and clean.lower() not in SKILL_TITLES and 1 <= len(clean.split()) <= 4:
                        return clean
        except Exception:
            pass

    # Strategy 4: Clean filename fallback
    if filename:
        clean_fn = filename.rsplit('.', 1)[0]
        clean_fn = re.sub(r'(resume|cv|final|v\d+|\d+|copy|_|-)', ' ', clean_fn, flags=re.IGNORECASE)
        clean_fn = re.sub(r'\s+', ' ', clean_fn).strip()
        if clean_fn and len(clean_fn.split()) <= 4:
            return clean_fn.title()

    return None


def extract_experience_years(text: str) -> int:
    """Extract years of experience mentioned in resume."""
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return 0


def parse_resume(file_bytes: bytes, filename: str = "") -> dict:
    """Main function - parse resume and return all extracted info."""
    # Step 1: Extract raw text
    text = extract_text_from_pdf(file_bytes)

    # Step 2: Extract email & contact info
    email = extract_email(text)
    phone = extract_phone(text)

    # Step 3: Extract candidate name with multi-strategy recognition
    name = extract_name(text, filename=filename, email=email)

    # Step 4: Extract skills & experience
    skills = extract_skills(text)
    experience_years = extract_experience_years(text)

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": skills,
        "experience_years": experience_years,
        "raw_text": text,
        "total_skills_found": len(skills)
    }