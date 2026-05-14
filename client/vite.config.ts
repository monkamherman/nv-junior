/// <reference types="vite/client" />
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  const apiUrl =
    process.env.VITE_API_URL !== undefined
      ? process.env.VITE_API_URL
      : env.VITE_API_URL !== undefined
        ? env.VITE_API_URL
        : 'https://api.rageai.digital';

  const devPort = Number(process.env.PORT) || 3000;
  const devHost = process.env.HOST || '0.0.0.0';

  return {
    plugins: [react(), tsconfigPaths()],
    base: './',
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        { find: 'process', replacement: 'process/browser' },
        { find: 'stream', replacement: 'stream-browserify' },
        { find: 'zlib', replacement: 'browserify-zlib' },
        { find: 'util', replacement: 'util' },
      ],
    },
    server: {
      host: devHost,
      port: devPort,
      strictPort: true,
      hmr: {
        host: 'localhost',
        port: devPort,
        clientPort: devPort,
        protocol: 'ws',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: './index.html',
      },
    },
    preview: {
      host: devHost,
      port: Number(process.env.PORT) || 4000,
    },
    css: {
      postcss: './postcss.config.js',
    },
  };
});
