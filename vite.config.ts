import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * 실행하는 쪽에서 PORT 를 정해주면 그 포트를 그대로 쓴다.
 * 여러 세션이 동시에 띄워도 서로 포트를 빼앗지 않고, 알려준 포트와 실제 포트가 어긋나지 않는다.
 */
const assignedPort = Number(process.env.PORT) || undefined;
const server = { port: assignedPort, strictPort: assignedPort !== undefined };

// base "./" : GitHub Pages(/dasi-bom/) 등 하위 경로 배포에서도 동작
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server,
  preview: server,
});
