import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',              // current directory is the project root
  build: {
    outDir: 'dist',  
    target: "esnext"      // build into ./dist
  },
})
