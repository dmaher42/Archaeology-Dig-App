import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { journeyOverridesDevPlugin } from './scripts/journeyOverridesDevPlugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site base path
  base: '/Archaeology-Dig-App/',
  plugins: [
    react(),
    journeyOverridesDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Archaeology Dig App',
        short_name: 'Dig App',
        description: 'An archaeological expedition adventure game',
        theme_color: '#1a0a00',
        background_color: '#1a0a00',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/Archaeology-Dig-App/',
        scope: '/Archaeology-Dig-App/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    watch: {
      ignored: [
        '**/.playwright-cli/**',
        '**/dist/**',
        '**/output/**',
        '**/scratch/**',
        '**/test-results/**',
      ],
    },
  },
})
