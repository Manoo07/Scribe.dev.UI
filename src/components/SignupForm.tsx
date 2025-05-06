import React, { useState } from 'react';
import axios from 'axios';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/auth/signup',
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Signup successful:', response.data);
      // Optionally redirect or show success message
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
      console.error('Signup error:', err);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4 w-full max-w-sm">
      <h2 className="text-3xl font-bold text-white mb-6">Create Account</h2>

      {error && <p className="text-red-400">{error}</p>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        required
        className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
      />
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignupForm;
