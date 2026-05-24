LLM = {
    "skill": "LLM",
    "total_duration": "4-5 weeks",
    "daily_time": "1 hour per day",
    "why": "Large Language Models are the foundation of every Gen AI product. Without understanding how LLMs work, you cannot build production AI systems. This is the most in-demand knowledge in AI engineering right now.",
    "free_resources": [
        {
            "title": "Andrej Karpathy — Let's Build GPT from Scratch",
            "url": "https://www.youtube.com/watch?v=kCc8FmEb1nY",
            "duration": "2 hours",
            "covers": "Build a GPT model from scratch — best resource ever made on this topic"
        },
        {
            "title": "3Blue1Brown — Attention in Transformers",
            "url": "https://www.youtube.com/watch?v=eMlx5fFNoYc",
            "duration": "27 mins",
            "covers": "Visual explanation of attention mechanism — watch before anything else"
        },
        {
            "title": "Andrej Karpathy — Intro to LLMs",
            "url": "https://www.youtube.com/watch?v=zjkBMFhNj_g",
            "duration": "1 hour",
            "covers": "High level overview of how LLMs work — perfect starting point"
        },
        {
            "title": "DeepLearning.AI — ChatGPT Prompt Engineering",
            "url": "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
            "duration": "1 hour",
            "covers": "Free course on prompt engineering by OpenAI and DeepLearning.AI"
        },
        {
            "title": "Hugging Face NLP Course — Free",
            "url": "https://huggingface.co/learn/nlp-course/chapter1/1",
            "duration": "Self-paced",
            "covers": "Transformers, tokenization, fine-tuning — completely free"
        },
        {
            "title": "DeepLearning.AI — LangChain for LLM Application Development",
            "url": "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/",
            "duration": "1 hour",
            "covers": "Free course by Andrew Ng on building with LLMs"
        },
        {
            "title": "Illustrated Transformer - Jay Alammar Blog",
            "url": "https://jalammar.github.io/illustrated-transformer/",
            "duration": "30 mins read",
            "covers": "Best visual explanation of transformer architecture on the internet"
        }
    ],
    "sections": [
        {
            "title": "1. LLM Fundamentals — What Is an LLM",
            "duration": "2 Days",
            "description": "Understand what LLMs are, how they are trained, and why they are different from traditional ML.",
            "topics": [
                {"name": "What is a Language Model — probability over sequences of words", "stars": 5, "interview_note": "Core definition — LLM predicts the most likely next token"},
                {"name": "What makes it Large — billions of parameters trained on internet-scale data", "stars": 5, "interview_note": "Scale is what makes LLMs qualitatively different"},
                {"name": "Next token prediction — how LLMs generate text", "stars": 5, "interview_note": "Most asked fundamental — LLM generates one token at a time"},
                {"name": "Pretraining vs Fine-tuning vs RLHF", "stars": 5, "interview_note": "Three stage process to create ChatGPT-like models"},
                {"name": "Training data — web crawls, books, code", "stars": 4, "interview_note": "Know what Common Crawl and The Pile are"},
                {"name": "Parameters — weights of the neural network", "stars": 5, "interview_note": "7B, 13B, 70B mean 7 billion parameters"},
                {"name": "Inference — using a trained model to generate text", "stars": 5, "interview_note": "Different from training — no gradient computation"},
                {"name": "Popular model families — GPT-4, Claude, Gemini, Llama, Mistral", "stars": 4, "interview_note": "Know which company built which model"},
                {"name": "Open source vs closed source models", "stars": 4, "interview_note": "Llama is open, GPT-4 is closed — tradeoffs"},
                {"name": "Model size vs capability tradeoff", "stars": 4, "interview_note": "Bigger is not always better — GPT-3.5 beats larger open models on many tasks"}
            ],
            "practice": [
                "Go to chat.openai.com or claude.ai — just use the models",
                "Try the same prompt on GPT-4, Gemini, Claude — compare outputs",
                "Try to make the model hallucinate — note what happens",
                "Go to huggingface.co/models — browse available open source models"
            ],
            "interview_questions": [
                "How does an LLM generate text?",
                "What is the difference between pretraining and fine-tuning?",
                "What does 7B mean in Llama-7B?",
                "What is the difference between open source and closed LLMs?"
            ]
        },
        {
            "title": "2. Transformer Architecture ⭐ Most Important",
            "duration": "7 Days",
            "description": "The transformer is the architecture behind every modern LLM. This is the most asked topic in Gen AI interviews. Do not skip anything here.",
            "topics": [
                {"name": "Why transformers replaced RNN and LSTM — parallelization", "stars": 5, "interview_note": "RNNs process sequentially, transformers process all tokens at once"},
                {"name": "Encoder vs Decoder vs Encoder-Decoder architecture", "stars": 5, "interview_note": "BERT = encoder only, GPT = decoder only, T5 = encoder-decoder"},
                {"name": "Decoder-only architecture — why GPT uses it", "stars": 5, "interview_note": "Most LLMs today are decoder-only"},
                {"name": "Attention mechanism — the core innovation", "stars": 5, "interview_note": "Every interview asks this — how attention lets model focus on relevant tokens"},
                {"name": "Query, Key, Value — what Q K V mean conceptually", "stars": 5, "interview_note": "Q = what am I looking for, K = what do I have, V = what to return"},
                {"name": "Attention formula — softmax(QK^T / sqrt(dk)) * V", "stars": 5, "interview_note": "Know this formula and explain each part"},
                {"name": "Self-attention — each token attends to all other tokens", "stars": 5, "interview_note": "Enables understanding of context and relationships"},
                {"name": "Multi-head attention — run attention multiple times in parallel", "stars": 5, "interview_note": "Each head learns different relationships — syntax, semantics etc"},
                {"name": "Positional encoding — inject position information into tokens", "stars": 5, "interview_note": "Transformers have no built-in order — positional encoding adds it"},
                {"name": "Feed-forward network — applied to each position after attention", "stars": 4, "interview_note": "Two linear layers with ReLU — position-wise"},
                {"name": "Residual connections — skip connections around each sublayer", "stars": 4, "interview_note": "Prevents vanishing gradient — enables very deep networks"},
                {"name": "Layer normalization — normalize activations", "stars": 4, "interview_note": "Applied before or after each sublayer"},
                {"name": "Causal masking in decoder — cannot see future tokens", "stars": 5, "interview_note": "Critical — ensures model only uses past context when predicting"},
                {"name": "KV cache — cache key-value pairs during inference", "stars": 4, "interview_note": "Speeds up inference significantly — avoid recomputing past tokens"},
                {"name": "Attention complexity — O(n²) memory with sequence length", "stars": 4, "interview_note": "Why long context windows are expensive"},
                {"name": "Flash Attention — memory efficient attention implementation", "stars": 3, "interview_note": "Know it exists and what problem it solves"}
            ],
            "practice": [
                "Read The Illustrated Transformer by Jay Alammar — jalammar.github.io",
                "Watch 3Blue1Brown Attention video — pause and re-watch attention formula part",
                "Watch Andrej Karpathy build GPT from scratch",
                "Draw the transformer architecture from memory on paper",
                "Implement simple self-attention in 20 lines of NumPy"
            ],
            "interview_questions": [
                "Explain the transformer architecture",
                "What is self-attention and how does it work?",
                "What are Query, Key, and Value in attention?",
                "Why do we need positional encoding?",
                "What is multi-head attention and why is it better than single-head?",
                "What is the difference between encoder-only and decoder-only models?",
                "Why are transformers better than RNNs?",
                "What is causal masking?"
            ]
        },
        {
            "title": "3. Tokenization",
            "duration": "3 Days",
            "description": "LLMs do not read words. They read tokens. Understanding tokenization explains why LLMs behave the way they do.",
            "topics": [
                {"name": "What is a token — chunk of text, not a word", "stars": 5, "interview_note": "1 token ≈ 4 characters in English — explain this clearly"},
                {"name": "Why not use characters or words — tradeoffs", "stars": 4, "interview_note": "Characters = too many steps, words = too large vocabulary"},
                {"name": "Subword tokenization — best of both worlds", "stars": 5, "interview_note": "Most LLMs use subword — splits rare words into pieces"},
                {"name": "Byte Pair Encoding (BPE) — how GPT tokenizes", "stars": 5, "interview_note": "Merge most frequent pairs iteratively — GPT-4 uses this"},
                {"name": "WordPiece — how BERT tokenizes", "stars": 4, "interview_note": "Similar to BPE but different merging criterion"},
                {"name": "SentencePiece — language-agnostic tokenizer", "stars": 3, "interview_note": "Used by Llama and T5"},
                {"name": "Vocabulary size — typical 32k to 100k tokens", "stars": 4, "interview_note": "GPT-4 has 100k vocabulary"},
                {"name": "Special tokens — BOS, EOS, PAD, SEP, CLS", "stars": 4, "interview_note": "Beginning of sequence, end of sequence etc"},
                {"name": "Token limits — context window in tokens not words", "stars": 5, "interview_note": "128k context = 128000 tokens ≈ 100000 words"},
                {"name": "Token counting — why it matters for cost", "stars": 5, "interview_note": "API pricing is per token — know how to count"},
                {"name": "Tokenization quirks — numbers, spaces, languages", "stars": 4, "interview_note": "Why LLMs struggle with counting letters — tokenization artifact"}
            ],
            "practice": [
                "Go to platform.openai.com/tokenizer — paste text and count tokens",
                "Check how many tokens your resume contains",
                "pip install tiktoken — count tokens in Python",
                "Tokenize the same sentence in different languages — see token count difference",
                "Try: how many Rs in strawberry — explain why LLM gets it wrong using tokenization"
            ],
            "interview_questions": [
                "What is a token?",
                "What is Byte Pair Encoding?",
                "Why do LLMs struggle with counting letters in a word?",
                "What is a vocabulary in the context of LLMs?",
                "How does tokenization affect API costs?"
            ]
        },
        {
            "title": "4. Embeddings ⭐ Very Important",
            "duration": "4 Days",
            "description": "Embeddings convert text into numbers that capture meaning. Used in RAG, semantic search, and recommendation systems.",
            "topics": [
                {"name": "What are embeddings — dense vector representation of text", "stars": 5, "interview_note": "Core concept — similar meanings = similar vectors"},
                {"name": "Word embeddings — Word2Vec, GloVe", "stars": 4, "interview_note": "Older approach — each word has one fixed embedding"},
                {"name": "Contextual embeddings — same word different embedding by context", "stars": 5, "interview_note": "BERT gives bank different embeddings in river bank vs bank account"},
                {"name": "Sentence embeddings — embed entire sentence", "stars": 5, "interview_note": "Used in semantic search and RAG"},
                {"name": "Embedding dimensions — 768, 1536, 3072", "stars": 4, "interview_note": "Higher dimension = more expressive but more expensive"},
                {"name": "Cosine similarity — measure how similar two embeddings are", "stars": 5, "interview_note": "Formula: A·B / (|A||B|) — values from -1 to 1"},
                {"name": "Euclidean distance — alternative similarity measure", "stars": 3, "interview_note": "Less used than cosine for text"},
                {"name": "Dot product — unnormalized cosine similarity", "stars": 4, "interview_note": "Used in attention mechanism"},
                {"name": "Semantic search — find similar meaning not exact match", "stars": 5, "interview_note": "Core use case for embeddings in production"},
                {"name": "Embedding models — text-embedding-3, sentence-transformers", "stars": 5, "interview_note": "Know which models to use for embeddings vs generation"},
                {"name": "Bi-encoder vs Cross-encoder", "stars": 4, "interview_note": "Bi-encoder is fast but less accurate, cross-encoder is slow but accurate"}
            ],
            "practice": [
                "pip install sentence-transformers",
                "from sentence_transformers import SentenceTransformer",
                "model = SentenceTransformer('all-MiniLM-L6-v2')",
                "Embed your resume and a job description",
                "Compute cosine similarity between them",
                "Find which sentences in your resume are most similar to job requirements",
                "Visualize embeddings with t-SNE or UMAP"
            ],
            "interview_questions": [
                "What is an embedding?",
                "What is cosine similarity and how is it calculated?",
                "What is the difference between word embeddings and sentence embeddings?",
                "How are embeddings used in RAG?",
                "What is semantic search?"
            ]
        },
        {
            "title": "5. Prompt Engineering ⭐ Must Master",
            "duration": "4 Days",
            "description": "Prompt engineering is the skill of getting LLMs to do exactly what you want. Every Gen AI job requires this.",
            "topics": [
                {"name": "System prompt vs User prompt vs Assistant message", "stars": 5, "interview_note": "Three roles in chat API — must know all three"},
                {"name": "Zero-shot prompting — no examples given", "stars": 5, "interview_note": "Most basic form"},
                {"name": "One-shot and few-shot prompting — give examples", "stars": 5, "interview_note": "Few-shot dramatically improves output quality"},
                {"name": "Chain-of-thought prompting — ask model to think step by step", "stars": 5, "interview_note": "Add think step by step to improve reasoning — proven to work"},
                {"name": "Role prompting — you are an expert in X", "stars": 5, "interview_note": "Sets context and tone for the response"},
                {"name": "Structured output prompting — ask for JSON output", "stars": 5, "interview_note": "Critical for production — parse LLM output reliably"},
                {"name": "Prompt templates — reusable prompts with variables", "stars": 5, "interview_note": "Used in LangChain — PromptTemplate class"},
                {"name": "Prompt chaining — output of one prompt becomes input of next", "stars": 5, "interview_note": "Building complex workflows with LLMs"},
                {"name": "Self-consistency — generate multiple answers and pick best", "stars": 3, "interview_note": "Advanced technique for reasoning tasks"},
                {"name": "ReAct prompting — reasoning and acting together", "stars": 4, "interview_note": "Foundation of AI agents"},
                {"name": "Prompt injection — security vulnerability", "stars": 5, "interview_note": "User input overrides system prompt — major security issue"},
                {"name": "Jailbreaking — bypassing safety filters", "stars": 3, "interview_note": "Know it exists and how to defend against it"},
                {"name": "Token budget — write concise prompts to save cost", "stars": 4, "interview_note": "Every token costs money in production"}
            ],
            "practice": [
                "Write a zero-shot prompt to extract skills from a resume",
                "Improve it with few-shot examples — compare quality",
                "Add chain-of-thought — see if reasoning improves",
                "Write a prompt that returns JSON output",
                "Build a PromptTemplate in LangChain with variables",
                "Try to inject a malicious instruction into your own system prompt"
            ],
            "interview_questions": [
                "What is chain-of-thought prompting?",
                "What is few-shot prompting and when would you use it?",
                "What is prompt injection and how do you prevent it?",
                "How do you get an LLM to return structured JSON output?",
                "What is the difference between system prompt and user prompt?"
            ]
        },
        {
            "title": "6. Context Window and Generation Parameters",
            "duration": "2 Days",
            "description": "Control how LLMs generate text and understand their memory limitations.",
            "topics": [
                {"name": "Context window — maximum tokens model can process at once", "stars": 5, "interview_note": "GPT-4 has 128k context, Claude has 200k — know the limits"},
                {"name": "Input tokens vs output tokens — both count toward limit", "stars": 5, "interview_note": "Prompt + response combined must fit in context window"},
                {"name": "Lost in the middle problem — LLMs ignore middle of long context", "stars": 5, "interview_note": "Research finding — important facts should be at start or end"},
                {"name": "Temperature — controls randomness of output", "stars": 5, "interview_note": "0 = deterministic, 1 = creative, 2 = chaotic — most asked parameter"},
                {"name": "max_tokens — limit output length", "stars": 5, "interview_note": "Always set this in production to control cost"},
                {"name": "top_p — nucleus sampling", "stars": 4, "interview_note": "Sample from tokens that make up top p probability mass"},
                {"name": "top_k — sample from top k tokens only", "stars": 4, "interview_note": "Alternative to top_p"},
                {"name": "Stop sequences — tell model when to stop generating", "stars": 4, "interview_note": "Useful for structured outputs"},
                {"name": "Frequency penalty — reduce repetition", "stars": 3, "interview_note": "Penalize tokens that appeared frequently"},
                {"name": "Presence penalty — encourage new topics", "stars": 3, "interview_note": "Penalize any token that appeared before"},
                {"name": "Streaming — get tokens as they generate", "stars": 4, "interview_note": "ChatGPT-like real-time output — better user experience"}
            ],
            "practice": [
                "Call Gemini API with temperature=0 — run 3 times — see same output",
                "Call with temperature=1 — run 3 times — see different outputs",
                "Set max_tokens=50 — see truncation",
                "Add stop sequence — model stops when it sees your stop word",
                "Implement streaming response in FastAPI endpoint"
            ],
            "interview_questions": [
                "What is temperature and how does it affect output?",
                "What is a context window?",
                "What is the difference between top_k and top_p?",
                "What is the lost in the middle problem?"
            ]
        },
        {
            "title": "7. Hallucination — Critical Topic",
            "duration": "2 Days",
            "description": "LLMs confidently say wrong things. Understanding why and how to prevent it is essential for production systems.",
            "topics": [
                {"name": "What is hallucination — model generates false but confident information", "stars": 5, "interview_note": "Core problem of LLMs — always asked"},
                {"name": "Why hallucination happens — model predicts likely next token, not true facts", "stars": 5, "interview_note": "LLMs are pattern matchers not knowledge databases"},
                {"name": "Intrinsic hallucination — contradicts source document", "stars": 4, "interview_note": "Model ignores the given context"},
                {"name": "Extrinsic hallucination — adds information not in source", "stars": 4, "interview_note": "Model makes things up beyond given context"},
                {"name": "Grounding — give model facts before asking questions", "stars": 5, "interview_note": "RAG is the main grounding technique"},
                {"name": "Retrieval Augmented Generation — main solution to hallucination", "stars": 5, "interview_note": "Give model real documents to base answer on"},
                {"name": "Self-consistency — run multiple times and check agreement", "stars": 3, "interview_note": "If model keeps giving same answer it is likely correct"},
                {"name": "Citations — ask model to cite sources", "stars": 4, "interview_note": "Makes hallucination detectable"},
                {"name": "Factual verification pipeline — check output against database", "stars": 4, "interview_note": "Production technique for high-stakes applications"},
                {"name": "Confidence calibration — model does not know what it does not know", "stars": 4, "interview_note": "LLMs are overconfident — they do not say I do not know reliably"}
            ],
            "practice": [
                "Ask an LLM about a very recent event — see if it hallucinates",
                "Ask it to cite sources — check if sources actually exist",
                "Ask the same factual question 5 times — note inconsistencies",
                "Give model a document and ask questions about it — check if answers are grounded",
                "Implement a simple fact-checker using another LLM call"
            ],
            "interview_questions": [
                "What is hallucination in LLMs?",
                "Why do LLMs hallucinate?",
                "How do you reduce hallucination in production?",
                "What is the difference between RAG and fine-tuning for reducing hallucination?"
            ]
        },
        {
            "title": "8. LLM API — Build With LLMs",
            "duration": "4 Days",
            "description": "Call LLM APIs from your Python code. This is what you will do every day as a Gen AI engineer.",
            "topics": [
                {"name": "API key — authenticate your requests", "stars": 5, "interview_note": "Never hardcode in code — use environment variables"},
                {"name": "Messages array — list of role and content dicts", "stars": 5, "interview_note": "Core structure of every LLM API call"},
                {"name": "System role — set model behavior and persona", "stars": 5, "interview_note": "First message in messages array"},
                {"name": "User role — human input", "stars": 5, "interview_note": "What the user typed"},
                {"name": "Assistant role — previous model responses", "stars": 5, "interview_note": "Include for multi-turn conversation"},
                {"name": "Response parsing — extract text from response object", "stars": 5, "interview_note": "response.choices[0].message.content for OpenAI"},
                {"name": "Streaming response — yield tokens as they arrive", "stars": 4, "interview_note": "stream=True — iterate over chunks"},
                {"name": "Structured output — JSON mode or function calling", "stars": 5, "interview_note": "response_format={'type': 'json_object'} — reliable JSON"},
                {"name": "Function calling — give LLM tools to use", "stars": 5, "interview_note": "Foundation of AI agents — model decides which function to call"},
                {"name": "Error handling — rate limits, timeouts, retries", "stars": 5, "interview_note": "Production must handle 429 rate limit errors"},
                {"name": "Cost estimation — tokens in + tokens out × price per token", "stars": 4, "interview_note": "Always estimate cost before building"},
                {"name": "Async API calls — parallel requests for speed", "stars": 4, "interview_note": "asyncio for concurrent LLM calls"}
            ],
            "practice": [
                "pip install google-generativeai",
                "Make your first Gemini API call in Python",
                "Build multi-turn conversation — maintain message history",
                "Get structured JSON output from LLM",
                "Implement streaming and print tokens as they arrive",
                "Add retry logic for rate limit errors",
                "Build a simple chatbot with conversation memory"
            ],
            "interview_questions": [
                "How do you maintain conversation history in an LLM API call?",
                "What is function calling in LLMs?",
                "How do you get structured JSON output from an LLM?",
                "How do you handle rate limit errors in production?"
            ]
        },
        {
            "title": "9. RAG — Retrieval Augmented Generation ⭐ Most Important for Jobs",
            "duration": "7 Days",
            "description": "RAG is the most in-demand Gen AI skill. It lets LLMs answer questions from your own documents without hallucinating.",
            "topics": [
                {"name": "What is RAG — retrieve relevant context then generate answer", "stars": 5, "interview_note": "Most asked Gen AI architecture in interviews"},
                {"name": "Why RAG beats fine-tuning for most use cases", "stars": 5, "interview_note": "RAG is cheaper, updatable, and more grounded"},
                {"name": "Document ingestion — load PDF, web, CSV, docs", "stars": 5, "interview_note": "First step of every RAG pipeline"},
                {"name": "Chunking — split documents into smaller pieces", "stars": 5, "interview_note": "Critical — chunk size affects retrieval quality"},
                {"name": "Chunk size and overlap — tradeoffs", "stars": 5, "interview_note": "Too small loses context, too large reduces precision"},
                {"name": "Embedding generation — convert chunks to vectors", "stars": 5, "interview_note": "Use embedding model, not generation model"},
                {"name": "Vector store — store and search embeddings", "stars": 5, "interview_note": "ChromaDB for local, Pinecone for production"},
                {"name": "Similarity search — find most relevant chunks for query", "stars": 5, "interview_note": "Top-k retrieval — return k most similar chunks"},
                {"name": "Context injection — insert retrieved chunks into prompt", "stars": 5, "interview_note": "Answer only using the following context pattern"},
                {"name": "Naive RAG vs Advanced RAG", "stars": 4, "interview_note": "Advanced RAG includes reranking, query expansion, hybrid search"},
                {"name": "Reranking — reorder retrieved chunks by relevance", "stars": 4, "interview_note": "Cross-encoder reranker improves precision"},
                {"name": "Hybrid search — combine keyword and semantic search", "stars": 4, "interview_note": "BM25 + vector search together"},
                {"name": "Query expansion — rewrite query to improve retrieval", "stars": 3, "interview_note": "HyDE — generate hypothetical answer then embed it"},
                {"name": "Evaluation of RAG — faithfulness, relevance, groundedness", "stars": 4, "interview_note": "RAGAs framework for evaluating RAG pipelines"}
            ],
            "practice": [
                "Build RAG pipeline for your own resume",
                "Load PDF → chunk → embed → store in ChromaDB → query",
                "Ask: what skills does this candidate have for ML role",
                "Experiment with different chunk sizes — 256 vs 512 vs 1024 tokens",
                "Add reranker — compare results with and without",
                "Build RAG chatbot for HireSense — answer questions about resumes",
                "Evaluate your RAG with RAGAs"
            ],
            "interview_questions": [
                "Explain the RAG pipeline end to end",
                "What is chunking and why does chunk size matter?",
                "What is the difference between RAG and fine-tuning?",
                "How do you evaluate a RAG system?",
                "What is hybrid search?",
                "What is a reranker?"
            ]
        },
        {
            "title": "10. Vector Databases ⭐ Very Important",
            "duration": "3 Days",
            "description": "Vector databases are the backbone of RAG and semantic search systems.",
            "topics": [
                {"name": "Why regular databases cannot store embeddings efficiently", "stars": 5, "interview_note": "PostgreSQL is slow for vector similarity search at scale"},
                {"name": "Nearest neighbor search — find most similar vectors", "stars": 5, "interview_note": "Core operation of vector DB"},
                {"name": "Approximate Nearest Neighbor (ANN) — trade accuracy for speed", "stars": 5, "interview_note": "Exact search is too slow — ANN is the practical solution"},
                {"name": "HNSW index — most common ANN algorithm", "stars": 4, "interview_note": "Hierarchical Navigable Small World — used by ChromaDB and Pinecone"},
                {"name": "FAISS — Facebook's vector similarity library", "stars": 4, "interview_note": "Most popular open source vector search library"},
                {"name": "ChromaDB — simple local vector database", "stars": 5, "interview_note": "Best for development and small projects — you are already using this"},
                {"name": "Pinecone — managed vector database for production", "stars": 4, "interview_note": "Most popular production vector DB"},
                {"name": "Weaviate and Qdrant — open source production vector DBs", "stars": 3, "interview_note": "Good alternatives to Pinecone"},
                {"name": "pgvector — vector search inside PostgreSQL", "stars": 4, "interview_note": "Add vector search to existing PostgreSQL — simple approach"},
                {"name": "Metadata filtering — filter by attributes before vector search", "stars": 5, "interview_note": "Find documents similar to query AND from 2024 AND about Python"},
                {"name": "Collections and namespaces — organize vectors", "stars": 4, "interview_note": "Separate vectors by document type or user"}
            ],
            "practice": [
                "Use ChromaDB with LangChain — already set up in HireSense",
                "Create collection, add documents, query with different k values",
                "Add metadata to documents — filter by metadata",
                "Try FAISS locally — compare speed with ChromaDB",
                "Sign up for Pinecone free tier — create index and insert vectors",
                "Install pgvector — add vector search to your PostgreSQL database"
            ],
            "interview_questions": [
                "What is a vector database and why do you need one?",
                "What is the difference between exact and approximate nearest neighbor search?",
                "What is HNSW?",
                "How does metadata filtering work in vector databases?",
                "When would you use ChromaDB vs Pinecone?"
            ]
        },
        {
            "title": "11. Fine-Tuning Basics",
            "duration": "3 Days",
            "description": "Adapt a pretrained LLM to your specific task or domain.",
            "topics": [
                {"name": "What is fine-tuning — continue training on domain-specific data", "stars": 5, "interview_note": "Adapt general model to your specific use case"},
                {"name": "When to use fine-tuning vs RAG vs prompt engineering", "stars": 5, "interview_note": "Most important question — use RAG first, fine-tune only if needed"},
                {"name": "Instruction fine-tuning — train on instruction-response pairs", "stars": 5, "interview_note": "How ChatGPT is created from GPT-4 base model"},
                {"name": "Full fine-tuning vs parameter efficient fine-tuning", "stars": 4, "interview_note": "Full = update all weights, PEFT = update small fraction"},
                {"name": "LoRA — Low Rank Adaptation", "stars": 5, "interview_note": "Most popular PEFT method — add small trainable matrices"},
                {"name": "QLoRA — quantized LoRA for consumer GPUs", "stars": 4, "interview_note": "Fine-tune 7B model on single GPU using quantization"},
                {"name": "PEFT library — Hugging Face PEFT", "stars": 4, "interview_note": "Standard library for LoRA and other PEFT methods"},
                {"name": "Training data format — JSONL with instruction and output", "stars": 4, "interview_note": "Know the data format required for fine-tuning"},
                {"name": "Catastrophic forgetting — model forgets general knowledge", "stars": 4, "interview_note": "Risk of fine-tuning — model becomes too specialized"},
                {"name": "Evaluation after fine-tuning — compare to base model", "stars": 4, "interview_note": "Always benchmark against the base model"}
            ],
            "practice": [
                "Use Hugging Face free fine-tuning notebook",
                "Fine-tune a small model like GPT-2 on custom text",
                "Use LoRA to fine-tune Llama on Colab free GPU",
                "Compare base model vs fine-tuned model on your test cases"
            ],
            "interview_questions": [
                "When would you use fine-tuning vs RAG?",
                "What is LoRA and why is it popular?",
                "What is catastrophic forgetting?",
                "What is RLHF?"
            ]
        }
    ],
    "final_learning_order": [
        "What is an LLM and how it generates text",
        "Transformer architecture — attention mechanism",
        "Tokenization",
        "Embeddings and cosine similarity",
        "Prompt engineering",
        "Context window and generation parameters",
        "Hallucination and how to prevent it",
        "LLM API usage in Python",
        "RAG pipeline end to end",
        "Vector databases",
        "Fine-tuning basics"
    ],
    "top_interview_topics": [
        "How transformers work — attention mechanism",
        "Q K V in self-attention",
        "What is RAG and explain end to end",
        "Tokenization and BPE",
        "Cosine similarity formula",
        "Temperature parameter",
        "Hallucination and mitigation",
        "RAG vs Fine-tuning — when to use which",
        "Vector database and ANN search",
        "Prompt injection security issue"
    ],
    "projects": [
        {
            "level": "Beginner",
            "name": "Resume Q&A Bot",
            "description": "Build a RAG system that answers questions about any resume. Upload PDF, ask questions, get grounded answers."
        },
        {
            "level": "Intermediate",
            "name": "Improve HireSense with RAG",
            "description": "Replace rule-based JD matching with semantic search using embeddings. More accurate skill matching."
        },
        {
            "level": "Advanced",
            "name": "Multi-document RAG",
            "description": "Upload 10 resumes for one job. Answer: which candidate is best for this role and why. Rank all candidates."
        }
    ]
}
