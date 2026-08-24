import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',              // current directory is the project root (local development path)
  base: "/ace-altitude/",
  build: {
    outDir: 'docs',  
    // outDir: 'dist',  
    target: "esnext"      // build into ./dist
  },
})
