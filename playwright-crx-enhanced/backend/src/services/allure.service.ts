import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

const ALLURE_RESULTS_DIR = path.join(process.cwd(), 'allure-results');
const ALLURE_REPORTS_DIR = path.join(process.cwd(), 'allure-reports');

export class AllureService {
  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
      fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(ALLURE_REPORTS_DIR)) {
      fs.mkdirSync(ALLURE_REPORTS_DIR, { recursive: true });
    }
  }

  async startTest(testRunId: string, scriptName: string) {
    try {
      const testData = {
        uuid: testRunId,
        testCaseId: testRunId,
        fullName: scriptName,
        name: scriptName,
        historyId: testRunId,
        start: Date.now(),
        steps: [],
      };
      
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testRunId}-result.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(testData, null, 2));
      
      return testData;
    } catch (error) {
      logger.error('Error starting Allure test:', error);
      throw error;
    }
  }

  async recordStep(testId: string, stepName: string, status: 'passed' | 'failed' | 'broken', duration?: number) {
    try {
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testId}-result.json`);
      
      const stepData = {
        name: stepName,
        status,
        statusDetails: {},
        stage: 'finished',
        start: Date.now() - (duration || 0),
        stop: Date.now(),
      };

      let results: any = { steps: [] };
      if (fs.existsSync(resultsPath)) {
        results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      }

      results.steps = results.steps || [];
      results.steps.push(stepData);

      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    } catch (error) {
      logger.error('Error recording Allure step:', error);
    }
  }

  async endTest(testId: string, status: 'passed' | 'failed' | 'broken', errorMessage?: string) {
    try {
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testId}-result.json`);
      
      const result = {
        uuid: testId,
        historyId: testId,
        testCaseId: testId,
        fullName: testId,
        name: testId,
        status,
        statusDetails: errorMessage ? { message: errorMessage } : {},
        stage: 'finished',
        start: Date.now(),
        stop: Date.now(),
        steps: [],
      };

      if (fs.existsSync(resultsPath)) {
        const existing = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        result.steps = existing.steps || [];
      }

      fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));
      
      logger.info(`Allure test ended: ${testId} with status: ${status}`);
    } catch (error) {
      logger.error('Error ending Allure test:', error);
    }
  }

  async generateReport(testRunId: string): Promise<string> {
    try {
      const reportPath = path.join(ALLURE_REPORTS_DIR, testRunId);
      
      if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath, { recursive: true });
      }

      execSync(`npx allure generate ${ALLURE_RESULTS_DIR} -o ${reportPath} --clean`, {
        cwd: process.cwd(),
        stdio: 'pipe',
      });

      logger.info(`Allure report generated at: ${reportPath}`);
      return reportPath;
    } catch (error) {
      logger.error('Error generating Allure report:', error);
      throw new Error('Failed to generate Allure report');
    }
  }

  async getReportUrl(testRunId: string): Promise<string> {
    const reportPath = path.join(ALLURE_REPORTS_DIR, testRunId);
    if (fs.existsSync(reportPath)) {
      return `/allure-reports/${testRunId}/index.html`;
    }
    return '';
  }

  async cleanupOldReports(daysToKeep = 7) {
    try {
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      const reports = fs.readdirSync(ALLURE_REPORTS_DIR);
      for (const report of reports) {
        const reportPath = path.join(ALLURE_REPORTS_DIR, report);
        const stats = fs.statSync(reportPath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.rmSync(reportPath, { recursive: true, force: true });
          logger.info(`Cleaned up old Allure report: ${report}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up Allure reports:', error);
    }
  }

  getAllReports(): Array<{ id: string; path: string; createdAt: Date }> {
    try {
      const reports = fs.readdirSync(ALLURE_REPORTS_DIR);
      return reports.map(report => {
        const reportPath = path.join(ALLURE_REPORTS_DIR, report);
        const stats = fs.statSync(reportPath);
        return {
          id: report,
          path: `/allure-reports/${report}/index.html`,
          createdAt: stats.birthtime,
        };
      });
    } catch (error) {
      logger.error('Error getting Allure reports:', error);
      return [];
    }
  }
}

export const allureService = new AllureService();
