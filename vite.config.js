import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',              // current directory is the project root (local development path)
  // root: "/ace-altitude",              // current directory is the project root
  base: "/ace-altitude/",
  build: {
    outDir: 'docs',  
    target: "esnext"      // build into ./dist
  },
})
