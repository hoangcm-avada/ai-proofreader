import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // This is the crucial line for GitHub Pages deployment.
  // It tells Vite that your app will be served from a sub-directory
  // named after your repository.
  base: '/ai-proofreader/', 
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})
