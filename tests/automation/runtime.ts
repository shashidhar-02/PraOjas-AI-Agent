import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));

export function getProjectRoot() {
  return rootDir;
}

export async function getFreePort() {
  const server = net.createServer();

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;

  await new Promise<void>((resolve, reject) => {
    server.close(error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  if (!port) {
    throw new Error('Unable to allocate a free port for the smoke server');
  }

  return port;
}

export async function waitForHttpOk(url: string, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // Keep polling until the server is ready.
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

export function startAppServer(port: number) {
  const child = spawn('tsx', ['server.ts'], {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      PORT: String(port),
      HOST: '127.0.0.1',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'test-key',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const output: string[] = [];
  child.stdout.on('data', chunk => output.push(chunk.toString()));
  child.stderr.on('data', chunk => output.push(chunk.toString()));

  return {
    child,
    output,
    url: `http://127.0.0.1:${port}`,
  };
}

export async function stopAppServer(child: ChildProcessWithoutNullStreams) {
  if (child.killed) {
    return;
  }

  child.kill('SIGTERM');

  await new Promise<void>(resolve => {
    const timer = setTimeout(resolve, 5_000);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}