"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiPost, AUTH_TOKEN_KEY } from "@/api/apiClient";

interface AdminLoginResponse {
  success: boolean;
  accessToken?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const usernameTrimmed = username.trim();
    const passwordTrimmed = password.trim();

    const hasIdError = !usernameTrimmed;
    const hasPasswordError = !passwordTrimmed;

    setIdError(hasIdError ? "관리자 ID를 입력해주세요" : "");
    setPasswordError(hasPasswordError ? "비밀번호를 입력해주세요" : "");

    if (hasIdError || hasPasswordError) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiPost<AdminLoginResponse>("v1/admin/login", {
        username: usernameTrimmed,
        password: passwordTrimmed,
      });

      if (data.success && data.accessToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.accessToken);
        setShowTransition(true);
      } else {
        setShowLoginErrorModal(true);
      }
    } catch {
      setShowLoginErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!showTransition) return;
    const timer = setTimeout(() => {
      router.push("/admin");
    }, 1000);
    return () => clearTimeout(timer);
  }, [showTransition, router]);

  if (showTransition) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white animate-[logo-transition-fade-in_0.3s_ease-out]">
        <Image
          src="/logo.png"
          alt="로드맵"
          width={200}
          height={200}
          className="animate-[logo-transition-scale_0.5s_ease-out]"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-xl">
        <div
          className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 animate-[login-form-appear_0.45s_ease-out]"
        >
          <h1 className="text-3xl font-bold text-slate-800 text-center mb-10 tracking-tight">
            RoadMap 관리자 로그인
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="username"
                className="block text-base font-medium text-slate-700 mb-2"
              >
                관리자 ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (idError) setIdError("");
                }}
                placeholder="ID를 입력하세요"
                disabled={isLoading}
                className={`w-full px-5 py-4 text-base border rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition ${
                  idError ? "border-red-500" : "border-slate-300"
                }`}
              />
              {idError && (
                <p className="mt-1 text-sm text-red-600 animate-[error-slide-in_0.25s_ease-out]">
                  {idError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-base font-medium text-slate-700 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="비밀번호를 입력하세요"
                disabled={isLoading}
                className={`w-full px-5 py-4 text-base border rounded-lg focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition ${
                  passwordError ? "border-red-500" : "border-slate-300"
                }`}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600 animate-[error-slide-in_0.25s_ease-out]">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-black hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition text-base cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? "로그인 중…" : "로그인"}
            </button>
          </form>
        </div>
      </div>

      {/* 로그인 실패 알림 모달 */}
      {showLoginErrorModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[280px] bg-black/50 animate-[logo-transition-fade-in_0.3s_ease-out]">
          <div className="mx-4 w-full max-w-xl rounded-xl bg-white p-10 shadow-xl animate-[confirm-modal-appear_0.6s_ease-out]">
            <p className="mb-8 text-center text-base text-slate-700">
              아이디 또는 비밀번호가 올바르지 않습니다
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowLoginErrorModal(false)}
                className="rounded-lg bg-slate-700 px-8 py-3 text-base font-medium text-white hover:bg-slate-800 hover:scale-[1.02] hover:shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
