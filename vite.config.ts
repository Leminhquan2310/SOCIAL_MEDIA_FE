import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load biến môi trường theo mode (development / production)
  const env = loadEnv(mode, ".", "VITE_");

  return {
    // Cấu hình dev server
    server: {
      port: 3000,
      host: "0.0.0.0",
      // Proxy API requests to avoid CORS issues in development
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "https://api.nexus-social.mock/v1",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },

    // Plugin React (JSX, Fast Refresh)
    plugins: [react()],

    // Inject biến môi trường vào frontend
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(env.VITE_API_BASE_URL),
      "import.meta.env.VITE_API_TIMEOUT": JSON.stringify(env.VITE_API_TIMEOUT),
      "import.meta.env.VITE_API_MAX_RETRIES": JSON.stringify(env.VITE_API_MAX_RETRIES),
      "import.meta.env.VITE_API_RETRY_DELAY": JSON.stringify(env.VITE_API_RETRY_DELAY),
    },

    // Alias đường dẫn
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },

    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: mode === "production" ? "terser" : false,
      target: "esnext",
    },
  };
});
