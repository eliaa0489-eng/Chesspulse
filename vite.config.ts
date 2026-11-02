import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'vercel-protection-cookie-compat',
        transformIndexHtml(html) {
          return html
            .replace(/<script type="module" crossorigin src="\/assets\//g, '<script type="module" src="/assets/')
            .replace(/<link rel="stylesheet" crossorigin href="\/assets\//g, '<link rel="stylesheet" href="/assets/');
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      modulePreload: false,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-chess': ['chess.js'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
