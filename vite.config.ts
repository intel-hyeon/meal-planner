import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // GitHub Pages 서브 디렉터리 배포 시 정적 파일 경로 깨짐 방지
  plugins: [react(), tailwindcss()],
})
