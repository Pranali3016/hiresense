SKILL_METADATA = {
    "docker": {"weeks": 2, "type": "devops", "why": "Packages your app so it runs anywhere. Every company uses Docker for deployment."},
    "pytorch": {"weeks": 3, "type": "ml_framework", "why": "Deep learning framework used by Meta, Google, and most AI research labs."},
    "tensorflow": {"weeks": 3, "type": "ml_framework", "why": "Google's ML framework. Industry standard for production ML systems."},
    "aws": {"weeks": 3, "type": "cloud", "why": "Used by 90% of companies. Essential for deploying any real application."},
    "gcp": {"weeks": 2, "type": "cloud", "why": "Google Cloud. Best platform for ML workloads and AI APIs."},
    "azure": {"weeks": 2, "type": "cloud", "why": "Microsoft's cloud. Most used in enterprise companies."},
    "kubernetes": {"weeks": 3, "type": "devops", "why": "Manages containers at scale. Required for senior ML engineer roles."},
    "mlops": {"weeks": 3, "type": "mlops", "why": "Deploying and monitoring ML models in production. Very high demand skill."},
    "computer vision": {"weeks": 3, "type": "ai_domain", "why": "Teaching machines to see. Used in medical imaging, self-driving, surveillance."},
    "react": {"weeks": 4, "type": "frontend", "why": "Most popular frontend framework. Needed for full stack AI roles."},
    "langchain": {"weeks": 2, "type": "genai", "why": "Framework for building LLM apps. Core skill for Gen AI engineer roles."},
    "fastapi": {"weeks": 2, "type": "backend", "why": "Fastest Python web framework. Standard for ML model APIs."},
    "sql": {"weeks": 2, "type": "data", "why": "Every company stores data in databases. SQL is non-negotiable."},
    "mongodb": {"weeks": 2, "type": "data", "why": "Most popular NoSQL database. Used when data structure is flexible."},
    "redis": {"weeks": 1, "type": "data", "why": "In-memory cache. Makes apps 10x faster. Used in every scaled system."},
    "spark": {"weeks": 3, "type": "data", "why": "Process massive datasets that don't fit in memory. Big data standard."},
    "airflow": {"weeks": 2, "type": "mlops", "why": "Schedules and monitors data pipelines. Used in every data team."},
    "flask": {"weeks": 1, "type": "backend", "why": "Simple Python web framework. Good for small ML model APIs."},
    "typescript": {"weeks": 2, "type": "frontend", "why": "JavaScript with types. Required in most modern frontend jobs."},
    "graphql": {"weeks": 2, "type": "backend", "why": "API query language. Alternative to REST. Growing in popularity."},
    "nlp": {"weeks": 3, "type": "ai_domain", "why": "Natural Language Processing. Core for chatbots, search, text analysis."},
    "huggingface": {"weeks": 2, "type": "genai", "why": "Largest ML model hub. Used to download and deploy pretrained models."},
    "linux": {"weeks": 2, "type": "devops", "why": "All servers run Linux. You need basics to deploy anything."},
    "git": {"weeks": 1, "type": "tool", "why": "Version control. Every team uses Git. Non-negotiable."},
    "power bi": {"weeks": 2, "type": "analytics", "why": "Business intelligence tool. Used by data analysts everywhere."},
    "tableau": {"weeks": 2, "type": "analytics", "why": "Data visualization tool. Common in data analyst job descriptions."},
}

