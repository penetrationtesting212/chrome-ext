import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { testRunnerService } from '../services/testRuns/testRunner.service';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  testRunId?: string;
}

/**
 * Setup WebSocket server for real-time test execution
 */
export function setupWebSocket(wss: WebSocketServer) {
  wss.on('connection', async (ws: AuthenticatedWebSocket, req) => {
    logger.info('New WebSocket connection attempt');

    // Authenticate WebSocket connection via token in query string
    const url = new URL(req.url!, `ws://localhost`);
    const token = url.searchParams.get('token');

    if (!token) {
      logger.warn('WebSocket connection rejected: No token provided');
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'dev-access-secret'
      ) as any;

      ws.userId = decoded.userId;
      logger.info(`WebSocket authenticated for user: ${ws.userId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'CONNECTED',
        message: 'WebSocket connection established',
        userId: ws.userId
      }));

    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Invalid token');
      return;
    }

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        logger.info(`WebSocket message received:`, { type: data.type, userId: ws.userId });

        switch (data.type) {
          case 'START_TEST':
            await handleTestStart(ws, data);
            break;

          case 'STOP_TEST':
            await handleTestStop(ws, data);
            break;

          case 'PAUSE_TEST':
            await handleTestPause(ws, data);
            break;

          case 'RESUME_TEST':
            await handleTestResume(ws, data);
            break;

          case 'PING':
            ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
            break;

          default:
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: `Unknown message type: ${data.type}`
            }));
        }
      } catch (error: any) {
        logger.error('WebSocket message handling error:', error);
        ws.send(JSON.stringify({
          type: 'ERROR',
          message: error.message
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      logger.info(`WebSocket disconnected for user: ${ws.userId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });
  });
}

/**
 * Handle test start request
 */
async function handleTestStart(ws: AuthenticatedWebSocket, data: any) {
  const { scriptId } = data;

  if (!scriptId || !ws.userId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'scriptId and user authentication required'
    }));
    return;
  }

  try {
    // Create a test run record in the database
    // This would typically be done via the API, but we'll do it directly here for simplicity
    // In a production environment, you'd want to validate this through proper API endpoints
    
    ws.testRunId = `test-run-${Date.now()}`;
    
    ws.send(JSON.stringify({
      type: 'TEST_STARTED',
      testRunId: ws.testRunId,
      scriptId,
      timestamp: Date.now()
    }));

    // Start the actual test execution
    // In a real implementation, this would trigger the Playwright test runner
    await testRunnerService.startTestRun(ws.testRunId, scriptId, ws.userId, undefined);
    
  } catch (error: any) {
    logger.error('Test start error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: error.message
    }));
  }
}

/**
 * Handle test stop request
 */
async function handleTestStop(ws: AuthenticatedWebSocket, data: any) {
  const { testRunId } = data;
  
  if (!testRunId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'testRunId required'
    }));
    return;
  }

  try {
    await testRunnerService.stopTestRun(testRunId);
    
    ws.send(JSON.stringify({
      type: 'TEST_STOPPED',
      testRunId: testRunId,
      timestamp: Date.now()
    }));
  } catch (error: any) {
    logger.error('Test stop error:', error);
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: error.message
    }));
  }
}

/**
 * Handle test pause request
 */
async function handleTestPause(ws: AuthenticatedWebSocket, data: any) {
  const { testRunId } = data;
  
  if (!testRunId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'testRunId required'
    }));
    return;
  }

  // In a real implementation, this would pause the actual test execution
  // For now, we'll just send a mock response
  
  ws.send(JSON.stringify({
    type: 'TEST_PAUSED',
    testRunId: testRunId,
    timestamp: Date.now()
  }));
}

/**
 * Handle test resume request
 */
async function handleTestResume(ws: AuthenticatedWebSocket, data: any) {
  const { testRunId } = data;
  
  if (!testRunId) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message: 'testRunId required'
    }));
    return;
  }

  // In a real implementation, this would resume the actual test execution
  // For now, we'll just send a mock response
  
  ws.send(JSON.stringify({
    type: 'TEST_RESUMED',
    testRunId: testRunId,
    timestamp: Date.now()
  }));
}