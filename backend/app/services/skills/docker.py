DOCKER = {
    "skill": "Docker",
    "total_duration": "4-5 weeks",
    "daily_time": "1 hour per day",
    "why": "Docker packages your app so it runs the same on every machine — your laptop, your teammate's laptop, and the production server. Every company uses Docker. Without Docker knowledge, you cannot deploy anything in the real world.",
    "free_resources": [
        {
            "title": "Docker Tutorial for Beginners - TechWorld with Nana",
            "url": "https://www.youtube.com/watch?v=3c-iBn73dDE",
            "duration": "3 hours 22 mins",
            "covers": "Complete Docker from scratch — best beginner resource"
        },
        {
            "title": "Docker in 100 Seconds - Fireship",
            "url": "https://www.youtube.com/watch?v=Gjnup-PuquQ",
            "duration": "2 mins",
            "covers": "Quick visual overview before you start"
        },
        {
            "title": "Docker Full Course - freeCodeCamp",
            "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo",
            "duration": "2 hours 10 mins",
            "covers": "Hands-on Docker with real projects"
        },
        {
            "title": "Docker Compose Tutorial - TechWorld with Nana",
            "url": "https://www.youtube.com/watch?v=SXwC9fSwct8",
            "duration": "2 hours",
            "covers": "Multi-container apps with Docker Compose"
        },
        {
            "title": "Official Docker Documentation",
            "url": "https://docs.docker.com/get-started/",
            "duration": "Self-paced",
            "covers": "Official reference — use alongside videos"
        },
        {
            "title": "Play With Docker — Free Browser Playground",
            "url": "https://labs.play-with-docker.com/",
            "duration": "Practice anytime",
            "covers": "Run Docker in browser — no install needed"
        }
    ],
    "sections": [
        {
            "title": "1. Foundations — Why Docker Exists",
            "duration": "2 Days",
            "description": "Before writing any command, understand the problem Docker solves. This is what interviewers ask first.",
            "topics": [
                {"name": "The dependency problem — works on my machine but not yours", "stars": 5, "interview_note": "Most asked: explain why Docker was created"},
                {"name": "Virtual Machines vs Containers — key differences", "stars": 5, "interview_note": "Always asked — VMs virtualize hardware, containers virtualize OS"},
                {"name": "What is a Container — isolated process with its own filesystem", "stars": 5, "interview_note": "Definition must be crystal clear"},
                {"name": "What is an Image — read-only template to create containers", "stars": 5, "interview_note": "Image vs Container difference is top interview question"},
                {"name": "Docker Architecture — Client, Daemon, Registry", "stars": 4, "interview_note": "Explain what happens when you run docker run"},
                {"name": "Docker Engine — the core runtime", "stars": 3, "interview_note": "Know what it is, not deep internals"},
                {"name": "Docker Hub — public registry for images", "stars": 4, "interview_note": "Know how to pull and push images"},
                {"name": "Docker Layers — how images are built in layers", "stars": 5, "interview_note": "Very important — layers enable caching and reduce build time"},
                {"name": "Union File System — how layers stack on each other", "stars": 3, "interview_note": "Good to know for advanced interviews"}
            ],
            "practice": [
                "Install Docker Desktop from docker.com",
                "docker run hello-world — verify installation",
                "docker run -it ubuntu bash — get a shell inside Ubuntu",
                "docker ps — list running containers",
                "docker ps -a — list all containers including stopped",
                "docker images — list downloaded images",
                "docker pull nginx — download nginx image",
                "docker stop <id> and docker rm <id>"
            ],
            "interview_questions": [
                "What is the difference between a Docker image and a container?",
                "How is Docker different from a virtual machine?",
                "What is Docker Hub?",
                "Explain Docker architecture in simple terms"
            ]
        },
        {
            "title": "2. Docker Core Commands",
            "duration": "3 Days",
            "description": "These are the commands you will use every single day. Know all of them without thinking.",
            "topics": [
                {"name": "docker run — create and start a container", "stars": 5, "interview_note": "Most used command — know all its flags"},
                {"name": "docker run -d — detached mode (background)", "stars": 5, "interview_note": "Always used in production"},
                {"name": "docker run -p host:container — port mapping", "stars": 5, "interview_note": "Critical — expose app to outside world"},
                {"name": "docker run -e KEY=VALUE — environment variables", "stars": 5, "interview_note": "How you pass config to containers"},
                {"name": "docker run -v — volume mounting", "stars": 5, "interview_note": "Persist data between container restarts"},
                {"name": "docker run --name — give container a name", "stars": 4, "interview_note": "Good practice always"},
                {"name": "docker run --network — connect to network", "stars": 4, "interview_note": "How containers communicate"},
                {"name": "docker logs <id> — view container output", "stars": 5, "interview_note": "First thing you do when debugging"},
                {"name": "docker exec -it <id> bash — get shell inside running container", "stars": 5, "interview_note": "Most used debugging command"},
                {"name": "docker inspect <id> — full container details as JSON", "stars": 4, "interview_note": "Used for debugging network and config issues"},
                {"name": "docker stats — live CPU and memory usage", "stars": 3, "interview_note": "Performance monitoring"},
                {"name": "docker stop vs docker kill — graceful vs force stop", "stars": 4, "interview_note": "Difference asked in interviews"},
                {"name": "docker rm — remove stopped container", "stars": 4, "interview_note": "Cleanup habit"},
                {"name": "docker rmi — remove image", "stars": 4, "interview_note": "Free disk space"},
                {"name": "docker system prune — clean everything unused", "stars": 3, "interview_note": "Maintenance command"}
            ],
            "practice": [
                "docker run -d -p 8080:80 --name my-nginx nginx",
                "Open browser at localhost:8080 — see Nginx page",
                "docker logs my-nginx",
                "docker exec -it my-nginx bash",
                "docker run -d -p 6379:6379 redis",
                "docker run -d -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo",
                "docker inspect my-nginx | grep IPAddress",
                "docker stats — watch live resource usage"
            ],
            "interview_questions": [
                "What is the difference between docker stop and docker kill?",
                "How do you debug a running container?",
                "How do you pass environment variables to a container?",
                "What does docker exec do?"
            ]
        },
        {
            "title": "3. Dockerfile — Build Your Own Images",
            "duration": "5 Days",
            "description": "This is the most important skill. Every company wants you to write Dockerfiles. Master every instruction.",
            "topics": [
                {"name": "FROM — base image to start from", "stars": 5, "interview_note": "Always first line — choose minimal base like python:3.11-slim"},
                {"name": "RUN — execute command during image build", "stars": 5, "interview_note": "Each RUN creates a new layer — combine with && to reduce layers"},
                {"name": "COPY — copy files from host into image", "stars": 5, "interview_note": "COPY vs ADD difference asked in interviews"},
                {"name": "ADD — like COPY but supports URLs and tar extraction", "stars": 3, "interview_note": "Prefer COPY unless you need ADD features"},
                {"name": "WORKDIR — set working directory inside container", "stars": 5, "interview_note": "Always set this — never use absolute paths"},
                {"name": "CMD — default command when container starts", "stars": 5, "interview_note": "CMD vs ENTRYPOINT is top interview question"},
                {"name": "ENTRYPOINT — fixed command that always runs", "stars": 5, "interview_note": "ENTRYPOINT cannot be overridden easily, CMD can"},
                {"name": "ENV — set environment variables in image", "stars": 4, "interview_note": "Bake config into image"},
                {"name": "EXPOSE — document which port app uses", "stars": 4, "interview_note": "Does NOT publish port — just documentation"},
                {"name": "ARG — build-time variables", "stars": 3, "interview_note": "Different from ENV — only available during build"},
                {"name": "VOLUME — create mount point for persistent data", "stars": 4, "interview_note": "Declare where data should persist"},
                {"name": "USER — run container as non-root user", "stars": 4, "interview_note": "Security best practice — always asked"},
                {"name": ".dockerignore — exclude files from build context", "stars": 4, "interview_note": "Like .gitignore — exclude node_modules, venv, .env"},
                {"name": "Layer caching — order instructions for maximum cache hits", "stars": 5, "interview_note": "Critical optimization — put rarely changing layers first"},
                {"name": "Multi-stage builds — separate build and runtime stages", "stars": 5, "interview_note": "Reduces final image size dramatically — very commonly asked"},
                {"name": "Image size optimization — use slim/alpine base images", "stars": 4, "interview_note": "python:3.11-slim vs python:3.11 — 10x smaller"}
            ],
            "practice": [
                "Write Dockerfile for your FastAPI HireSense backend",
                "Write Dockerfile for a simple Flask app",
                "Write Dockerfile for a Node.js app",
                "Practice multi-stage build: stage 1 install dependencies, stage 2 copy only what is needed",
                "Compare image sizes: python:3.11 vs python:3.11-slim vs python:3.11-alpine",
                "docker build -t hiresense:v1 .",
                "docker build --no-cache -t hiresense:v2 . -- force rebuild",
                "docker history hiresense:v1 — see all layers"
            ],
            "interview_questions": [
                "What is the difference between CMD and ENTRYPOINT?",
                "What is a multi-stage build and why do you use it?",
                "How do you reduce Docker image size?",
                "What is layer caching and how does it speed up builds?",
                "Why should you not run containers as root?",
                "What is the difference between COPY and ADD?"
            ]
        },
        {
            "title": "4. Docker Volumes — Persistent Storage",
            "duration": "3 Days",
            "description": "Containers are stateless by default. When a container stops, all data is lost. Volumes solve this.",
            "topics": [
                {"name": "Why containers lose data when stopped", "stars": 5, "interview_note": "Fundamental concept — containers are stateless"},
                {"name": "Named volumes — managed by Docker", "stars": 5, "interview_note": "Most common in production — docker volume create"},
                {"name": "Bind mounts — map host folder to container folder", "stars": 5, "interview_note": "Used in development for hot reload"},
                {"name": "tmpfs mounts — in-memory storage", "stars": 2, "interview_note": "Rarely asked"},
                {"name": "docker volume create — create named volume", "stars": 4, "interview_note": "Know the command"},
                {"name": "docker volume ls — list volumes", "stars": 3, "interview_note": "Inspection command"},
                {"name": "docker volume inspect — volume details", "stars": 3, "interview_note": "Debugging"},
                {"name": "docker volume rm — remove volume", "stars": 3, "interview_note": "Cleanup"},
                {"name": "Volume vs Bind Mount — when to use which", "stars": 5, "interview_note": "Very commonly asked — volumes for production, bind for dev"},
                {"name": "Sharing volumes between containers", "stars": 4, "interview_note": "Multiple containers reading same data"}
            ],
            "practice": [
                "docker volume create mydata",
                "docker run -d -v mydata:/var/lib/postgresql/data postgres",
                "Stop container, start again — verify data persists",
                "docker run -d -v $(pwd):/app python:3.11 python app.py — bind mount",
                "Connect PostgreSQL container with named volume to your FastAPI app"
            ],
            "interview_questions": [
                "What happens to data when a container stops?",
                "What is the difference between a volume and a bind mount?",
                "How do you persist a database in Docker?"
            ]
        },
        {
            "title": "5. Docker Networking",
            "duration": "3 Days",
            "description": "How containers talk to each other and to the outside world.",
            "topics": [
                {"name": "Bridge network — default network for containers", "stars": 5, "interview_note": "Default mode — containers on same bridge can communicate"},
                {"name": "Host network — container shares host network stack", "stars": 4, "interview_note": "Better performance but less isolation"},
                {"name": "None network — completely isolated container", "stars": 2, "interview_note": "Rarely used"},
                {"name": "Custom bridge network — best practice", "stars": 5, "interview_note": "Containers on custom network resolve each other by name"},
                {"name": "Container DNS — containers find each other by name", "stars": 5, "interview_note": "Critical concept — how microservices communicate"},
                {"name": "Port mapping — -p hostPort:containerPort", "stars": 5, "interview_note": "Expose app to outside world"},
                {"name": "docker network create — create custom network", "stars": 4, "interview_note": "Best practice for multi-container apps"},
                {"name": "docker network ls — list networks", "stars": 3, "interview_note": "Inspection"},
                {"name": "docker network connect — add container to network", "stars": 3, "interview_note": "Add running container to network"},
                {"name": "Connecting frontend + backend + database containers", "stars": 5, "interview_note": "Real world scenario always asked"}
            ],
            "practice": [
                "docker network create app-network",
                "docker run -d --name postgres --network app-network postgres",
                "docker run -d --name backend --network app-network your-app",
                "From backend container, ping postgres by name — it should resolve",
                "Build 3-container app: FastAPI + PostgreSQL + Redis all on same custom network"
            ],
            "interview_questions": [
                "How do containers communicate with each other?",
                "What is the difference between bridge and host network?",
                "How does Docker DNS work inside a custom network?"
            ]
        },
        {
            "title": "6. Docker Compose — Multi Container Apps",
            "duration": "7 Days",
            "description": "Run your entire application stack with one command. This is what every real project uses.",
            "topics": [
                {"name": "What is Docker Compose and why it exists", "stars": 5, "interview_note": "Replaces running 10 docker run commands manually"},
                {"name": "docker-compose.yml structure", "stars": 5, "interview_note": "Must know YAML syntax for this file"},
                {"name": "services — define each container", "stars": 5, "interview_note": "Core concept"},
                {"name": "build vs image — build from Dockerfile or pull from Hub", "stars": 5, "interview_note": "Common interview question"},
                {"name": "ports — port mapping in compose", "stars": 5, "interview_note": "Same as -p flag"},
                {"name": "environment — env variables in compose", "stars": 5, "interview_note": "Same as -e flag"},
                {"name": "volumes — persistent storage in compose", "stars": 5, "interview_note": "Define at service level and top level"},
                {"name": "networks — custom networks in compose", "stars": 4, "interview_note": "Compose creates default network automatically"},
                {"name": "depends_on — start order of services", "stars": 5, "interview_note": "Make backend wait for database"},
                {"name": "healthcheck — wait until service is ready", "stars": 4, "interview_note": "depends_on does not wait for service to be ready — healthcheck does"},
                {"name": ".env file with Compose — separate secrets from config", "stars": 5, "interview_note": "Best practice — never hardcode passwords"},
                {"name": "docker compose up — start all services", "stars": 5, "interview_note": "Most used command"},
                {"name": "docker compose up --build — rebuild images then start", "stars": 5, "interview_note": "Use when code changes"},
                {"name": "docker compose down — stop and remove containers", "stars": 5, "interview_note": "Clean shutdown"},
                {"name": "docker compose down -v — also remove volumes", "stars": 4, "interview_note": "Full reset including data"},
                {"name": "docker compose logs — see all service logs", "stars": 4, "interview_note": "Debugging multi-container apps"},
                {"name": "docker compose ps — see status of all services", "stars": 3, "interview_note": "Quick status check"},
                {"name": "docker compose exec — run command in running service", "stars": 4, "interview_note": "Like docker exec but using service name"},
                {"name": "Compose profiles — start different sets of services", "stars": 3, "interview_note": "Advanced feature"},
                {"name": "Override files — docker-compose.override.yml", "stars": 3, "interview_note": "Different config for dev vs prod"}
            ],
            "practice": [
                "Write docker-compose.yml for HireSense: FastAPI + PostgreSQL + Redis",
                "Add .env file for database password",
                "Add healthcheck for PostgreSQL service",
                "docker compose up --build",
                "docker compose logs -f backend — follow backend logs",
                "docker compose exec backend bash",
                "Write separate compose files for development and production",
                "Add Nginx as reverse proxy service in front of FastAPI"
            ],
            "interview_questions": [
                "What is Docker Compose and when do you use it?",
                "What is the difference between depends_on and healthcheck?",
                "How do you manage secrets in Docker Compose?",
                "What is the difference between docker compose up and docker compose up --build?",
                "How do you scale a service in Docker Compose?"
            ]
        },
        {
            "title": "7. Docker in Production — Best Practices",
            "duration": "5 Days",
            "description": "What separates a beginner from a production-ready Docker engineer. Interviewers love these topics.",
            "topics": [
                {"name": "Multi-stage builds — build vs runtime image separation", "stars": 5, "interview_note": "Reduces image size from 1GB to 100MB — always asked"},
                {"name": "Non-root user — run container as unprivileged user", "stars": 5, "interview_note": "Security best practice — asked in every security interview"},
                {"name": "Read-only filesystem — prevent writes to container", "stars": 3, "interview_note": "Advanced security"},
                {"name": "Health checks — let orchestrator know if app is ready", "stars": 5, "interview_note": "Kubernetes and compose use this to restart unhealthy containers"},
                {"name": "Restart policies — always, on-failure, unless-stopped", "stars": 4, "interview_note": "Auto-restart crashed containers"},
                {"name": "Resource limits — CPU and memory limits", "stars": 4, "interview_note": "Prevent one container from starving others"},
                {"name": "Image scanning — find vulnerabilities before deploying", "stars": 4, "interview_note": "Docker Scout, Trivy — security scanning tools"},
                {"name": "Minimal base images — alpine, slim, distroless", "stars": 5, "interview_note": "Smaller image = faster pull = less attack surface"},
                {"name": "Layer ordering — copy requirements before source code", "stars": 5, "interview_note": "Cache requirements layer so rebuild is fast when only code changes"},
                {"name": "Secrets management — never use ENV for secrets in production", "stars": 5, "interview_note": "Use Docker secrets or external vault"},
                {"name": "Logging best practices — stdout and stderr", "stars": 4, "interview_note": "12-factor app principle — log to stdout"},
                {"name": "Image tagging strategy — semantic versioning", "stars": 4, "interview_note": "Never use latest in production"}
            ],
            "practice": [
                "Rewrite your HireSense Dockerfile with multi-stage build",
                "Add USER appuser before CMD in Dockerfile",
                "Add HEALTHCHECK instruction to Dockerfile",
                "Compare image sizes before and after optimization",
                "Install Trivy and scan your image for vulnerabilities",
                "Set memory limit: docker run --memory=512m your-app",
                "Add restart policy: restart: unless-stopped in compose"
            ],
            "interview_questions": [
                "How do you reduce Docker image size?",
                "What is a multi-stage build?",
                "Why should you not run as root in a container?",
                "How do you handle secrets in Docker?",
                "What is a Docker health check?"
            ]
        },
        {
            "title": "8. Docker CI/CD — Automate Everything",
            "duration": "5 Days",
            "description": "Every company automates Docker builds. Learn to build, test, and push images automatically on every code push.",
            "topics": [
                {"name": "What is CI/CD and why it matters", "stars": 5, "interview_note": "Must explain clearly — build, test, deploy automatically"},
                {"name": "GitHub Actions for Docker — build on push", "stars": 5, "interview_note": "Most common CI tool for open source projects"},
                {"name": "docker/build-push-action — official GitHub Action", "stars": 4, "interview_note": "Builds and pushes Docker image in one step"},
                {"name": "Docker Hub as registry — push built images", "stars": 5, "interview_note": "Store versioned images"},
                {"name": "GitHub Container Registry — ghcr.io", "stars": 4, "interview_note": "Alternative to Docker Hub — free with GitHub"},
                {"name": "Build cache in CI — speed up builds", "stars": 4, "interview_note": "Use --cache-from to reuse layers from previous build"},
                {"name": "Matrix builds — build for multiple platforms", "stars": 3, "interview_note": "Build for linux/amd64 and linux/arm64"},
                {"name": "Automated testing in pipeline — run tests inside Docker", "stars": 5, "interview_note": "docker run your-image pytest — test before push"},
                {"name": "Deploy after successful build", "stars": 4, "interview_note": "Trigger Render or EC2 deployment after push"}
            ],
            "practice": [
                "Create .github/workflows/docker.yml",
                "On push to main: build image, run pytest, push to Docker Hub",
                "Add secrets: DOCKER_USERNAME and DOCKER_PASSWORD to GitHub repo settings",
                "View Actions tab — watch pipeline run",
                "Set up automatic deployment to Render after successful push"
            ],
            "interview_questions": [
                "How do you build and push Docker images in CI/CD?",
                "How do you run tests inside a Docker container?",
                "What is the difference between Docker Hub and GitHub Container Registry?"
            ]
        },
        {
            "title": "9. Docker Registry",
            "duration": "2 Days",
            "description": "Store and distribute your Docker images.",
            "topics": [
                {"name": "Docker Hub — public and private repositories", "stars": 5, "interview_note": "Most common registry"},
                {"name": "docker login — authenticate to registry", "stars": 5, "interview_note": "Always needed before push"},
                {"name": "docker tag — tag image for registry", "stars": 5, "interview_note": "username/repo:version format"},
                {"name": "docker push — upload image to registry", "stars": 5, "interview_note": "Core command"},
                {"name": "docker pull — download image from registry", "stars": 5, "interview_note": "Core command"},
                {"name": "Image versioning — v1.0.0, v1.0.1, latest", "stars": 4, "interview_note": "Never use latest in production — always use specific version"},
                {"name": "Private registry — AWS ECR, GCR, Azure ACR", "stars": 4, "interview_note": "Production companies use private registries"},
                {"name": "Self-hosted registry — run your own registry", "stars": 2, "interview_note": "Rarely asked at fresher level"}
            ],
            "practice": [
                "docker tag hiresense:v1 YOUR_USERNAME/hiresense:v1",
                "docker push YOUR_USERNAME/hiresense:v1",
                "docker pull YOUR_USERNAME/hiresense:v1 on a different machine",
                "Create private repository on Docker Hub"
            ],
            "interview_questions": [
                "How do you push a Docker image to Docker Hub?",
                "Why should you not use latest tag in production?",
                "What is a private container registry?"
            ]
        },
        {
            "title": "10. Next Step — Kubernetes",
            "duration": "Pointer only",
            "description": "After Docker, Kubernetes is the natural next step. It manages Docker containers at scale.",
            "topics": [
                {"name": "What Kubernetes solves that Docker Compose cannot", "stars": 5, "interview_note": "Compose is for single machine, Kubernetes is for clusters"},
                {"name": "Pods — Kubernetes equivalent of containers", "stars": 5, "interview_note": "Basic building block"},
                {"name": "Deployments — manage replica sets", "stars": 5, "interview_note": "How you deploy in Kubernetes"},
                {"name": "Services — expose pods to network", "stars": 5, "interview_note": "Same concept as Docker port mapping but more powerful"},
                {"name": "Helm charts — package manager for Kubernetes", "stars": 4, "interview_note": "Like npm but for Kubernetes apps"}
            ],
            "practice": [
                "Install minikube — local Kubernetes cluster",
                "Deploy your HireSense Docker image on minikube",
                "This will be covered in the Kubernetes syllabus"
            ],
            "interview_questions": [
                "When would you use Kubernetes instead of Docker Compose?",
                "What is a Pod in Kubernetes?"
            ]
        }
    ],
    "final_learning_order": [
        "What is Docker and why it exists",
        "Images vs Containers",
        "Core Commands",
        "Write Dockerfiles",
        "Volumes for persistence",
        "Networking between containers",
        "Docker Compose",
        "Production best practices",
        "CI/CD automation",
        "Registry and deployment",
        "Kubernetes next"
    ],
    "top_interview_topics": [
        "Image vs Container difference",
        "VM vs Container difference",
        "CMD vs ENTRYPOINT",
        "Multi-stage builds",
        "Layer caching",
        "Volume vs Bind Mount",
        "Docker Compose depends_on vs healthcheck",
        "Running as non-root",
        "How containers communicate on same network"
    ],
    "projects": [
        {
            "level": "Beginner",
            "name": "Dockerize HireSense Backend",
            "description": "Write a Dockerfile for your FastAPI backend. Build it, run it, verify it works."
        },
        {
            "level": "Intermediate",
            "name": "Full Stack Docker Compose",
            "description": "Write docker-compose.yml with FastAPI + PostgreSQL + Redis. One command starts everything."
        },
        {
            "level": "Advanced",
            "name": "CI/CD Pipeline",
            "description": "GitHub Actions: push code → build Docker image → run tests → push to Docker Hub → deploy to Render."
        }
    ]
}
