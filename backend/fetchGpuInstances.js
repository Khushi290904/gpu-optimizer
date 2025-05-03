const axios = require('axios');

async function fetchGpuInstances() {
    try {
        const response = await axios.get('https://customer.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=us-east-at-1'); // replace with real endpoint
        return response.data || [];
    } catch (err) {
        console.error('Failed to fetch GPU instances:', err.message);
        return [];
    }
}

module.exports = fetchGpuInstances;
