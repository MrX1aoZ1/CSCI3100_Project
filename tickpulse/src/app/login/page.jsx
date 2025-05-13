'use client';

import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState, useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('hayashicoco@gmail.com');
  const [password, setPassword] = useState('0515hayashi');

  const [formError, setFormError] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push('/');
    }
  }, []);

  const submitHandler = useCallback(
    async (event) => {
      event.preventDefault();
      setFormError(undefined);

      if (!email) {
        setEmailError("Email cannot be empty");
        return;
      }

      if (!password) {
        setFormError("Password cannot be empty");
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          'http://localhost:3000/auth/login',
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          }
        );

        const data = await response.json().catch(() => undefined);

        if (response.status === 401) {
          setIsLoading(false);
          setFormError("User not registered, please register first");
          return;
        }
        if (response.status === 402) {
          setIsLoading(false);
          setFormError("Password is incorrect, please try again");
          return;
        }

        if (500 <= response.status && response.status < 600) {
          setIsLoading(false);
          setFormError(
            "Server error, please try again later"
          );
        }

        if (!response.ok) {
          setIsLoading(false);
          setFormError("Unknown error, please try again later");
          return;
        }

        localStorage.setItem('accessToken', data.accessToken);
        // localStorage.setItem('refreshToken', data.refreshToken);
        router.push('/');

      } catch (error) {
        setIsLoading(false);
        setFormError("Network error, please try again later");
      }
    },
    [email, password, router],
  );


  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          </div>

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            {/* Email */}
            <div className="relative">
              <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?
                <Link
                  href="/sign-up"
                  className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                >
                  Click here
                </Link>
                to register
              </p>
            </div>

            <p className="mx-6 mb-4 text-center text-red-500">
              {formError ?? ''}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}