ROADMAP_TEMPLATES = {
    "devops": {
        "week_titles": ["Core concepts + install + first commands", "Apply to a real project", "Deploy something live"],
        "week_focuses": [
            "Understand what problem this tool solves, install it, run the hello world equivalent, learn the 5 most important commands",
            "Take your existing project and apply this tool to it. Document what you did in a README",
            "Deploy your project using this tool. Add it to your GitHub and write what you learned"
        ]
    },
    "ml_framework": {
        "week_titles": ["Installation + tensors + basics", "Build and train a model", "Recreate one of your existing projects"],
        "week_focuses": [
            "Install the framework, understand its core data structure, run basic operations, compare with what you already know",
            "Build a simple neural network, train it on a public dataset like MNIST or CIFAR-10, evaluate accuracy",
            "Take your best existing project and reimplement it in this framework. This deepens understanding fastest"
        ]
    },
    "cloud": {
        "week_titles": ["Account setup + core services", "Deploy a real app", "ML-specific services"],
        "week_focuses": [
            "Create account, understand the free tier limits, learn storage and compute services, navigate the console",
            "Deploy your FastAPI backend on this cloud platform. Get a real public URL",
            "Explore the ML-specific services like managed notebooks, model endpoints, and auto-scaling"
        ]
    },
    "mlops": {
        "week_titles": ["Core concepts + setup", "Track experiments", "Full pipeline"],
        "week_focuses": [
            "Understand what MLOps solves — reproducibility, monitoring, automation. Install the tool, run first example",
            "Integrate with your existing ML project. Track metrics, log models, compare runs",
            "Build an end-to-end pipeline: data → train → evaluate → deploy → monitor"
        ]
    },
    "ai_domain": {
        "week_titles": ["Theory + basic implementation", "Standard models and datasets", "Real project"],
        "week_focuses": [
            "Understand the core concepts, implement basic examples, use standard libraries for this domain",
            "Work through a benchmark dataset, implement standard models, understand evaluation metrics",
            "Build a project in this domain and deploy it on Hugging Face Spaces for free"
        ]
    },
    "frontend": {
        "week_titles": ["Syntax + components + state", "API integration + routing", "Full project"],
        "week_focuses": [
            "Learn the syntax, build basic components, understand state management, follow official tutorial",
            "Connect to your FastAPI backend, add routing between pages, handle loading and error states",
            "Build a complete mini project. Deploy on Vercel for free. Add to GitHub and resume"
        ]
    },
    "genai": {
        "week_titles": ["Setup + first LLM call", "Build a real application"],
        "week_focuses": [
            "Install the library, make your first LLM API call, understand prompts, chains, and memory",
            "Build a RAG application using your own documents. This is the most in-demand Gen AI skill right now"
        ]
    },
    "backend": {
        "week_titles": ["Core concepts + first API", "Database + deployment"],
        "week_focuses": [
            "Install and set up, build your first endpoint, understand request/response, test with browser",
            "Connect to a database, add CRUD operations, deploy on Render for free"
        ]
    },
    "data": {
        "week_titles": ["Core operations", "Real dataset project"],
        "week_focuses": [
            "Install and connect, learn the 10 most common operations, practice on sample data",
            "Take a real dataset, answer 5 business questions using only this tool, document findings"
        ]
    },
    "analytics": {
        "week_titles": ["Interface + basic charts", "Dashboard project"],
        "week_focuses": [
            "Install or use free version, connect to data, build 5 different chart types, understand filters",
            "Build a complete dashboard for a real dataset. Export and add screenshot to portfolio"
        ]
    },
    "tool": {
        "week_titles": ["Core commands in one day"],
        "week_focuses": [
            "Learn init, add, commit, push, pull, branch, merge. Practice on your HireSense project today"
        ]
    }
}

def get_weeks_for_skill(skill_lower: str, template: dict) -> list:
    """Generate week-by-week plan for any skill."""
    weeks = []
    titles = template["week_titles"]
    focuses = template["week_focuses"]

    for i, (title, focus) in enumerate(zip(titles, focuses)):
        weeks.append({
            "week": i + 1,
            "title": title,
            "what_to_do": focus,
            "daily_time": "1.5 to 2 hours",
            "end_goal": f"By end of week {i+1}, you should be able to explain and demonstrate this to someone else"
        })

    return weeks

def generate_roadmap(missing_skills: list) -> list:
    """Generate dynamic roadmap for any list of missing skills."""
    roadmap = []

    for skill in missing_skills[:5]:
        skill_lower = skill.lower()

        meta = SKILL_METADATA.get(skill_lower, {
            "weeks": 2,
            "type": "tool",
            "why": f"In-demand skill that appears frequently in {skill} related job descriptions."
        })

        template = ROADMAP_TEMPLATES.get(meta["type"], ROADMAP_TEMPLATES["tool"])
        weeks = get_weeks_for_skill(skill_lower, template)

        roadmap.append({
            "skill": skill,
            "weeks_needed": meta["weeks"],
            "why_important": meta["why"],
            "daily_time_needed": "1.5 to 2 hours per day",
            "weeks": weeks
        })

    return roadmap
