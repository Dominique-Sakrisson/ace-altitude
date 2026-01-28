import { defineConfig } from 'vite'

export default defineConfig({
  //root is needed for local development via 'npm run dev'
  //for deployed code, the root must be commented out or removed
  //and  base: "/ace-altitude",  must be put in its place.
  // current directory is the project root (local development path)
  root: '.',
  // root: "/ace-altitude",              // current directory is the project root
  // base: "/ace-altitude",
  build: {
    outDir: 'dist',  
    target: "esnext"      // build into ./dist
  },
})
