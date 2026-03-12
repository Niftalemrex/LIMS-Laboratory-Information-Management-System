import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/LIMS-Laboratory-Information-Management-System/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['react-big-calendar', 'react-big-calendar/lib/css/react-big-calendar.css', 'moment'],
  },
});