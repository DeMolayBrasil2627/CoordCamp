import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const rawUrl = (env.VITE_SUPABASE_URL || 'https://whmpsbehvupbniphzyiw.supabase.co').trim();
  const targetUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/supabase-proxy': {
          target: targetUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/supabase-proxy/, ''),
          headers: {
            'user-agent': 'CoordCamp-Node-Client/1.0',
            origin: '',
            referer: '',
          },
        },
      },
    },
  };
});
