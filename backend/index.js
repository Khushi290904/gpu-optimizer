const express = require('express');
const bodyParser = require('body-parser');
const recommend = require('./recommend');
const fetchGpuInstances = require('../backend/fetchGpuInstances');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/recommend', async (req, res) => {
  try {
    const input = req.body;
    const recommendations = await recommend(input); // ✅ Await it
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
