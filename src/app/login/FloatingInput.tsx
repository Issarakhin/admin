import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface FloatingInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  required?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  error?: string;
}

const FloatingInput = ({
  label,
  type,
  value,
  onChange,
  name,
  required,
  showPassword,
  onTogglePassword,
  error,
}: FloatingInputProps) => {
  const isPassword = type === "password";

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          borderRadius: 15,
          fontWeight: 400,
          fontSize: 15,
          color: "#2c3e50",
          borderColor: error ? "#e74c3c" : "#d1d5db",
        }}
        className={`block w-full px-4 h-11 text-sm text-gray-900 bg-transparent border appearance-none focus:outline-none focus:ring-0 peer ${
          error ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-blue-600"
        }`}
        placeholder=" "
      />
      <label
        className={`absolute text-sm duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 left-3 rounded-lg ${
          error ? "text-red-500 peer-focus:text-red-500" : "text-gray-500 peer-focus:text-blue-600"
        }`}
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-500"
          onClick={onTogglePassword}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500" style={{ fontSize: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
