PYTORCH = {
    "skill": "PyTorch",
    "total_duration": "4-5 weeks",
    "daily_time": "1 hour per day",
    "why": "PyTorch is the most popular deep learning framework in AI research and production. Meta, Google DeepMind, Tesla, and most AI startups use PyTorch. If you already know TensorFlow, PyTorch will feel cleaner and more Pythonic. Essential for any ML Engineer role.",
    "free_resources": [
        {
            "title": "PyTorch Full Course - freeCodeCamp",
            "url": "https://www.youtube.com/watch?v=Z_ikDlimN6A",
            "duration": "10 hours",
            "covers": "Complete PyTorch from scratch - best beginner resource"
        },
        {
            "title": "PyTorch for Deep Learning - Daniel Bourke",
            "url": "https://www.youtube.com/watch?v=V_xro1bcAuA",
            "duration": "25 hours",
            "covers": "Most comprehensive free PyTorch course available"
        },
        {
            "title": "Official PyTorch Tutorials",
            "url": "https://pytorch.org/tutorials/beginner/basics/intro.html",
            "duration": "Self-paced",
            "covers": "Official step by step tutorials from PyTorch team"
        },
        {
            "title": "Andrej Karpathy - Neural Networks Zero to Hero",
            "url": "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
            "duration": "8 hours",
            "covers": "Build neural networks from scratch in PyTorch - best for deep understanding"
        },
        {
            "title": "PyTorch in 100 Seconds - Fireship",
            "url": "https://www.youtube.com/watch?v=ORMx45xqWkA",
            "duration": "2 mins",
            "covers": "Quick overview before you start"
        }
    ],
    "sections": [
        {
            "title": "1. PyTorch Fundamentals",
            "duration": "3-4 Days",
            "description": "Learn the core building block of PyTorch — Tensors. Everything in deep learning is built on tensors.",
            "topics": [
                {"name": "What is PyTorch and how it differs from TensorFlow", "stars": 5, "interview_note": "Always asked — PyTorch uses dynamic computation graph, TF uses static"},
                {"name": "Install PyTorch — pip install torch torchvision torchaudio", "stars": 4, "interview_note": "Know how to install with and without GPU support"},
                {"name": "What is a Tensor — multi-dimensional array with GPU support", "stars": 5, "interview_note": "Core data structure — like NumPy array but runs on GPU"},
                {"name": "Creating tensors — torch.tensor, torch.zeros, torch.ones, torch.rand", "stars": 5, "interview_note": "Know all 4 creation methods"},
                {"name": "Tensor attributes — shape, dtype, device", "stars": 5, "interview_note": "Always check these when debugging shape errors"},
                {"name": "Tensor operations — add, multiply, matmul, reshape, squeeze, unsqueeze", "stars": 5, "interview_note": "reshape and matmul are most commonly asked"},
                {"name": "Tensor vs NumPy — similarities and conversion", "stars": 4, "interview_note": "tensor.numpy() and torch.from_numpy() — know both"},
                {"name": "Moving tensors to GPU — tensor.to('cuda') or tensor.cuda()", "stars": 5, "interview_note": "Very commonly asked — how to use GPU in PyTorch"},
                {"name": "torch.cuda.is_available() — check if GPU exists", "stars": 4, "interview_note": "Always check before moving to GPU"},
                {"name": "Autograd — automatic gradient computation", "stars": 5, "interview_note": "Most important PyTorch feature — how backpropagation works automatically"},
                {"name": "requires_grad=True — tell PyTorch to track operations", "stars": 5, "interview_note": "Without this, no gradients are computed"},
                {"name": "tensor.backward() — compute gradients", "stars": 5, "interview_note": "Triggers backpropagation through computation graph"},
                {"name": "tensor.grad — access computed gradient", "stars": 5, "interview_note": "x.grad gives derivative of loss with respect to x"},
                {"name": "torch.no_grad() — disable gradient tracking for inference", "stars": 5, "interview_note": "Always use during evaluation — saves memory and speeds up"},
                {"name": "Computation graph — dynamic vs static", "stars": 5, "interview_note": "PyTorch builds graph on the fly — easier debugging than TensorFlow 1.x"}
            ],
            "practice": [
                "x = torch.tensor([1.0, 2.0, 3.0])",
                "x = torch.zeros(3, 4); print(x.shape, x.dtype, x.device)",
                "x = torch.tensor(2.0, requires_grad=True); y = x**3; y.backward(); print(x.grad)",
                "a = torch.rand(3, 4); b = torch.rand(4, 5); print(torch.matmul(a, b).shape)",
                "Move tensor to GPU if available: device = 'cuda' if torch.cuda.is_available() else 'cpu'"
            ],
            "interview_questions": [
                "What is the difference between PyTorch and TensorFlow?",
                "What is autograd in PyTorch?",
                "What does requires_grad=True do?",
                "When do you use torch.no_grad()?",
                "What is a dynamic computation graph?"
            ]
        },
        {
            "title": "2. Building Neural Networks with nn.Module",
            "duration": "5-7 Days",
            "description": "Build neural networks using PyTorch's nn.Module — the standard way every real project is structured.",
            "topics": [
                {"name": "torch.nn.Module — base class for all neural networks", "stars": 5, "interview_note": "Every model must inherit from nn.Module"},
                {"name": "__init__ method — define all layers here", "stars": 5, "interview_note": "Call super().__init__() first always"},
                {"name": "forward() method — define computation flow", "stars": 5, "interview_note": "Never call forward() directly — call model(input) instead"},
                {"name": "nn.Linear — fully connected layer", "stars": 5, "interview_note": "Most basic layer — nn.Linear(in_features, out_features)"},
                {"name": "nn.Conv2d — 2D convolutional layer", "stars": 5, "interview_note": "Core of CNN — know parameters: in_channels, out_channels, kernel_size"},
                {"name": "nn.LSTM — LSTM layer", "stars": 5, "interview_note": "Directly relevant to your IEEE paper project"},
                {"name": "nn.Embedding — convert integers to dense vectors", "stars": 4, "interview_note": "Used in NLP models for word embeddings"},
                {"name": "Activation functions — nn.ReLU, nn.Sigmoid, nn.Softmax, nn.Tanh", "stars": 5, "interview_note": "ReLU is default choice — know when to use each"},
                {"name": "nn.Sequential — stack layers in order", "stars": 5, "interview_note": "Quick way to build simple models without forward method"},
                {"name": "nn.Dropout — randomly zero out neurons during training", "stars": 5, "interview_note": "Prevents overfitting — disabled automatically during eval"},
                {"name": "nn.BatchNorm2d — normalize activations", "stars": 4, "interview_note": "Speeds up training and stabilizes it"},
                {"name": "model.parameters() — get all trainable parameters", "stars": 5, "interview_note": "Passed to optimizer"},
                {"name": "model.train() vs model.eval() — switch modes", "stars": 5, "interview_note": "Critical — Dropout and BatchNorm behave differently in each mode"},
                {"name": "model.state_dict() — get all weights as dict", "stars": 5, "interview_note": "Used for saving and loading models"}
            ],
            "practice": [
                "Build 3-layer classifier: nn.Linear(784, 256) -> ReLU -> nn.Linear(256, 128) -> ReLU -> nn.Linear(128, 10)",
                "Build CNN: Conv2d(1,32,3) -> ReLU -> MaxPool -> Conv2d(32,64,3) -> ReLU -> MaxPool -> Flatten -> Linear",
                "Build LSTM model for sequence classification — connect to your sign language project",
                "Use nn.Sequential to build a model in 5 lines",
                "Print model summary: print(model) and count parameters"
            ],
            "interview_questions": [
                "What is nn.Module?",
                "What is the difference between model.train() and model.eval()?",
                "How does Dropout work and when is it disabled?",
                "What does forward() do in PyTorch?",
                "How do you count the number of parameters in a model?"
            ]
        },
        {
            "title": "3. Loss Functions and Optimizers",
            "duration": "2-3 Days",
            "description": "Loss functions measure how wrong your model is. Optimizers update weights to make it less wrong.",
            "topics": [
                {"name": "What is a loss function — measures difference between prediction and truth", "stars": 5, "interview_note": "Core concept — always asked"},
                {"name": "nn.CrossEntropyLoss — for multi-class classification", "stars": 5, "interview_note": "Most common loss — includes softmax internally"},
                {"name": "nn.BCELoss — binary cross entropy for binary classification", "stars": 4, "interview_note": "Use when output is 0 or 1"},
                {"name": "nn.MSELoss — mean squared error for regression", "stars": 5, "interview_note": "Most common regression loss"},
                {"name": "torch.optim.Adam — adaptive learning rate optimizer", "stars": 5, "interview_note": "Default choice for most problems — lr=0.001"},
                {"name": "torch.optim.SGD — stochastic gradient descent", "stars": 4, "interview_note": "Simpler optimizer — needs learning rate tuning"},
                {"name": "optimizer.zero_grad() — clear previous gradients", "stars": 5, "interview_note": "Must be called before every backward pass — most common bug if forgotten"},
                {"name": "loss.backward() — compute gradients", "stars": 5, "interview_note": "Backpropagation through computation graph"},
                {"name": "optimizer.step() — update weights", "stars": 5, "interview_note": "Apply computed gradients to parameters"},
                {"name": "Learning rate — most important hyperparameter", "stars": 5, "interview_note": "Too high = unstable training, too low = very slow"},
                {"name": "Learning rate scheduler — reduce lr over time", "stars": 4, "interview_note": "torch.optim.lr_scheduler.StepLR, CosineAnnealingLR"}
            ],
            "practice": [
                "Full training step: optimizer.zero_grad() -> output=model(x) -> loss=criterion(output,y) -> loss.backward() -> optimizer.step()",
                "Try Adam with lr=0.001, 0.01, 0.0001 — see effect on training",
                "Add learning rate scheduler to training loop",
                "Plot loss curve over epochs using matplotlib"
            ],
            "interview_questions": [
                "Why do you call optimizer.zero_grad() before backward?",
                "What is the difference between CrossEntropyLoss and BCELoss?",
                "What does optimizer.step() do?",
                "What happens if learning rate is too high or too low?"
            ]
        },
        {
            "title": "4. Training Loop — The Full Pattern",
            "duration": "3-4 Days",
            "description": "The training loop is the heart of every ML project. Master this pattern — you will write it hundreds of times.",
            "topics": [
                {"name": "Dataset class — torch.utils.data.Dataset", "stars": 5, "interview_note": "Custom dataset must implement __len__ and __getitem__"},
                {"name": "DataLoader — batch and shuffle data automatically", "stars": 5, "interview_note": "DataLoader(dataset, batch_size=32, shuffle=True)"},
                {"name": "Training loop structure — epochs and batches", "stars": 5, "interview_note": "Outer loop = epochs, inner loop = batches"},
                {"name": "Validation loop — evaluate on unseen data each epoch", "stars": 5, "interview_note": "Run with torch.no_grad() and model.eval()"},
                {"name": "Training vs validation loss — detect overfitting", "stars": 5, "interview_note": "Val loss increasing while train loss decreasing = overfitting"},
                {"name": "Accuracy calculation — correct predictions / total", "stars": 5, "interview_note": "torch.argmax(output, dim=1) == labels"},
                {"name": "torchvision datasets — MNIST, CIFAR10, ImageNet", "stars": 4, "interview_note": "Standard benchmark datasets for practice"},
                {"name": "torchvision transforms — normalize, resize, augment", "stars": 4, "interview_note": "transforms.Compose([transforms.ToTensor(), transforms.Normalize()])"},
                {"name": "Custom Dataset class — load your own data", "stars": 5, "interview_note": "Real projects always need custom datasets"},
                {"name": "Checkpointing — save model during training", "stars": 4, "interview_note": "Save best model based on validation loss"}
            ],
            "practice": [
                "Load MNIST with torchvision.datasets.MNIST",
                "Wrap in DataLoader with batch_size=64, shuffle=True",
                "Write full training loop for 10 epochs",
                "Add validation loop — print train loss and val loss each epoch",
                "Plot training and validation curves",
                "Save best model: if val_loss < best_loss: torch.save(model.state_dict(), 'best.pth')"
            ],
            "interview_questions": [
                "What methods must a custom Dataset implement?",
                "What is the difference between an epoch and a batch?",
                "How do you detect overfitting during training?",
                "Why do you shuffle training data but not validation data?"
            ]
        },
        {
            "title": "5. Save, Load and Deploy Models",
            "duration": "2-3 Days",
            "description": "A trained model is useless if you cannot save and use it later. Learn to persist and serve models.",
            "topics": [
                {"name": "torch.save(model.state_dict(), path) — save weights only", "stars": 5, "interview_note": "Preferred way — saves only weights not architecture"},
                {"name": "torch.save(model, path) — save entire model", "stars": 4, "interview_note": "Easier but less portable"},
                {"name": "model.load_state_dict(torch.load(path)) — load weights", "stars": 5, "interview_note": "Must create model first then load weights into it"},
                {"name": "map_location — load GPU model on CPU", "stars": 4, "interview_note": "torch.load(path, map_location='cpu') — common in deployment"},
                {"name": "model.eval() after loading — switch to inference mode", "stars": 5, "interview_note": "Always do this before making predictions"},
                {"name": "ONNX export — export to framework-agnostic format", "stars": 3, "interview_note": "torch.onnx.export() — deploy on any platform"},
                {"name": "TorchScript — compile model for production", "stars": 3, "interview_note": "torch.jit.script() — faster inference"},
                {"name": "Serve model with FastAPI — build prediction endpoint", "stars": 5, "interview_note": "Most practical skill — build REST API around your model"},
                {"name": "Batch inference vs single inference", "stars": 4, "interview_note": "Batch is faster — unsqueeze(0) for single sample"}
            ],
            "practice": [
                "Train model -> torch.save(model.state_dict(), 'model.pth')",
                "Load: model = YourModel(); model.load_state_dict(torch.load('model.pth')); model.eval()",
                "Build FastAPI endpoint that loads model and returns prediction",
                "Rewrite your sign language LSTM project to save and serve via FastAPI",
                "Test with a real image input end to end"
            ],
            "interview_questions": [
                "What is the difference between saving state_dict vs entire model?",
                "What is map_location used for?",
                "How do you serve a PyTorch model as an API?",
                "What is ONNX?"
            ]
        },
        {
            "title": "6. Transfer Learning — Most Practical Skill",
            "duration": "3-4 Days",
            "description": "Use pretrained models instead of training from scratch. This is how real projects work — nobody trains ResNet from zero.",
            "topics": [
                {"name": "What is transfer learning — reuse pretrained weights", "stars": 5, "interview_note": "Most important practical skill — always asked"},
                {"name": "Feature extraction — freeze all layers except final", "stars": 5, "interview_note": "param.requires_grad = False to freeze"},
                {"name": "Fine-tuning — unfreeze some layers and retrain", "stars": 5, "interview_note": "Better than feature extraction for domain-specific tasks"},
                {"name": "torchvision.models — pretrained models", "stars": 5, "interview_note": "ResNet, VGG, EfficientNet, MobileNet all available"},
                {"name": "ResNet — most commonly used pretrained model", "stars": 5, "interview_note": "resnet50 = torchvision.models.resnet50(pretrained=True)"},
                {"name": "Replace final layer — adapt to your number of classes", "stars": 5, "interview_note": "model.fc = nn.Linear(2048, num_classes) for ResNet50"},
                {"name": "Hugging Face transformers — pretrained NLP models", "stars": 5, "interview_note": "from transformers import AutoModel — loads any pretrained LLM"},
                {"name": "BERT for text classification", "stars": 4, "interview_note": "Fine-tune BERT on your text classification task"}
            ],
            "practice": [
                "Load pretrained ResNet50: model = torchvision.models.resnet50(weights='IMAGENET1K_V1')",
                "Freeze all layers: for param in model.parameters(): param.requires_grad = False",
                "Replace final layer: model.fc = nn.Linear(2048, 10)",
                "Train only the final layer on CIFAR-10",
                "Compare accuracy: from scratch vs transfer learning",
                "Load BERT and fine-tune on a sentiment classification task"
            ],
            "interview_questions": [
                "What is transfer learning?",
                "What is the difference between feature extraction and fine-tuning?",
                "How do you freeze layers in PyTorch?",
                "Why is transfer learning better than training from scratch?"
            ]
        }
    ],
    "final_learning_order": [
        "Tensors and autograd",
        "nn.Module and building networks",
        "Loss functions and optimizers",
        "Full training loop",
        "Save and load models",
        "Transfer learning",
        "Deploy with FastAPI"
    ],
    "top_interview_topics": [
        "Dynamic vs static computation graph",
        "autograd and requires_grad",
        "optimizer.zero_grad() why it is needed",
        "model.train() vs model.eval()",
        "torch.no_grad() purpose",
        "Transfer learning — freeze and fine-tune",
        "Custom Dataset __len__ and __getitem__",
        "Save and load state_dict"
    ],
    "projects": [
        {
            "level": "Beginner",
            "name": "MNIST Classifier",
            "description": "Build and train a neural network to classify handwritten digits. Full training loop with validation."
        },
        {
            "level": "Intermediate",
            "name": "Rewrite Sign Language Project in PyTorch",
            "description": "Take your IEEE paper LSTM model and rewrite it completely in PyTorch. Deploy with FastAPI."
        },
        {
            "level": "Advanced",
            "name": "Transfer Learning Image Classifier",
            "description": "Fine-tune ResNet50 on a custom dataset. Compare with training from scratch. Deploy as REST API."
        }
    ]
}
