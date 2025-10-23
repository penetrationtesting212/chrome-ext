/**
 * Real Data Integration for Self-Healing Features
 * Connects self-healing with actual test execution data
 */

import { aiSelfHealingService } from './aiSelfHealingService';
import { selfHealingService } from './selfHealing';
import { testExecutor } from './testExecutor';

export interface RealTestExecution {
  id: string;
  scriptId: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  startTime: Date;
  endTime?: Date;
  logs: string[];
  failures?: TestFailure[];
}

export interface TestFailure {
  id: string;
  step: number;
  locator: string;
  error: string;
  timestamp: Date;
  element?: Element;
  healed?: boolean;
  healedLocator?: string;
}

export class RealDataIntegration {
  private activeExecutions: Map<string, RealTestExecution> = new Map();
  private isListening: boolean = false;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for test execution
   */
  private setupEventListeners(): void {
    // Listen for test execution events
    if (typeof window !== 'undefined') {
      window.addEventListener('testExecutionStarted', this.handleTestStart as EventListener);
      window.addEventListener('testExecutionCompleted', this.handleTestComplete as EventListener);
      window.addEventListener('locatorFailed', this.handleLocatorFailure as EventListener);
      window.addEventListener('locatorHealed', this.handleLocatorHealed as EventListener);
    }
  }

  /**
   * Start listening for real test data
   */
  startListening(): void {
    this.isListening = true;
    console.log('Real data integration started');
  }

  /**
   * Stop listening for real test data
   */
  stopListening(): void {
    this.isListening = false;
    console.log('Real data integration stopped');
  }

  /**
   * Handle test execution start
   */
  private handleTestStart(event: Event): void {
    const customEvent = event as CustomEvent;
    if (!this.isListening) return;
    
    const { testExecution } = customEvent.detail;
    this.activeExecutions.set(testExecution.id, testExecution);
  }

  /**
   * Handle test execution completion
   */
  private handleTestComplete(event: Event): void {
    const customEvent = event as CustomEvent;
    if (!this.isListening) return;
    
    const { testExecution } = customEvent.detail;
    const execution = this.activeExecutions.get(testExecution.id);
    
    if (execution) {
      execution.status = testExecution.status;
      execution.endTime = testExecution.endTime;
      execution.logs = testExecution.logs;
      
      // Process failures for self-healing
      if (execution.failures && execution.failures.length > 0) {
        this.processFailures(execution);
      }
    }
  }

  /**
   * Handle locator failure
   */
  private handleLocatorFailure(event: Event): void {
    const customEvent = event as CustomEvent;
    if (!this.isListening) return;
    
    const { testId, step, locator, error, element } = customEvent.detail;
    const execution = this.activeExecutions.get(testId);
    
    if (execution) {
      const failure: TestFailure = {
        id: `failure-${Date.now()}`,
        step,
        locator,
        error,
        timestamp: new Date(),
        element
      };
      
      if (!execution.failures) {
        execution.failures = [];
      }
      execution.failures.push(failure);
      
      // Attempt auto-healing
      this.attemptAutoHealing(execution, failure);
    }
  }

  /**
   * Handle locator healing
   */
  private handleLocatorHealed(event: Event): void {
    const customEvent = event as CustomEvent;
    if (!this.isListening) return;
    
    const { testId, failureId, healedLocator, success } = customEvent.detail;
    const execution = this.activeExecutions.get(testId);
    
    if (execution && execution.failures) {
      const failure = execution.failures.find(f => f.id === failureId);
      if (failure) {
        failure.healed = success;
        failure.healedLocator = healedLocator;
        
        // Record the healing result
        this.recordHealingResult(failure, success);
      }
    }
  }

  /**
   * Attempt auto-healing for a failure
   */
  private async attemptAutoHealing(execution: RealTestExecution, failure: TestFailure): Promise<void> {
    if (!failure.element) return;
    
    try {
      // Try AI healing first
      const config = aiSelfHealingService.getConfig();
      if (config.enabled) {
        const aiResult = await aiSelfHealingService.autoHealLocator(
          failure.locator,
          failure.element,
          {
            url: `test-${execution.scriptId}`,
            failureReason: failure.error
          }
        );
        
        if (aiResult.autoApplied) {
          failure.healed = true;
          failure.healedLocator = aiResult.healedLocator;
          
          // Emit healing event
          this.emitEvent('locatorHealed', {
            testId: execution.id,
            failureId: failure.id,
            healedLocator: aiResult.healedLocator,
            success: true
          });
          
          return;
        }
      }
      
      // Fallback to traditional self-healing
      const traditionalResult = await selfHealingService.autoHealLocator(
        failure.locator,
        failure.element,
        {
          url: `test-${execution.scriptId}`,
          failureReason: failure.error
        }
      );
      
      if (traditionalResult.healedLocator) {
        failure.healed = true;
        failure.healedLocator = traditionalResult.healedLocator;
        
        // Emit healing event
        this.emitEvent('locatorHealed', {
          testId: execution.id,
          failureId: failure.id,
          healedLocator: traditionalResult.healedLocator,
          success: true
        });
      }
    } catch (error) {
      console.error('Auto-healing failed:', error);
      
      // Record failure
      this.recordHealingResult(failure, false);
    }
  }

  /**
   * Process all failures in a test execution
   */
  private async processFailures(execution: RealTestExecution): Promise<void> {
    if (!execution.failures) return;
    
    for (const failure of execution.failures) {
      if (!failure.healed) {
        // Try to heal any remaining failures
        await this.attemptAutoHealing(execution, failure);
      }
    }
  }

