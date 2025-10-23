import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import * as path from 'path';

// Routes
import authRoutes from './routes/auth.routes';
import scriptRoutes from './routes/script.routes';
import projectRoutes from './routes/project.routes';
import testRunRoutes from './routes/testRun.routes';
import selfHealingRoutes from './routes/selfHealing.routes';
import ddtRoutes from './routes/ddt.routes';
import extensionRoutes from './routes/extension.routes';
import allureRoutes from './routes/allure.routes';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// WebSocket
import { setupWebSocket } from './websocket/testRunner';

// Load environment variables
dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ 
  server: httpServer, 
  path: '/ws' 
});

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet());

// CORS
const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const defaultOrigins = [
  'chrome-extension://*',
  'ms-browser-extension://*',
  'edge-extension://*',
  'http://localhost:3000',
  'http://localhost:3100',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3100'
];
const allowedOrigins = envOrigins.length ? envOrigins : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins to simplify local testing
    if ((process.env.NODE_ENV || 'development') === 'development') {
      return callback(null, true);
    }

    // Allow requests with no origin (mobile apps, curl, extension SW, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const pattern = new RegExp('^' + allowed.replace('*', '.*') + '$');
        return pattern.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API root for quick diagnostics
app.get('/api', (_req, res) => {
  res.json({
    status: 'ok',
    api: 'playwright-crx-backend',
    endpoints: [
      '/api/auth/*',
      '/api/projects/*',
      '/api/scripts/*',
      '/api/test-runs/*',
      '/api/self-healing/*',
      '/api/test-data/*',
      '/api/extensions/*',
      '/api-docs',
      '/api-docs.json'
    ]
  });
});

// Swagger UI & JSON
app.get('/api-docs.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve Allure reports
app.use('/allure-reports', express.static(path.join(process.cwd(), 'allure-reports')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/test-runs', testRunRoutes);
app.use('/api/self-healing', selfHealingRoutes);
app.use('/api/test-data', ddtRoutes);
app.use('/api/extensions', extensionRoutes);
app.use('/api/allure', allureRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// ============================================
// WEBSOCKET SETUP
// ============================================

setupWebSocket(wss);

// ============================================
// START SERVER
// ============================================

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 Environment: ${NODE_ENV}`);
  logger.info(`🔌 WebSocket server running on ws://localhost:${PORT}/ws`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, httpServer };
