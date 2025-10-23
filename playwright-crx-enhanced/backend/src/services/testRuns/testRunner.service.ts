import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface TestStep {
  stepNumber: number;
  action: string;
  selector?: string;
  value?: string;
}

interface TestRunContext {
  testRunId: string;
  scriptId: string;
  userId: string;
  ws?: WebSocketServer;
}

/**
 * Execute a Playwright test script
 */
export class TestRunnerService {
  private activeRuns: Map<string, TestRunContext> = new Map();

  /**
   * Start executing a test script
   */
  async startTestRun(testRunId: string, scriptId: string, userId: string, ws?: WebSocketServer): Promise<void> {
    try {
      // Store active run
      const context: TestRunContext = { testRunId, scriptId, userId, ws };
      this.activeRuns.set(testRunId, context);

      // Update test run status to running
      await prisma.testRun.update({
        where: { id: testRunId },
        data: { status: 'running' }
      });

      // Send start message via WebSocket if available
      if (ws) {
        this.sendWebSocketMessage(ws, {
          type: 'TEST_STARTED',
          testRunId,
          scriptId,
          timestamp: Date.now()
        });
      }

      // Get script content
      const script = await prisma.script.findFirst({
        where: {
          id: scriptId,
          userId
        }
      });

      if (!script) {
        throw new Error('Script not found');
      }

      // Parse and execute script steps
      await this.executeScript(context, script.code);

      // Update test run as completed
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'passed',
          completedAt: new Date()
        }
      });

      // Send completion message via WebSocket if available
      if (ws) {
        this.sendWebSocketMessage(ws, {
          type: 'TEST_COMPLETED',
          testRunId,
          status: 'passed',
          timestamp: Date.now()
        });
      }

      // Remove from active runs
      this.activeRuns.delete(testRunId);
    } catch (error: any) {
      logger.error('Test execution failed:', error);

      // Update test run as failed
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'failed',
          errorMsg: error.message,
          completedAt: new Date()
        }
      });

      // Send error message via WebSocket if available
      if (ws) {
        this.sendWebSocketMessage(ws, {
          type: 'TEST_FAILED',
          testRunId,
          error: error.message,
          timestamp: Date.now()
        });
      }

      // Remove from active runs
      this.activeRuns.delete(testRunId);
    }
  }

  /**
   * Stop a running test
   */
  async stopTestRun(testRunId: string): Promise<void> {
    const context = this.activeRuns.get(testRunId);
    if (context) {
      // Update test run as cancelled
      await prisma.testRun.update({
        where: { id: testRunId },
        data: {
          status: 'cancelled',
          completedAt: new Date()
        }
      });

      // Send stop message via WebSocket if available
      if (context.ws) {
        this.sendWebSocketMessage(context.ws, {
          type: 'TEST_STOPPED',
          testRunId,
          timestamp: Date.now()
        });
      }

      // Remove from active runs
      this.activeRuns.delete(testRunId);
    }
  }

  /**
   * Execute script code
   */
  private async executeScript(context: TestRunContext, code: string): Promise<void> {
    // In a real implementation, this would actually run the Playwright script
    // For now, we'll simulate execution with mock steps
    
    // Parse script to extract steps (simplified)
    const steps: TestStep[] = this.parseScriptSteps(code);
    
    // Execute each step
    for (const step of steps) {
      // Update step status to running
      await prisma.testStep.create({
        data: {
          testRunId: context.testRunId,
          stepNumber: step.stepNumber,
          action: step.action,
          selector: step.selector,
          value: step.value,
          status: 'running'
        }
      });

      // Send step update via WebSocket if available
      if (context.ws) {
        this.sendWebSocketMessage(context.ws, {
          type: 'STEP_UPDATE',
          testRunId: context.testRunId,
          stepNumber: step.stepNumber,
          action: step.action,
          status: 'running',
          timestamp: Date.now()
        });
      }

      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update step status to passed
      await prisma.testStep.update({
        where: {
          id: `${context.testRunId}-${step.stepNumber}`  // Using composite key workaround
        },
        data: {
          status: 'passed',
          duration: 500
        }
      });

      // Send step completion via WebSocket if available
      if (context.ws) {
        this.sendWebSocketMessage(context.ws, {
          type: 'STEP_UPDATE',
          testRunId: context.testRunId,
          stepNumber: step.stepNumber,
          action: step.action,
          status: 'passed',
          duration: 500,
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Parse script code to extract steps (simplified implementation)
   */
  private parseScriptSteps(code: string): TestStep[] {
    // This is a simplified parser that just identifies common Playwright actions
    const steps: TestStep[] = [];
    let stepNumber = 1;

    // Look for common Playwright methods
    const lines = code.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('page.goto(')) {
        steps.push({
          stepNumber: stepNumber++,
          action: 'goto',
          selector: this.extractParameter(trimmedLine, 'page.goto(')
        });
      } else if (trimmedLine.includes('page.click(')) {
        steps.push({
          stepNumber: stepNumber++,
          action: 'click',
          selector: this.extractParameter(trimmedLine, 'page.click(')
        });
      } else if (trimmedLine.includes('page.fill(')) {
        const params = this.extractParameters(trimmedLine, 'page.fill(');
        steps.push({
          stepNumber: stepNumber++,
          action: 'fill',
          selector: params[0],
          value: params[1]
        });
      } else if (trimmedLine.includes('page.press(')) {
        const params = this.extractParameters(trimmedLine, 'page.press(');
        steps.push({
          stepNumber: stepNumber++,
          action: 'press',
          selector: params[0],
          value: params[1]
        });
      } else if (trimmedLine.includes('expect(')) {
        steps.push({
          stepNumber: stepNumber++,
          action: 'assert',
          selector: this.extractParameter(trimmedLine, 'expect(')
        });
      }
    }

    return steps;
  }

  /**
   * Extract parameter from a method call
   */
  private extractParameter(line: string, method: string): string | undefined {
    const startIndex = line.indexOf(method);
    if (startIndex === -1) return undefined;
    
    const paramStart = startIndex + method.length;
    const paramEnd = line.indexOf(')', paramStart);
    if (paramEnd === -1) return undefined;
    
    return line.substring(paramStart, paramEnd).replace(/['"]/g, '').trim();
  }

  /**
   * Extract multiple parameters from a method call
   */
  private extractParameters(line: string, method: string): string[] {
    const startIndex = line.indexOf(method);
    if (startIndex === -1) return [];
    
    const paramStart = startIndex + method.length;
    const paramEnd = line.indexOf(')', paramStart);
    if (paramEnd === -1) return [];
    
    const paramsString = line.substring(paramStart, paramEnd);
    return paramsString.split(',').map(param => param.replace(/['"]/g, '').trim());
  }

  /**
   * Send message via WebSocket
   */
  private sendWebSocketMessage(_ws: WebSocketServer, message: any): void {
    // In a real implementation, we would send to the specific user's WebSocket connection
    // For now, we'll just log the message
    logger.info('WebSocket message:', message);
  }

  /**
   * Get active test runs
   */
  getActiveTestRuns(): string[] {
    return Array.from(this.activeRuns.keys());
  }
}

// Export singleton instance
export const testRunnerService = new TestRunnerService();