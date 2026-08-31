import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { oceanAnalystPlugin } from './server/apiPlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/*',
          dest: 'cesium',
        },
      ],
    }),
    oceanAnalystPlugin(),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium'),
  },
})
