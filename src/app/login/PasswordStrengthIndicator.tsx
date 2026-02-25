import React from "react";
import { Check, X } from "lucide-react";

interface PasswordStrength {
  score: number;
  feedback: string[];
}

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getPasswordStrength = (value: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (value.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[a-z]/.test(value)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/[A-Z]/.test(value)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[0-9]/.test(value)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[^A-Za-z0-9]/.test(value)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    return { score, feedback };
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#27ae60"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600">Password Strength:</span>
        <span className="text-sm font-medium" style={{ color: strengthColors[strength.score] }}>
          {strengthLabels[strength.score]}
        </span>
      </div>

      <div className="flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full"
            style={{
              backgroundColor: i < strength.score ? strengthColors[strength.score] : "#e5e7eb",
            }}
          />
        ))}
      </div>

      {strength.feedback.length > 0 && (
        <div className="space-y-1">
          {strength.feedback.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <X size={12} className="text-red-500" />
              {item}
            </div>
          ))}
        </div>
      )}

      {strength.score === 5 && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Check size={12} />
          Password meets all requirements
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
