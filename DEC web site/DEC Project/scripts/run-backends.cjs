const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const backendDir = path.join(__dirname, '..', 'src', 'Backend');

const services = [
  { name: 'auth', file: 'Login.cjs' },
  { name: 'products', file: 'Products.cjs' },
  { name: 'farmer-profile', file: 'farmerProfile.cjs' },
  { name: 'farmers', file: 'farmers.cjs' },
  { name: 'payment', file: 'payment.cjs' },
  { name: 'admin-products', file: 'fetchProducts.cjs' },
  { name: 'customer-profile', file: 'customerProfile.cjs' }
];

const children = new Map();
let shuttingDown = false;

const formatPrefix = (name) => `[${name}]`;

const pipeOutput = (stream, name, target) => {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    target.write(`${formatPrefix(name)} ${line}\n`);
  });
};

const shutdown = (reason, exitCode = 0) => {
  if (shuttingDown) return;
  shuttingDown = true;

  if (reason) {
    console.log(reason);
  }

  for (const child of children.values()) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => {
    for (const child of children.values()) {
      if (!child.killed) {
        child.kill('SIGTERM');
      }
    }
    process.exit(exitCode);
  }, 500);
};

for (const service of services) {
  const child = spawn(process.execPath, [path.join(backendDir, service.file)], {
    cwd: path.join(__dirname, '..'),
    stdio: ['ignore', 'pipe', 'pipe']
  });

  children.set(service.name, child);

  pipeOutput(child.stdout, service.name, process.stdout);
  pipeOutput(child.stderr, service.name, process.stderr);

  child.on('exit', (code, signal) => {
    children.delete(service.name);

    if (shuttingDown) {
      if (children.size === 0) {
        process.exit(code ?? 0);
      }
      return;
    }

    const detail = signal ? `signal ${signal}` : `code ${code}`;
    shutdown(`${formatPrefix(service.name)} stopped unexpectedly with ${detail}.`, code ?? 1);
  });

  child.on('error', (error) => {
    shutdown(`${formatPrefix(service.name)} failed to start: ${error.message}`, 1);
  });
}

console.log(`Started ${services.length} backend services.`);
console.log('Press Ctrl+C to stop all backend services.');

process.on('SIGINT', () => shutdown('Stopping backend services...'));
process.on('SIGTERM', () => shutdown('Stopping backend services...'));
