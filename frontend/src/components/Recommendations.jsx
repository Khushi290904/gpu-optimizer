import React from "react";
import "./RecommendationList.css"; // Optional: if you want to style it separately

const RecommendationList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="results">
      <h3>Recommended Instances:</h3>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index} className="recommendation-item">
            <strong>{rec.resource_name}</strong>
            <p><strong>GPU:</strong> {rec.gpu}</p>
            <p><strong>vCPUs:</strong> {rec.vcpus} | <strong>RAM:</strong> {rec.ram} GB</p>
            <p><strong>Estimated Cost:</strong> ₹{rec.estimated_cost?.toFixed(2)}</p>
            <p><strong>Spot Instance Used:</strong> {rec.used_spot ? "Yes" : "No"}</p>
            {rec.explanation && (
              <p><strong>Explanation:</strong> {rec.explanation}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationList;