  /**
   * Record healing result in both services
   */
  private async recordHealingResult(failure: TestFailure, success: boolean): Promise<void> {
    try {
      // Record in AI service
      await aiSelfHealingService.recordHealingResult(
        `failure-${failure.id}`,
        success,
        success ? undefined : failure.error
      );
      
      // Record in traditional service
      await selfHealingService.recordHealingResult(
        `failure-${failure.id}`,
        success,
        failure.error
      );
    } catch (error) {
      console.error('Failed to record healing result:', error);
    }
  }

  /**
   * Get real healing statistics
   */
  async getRealHealingStatistics(): Promise<{
    totalTests: number;
    totalFailures: number;
    totalHealings: number;
    successRate: number;
    aiHealings: number;
    traditionalHealings: number;
    recentFailures: TestFailure[];
  }> {
    let totalTests = 0;
    let totalFailures = 0;
    let totalHealings = 0;
    let aiHealings = 0;
    let traditionalHealings = 0;
    const recentFailures: TestFailure[] = [];
    
    // Process all active executions
    for (const execution of this.activeExecutions.values()) {
      totalTests++;
      
      if (execution.failures) {
        totalFailures += execution.failures.length;
        
        for (const failure of execution.failures) {
          if (failure.healed) {
            totalHealings++;
            
            // Check if it was AI or traditional healing
            if (failure.healedLocator && failure.healedLocator.includes('data-testid')) {
              aiHealings++;
            } else {
              traditionalHealings++;
            }
          } else {
            // Add to recent failures if not healed
            if (Date.now() - failure.timestamp.getTime() < 24 * 60 * 60 * 1000) { // Last 24 hours
              recentFailures.push(failure);
            }
          }
        }
      }
    }
    
    // Get AI service statistics
    const aiStats = await aiSelfHealingService.getHealingStatistics();
    
    // Get traditional service statistics
    const traditionalStats = await selfHealingService.getStatistics();
    
    return {
      totalTests,
      totalFailures,
      totalHealings,
      successRate: totalFailures > 0 ? totalHealings / totalFailures : 0,
      aiHealings: aiHealings + aiStats.totalHealings,
      traditionalHealings: traditionalHealings + traditionalStats.total,
      recentFailures: recentFailures.slice(0, 10) // Last 10 failures
    };
  }

  /**
   * Get real healing history
   */
  async getRealHealingHistory(): Promise<Array<{
    id: string;
    testId: string;
    scriptId: string;
    originalLocator: string;
    healedLocator?: string;
    success: boolean;
    timestamp: Date;
    failureReason: string;
    elementType: string;
    aiEnhanced: boolean;
  }>> {
    const history: Array<{
      id: string;
      testId: string;
      scriptId: string;
      originalLocator: string;
      healedLocator?: string;
      success: boolean;
      timestamp: Date;
      failureReason: string;
      elementType: string;
      aiEnhanced: boolean;
    }> = [];
    
    // Process all active executions
    for (const execution of this.activeExecutions.values()) {
      if (execution.failures) {
        for (const failure of execution.failures) {
          history.push({
            id: `healing-${failure.id}`,
            testId: execution.id,
            scriptId: execution.scriptId,
            originalLocator: failure.locator,
            healedLocator: failure.healedLocator,
            success: failure.healed || false,
            timestamp: failure.timestamp,
            failureReason: failure.error,
            elementType: failure.element?.tagName.toLowerCase() || 'unknown',
            aiEnhanced: failure.healedLocator?.includes('data-testid') || false
          });
        }
      }
    }
    
    // Sort by timestamp (newest first)
    return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Simulate test execution with failures for demonstration
   */
  async simulateTestExecution(scriptId: string, withFailures: boolean = true): Promise<void> {
    const testId = `test-${Date.now()}`;
    const execution: RealTestExecution = {
      id: testId,
      scriptId,
      status: 'running',
      startTime: new Date(),
      logs: ['Test started'],
      failures: []
    };
    
    this.activeExecutions.set(testId, execution);
    
    // Emit test start event
    this.emitEvent('testExecutionStarted', { testExecution: execution });
    
    // Simulate test steps
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (withFailures) {
      // Simulate a locator failure
      const failure: TestFailure = {
        id: `failure-${Date.now()}`,
        step: 1,
        locator: '#dynamic-element-12345',
        error: 'Element not found',
        timestamp: new Date()
      };
      
      execution.failures?.push(failure);
      execution.logs.push(`Step 1 failed: ${failure.error}`);
      
      // Emit failure event
      this.emitEvent('locatorFailed', {
        testId,
        step: failure.step,
        locator: failure.locator,
        error: failure.error
      });
      
      // Wait for healing attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Complete test
    execution.status = 'passed';
    execution.endTime = new Date();
    execution.logs.push('Test completed');
    
    // Emit test complete event
    this.emitEvent('testExecutionCompleted', { testExecution: execution });
  }

  /**
   * Emit custom event
   */
  private emitEvent(eventName: string, detail: any): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
  }

  /**
   * Clear old test executions
   */
  clearOldExecutions(olderThanDays: number = 7): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    for (const [id, execution] of this.activeExecutions.entries()) {
      if (execution.startTime < cutoffDate) {
        this.activeExecutions.delete(id);
      }
    }
  }
}

// Export singleton instance
export const realDataIntegration = new RealDataIntegration();