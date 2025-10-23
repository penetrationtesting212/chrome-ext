import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export interface LocatorInfo {
  locator: string;
  type: 'id' | 'css' | 'xpath' | 'testid' | 'name';
  elementTag?: string;
  elementText?: string;
}

export class SelfHealingService {
  /**
   * Record a locator failure and suggest alternative
   */
  async recordFailure(
    scriptId: string,
    brokenLocator: LocatorInfo,
    validLocator?: LocatorInfo
  ) {
    try {
      // Check if this combination already exists
      if (validLocator) {
        const existing = await prisma.selfHealingLocator.findFirst({
          where: {
            scriptId,
            brokenLocator: brokenLocator.locator,
            validLocator: validLocator.locator
          }
        });

        if (existing) {
          // Update usage count
          await prisma.selfHealingLocator.update({
            where: { id: existing.id },
            data: {
              timesUsed: existing.timesUsed + 1,
              lastUsedAt: new Date()
            }
          });
          return existing;
        }

        // Create new self-healing locator
        const healingLocator = await prisma.selfHealingLocator.create({
          data: {
            scriptId,
            brokenLocator: brokenLocator.locator,
            brokenType: brokenLocator.type,
            validLocator: validLocator.locator,
            validType: validLocator.type,
            elementTag: validLocator.elementTag,
            elementText: validLocator.elementText,
            status: 'pending'
          }
        });

        logger.info(`Self-healing locator recorded for script ${scriptId}`);
        return healingLocator;
      }

      return null;
    } catch (error) {
      logger.error('Error recording locator failure:', error);
      throw error;
    }
  }

  /**
   * Record successful locator usage
   */
  async recordSuccess(scriptId: string, locator: string, _type: string) {
    try {
      // Update confidence score for approved locators
      await prisma.selfHealingLocator.updateMany({
        where: {
          scriptId,
          validLocator: locator,
          status: 'approved'
        },
        data: {
          timesUsed: { increment: 1 },
          lastUsedAt: new Date(),
          confidence: { increment: 0.1 } // Increase confidence up to 1.0
        }
      });
    } catch (error) {
      logger.error('Error recording success:', error);
    }
  }

  /**
   * Get self-healing suggestions for a script
   */
  async getSuggestions(scriptId: string, status?: string) {
    try {
      const where: any = { scriptId };
      
      if (status) {
        where.status = status;
      }

      const suggestions = await prisma.selfHealingLocator.findMany({
        where,
        orderBy: [
          { confidence: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      return suggestions;
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      throw error;
    }
  }

  /**
   * Approve a self-healing suggestion
   */
  async approveSuggestion(id: string, userId: string) {
    try {
      const suggestion = await prisma.selfHealingLocator.findUnique({
        where: { id },
        include: { script: true }
      });

      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Verify user owns the script
      if (suggestion.script.userId !== userId) {
        throw new Error('Unauthorized');
      }

      const updated = await prisma.selfHealingLocator.update({
        where: { id },
        data: {
          status: 'approved',
          approvedAt: new Date()
        }
      });

      logger.info(`Self-healing suggestion ${id} approved`);
      return updated;
    } catch (error) {
      logger.error('Error approving suggestion:', error);
      throw error;
    }
  }

  /**
   * Reject a self-healing suggestion
   */
  async rejectSuggestion(id: string, userId: string) {
    try {
      const suggestion = await prisma.selfHealingLocator.findUnique({
        where: { id },
        include: { script: true }
      });

      if (!suggestion) {
        throw new Error('Suggestion not found');
      }

      // Verify user owns the script
      if (suggestion.script.userId !== userId) {
        throw new Error('Unauthorized');
      }

      const updated = await prisma.selfHealingLocator.update({
        where: { id },
        data: {
          status: 'rejected'
        }
      });

      logger.info(`Self-healing suggestion ${id} rejected`);
      return updated;
    } catch (error) {
      logger.error('Error rejecting suggestion:', error);
      throw error;
    }
  }

  /**
   * Get locator strategies for fallback
   */
  async getLocatorStrategies(userId: string) {
    try {
      let strategies = await prisma.locatorStrategy.findMany({
        where: { userId, enabled: true },
        orderBy: { priority: 'asc' }
      });

      // If user doesn't have custom strategies, use defaults
      if (strategies.length === 0) {
        strategies = await this.createDefaultStrategies(userId);
      }

      return strategies;
    } catch (error) {
      logger.error('Error getting locator strategies:', error);
      throw error;
    }
  }

  /**
   * Update locator strategy priority
   */
  async updateStrategyPriority(
    userId: string,
    strategies: Array<{ strategy: string; priority: number; enabled: boolean }>
  ) {
    try {
      // Delete existing strategies
      await prisma.locatorStrategy.deleteMany({
        where: { userId }
      });

      // Create new strategies with updated priorities
      await prisma.locatorStrategy.createMany({
        data: strategies.map(s => ({
          userId,
          strategy: s.strategy,
          priority: s.priority,
          enabled: s.enabled
        }))
      });

      logger.info(`Locator strategies updated for user ${userId}`);
      return await this.getLocatorStrategies(userId);
    } catch (error) {
      logger.error('Error updating strategy priority:', error);
      throw error;
    }
  }

  /**
   * Create default locator strategies
   */
  private async createDefaultStrategies(userId: string) {
    const defaultStrategies = [
      { strategy: 'id', priority: 1, enabled: true },
      { strategy: 'testid', priority: 2, enabled: true },
      { strategy: 'css', priority: 3, enabled: true },
      { strategy: 'xpath', priority: 4, enabled: true },
      { strategy: 'name', priority: 5, enabled: true }
    ];

    await prisma.locatorStrategy.createMany({
      data: defaultStrategies.map(s => ({
        userId,
        ...s
      }))
    });

    return await prisma.locatorStrategy.findMany({
      where: { userId },
      orderBy: { priority: 'asc' }
    });
  }

  /**
   * Try to find element using alternative locators
   */
  findAlternativeLocator(
    element: { tag: string; id?: string; className?: string; attributes: Record<string, string> },
    strategies: string[]
  ): LocatorInfo | null {
    for (const strategy of strategies) {
      switch (strategy) {
        case 'id':
          if (element.id) {
            return { locator: `#${element.id}`, type: 'id' };
          }
          break;
        
        case 'testid':
          const testId = element.attributes['data-testid'] || element.attributes['data-test'];
          if (testId) {
            return { locator: `[data-testid="${testId}"]`, type: 'testid' };
          }
          break;
        
        case 'css':
          if (element.className) {
            return { locator: `.${element.className.split(' ')[0]}`, type: 'css' };
          }
          break;
        
        case 'name':
          if (element.attributes.name) {
            return { locator: `[name="${element.attributes.name}"]`, type: 'name' };
          }
          break;
        
        case 'xpath':
          // Generate basic XPath
          return { locator: `//${element.tag}`, type: 'xpath' };
      }
    }

    return null;
  }
}

export const selfHealingService = new SelfHealingService();
