'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");

    const res = await fetch('/api/login', {
      method: "POST",
      headers: {
      "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    if (res.status === 200) {
      router.push('/chat');
    } else {
      setError(result.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="space-y-4">
          <input
            value={form.email}
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            value={form.password}
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
          <p className="text-center text-sm text-gray-600 mt-6">
           not have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">signup</a>
        </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
