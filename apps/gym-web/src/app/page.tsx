"use client";
import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gymName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (name, value) => {
    switch (name) {
      case "name":
        if (!value) {
          return "Name is required";
        }
        break;
      case "email":
        if (!value) {
          return "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          return "Email is invalid";
        }
        break;
      case "gymName":
        if (!value) {
          return "Gym name is required";
        }
        break;
      case "password":
        if (!value) {
          return "Password is required";
        } else if (value.length < 6) {
          return "Password must be at least 6 characters";
        }
        break;
      default:
        break;
    }
    return "";
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate form data
    validateForm("name", formData.name);
    validateForm("email", formData.email);
    validateForm("gymName", formData.gymName);
    validateForm("password", formData.password);

    // Check if there are any validation errors
    const errors = Object.keys(formData).reduce((acc, key) => {
      const error = validateForm(key, formData[key]);
      if (error) {
        acc[key] = error;
      }
      return acc;
    }, {});

    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors).join(", "));
      setLoading(false);
      return;
    }

    // Proceed with registration logic here
    // For example, you can send the form data to your backend API

    setLoading(false);
  }

  return (
    <div>
      <h1>Gym App</h1>
      <p>
        You are required to create an account to use the app and invite your gym
        clients.
      </p>

      <form action="handleRegister">
        <input 
        type="text" 
        name="name" 
        value={formData.name} 
        placeholder="Full Name" 
        onChange={handleChange}/>

        <input 
        type="email" 
        name="email" 
        value={formData.email} 
        placeholder="Email" 
        onChange={handleChange} />
        <input 
        type="text" 
        name="gymName" 
        value={formData.gymName} 
        placeholder="Gym Name" 
        onChange={handleChange} />
        <input 
        type="password" 
        name="password" 
        value={formData.password} 
        placeholder="Password" 
        onChange={handleChange} />
        <input 
        type="password" 
        name="confirmPassword" 
        placeholder="Confirm Password" 
        onChange={handleChange} />
        <button type="submit">Register</button>

        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
}
