/**
 * Test: Login endpoint returns 503 while LOGIN_DISABLED is true.
 *
 * This test verifies that the temporary login-disable guard in routes/auth.js
 * correctly rejects login attempts with HTTP 503 Service Unavailable.
 *
 * TODO: Remove or update this test once login is re-enabled.
 */

import express from 'express';
import http from 'http';
import authRouter from '../routes/auth.js';

function makeRequest(port, path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, body: raw });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  // Spin up a minimal Express app with the auth router
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    const result = await makeRequest(port, '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123',
    });

    if (result.status !== 503) {
      console.error(
        `FAIL: Expected HTTP 503 for disabled login, got ${result.status}`
      );
      process.exit(2);
    }

    if (!result.body?.error) {
      console.error('FAIL: Expected error message in response body');
      process.exit(3);
    }

    console.log('PASS: login endpoint returns 503 while login is disabled');
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

run();
