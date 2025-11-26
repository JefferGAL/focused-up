import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/focused-up/', // REQUIRED: Tells the app it lives at https://jeffergal.github.io/focused-up/
  build: {
    outDir: 'dist', // Output the built site used to be 'docs' folder so GitHub can read it
  }
})
