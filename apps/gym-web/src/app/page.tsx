"use client"

import { FormEvent, useState } from "react";

type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

const initialForm: RegisterFormData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function validateField(
  field: keyof RegisterFormData,
  value: string,
  form: RegisterFormData
): string {
  switch (field) {
    case "fullName":
      if (!value.trim()) return "Full name is required.";
      if (value.trim().length < 2)
        return "Full name must be at least 2 characters.";
      return "";

    case "email":
      if (!value.trim()) return "Email is required.";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Enter a valid email address.";

      return "";

    case "phone":
      if (!value.trim()) return "Phone number is required.";

      if (!/^\+?[0-9]{9,15}$/.test(value))
        return "Enter a valid phone number.";

      return "";

    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8)
        return "Password must be at least 8 characters.";
      if (!/[A-Z]/.test(value))
        return "Password must contain an uppercase letter.";
      if (!/[a-z]/.test(value))
        return "Password must contain a lowercase letter.";
      if (!/[0-9]/.test(value))
        return "Password must contain a number.";

      return "";

    case "confirmPassword":
      if (!value) return "Please confirm your password.";

      if (value !== form.password)
        return "Passwords do not match.";

      return "";

    default:
      return "";
  }
}

function validateForm(form: RegisterFormData): FormErrors {
  const errors: FormErrors = {};

  for (const field of Object.keys(form) as Array<keyof RegisterFormData>) {
    const error = validateField(field, form[field], form);

    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export default function RegisterForm() {
  const [form, setForm] = useState<RegisterFormData>(initialForm);

  const [errors, setErrors] = useState<FormErrors>({});

  const [touched, setTouched] = useState<
    Partial<Record<keyof RegisterFormData, boolean>>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (
    field: keyof RegisterFormData,
    value: string
  ) => {
    const updatedForm = {
      ...form,
      [field]: value,
    };

    setForm(updatedForm);

    // Validate immediately after the field has been touched.
    if (touched[field]) {
      const error = validateField(field, value, updatedForm);

      setErrors((previous) => ({
        ...previous,
        [field]: error || undefined,
      }));
    }

    // Password changes can make confirmPassword invalid.
    if (field === "password" && touched.confirmPassword) {
      const confirmPasswordError = validateField(
        "confirmPassword",
        updatedForm.confirmPassword,
        updatedForm
      );

      setErrors((previous) => ({
        ...previous,
        confirmPassword: confirmPasswordError || undefined,
      }));
    }
  };

  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched((previous) => ({
      ...previous,
      [field]: true,
    }));

    const error = validateField(field, form[field], form);

    setErrors((previous) => ({
      ...previous,
      [field]: error || undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setServerError("");

    // Validate everything before submitting.
    const validationErrors = validateForm(form);

    setErrors(validationErrors);

    // Mark every field as touched.
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      console.log("Registration successful:", data);

      setForm(initialForm);
      setErrors({});
      setTouched({});
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>Create your account</h1>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName">Full name</label>

        <input
          id="fullName"
          type="text"
          value={form.fullName}
          onChange={(event) =>
            handleChange("fullName", event.target.value)
          }
          onBlur={() => handleBlur("fullName")}
          placeholder="John Doe"
        />

        {touched.fullName && errors.fullName && (
          <p>{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">Email</label>

        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            handleChange("email", event.target.value)
          }
          onBlur={() => handleBlur("email")}
          placeholder="john@example.com"
        />

        {touched.email && errors.email && (
          <p>{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone">Phone number</label>

        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(event) =>
            handleChange("phone", event.target.value)
          }
          onBlur={() => handleBlur("phone")}
          placeholder="+254712345678"
        />

        {touched.phone && errors.phone && (
          <p>{errors.phone}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password">Password</label>

        <div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) =>
              handleChange("password", event.target.value)
            }
            onBlur={() => handleBlur("password")}
            placeholder="Enter your password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {touched.password && errors.password && (
          <p>{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword">
          Confirm password
        </label>

        <div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(event) =>
              handleChange(
                "confirmPassword",
                event.target.value
              )
            }
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="Confirm your password"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword((previous) => !previous)
            }
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>

        {touched.confirmPassword && errors.confirmPassword && (
          <p>{errors.confirmPassword}</p>
        )}
      </div>

      {/* Server error */}
      {serverError && <p>{serverError}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}


//this register form should match the gym system and what the backend is going to return