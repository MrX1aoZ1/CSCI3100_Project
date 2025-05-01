'use client';

import Link from 'next/link';
import { FiMail, FiLock } from 'react-icons/fi';
import React, { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validate as isEmailValid } from 'email-validator';

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState('w@w');
  const [password, setPassword] = useState('078529dj');
  const [confirmPassword, setConfirmPassword] = useState('078529dj');

  const [emailError, setEmailError] = useState(undefined);
  const [passwordError, setPasswordError] = useState(undefined);
  const [confirmPasswordError, setConfirmPasswordError] = useState(undefined);
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
      setEmailError(undefined);
      setPasswordError(undefined);
      setConfirmPasswordError(undefined);
      setFormError(undefined);

      if (!email) {
        setEmailError("郵箱不能為空");
        return;
      }

      if (!password) {
        setPasswordError("密碼不能為空");
        return;
      }

      if (password.length < 8) {
        setPasswordError("密碼長度不能小於8");
        return;
      }

      if (password.length > 63) {
        setPasswordError("密碼長度不能大於63");
        return;
      }

      if (!/^[a-zA-Z0-9!@#$%^&*]{8,63}$/.test(password)) {
        setPasswordError("密碼只能包含英文字母、數字和特殊符號");
        return;
      }

      if (!confirmPassword) {
        setConfirmPasswordError("確認密碼不能為空");
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError("密碼和確認密碼不一致");
        setConfirmPasswordError("密碼和確認密碼不一致");
        return;
      }

      
      setIsLoading(true);

      console.log(email);
      console.log(password);

      try {
        const response = await fetch(
          'http://localhost:3000/sign-up',
          {
            method: 'POST',
            headers: { 
              Accept: 'application/json',
              'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

        console.log('Login response status:', response.status);

        //const data = await response.json().catch(() => undefined);

        if (response.status === 400) {
          setIsLoading(false);
          setEmailError("Email 已經被註冊");
          return;
        }
        if (500 <= response.status && response.status < 600) {
          setIsLoading(false);
          setFormError("伺服器錯誤，請稍後再試");
        }

        if (!response.ok) {
          setIsLoading(false);
          setFormError("發生未知錯誤，請稍後再試");
          return;
        }

        // localStorage.setItem('accessToken', data.accessToken);
        // localStorage.setItem('refreshToken', data.refreshToken);
        console.log(response)

        router.push('/login');

      } catch (error) {
        setIsLoading(false);
        setFormError("網絡錯誤，請稍後再試");
        console.error('Login error:', error);
      }
    },
    [email, password, confirmPassword, router],
  );


  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* 注册卡片 */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          {/* 标题 */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">創建新賬戶</h1>
          </div>

          {/* 注册表单 */}
          <form className="mt-8 space-y-6" onSubmit={submitHandler}>
            {/* 邮箱 */}
            <div className="relative">
              <FiMail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                }}
                className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="郵箱"
                error={emailError}
              />
            </div>

            {/* 密码 */}
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="密碼"
                error={passwordError}
              />
            </div>

            {/* 确认密码 */}
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                }}
                className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="確認密碼"
                error={confirmPasswordError}
              />
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "註冊中..." : "註冊"}
            </button>

            {/* 登录链接 */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                已有帳號？
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                >
                  按此
                </Link>
                登錄
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