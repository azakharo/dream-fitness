import * as path from 'node:path';
import {defineConfig, loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import babel from 'vite-plugin-babel';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const {VITE_API_URL} = loadEnv(mode, process.cwd());

  return {
    plugins: [
      tanstackRouter({
        target: 'react',
      }),
      react(),
      tailwindcss(),
      babel({
        babelConfig: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(String(import.meta.dirname), './src'),
      },
    },
    server: {
      proxy: {
        '^/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
