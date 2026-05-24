AWS = {
    "skill": "AWS",
    "total_duration": "4-5 weeks",
    "daily_time": "1 hour per day",
    "why": "AWS is used by over 90% of companies worldwide. For AI and ML engineer roles, you need S3 for storing datasets and models, EC2 for running training jobs, Lambda for serverless inference, and SageMaker for managed ML. Without cloud knowledge you cannot deploy anything in production.",
    "free_resources": [
        {
            "title": "AWS Tutorial for Beginners - TechWorld with Nana",
            "url": "https://www.youtube.com/watch?v=k1RI5locZE4",
            "duration": "4 hours",
            "covers": "Complete AWS fundamentals from scratch"
        },
        {
            "title": "AWS Full Course 2024 - freeCodeCamp",
            "url": "https://www.youtube.com/watch?v=ubCNZFQZZWg",
            "duration": "5 hours",
            "covers": "Comprehensive AWS course covering all core services"
        },
        {
            "title": "AWS Cloud Practitioner - Andrew Brown freeCodeCamp",
            "url": "https://www.youtube.com/watch?v=SOTamWNgDKc",
            "duration": "14 hours",
            "covers": "Full certification prep - also excellent learning resource"
        },
        {
            "title": "AWS Free Tier - Create Account",
            "url": "https://aws.amazon.com/free/",
            "duration": "30 mins setup",
            "covers": "750 hours EC2 + 5GB S3 + much more free every month"
        },
        {
            "title": "AWS Skill Builder - Official Free Courses",
            "url": "https://skillbuilder.aws/",
            "duration": "Self-paced",
            "covers": "Official AWS training - many free courses available"
        }
    ],
    "sections": [
        {
            "title": "1. AWS Basics and Account Setup",
            "duration": "2 Days",
            "description": "Understand what AWS is, create your account, and navigate the console. Never skip this — bad account setup causes accidental billing.",
            "topics": [
                {"name": "What is AWS and what is cloud computing", "stars": 5, "interview_note": "Define cloud computing: on-demand resources over internet, pay per use"},
                {"name": "AWS global infrastructure — Regions and Availability Zones", "stars": 5, "interview_note": "Region = geographic area, AZ = data center within region — always asked"},
                {"name": "Create AWS free tier account — add credit card but stay in free limits", "stars": 5, "interview_note": "Know what free tier includes: 750hr EC2 t2.micro, 5GB S3, 1M Lambda requests"},
                {"name": "AWS Console — web interface to manage all services", "stars": 4, "interview_note": "Know how to navigate — search bar finds any service"},
                {"name": "IAM — Identity and Access Management", "stars": 5, "interview_note": "Most important security service — controls who can do what"},
                {"name": "Root account vs IAM user — never use root for daily work", "stars": 5, "interview_note": "Security best practice — always asked"},
                {"name": "IAM users, groups, roles, and policies", "stars": 5, "interview_note": "User = person, Role = service identity, Policy = permissions document"},
                {"name": "Principle of least privilege — give minimum permissions needed", "stars": 5, "interview_note": "Core security concept — always asked in interviews"},
                {"name": "AWS CLI — command line tool to manage AWS", "stars": 5, "interview_note": "aws configure — set access key, secret, region"},
                {"name": "Access keys vs IAM roles — keys for CLI, roles for services", "stars": 4, "interview_note": "Never hardcode access keys in code — use roles or env variables"},
                {"name": "Billing alerts — set up to avoid surprise charges", "stars": 5, "interview_note": "Always set this up first — prevents accidental bills"}
            ],
            "practice": [
                "Create AWS account at aws.amazon.com/free",
                "Create IAM user with AdministratorAccess — download credentials",
                "Never use root account again after setup",
                "Install AWS CLI: pip install awscli",
                "aws configure — enter access key, secret key, region us-east-1",
                "aws sts get-caller-identity — verify CLI works",
                "Set up billing alert at 5 dollars to avoid surprise charges"
            ],
            "interview_questions": [
                "What is the difference between a Region and an Availability Zone?",
                "What is IAM and why is it important?",
                "What is the principle of least privilege?",
                "Why should you not use the root account for daily work?",
                "What is the difference between an IAM user and an IAM role?"
            ]
        },
        {
            "title": "2. S3 — Simple Storage Service",
            "duration": "3-4 Days",
            "description": "S3 is the most used AWS service. It stores files, datasets, ML models, static websites, and backups. Every AWS project uses S3.",
            "topics": [
                {"name": "What is S3 — object storage for any type of file", "stars": 5, "interview_note": "Object storage vs block storage vs file storage difference"},
                {"name": "Buckets — containers for objects, globally unique name", "stars": 5, "interview_note": "Bucket name must be unique across all AWS globally"},
                {"name": "Objects — files stored in S3, max 5TB per object", "stars": 5, "interview_note": "Object = file + metadata + key"},
                {"name": "S3 storage classes — Standard, Infrequent Access, Glacier", "stars": 4, "interview_note": "Standard for frequent access, Glacier for archiving — cost vs speed tradeoff"},
                {"name": "S3 bucket policies — control who can access bucket", "stars": 5, "interview_note": "JSON policy document — very commonly asked"},
                {"name": "Public vs private access — block public access by default", "stars": 5, "interview_note": "Never make bucket public unless intentional"},
                {"name": "Presigned URLs — temporary access to private objects", "stars": 5, "interview_note": "Generate URL valid for X minutes — used for file downloads in apps"},
                {"name": "S3 versioning — keep multiple versions of objects", "stars": 4, "interview_note": "Protect against accidental deletion"},
                {"name": "S3 lifecycle policies — auto-move to cheaper storage class", "stars": 3, "interview_note": "Cost optimization"},
                {"name": "Static website hosting — serve HTML from S3", "stars": 4, "interview_note": "Host React app on S3 + CloudFront"},
                {"name": "S3 with Python — boto3 library", "stars": 5, "interview_note": "pip install boto3 — most important AWS Python library"},
                {"name": "Multipart upload — upload large files in parts", "stars": 3, "interview_note": "Required for files over 5GB"},
                {"name": "S3 Transfer Acceleration — faster uploads via CloudFront", "stars": 2, "interview_note": "Advanced feature"}
            ],
            "practice": [
                "Create S3 bucket with unique name",
                "Upload your resume PDF to S3",
                "Make object public and access via URL",
                "pip install boto3",
                "import boto3; s3 = boto3.client('s3')",
                "s3.upload_file('resume.pdf', 'your-bucket', 'resume.pdf')",
                "Generate presigned URL: s3.generate_presigned_url('get_object', Params={'Bucket': 'bucket', 'Key': 'resume.pdf'}, ExpiresIn=3600)",
                "Store your ML model file in S3 and download it in Python"
            ],
            "interview_questions": [
                "What is S3 and what is it used for?",
                "What is a presigned URL?",
                "What is the difference between S3 storage classes?",
                "How do you make an S3 object publicly accessible?",
                "What is S3 versioning?"
            ]
        },
        {
            "title": "3. EC2 — Elastic Compute Cloud",
            "duration": "5-6 Days",
            "description": "EC2 gives you virtual computers in the cloud. Used to run backends, training jobs, and any compute-heavy task.",
            "topics": [
                {"name": "What is EC2 — virtual machine in AWS cloud", "stars": 5, "interview_note": "Core compute service — launch Linux or Windows servers"},
                {"name": "Instance types — t2.micro, t3.small, p3.xlarge", "stars": 5, "interview_note": "t = general, c = compute, r = memory, p/g = GPU — know this pattern"},
                {"name": "t2.micro — free tier eligible, 1 vCPU, 1GB RAM", "stars": 5, "interview_note": "Use this for practice — free 750 hours per month"},
                {"name": "AMI — Amazon Machine Image, OS template for instance", "stars": 5, "interview_note": "Ubuntu 22.04 AMI is most common for ML projects"},
                {"name": "Key pairs — SSH authentication to EC2", "stars": 5, "interview_note": "Download .pem file — keep it safe, cannot be re-downloaded"},
                {"name": "Security groups — firewall rules for EC2", "stars": 5, "interview_note": "Inbound rules control what traffic reaches your instance"},
                {"name": "SSH into EC2 — ssh -i key.pem ubuntu@PUBLIC_IP", "stars": 5, "interview_note": "Most common interview practical question"},
                {"name": "Elastic IP — static public IP address", "stars": 4, "interview_note": "Regular IP changes on restart — Elastic IP stays fixed"},
                {"name": "User data — run scripts on instance startup", "stars": 4, "interview_note": "Auto-install software when instance launches"},
                {"name": "EBS volumes — persistent storage attached to EC2", "stars": 5, "interview_note": "Like a hard drive for your EC2 — data persists after stop"},
                {"name": "Instance store — temporary storage, lost on stop", "stars": 3, "interview_note": "Different from EBS — not persistent"},
                {"name": "Stop vs terminate — stop keeps EBS, terminate deletes everything", "stars": 5, "interview_note": "Very commonly asked — stop to pause, terminate to delete"},
                {"name": "Auto Scaling — automatically add or remove instances", "stars": 4, "interview_note": "Scale based on CPU or request load"},
                {"name": "Load Balancer — distribute traffic across multiple instances", "stars": 4, "interview_note": "ALB for HTTP, NLB for TCP — works with Auto Scaling"}
            ],
            "practice": [
                "Launch t2.micro with Ubuntu 22.04",
                "Download key pair as .pem file",
                "Add inbound rule: SSH port 22 from your IP",
                "SSH: ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP",
                "sudo apt update && sudo apt install python3-pip -y",
                "pip3 install fastapi uvicorn",
                "Deploy your HireSense backend on EC2",
                "Add port 8000 to security group inbound rules",
                "Visit http://YOUR_EC2_IP:8000 — see your API live"
            ],
            "interview_questions": [
                "What is the difference between stopping and terminating an EC2 instance?",
                "What is a security group?",
                "What is an AMI?",
                "What is the difference between EBS and instance store?",
                "How do you SSH into an EC2 instance?",
                "What is Auto Scaling?"
            ]
        },
        {
            "title": "4. Lambda — Serverless Computing",
            "duration": "4-5 Days",
            "description": "Lambda runs your code without you managing any server. You pay only when code runs. Perfect for ML inference APIs.",
            "topics": [
                {"name": "What is serverless — no server management, pay per execution", "stars": 5, "interview_note": "Core concept — you bring code, AWS manages everything else"},
                {"name": "Lambda function structure — handler(event, context)", "stars": 5, "interview_note": "event = input data, context = runtime info"},
                {"name": "Lambda triggers — S3, API Gateway, EventBridge, SQS", "stars": 5, "interview_note": "What causes Lambda to run — know all common triggers"},
                {"name": "Lambda execution limits — 15 min max, 10GB memory max", "stars": 4, "interview_note": "Not suitable for long training jobs — use EC2 for that"},
                {"name": "Lambda layers — add dependencies as layers", "stars": 5, "interview_note": "Add numpy, pandas, sklearn as Lambda layers"},
                {"name": "Cold start — first invocation is slow", "stars": 5, "interview_note": "Lambda needs to initialize — subsequent calls are faster"},
                {"name": "API Gateway + Lambda — REST API without server", "stars": 5, "interview_note": "Most common Lambda pattern — expose function as HTTP endpoint"},
                {"name": "Lambda environment variables — store config and secrets", "stars": 4, "interview_note": "Never hardcode secrets in Lambda code"},
                {"name": "Lambda concurrency — run multiple instances simultaneously", "stars": 4, "interview_note": "Auto-scales to handle traffic spikes"},
                {"name": "Lambda vs EC2 vs ECS — when to use which", "stars": 5, "interview_note": "Lambda for short tasks, EC2 for long running, ECS for containers"}
            ],
            "practice": [
                "Create Lambda function in Python 3.11",
                "Write handler that returns JSON response",
                "Test with sample event in Lambda console",
                "Add API Gateway trigger — get HTTPS URL",
                "Call your Lambda from browser or curl",
                "Create Lambda that processes S3 upload — trigger on file upload",
                "Add numpy layer to Lambda function"
            ],
            "interview_questions": [
                "What is serverless computing?",
                "What is a Lambda cold start and how do you reduce it?",
                "What is the maximum execution time for Lambda?",
                "When would you use Lambda vs EC2?",
                "How do you add external libraries to Lambda?"
            ]
        },
        {
            "title": "5. RDS — Managed Database Service",
            "duration": "2-3 Days",
            "description": "RDS manages your PostgreSQL or MySQL database in the cloud — backups, scaling, and patching handled automatically.",
            "topics": [
                {"name": "What is RDS — managed relational database", "stars": 5, "interview_note": "RDS vs self-managed DB on EC2 — RDS handles maintenance"},
                {"name": "RDS engines — PostgreSQL, MySQL, Aurora, MariaDB", "stars": 4, "interview_note": "Aurora is AWS proprietary — 5x faster than MySQL"},
                {"name": "RDS free tier — db.t3.micro, 20GB storage", "stars": 4, "interview_note": "Use for practice — free 750 hours per month"},
                {"name": "Multi-AZ deployment — automatic failover", "stars": 4, "interview_note": "High availability — standby in another AZ"},
                {"name": "Read replicas — scale read operations", "stars": 4, "interview_note": "Offload read queries to replicas"},
                {"name": "RDS security — VPC, security groups, encryption", "stars": 5, "interview_note": "Never expose RDS publicly — access only from EC2 in same VPC"},
                {"name": "Connect RDS to FastAPI — update DATABASE_URL", "stars": 5, "interview_note": "Replace localhost with RDS endpoint in .env"}
            ],
            "practice": [
                "Create PostgreSQL RDS instance on free tier",
                "Configure security group to allow port 5432 from EC2 only",
                "Connect using psql: psql -h RDS_ENDPOINT -U postgres -d hiresense",
                "Update HireSense DATABASE_URL to use RDS endpoint",
                "Deploy HireSense backend on EC2 connected to RDS"
            ],
            "interview_questions": [
                "What is RDS and why use it instead of self-managed database?",
                "What is Multi-AZ deployment?",
                "What is Aurora?",
                "How do you secure an RDS instance?"
            ]
        },
        {
            "title": "6. SageMaker — ML on AWS",
            "duration": "4-5 Days",
            "description": "SageMaker is AWS's managed ML platform. Train, deploy, and monitor ML models without managing infrastructure.",
            "topics": [
                {"name": "What is SageMaker — end to end ML platform", "stars": 5, "interview_note": "Most asked AWS ML service — know the full workflow"},
                {"name": "SageMaker Studio — IDE for ML in the cloud", "stars": 4, "interview_note": "Like JupyterLab but managed by AWS"},
                {"name": "SageMaker Notebooks — managed Jupyter notebooks", "stars": 5, "interview_note": "Run training on cloud GPU from browser"},
                {"name": "Built-in algorithms — XGBoost, Linear Learner, etc", "stars": 3, "interview_note": "AWS optimized versions — faster than open source"},
                {"name": "Training jobs — run training on managed infrastructure", "stars": 5, "interview_note": "Specify instance type, docker image, data location in S3"},
                {"name": "Model registry — version and manage trained models", "stars": 4, "interview_note": "Track model versions and approve for production"},
                {"name": "Endpoints — deploy model as REST API", "stars": 5, "interview_note": "Most important SageMaker feature — one click deployment"},
                {"name": "Real-time vs batch inference", "stars": 5, "interview_note": "Real-time endpoint for low latency, batch transform for bulk"},
                {"name": "SageMaker Pipelines — automate ML workflow", "stars": 3, "interview_note": "MLOps on AWS"},
                {"name": "SageMaker costs — expensive — use free tier carefully", "stars": 5, "interview_note": "Always stop notebook instances when not using"}
            ],
            "practice": [
                "Create SageMaker Studio domain",
                "Launch notebook instance — choose ml.t3.medium",
                "Train sklearn model in SageMaker notebook",
                "Deploy model to SageMaker endpoint",
                "Call endpoint with boto3: runtime.invoke_endpoint()",
                "Remember to DELETE endpoint after practice — it costs money per hour"
            ],
            "interview_questions": [
                "What is SageMaker?",
                "What is the difference between a training job and an endpoint?",
                "What is the difference between real-time and batch inference?",
                "How do you deploy a model on SageMaker?"
            ]
        }
    ],
    "final_learning_order": [
        "Account setup and IAM",
        "S3 storage",
        "EC2 virtual machines",
        "Lambda serverless",
        "RDS managed database",
        "SageMaker for ML",
        "Deploy HireSense on AWS"
    ],
    "top_interview_topics": [
        "IAM users vs roles vs policies",
        "Principle of least privilege",
        "S3 storage classes",
        "Presigned URLs",
        "EC2 stop vs terminate",
        "Security groups",
        "Lambda cold start",
        "Lambda vs EC2 when to use which",
        "SageMaker endpoint deployment"
    ],
    "projects": [
        {
            "level": "Beginner",
            "name": "Store ML Model in S3",
            "description": "Train a model locally, save it, upload to S3, download in another script and make predictions."
        },
        {
            "level": "Intermediate",
            "name": "Deploy HireSense on EC2",
            "description": "Launch EC2 instance, SSH in, deploy your FastAPI backend, open port 8000, access from browser."
        },
        {
            "level": "Advanced",
            "name": "Serverless ML API",
            "description": "Deploy ML model as Lambda function with API Gateway. Auto-scales to any traffic. No server management."
        }
    ]
}
