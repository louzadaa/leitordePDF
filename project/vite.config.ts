import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      'lucide-react',
      'react-router-dom',
      'react-dropzone',
      'uuid'
    ]
  },
  build: {
    commonjsOptions: {
      include: []
    }
  }
});