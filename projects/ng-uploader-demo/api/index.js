const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.join(__dirname, '.env')
});

const { bootstrapServer, closeServer } = require('./src/server');

async function gracefulShutdown(signal) {
  console.log(signal);
  if (signal === 'SIGUSR2') {
    process.kill(process.pid, signal);
  } else {
    try {
      console.log('Gracefully stopping... (press Ctrl+C again to force)');
      await closeServer();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}

function catchTermination() {
  process.on('SIGHUP', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
  process.once('SIGUSR2', gracefulShutdown);
}

bootstrapServer();
catchTermination();
