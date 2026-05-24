import fitz  # PyMuPDF
import spacy
import re
from typing import Optional

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Common tech skills list to match against
TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "c++", "c#", "sql", "nosql",
    "react", "angular", "vue", "nodejs", "fastapi", "django", "flask",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy",
    "docker", "kubernetes", "aws", "gcp", "azure", "git", "github",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "langchain", "openai", "huggingface", "lstm", "cnn", "transformer",
    "rest api", "graphql", "microservices", "agile", "scrum",
    "data analysis", "data science", "artificial intelligence",
    "neural network", "reinforcement learning", "mlops",
    "html", "css", "linux", "bash", "spark", "hadoop", "tableau", "powerbi"
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
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

def extract_name(text: str) -> Optional[str]:
    """Extract candidate name using spaCy NER."""
    doc = nlp(text[:500])  # Check first 500 chars only
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
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

def parse_resume(file_bytes: bytes) -> dict:
    """Main function - parse resume and return all extracted info."""
    # Step 1: Extract raw text
    text = extract_text_from_pdf(file_bytes)

    # Step 2: Extract all information
    skills = extract_skills(text)
    email = extract_email(text)
    phone = extract_phone(text)
    name = extract_name(text)
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