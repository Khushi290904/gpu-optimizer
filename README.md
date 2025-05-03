# gpu-optimizer

## ⚡ GPU Recommendation System

This project is a full-stack web application that recommends GPU instances for machine learning workloads based on user-defined requirements such as model type, dataset size, duration, budget, region, and more.

---

## 📦 video

https://drive.google.com/drive/folders/1-6jZ99f2OEcus0QJTjH4sPeu16LmSyTb

---

## 📦 Tech Stack

- **Frontend**: React 19 + Vite + Axios
- **Backend**: Node.js + Express
- **Language**: JavaScript (ES Modules)
- **Styling**: CSS

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Khushi290904/gpu-optimizer.git

 Install backend dependencies
npm install

# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install
```


#3. Run the App
```bash
cd frontend
npm run dev
Open your browser at: http://localhost:5173
```

## API Reference

# POST /api/recommend
```bash
Request Body
{
  "model_type": "Transformer",         // Type of ML model (e.g., LLM, Transformer, CNN, GAN)
  "task": "inference",                 // Task type: "training" or "inference"
  "dataset_size": 100,                 // Size of your dataset in GB
  "duration": {
    "type": "hours",                   // Duration unit: "hours" or "minutes"
    "value": 8                         // Duration value (numeric)
  },
  "budget": 700,                       // Total budget (in currency unit)
  "country": "usa",                    // Country where resources should be located
  "region": "atlanta",                 // Specific region (e.g., "mumbai", "atlanta")
  "operating_system": "windows",       // Preferred OS: "linux" or "windows"
  "allow_spot": true                   // Whether to allow spot instances (boolean)
}
```

 #Response Body
 ```bash

 {
  "success": true,
  "recommendations": [
    {
      "resource_name": "W.N.A100.512",             // Unique identifier of the resource
      "gpu": "4x A100",                            // GPU configuration (e.g., 4x A100)
      "vcpus": 64,                                 // Number of virtual CPUs
      "ram": 512,                                  // RAM in GB
      "estimated_cost": 60.14,                     // Estimated total cost for the specified duration
      "used_spot": true,                           // Whether spot pricing was used
      "score": 9.42,                               // Suitability score (higher is better)
      "explanation": "W.N.A100.512 with 4x A100 fits your inference workload for Transformer on a 100GB dataset within your budget of ₹700. Cost: ₹60.14, using spot pricing."
    },
    {
      "resource_name": "W.N.A100.256",             // Unique identifier of the resource
      "gpu": "2x A100",                            // GPU configuration (e.g., 2x A100)
      "vcpus": 32,                                 // Number of virtual CPUs
      "ram": 256,                                  // RAM in GB
      "estimated_cost": 30.07,                     // Estimated total cost for the specified duration
      "used_spot": true,                           // Whether spot pricing was used
      "score": 9.27,                               // Suitability score (higher is better)
      "explanation": "W.N.A100.256 with 2x A100 fits your inference workload for Transformer on a 100GB dataset within your budget of ₹700. Cost: ₹30.07, using spot pricing."
    }
  ]
}
```






