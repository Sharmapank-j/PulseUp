/**
 * PulseUp Local AI Bridge
 * Solves the browser "HTTP vs HTTPS" Mixed Content and CORS restrictions
 * when connecting from the live webapp (https://pulseupdemo.netlify.app)
 * to local AI servers (Ollama, LM Studio, LocalAI, vLLM).
 *
 * Usage:
 *   node scripts/local_bridge.js
 *   node scripts/local_bridge.js --target http://localhost:11434 --port 11435
 *   node scripts/local_bridge.js --tunnel
 */

import http from 'node:http';
import https from 'node:https';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
function getArg(name, defaultValue) {
  const idx = args.indexOf(name);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return defaultValue;
}

const TARGET_URL = getArg('--target', process.env.TARGET_URL || 'http://localhost:11434');
const BRIDGE_PORT = parseInt(getArg('--port', process.env.PORT || '11435'), 10);
const WANT_TUNNEL = args.includes('--tunnel');

console.log('='.repeat(70));
console.log('   PULSEUP LOCAL AI BRIDGE — HTTP/HTTPS CORS GATEWAY');
console.log('='.repeat(70));
console.log(`[Bridge] Target Local Engine : ${TARGET_URL}`);
console.log(`[Bridge] Listening On        : http://127.0.0.1:${BRIDGE_PORT}`);

const server = http.createServer(async (req, res) => {
  // Essential headers for browser PNA & CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const targetEndpoint = `${TARGET_URL.replace(/\/+$/, '')}${req.url}`;

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const bodyBuffer = Buffer.concat(chunks);

    const client = targetEndpoint.startsWith('https') ? https : http;
    const proxyReq = client.request(
      targetEndpoint,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(targetEndpoint).host,
          'content-length': bodyBuffer.length,
        },
      },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode, {
          ...upstreamRes.headers,
          'access-control-allow-origin': '*',
          'access-control-allow-private-network': 'true',
        });
        upstreamRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.error(`[Bridge Error] Failed to reach ${targetEndpoint}: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(
        JSON.stringify({
          error: {
            message: `PulseUp Local Bridge could not connect to ${TARGET_URL}. Ensure Ollama or LM Studio is running.`,
            code: 'BRIDGE_UPSTREAM_UNREACHABLE',
          },
        })
      );
    });

    if (bodyBuffer.length > 0) {
      proxyReq.write(bodyBuffer);
    }
    proxyReq.end();
  } catch (err) {
    console.error(`[Bridge Request Error] ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(BRIDGE_PORT, '127.0.0.1', () => {
  console.log(`[Bridge] ✓ Local gateway active!`);
  console.log(`[Bridge] Browser Private Network Access (PNA) headers enabled.`);

  if (WANT_TUNNEL) {
    console.log(`\n[Tunnel] Spawning Cloudflare HTTPS Tunnel...`);
    const tunnel = spawn('npx', ['--yes', 'untun@latest', 'tunnel', `http://127.0.0.1:${BRIDGE_PORT}`], {
      shell: true,
      stdio: 'inherit',
    });
    tunnel.on('close', (code) => {
      console.log(`[Tunnel] Closed with code ${code}`);
    });
  } else {
    console.log(`\nTip: To create an instant public HTTPS URL for browser access on Netlify:`);
    console.log(`  node scripts/local_bridge.js --tunnel`);
    console.log(`  OR run: npx untun tunnel http://localhost:11434\n`);
  }
});
