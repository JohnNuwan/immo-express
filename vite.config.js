import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  publicDir: 'assets',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        vente: resolve(__dirname, 'public/vente.html'),
        location: resolve(__dirname, 'public/location.html'),
        dashboard: resolve(__dirname, 'public/dashboard.html'),
        profil: resolve(__dirname, 'public/profil.html'),
        recherche: resolve(__dirname, 'public/recherche.html'),
        risques: resolve(__dirname, 'public/risques.html'),
        scoring: resolve(__dirname, 'public/scoring.html'),
        pro: resolve(__dirname, 'public/pro.html'),
        login: resolve(__dirname, 'public/login.html'),
        register: resolve(__dirname, 'public/register.html'),
        cgu: resolve(__dirname, 'public/cgu.html'),
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
