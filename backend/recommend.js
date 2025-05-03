const fetchGpuInstances = require("../backend/fetchGpuInstances");

const HOUR_IN_MONTH = 730;
const HOUR_IN_HALF_YEAR = 4380;
const HOUR_IN_YEAR = 8760;

const modelRequirements = {
    LLM:        { vcpus: 32, ram: 192, gpu_class: "a100" },
    Transformer:{ vcpus: 16, ram: 96,  gpu_class: "a100" },
    CNN:        { vcpus: 8,  ram: 32,  gpu_class: "a30" },
    GAN:        { vcpus: 16, ram: 64,  gpu_class: "a30" },
    Default:    { vcpus: 8,  ram: 32,  gpu_class: "a30" }
};

function adjustForTask(task, modelReq) {
    switch (task.toLowerCase()) {
        case "inference":
            return { ...modelReq, vcpus: modelReq.vcpus, ram: modelReq.ram };
        case "training":
            return { ...modelReq, vcpus: modelReq.vcpus * 2, ram: modelReq.ram * 2 };
        default:
            return modelReq;
    }
}

function estimateCost(instance, duration, allow_spot) {
    const { type, value } = duration;
    const rate = allow_spot ? instance.price_per_spot : instance.price_per_hour;

    const storageCost = instance.storage_cost_per_gb ? instance.storage_cost_per_gb * (instance.storage_gb || 0) : 0;

    switch (type) {
        case "hours":
            return rate * value + storageCost;
        case "days":
            return rate * value * 24 + storageCost;
        case "weeks":
            return rate * value * 24 * 7 + storageCost;
        case "months":
            return allow_spot
                ? rate * HOUR_IN_MONTH * value + storageCost
                : instance.price_per_month * value + storageCost;
        case "half_year":
            return allow_spot
                ? rate * HOUR_IN_HALF_YEAR + storageCost
                : instance.price_per_half_year + storageCost;
        case "years":
            return allow_spot
                ? rate * HOUR_IN_YEAR * value + storageCost
                : instance.price_per_year * value + storageCost;
        default:
            return Infinity; 
    }
}

function filterByTask(instances, task, req) {
    return instances.filter(instance => {
        return (
            instance.vcpus >= req.vcpus &&
            instance.ram >= req.ram &&
            instance.resource_class.toLowerCase() === req.gpu_class.toLowerCase()
        );
    });
}

function calculateScore(instance, cost, req) {
    const resourceScore = (instance.vcpus + instance.ram) / (cost + 1); 
    return resourceScore;
}

function adjustForDatasetSize(dataset_size, modelReq) {
    if (dataset_size < 10) {
        return { ...modelReq, vcpus: modelReq.vcpus, ram: modelReq.ram };
    } else if (dataset_size < 50) {
        return { ...modelReq, vcpus: modelReq.vcpus + 4, ram: modelReq.ram + 16 };
    } else {
        return { ...modelReq, vcpus: modelReq.vcpus + 8, ram: modelReq.ram + 64 };
    }
}


async function recommend(input) {
    const {
        model_type = "Default",
        task = "training",
        dataset_size = 100,
        duration = { type: "hours", value: 10 },
        budget = 100,
        region,
        country,
        operating_system,
        allow_spot = false
    } = input;

    let req = adjustForTask(task, modelRequirements[model_type] || modelRequirements.Default);
    req = adjustForDatasetSize(dataset_size, req); 
    const results = [];

    let instances = [];
    try {
        const data = await fetchGpuInstances();
        instances = data.data;
    } catch (err) {
        console.error("❌ Failed to fetch GPU instances:", err.message);
        return [];
    }

    if (!Array.isArray(instances)) {
        console.error("❌ Instances is not an array!");
        return [];
    }

    instances = filterByTask(instances, task, req);

    for (const instance of instances) {
        if (instance.is_gpu !== 1) {
            console.log(`❌ Skipped ${instance.resource_name} - not GPU`);
            continue;
        }

        if (instance.is_public !== 1) {
            console.log(`❌ Skipped ${instance.resource_name} - not public`);
            continue;
        }

        if (country && instance.country.toLowerCase() !== country.toLowerCase()) {
            console.log(`❌ Skipped ${instance.resource_name} - country mismatch`);
            continue;
        }

        if (region && instance.region.toLowerCase() !== region.toLowerCase()) {
            console.log(`❌ Skipped ${instance.resource_name} - region mismatch`);
            continue;
        }

        if (operating_system && instance.operating_system.toLowerCase() !== operating_system.toLowerCase()) {
            console.log(`❌ Skipped ${instance.resource_name} - OS mismatch`);
            continue;
        }

        const cost = estimateCost(instance, duration, allow_spot);
        if (cost > budget) {
            console.log(`❌ Skipped ${instance.resource_name} - cost ₹${cost} > ₹${budget}`);
            continue;
        }

        if (
            instance.vcpus < req.vcpus ||
            instance.ram < req.ram ||
            instance.resource_class.toLowerCase() !== req.gpu_class.toLowerCase()
        ) {
            console.log(`❌ Skipped ${instance.resource_name} - doesn't meet resource requirements`);
            continue;
        }

        // Calculate the score properly
        const score = calculateScore(instance, cost, req);

        results.push({
            resource_name: instance.resource_name,
            gpu: instance.gpu_description,
            vcpus: instance.vcpus,
            ram: instance.ram,
            estimated_cost: parseFloat(cost.toFixed(2)),
            used_spot: allow_spot,
            score: parseFloat(score.toFixed(2)), 
            explanation: `${instance.resource_name} with ${instance.gpu_description} fits your ${task} workload for ${model_type} on a ${dataset_size}GB dataset within your budget of ₹${budget}. Cost: ₹${cost.toFixed(2)}, using ${allow_spot ? "spot" : "on-demand"} pricing.`
        });
    }

    console.log("Final recommendations:", results.length);
    return results.sort((a, b) => b.score - a.score); 
}

module.exports = recommend;
