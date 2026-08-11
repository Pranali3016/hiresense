from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from app.services.resume_parser import parse_resume
from app.services.jd_parser import parse_jd
from app.services.scorer import score_resume_against_jd
from app.services.rag_matcher import semantic_match_score
from app.services.roadmap_generator import generate_roadmap

class AgentState(TypedDict):
    file_bytes: bytes
    job_description: str
    resume_data: dict
    jd_data: dict
    score_data: dict
    rag_data: dict
    roadmap: list
    final_output: dict

def parse_resume_node(state: AgentState) -> AgentState:
    """Agent Tool 1 — Parse the resume PDF"""
    print("Agent: Parsing resume...")
    resume_data = parse_resume(state["file_bytes"])
    return {**state, "resume_data": resume_data}

def parse_jd_node(state: AgentState) -> AgentState:
    """Agent Tool 2 — Parse the job description"""
    print("Agent: Parsing job description...")
    jd_data = parse_jd(state["job_description"])
    return {**state, "jd_data": jd_data}

def rag_match_node(state: AgentState) -> AgentState:
    """Agent Tool 3 — Semantic RAG matching using embeddings"""
    print("Agent: Running RAG semantic matching...")
    rag_data = semantic_match_score(
        state["resume_data"].get("raw_text", ""),
        state["job_description"]
    )
    return {**state, "rag_data": rag_data}

def score_node(state: AgentState) -> AgentState:
    """Agent Tool 4 — Score resume against JD with Groq AI explanation"""
    print("Agent: Scoring with Groq AI...")
    score_data = score_resume_against_jd(
        state["resume_data"],
        state["jd_data"]
    )
    return {**state, "score_data": score_data}

def roadmap_node(state: AgentState) -> AgentState:
    """Agent Tool 5 — Generate learning roadmap for missing skills"""
    print("Agent: Generating roadmap...")
    roadmap = generate_roadmap(state["score_data"].get("missing_skills", []))
    return {**state, "roadmap": roadmap}

def compile_output_node(state: AgentState) -> AgentState:
    """Agent final step — compile all results into final output"""
    print("Agent: Compiling final output...")
    
    
    final_output = {
        "success": True,
        "agent_powered": True,
        "resume": {
            "name": state["resume_data"].get("name"),
            "email": state["resume_data"].get("email"),
            "skills_found": state["resume_data"].get("skills"),
            "experience_years": state["resume_data"].get("experience_years")
        },
        "job": {
            "title": state["jd_data"].get("job_title"),
            "required_skills": state["jd_data"].get("required_skills"),
            "required_experience": state["jd_data"].get("required_experience_years"),
            "seniority": state["jd_data"].get("seniority_level")
        },
        "analysis": {
            **state["score_data"],
            "semantic_score": state["rag_data"].get("semantic_score"),
            "semantic_interpretation": state["rag_data"].get("interpretation"),
            "top_semantic_matches": state["rag_data"].get("top_matches", [])
        },
        "roadmap": state["roadmap"]
    }
    return {**state, "final_output": final_output}

def build_agent():
    """Build the LangGraph agent with all tools"""
    workflow = StateGraph(AgentState)
    
    workflow.add_node("parse_resume", parse_resume_node)
    workflow.add_node("parse_jd", parse_jd_node)
    workflow.add_node("rag_match", rag_match_node)
    workflow.add_node("score", score_node)
    workflow.add_node("roadmap", roadmap_node)
    workflow.add_node("compile_output", compile_output_node)
    
    workflow.set_entry_point("parse_resume")
    workflow.add_edge("parse_resume", "parse_jd")
    workflow.add_edge("parse_jd", "rag_match")
    workflow.add_edge("rag_match", "score")
    workflow.add_edge("score", "roadmap")
    workflow.add_edge("roadmap", "compile_output")
    workflow.add_edge("compile_output", END)
    
    return workflow.compile()

hiresense_agent = build_agent()

def run_agent(file_bytes: bytes, job_description: str) -> dict:
    """Run the full agentic pipeline"""
    initial_state = {
        "file_bytes": file_bytes,
        "job_description": job_description,
        "resume_data": {},
        "jd_data": {},
        "score_data": {},
        "rag_data": {},
        "roadmap": [],
        "final_output": {}
    }
    result = hiresense_agent.invoke(initial_state)
    return result["final_output"]
