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

function estimateCost(instance, duration, allow_spot) {
  const { type, value } = duration;
  const rate = allow_spot ? instance.price_per_spot : instance.price_per_hour;

  switch (type) {
    case "hours": return rate * value;
    case "days": return rate * value * 24;
    case "months":
      return allow_spot ? rate * HOUR_IN_MONTH * value : instance.price_per_month * value;
    case "half_year":
      return allow_spot ? rate * HOUR_IN_HALF_YEAR : instance.price_per_half_year;
    case "years":
      return allow_spot ? rate * HOUR_IN_YEAR : instance.price_per_year;
    default: return Infinity;
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

  const req = modelRequirements[model_type] || modelRequirements.Default;
  const results = [];


  let instances = [];
  try {
    const data = await fetchGpuInstances();
    instances = data.data

     // ✅ WAIT for promise to resolve
  } catch (err) {
    console.error("❌ Failed to fetch GPU instances:", err.message);
    return [];
  }
  console.log(instances);
  
  

  if (!Array.isArray(instances)) {
    console.error("❌ Instances is not an array!");
    return [];
  }

  for (const instance of instances) {
    // Debug all filters
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

    // Passed all checks ✅
    const score = (instance.vcpus + instance.ram) / cost;

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

  console.log("✅ Final recommendations:", results.length);
  console.log(results)
  return results.sort((a, b) => b.score - a.score);
}

module.exports = recommend;
