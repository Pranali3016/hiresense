import re
from app.services.resume_parser import TECH_SKILLS


EXPERIENCE_PATTERNS = [
    r'(\d+)\+?\s*years?\s*of\s*experience',
    r'(\d+)\+?\s*years?\s*experience',
    r'minimum\s*(\d+)\s*years?',
    r'at\s*least\s*(\d+)\s*years?',
]

SENIORITY_KEYWORDS = {
    "junior": ["junior", "entry level", "entry-level", "fresher", "graduate", "0-1 year", "0-2 year"],
    "mid": ["mid level", "mid-level", "2-4 years", "3-5 years", "intermediate"],
    "senior": ["senior", "lead", "5+ years", "7+ years", "principal", "staff engineer"]
}

def extract_required_skills(text: str) -> list[str]:
    """Extract required skills from job description."""
    text_lower = text.lower()
    found_skills = []
    for skill in TECH_SKILLS:
        if skill in text_lower:
            found_skills.append(skill)
    return found_skills

def extract_required_experience(text: str) -> int:
    """Extract years of experience required."""
    text_lower = text.lower()
    for pattern in EXPERIENCE_PATTERNS:
        match = re.search(pattern, text_lower)
        if match:
            return int(match.group(1))
    return 0

def extract_seniority(text: str) -> str:
    """Detect if role is junior, mid, or senior level."""
    text_lower = text.lower()
    for level, keywords in SENIORITY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                return level
    return "mid"

ROLE_KEYWORDS = [
    "engineer", "developer", "analyst", "scientist", "manager", "architect",
    "designer", "specialist", "consultant", "intern", "lead", "director",
    "administrator", "programmer", "researcher", "coordinator"
]

LABEL_PATTERN = r'^(?:job\\s*title|position|role|title)\\s*[:\\-]\\s*(.+)$'


def extract_job_title(text: str) -> str:
    """Extract job title. Tries an explicit label first (e.g. 'Job Title: ...'),
    then scans early lines for a common role keyword, then falls back to the
    first non-empty line. Handles JDs with no company name or title header."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if not lines:
        return "Unknown Role"

    for line in lines[:15]:
        match = re.match(LABEL_PATTERN, line, re.IGNORECASE)
        if match:
            candidate = match.group(1).strip()
            if candidate:
                return candidate[:100]

    for line in lines[:15]:
        if len(line) <= 80 and any(kw in line.lower() for kw in ROLE_KEYWORDS):
            return line[:100]

    return lines[0][:100]

def parse_jd(text: str) -> dict:
    """Main function - parse job description."""
    required_skills = extract_required_skills(text)
    required_experience = extract_required_experience(text)
    seniority = extract_seniority(text)
    job_title = extract_job_title(text)

    return {
        "job_title": job_title,
        "required_skills": required_skills,
        "required_experience_years": required_experience,
        "seniority_level": seniority,
        "total_skills_required": len(required_skills)
    }
