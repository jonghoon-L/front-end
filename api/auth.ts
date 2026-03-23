/**
 * 휴대폰 인증 API
 * - POST /v1/common/auth/send: 인증번호 발송 (3분 유효)
 * - POST /v1/common/auth/verify: 인증 확인 → verificationToken 반환
 */

import { apiPost } from "@/api/apiClient";

export interface SendAuthResponse {
  success: boolean;
  message: string;
}

export interface VerifyAuthResponse {
  success: boolean;
  message: string;
  verificationToken: string;
}

/** 인증번호 발송: 휴대폰 번호로 6자리 인증번호 문자 발송 */
export async function sendVerificationCode(phoneNumber: string): Promise<SendAuthResponse> {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return apiPost<SendAuthResponse>("/v1/common/auth/send", { phoneNumber: digitsOnly });
}

/** 인증번호 확인: 인증번호 검증 후 verificationToken 반환 */
export async function verifyAuthCode(phoneNumber: string, authCode: string): Promise<VerifyAuthResponse> {
  const digitsOnly = phoneNumber.replace(/\D/g, "");
  return apiPost<VerifyAuthResponse>("/v1/common/auth/verify", {
    phoneNumber: digitsOnly,
    authCode: authCode.trim(),
  });
}
