import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'vite-plugin-ai-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy', (req, res, next) => {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: { message: 'Method Not Allowed. Use POST.' } }));
            return;
          }

          let rawBody = '';
          req.on('data', (chunk) => {
            rawBody += chunk;
          });
          req.on('end', async () => {
            try {
              const { endpoint, method = 'POST', headers = {}, body } = JSON.parse(rawBody || '{}');
              if (!endpoint) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: { message: 'Missing endpoint' } }));
                return;
              }

              const forwardHeaders = { ...headers };
              delete forwardHeaders['host'];
              delete forwardHeaders['origin'];
              delete forwardHeaders['referer'];
              if (!forwardHeaders['content-type'] && !forwardHeaders['Content-Type']) {
                forwardHeaders['Content-Type'] = 'application/json';
              }

              const upstreamRes = await fetch(endpoint, {
                method,
                headers: forwardHeaders,
                body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
              });

              res.statusCode = upstreamRes.status;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', upstreamRes.headers.get('content-type') || 'application/json');
              const data = await upstreamRes.text();
              res.end(data);
            } catch (err) {
              res.statusCode = 502;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: { message: `Vite Proxy Gateway Error: ${err.message}` } }));
            }
          });
        });
      },
    },
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/local-llm': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/local-llm/, '')
      }
    }
  }
});
