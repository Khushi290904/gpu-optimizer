const express = require('express');
const app = express();
const recommend = require("../backend/recommend.js");

// Middleware to parse JSON request bodies
app.use(express.json());

const sampleData = {
  "model_type": "Transformer",
  "task": "training",
  "dataset_size": 100,
  "duration": {
    "type": "hours",
    "value": 10
  },
  "budget": 100,
  "region": "mumbai",
  "country": "india",
  "operating_system": "windows",
  "allow_spot": true
};

const port = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
    res.send("Working fine");
});

// GET route for recommendation
app.get('/recommend', (req, res) => {
    res.json(sampleData);
});

// POST route for recommendation
app.post("/recommend", (req, res) => {
    const data = req.body;
    console.log("Received Data:", data);
    res.send("Got the data");

   const check =  recommend(data);
   console.log(check);
   

});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
