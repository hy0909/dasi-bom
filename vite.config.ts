import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" : GitHub Pages(/dasi-bom/) 등 하위 경로 배포에서도 동작
export default defineConfig({
  plugins: [react()],
  base: "./",
});
