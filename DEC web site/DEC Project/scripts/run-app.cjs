const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const projectRoot = path.join(__dirname, '..');
const viteBin = path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js');

const services = [
  {
    name: 'backend',
    command: process.execPath,
    args: [path.join(__dirname, 'run-backends.cjs')]
  },
  {
    name: 'frontend',
    command: process.execPath,
    args: [viteBin]
  }
];

const children = new Map();
let shuttingDown = false;

const prefix = (name) => `[${name}]`;

const pipeOutput = (stream, name, target) => {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    target.write(`${prefix(name)} ${line}\n`);
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
  const child = spawn(service.command, service.args, {
    cwd: projectRoot,
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
    shutdown(`${prefix(service.name)} stopped unexpectedly with ${detail}.`, code ?? 1);
  });

  child.on('error', (error) => {
    shutdown(`${prefix(service.name)} failed to start: ${error.message}`, 1);
  });
}

console.log('Starting backend and frontend together...');
console.log('Press Ctrl+C to stop the full app.');

process.on('SIGINT', () => shutdown('Stopping app...'));
process.on('SIGTERM', () => shutdown('Stopping app...'));
