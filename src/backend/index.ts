import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import * as readline from 'readline';
import { cors } from '@elysiajs/cors'
import { CONFIG } from './config';
import { DocumentMetadata } from './model';
import { chatRoutesV1, documentRoutesV1 } from './routes/v1';
import { userRoutesV1 } from './routes/v1/user';


const originalWarn = console.log;

console.log = function (...args) {
  if (!args.some(arg => typeof arg === 'string' && arg.includes('Warning: Ran out of space in font private use area.'))) {
    originalWarn.apply(console, args);
  }
};


// Global state
let DOCUMENTS: Record<string, DocumentMetadata> = {};
let server: any;


// // Document management functions
// const loadDocumentsMetadata = async () => {
//   try {
//     await mkdir(CONFIG.VECTOR_DB_PATH, { recursive: true });
//     if (existsSync(CONFIG.METADATA_FILE)) {
//       const data = await readFile(CONFIG.METADATA_FILE, 'utf-8');
//       DOCUMENTS = JSON.parse(data);
//     }
//   } catch (error) {
//     console.error('Error loading documents:', error);
//     DOCUMENTS = {};
//   }
// };

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');
  try {
    if (server) {
      await server.stop();
    }
    // await writeFile(CONFIG.METADATA_FILE, JSON.stringify(DOCUMENTS));
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Command handler setup
const setupCommandHandler = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (line.trim() === 'sidecar shutdown') {
      await shutdown();
    }
  });

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// Main application
const app = new Elysia()
  .use(cors())
  .state('user', 1)
  .use(swagger())
  .get('/health', () => ({ status: 'healthy' }))
  .get('/v1/connect', () => ({
    message: `Connected to API server on port ${CONFIG.PORT}`,
    data: {
      port: CONFIG.PORT,
      pid: process.pid,
      host: `http://localhost:${CONFIG.PORT}`
    }
  }))
  .get('/info', async ({ store: { user } }) => ({
    info: {
      user
    }
  }))
  .use(chatRoutesV1)
  .use(documentRoutesV1)
  .use(userRoutesV1);

// Server startup
const startServer = async () => {
  try {
    // await loadDocumentsMetadata();
    server = await app.listen(CONFIG.PORT);
    console.log(`Server started on http://localhost:${CONFIG.PORT}`);

    setupCommandHandler();
    console.log('Command handler ready');
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
