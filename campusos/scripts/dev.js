const { spawn } = require('child_process');
const path = require('path');

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--use-system-ca' }
});
child.on('exit', (code) => process.exit(code ?? 0));
