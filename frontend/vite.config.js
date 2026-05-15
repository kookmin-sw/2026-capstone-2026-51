import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// 포트 3000 고정 — 백엔드 OAuth redirect_uri 가 http://localhost:3000/auth/callback 으로 등록되어 있음.
// 다른 포트로 띄우면 구글 로그인 콜백이 실패함. strictPort: true 라 충돌 시 다른 포트로 fallback 안 함.
// IPv4 localhost 로 명시 — 기본 ::1 (IPv6) 만 바인딩되면 일부 환경에서 ERR_CONNECTION_REFUSED.
//
// API 호출은 axios baseURL (VITE_API_URL=https://api.logi.p-e.kr/api) 로 직접. dev proxy 안 씀.
// 백엔드 CORS allowed-origins 에 http://localhost:3000 가 등록되어 있어야 함.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
});
