import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/focus-up/', // REQUIRED: Tells the app it lives at https://jeffergal.github.io/focus-up/
  build: {
    outDir: 'docs', // Output the built site to 'docs' folder so GitHub can read it
  }
})