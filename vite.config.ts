import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// FIX: Import 'process' to provide correct type hints for process.cwd() in environments where Node.js globals are not automatically recognized.
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This will load .env, .env.local, etc. and make them available.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // This is the crucial line for GitHub Pages deployment.
    // It tells Vite that your app will be served from a sub-directory
    // named after your repository.
    base: '/ai-proofreader/', 
    plugins: [react()],
    define: {
      // By using loadEnv, we can now correctly map your GEMINI_API_KEY
      // from the .env.local file to the process.env.API_KEY variable
      // that the application's code expects.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  }
})
