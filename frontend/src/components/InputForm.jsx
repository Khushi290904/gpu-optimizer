import React, { useState } from "react";
import RecommendationList from "./Recommendations";
import axios from "axios";
import "../styles/InputForm.css";

const WorkloadForm = () => {
  const [formData, setFormData] = useState({
    modelType: "",
    task: "training",
    datasetSize: "",
    durationValue: "",
    durationUnit: "hours",
    budget: "",
    country: "india",
    region: "mumbai",
    os: "linux",
    allowSpot: false,
  });

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const isFormValid = () =>
    formData.modelType &&
    formData.datasetSize &&
    formData.durationValue &&
    formData.budget;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.modelType) {
      setError("Please select a model type.");
      return;
    }

    setLoading(true);

    const durationInHours =
      formData.durationUnit === "minutes"
        ? Number(formData.durationValue) / 60
        : Number(formData.durationValue);

    const payload = {
      model_type: formData.modelType,
      task: formData.task,
      dataset_size: Number(formData.datasetSize),
      duration: {
        type: "hours",
        value: durationInHours,
      },
      budget: Number(formData.budget),
      country: formData.country,
      region: formData.region,
      operating_system: formData.os,
      allow_spot: formData.allowSpot,
    };

    try {
      const response = await axios.post("/api/recommend", payload);
      console.log(response)
      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>GPU Workload Input Form</h2>
      <form onSubmit={handleSubmit}>
        <label>Model Type</label>
        <select name="modelType" value={formData.modelType} onChange={handleChange} required>
          <option value="">-- Select Model Type --</option>
          <option value="LLM">LLM</option>
          <option value="Transformer">Transformer</option>
          <option value="CNN">CNN</option>
          <option value="GAN">GAN</option>
        </select>

        <label>Task</label>
        <select name="task" value={formData.task} onChange={handleChange}>
          <option value="training">Training</option>
          <option value="inference">Inference</option>
        </select>

        <label>Dataset Size (in GB)</label>
        <input type="number" name="datasetSize" value={formData.datasetSize} onChange={handleChange} required />

        <label>Duration</label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="number"
            name="durationValue"
            value={formData.durationValue}
            onChange={handleChange}
            placeholder="e.g., 8"
            required
          />
          <select
            name="durationUnit"
            value={formData.durationUnit}
            onChange={handleChange}
            required
          >
            <option value="hours">Hours</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>

        <label>Budget (total budget)</label>
        <input type="number" name="budget" value={formData.budget} onChange={handleChange} required />

        <label>Country</label>
        <select name="country" value={formData.country} onChange={handleChange}>
          <option value="india">India</option>
          <option value="usa">USA</option>
          <option value="germany">Germany</option>
        </select>

        <label>Region</label>
        <select name="region" value={formData.region} onChange={handleChange}>
          <option value="mumbai">Mumbai</option>
          <option value="delhi">Delhi</option>
          <option value="bangalore">Bangalore</option>
          <option value="atlanta">Atlanta</option>
        </select>

        <label>Operating System</label>
        <select name="os" value={formData.os} onChange={handleChange}>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
        </select>

        <label>
          <input type="checkbox" name="allowSpot" checked={formData.allowSpot} onChange={handleChange} />
          Allow Spot Instances
        </label>

        <button type="submit" disabled={loading || !isFormValid()}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {recommendations.length > 0 && (
        <RecommendationList recommendations={recommendations} />
        )}

    </div>
  );
};

export default WorkloadForm;
