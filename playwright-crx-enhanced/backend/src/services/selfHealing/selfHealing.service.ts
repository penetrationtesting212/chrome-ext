import { logger } from '../../utils/logger';
import pool from '../../db';

export interface LocatorInfo {
  locator: string;
  type: 'id' | 'css' | 'xpath' | 'testid' | 'name';
  elementTag?: string;
  elementText?: string;
}

export class SelfHealingService {
  async recordFailure(
    scriptId: string,
    brokenLocator: LocatorInfo,
    validLocator?: LocatorInfo
  ) {
    try {
      if (validLocator) {
        const { rows: existingRows } = await pool.query(
          `SELECT id, "timesUsed" FROM "SelfHealingLocator"
           WHERE "scriptId" = $1 AND "brokenLocator" = $2 AND "validLocator" = $3`,
          [scriptId, brokenLocator.locator, validLocator.locator]
        );
        const existing = existingRows[0];

        if (existing) {
          await pool.query(
            `UPDATE "SelfHealingLocator"
             SET "timesUsed" = $2, "lastUsedAt" = now()
             WHERE id = $1`,
            [existing.id, (existing.timesUsed || 0) + 1]
          );
          return existing;
        }

        const { rows } = await pool.query(
          `INSERT INTO "SelfHealingLocator"
           (id, "scriptId", "brokenLocator", "brokenType", "validLocator", "validType",
            "elementTag", "elementText", status, "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, 'pending', now(), now())
           RETURNING *`,
          [scriptId, brokenLocator.locator, brokenLocator.type, validLocator.locator, validLocator.type, validLocator.elementTag ?? null, validLocator.elementText ?? null]
        );
        logger.info(`Self-healing locator recorded for script ${scriptId}`);
        return rows[0];
      }
      return null;
    } catch (error) {
      logger.error('Error recording locator failure:', error);
      throw error;
    }
  }

  async recordSuccess(scriptId: string, locator: string, _type: string) {
    try {
      await pool.query(
        `UPDATE "SelfHealingLocator"
         SET "timesUsed" = COALESCE("timesUsed",0) + 1,
             "lastUsedAt" = now(),
             confidence = LEAST(COALESCE(confidence,0) + 0.1, 1.0)
         WHERE "scriptId" = $1 AND "validLocator" = $2 AND status = 'approved'`,
        [scriptId, locator]
      );
    } catch (error) {
      logger.error('Error recording success:', error);
    }
  }

  async getSuggestions(scriptId: string, status?: string) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM "SelfHealingLocator"
         WHERE "scriptId" = $1 ${status ? 'AND status = $2' : ''}
         ORDER BY confidence DESC, "createdAt" DESC`,
        status ? [scriptId, status] : [scriptId]
      );
      return rows;
    } catch (error) {
      logger.error('Error getting suggestions:', error);
      throw error;
    }
  }

  async getAllSuggestions(userId: string, status?: string) {
    try {
      const query = `
        SELECT shl.*, s.name as "scriptName", s.id as "scriptId"
        FROM "SelfHealingLocator" shl
        JOIN "Script" s ON s.id = shl."scriptId"
        WHERE s."userId" = $1
        ${status ? 'AND shl.status = $2' : ''}
        ORDER BY shl."createdAt" DESC
      `;
      const { rows } = await pool.query(
        query,
        status ? [userId, status] : [userId]
      );
      return rows.map(row => ({
        id: row.id,
        brokenLocator: row.brokenLocator,
        validLocator: row.validLocator,
        confidence: row.confidence || 0.75,
        status: row.status,
        scriptId: row.scriptId,
        scriptName: row.scriptName,
        createdAt: row.createdAt,
        reason: row.reason || this.getReasonForLocator(row.brokenLocator)
      }));
    } catch (error) {
      logger.error('Error getting all suggestions:', error);
      throw error;
    }
  }

  async createDemoSuggestions(userId: string) {
    try {
      // Get user's first script or use a default
      const { rows: scripts } = await pool.query(
        `SELECT id FROM "Script" WHERE "userId" = $1 LIMIT 1`,
        [userId]
      );
      
      const scriptId = scripts[0]?.id || 'demo-script';

      const demoSuggestions = [
        {
          brokenLocator: '#submit-button-12345',
          brokenType: 'id',
          validLocator: '[data-testid="submit-btn"]',
          validType: 'testid',
          confidence: 0.95,
          reason: 'Dynamic ID with numbers detected'
        },
        {
          brokenLocator: '.css-1x2y3z4-button',
          brokenType: 'css',
          validLocator: 'button[aria-label="Submit"]',
          validType: 'css',
          confidence: 0.85,
          reason: 'CSS-in-JS module class (unstable)'
        },
        {
          brokenLocator: '//*[@id="form"]/div[2]/button[1]',
          brokenType: 'xpath',
          validLocator: 'button[type="submit"]',
          validType: 'css',
          confidence: 0.80,
          reason: 'XPath with array indices (fragile)'
        },
        {
          brokenLocator: '#timestamp-1638457890',
          brokenType: 'id',
          validLocator: 'button[name="submit"]',
          validType: 'css',
          confidence: 0.75,
          reason: 'Timestamp-based ID detected'
        },
        {
          brokenLocator: '#uuid-abc-def-123',
          brokenType: 'id',
          validLocator: 'button.submit-btn',
          validType: 'css',
          confidence: 0.70,
          reason: 'UUID pattern detected'
        }
      ];

      const created = [];
      for (const demo of demoSuggestions) {
        const { rows } = await pool.query(
          `INSERT INTO "SelfHealingLocator"
           (id, "scriptId", "brokenLocator", "brokenType", "validLocator", "validType",
            confidence, status, reason, "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 'pending', $7, now(), now())
           RETURNING *`,
          [scriptId, demo.brokenLocator, demo.brokenType, demo.validLocator, demo.validType, demo.confidence, demo.reason]
        );
        created.push(rows[0]);
      }

      logger.info(`Created ${created.length} demo suggestions for user ${userId}`);
      return await this.getAllSuggestions(userId);
    } catch (error) {
      logger.error('Error creating demo suggestions:', error);
      throw error;
    }
  }

  private getReasonForLocator(locator: string): string {
    if (/\d{6,}/.test(locator)) return 'Contains long numeric ID (likely dynamic)';
    if (/^\.(css|sc|jss)-\w+/.test(locator)) return 'CSS-in-JS class (changes on build)';
    if (/timestamp|uid|uuid|random/i.test(locator)) return 'Contains dynamic identifier';
    if (/\[\d+\]/.test(locator)) return 'Uses array index (fragile)';
    return 'Locator stability issue detected';
  }

  async approveSuggestion(id: string, userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT shl.id, s."userId" AS script_user
         FROM "SelfHealingLocator" shl
         JOIN "Script" s ON s.id = shl."scriptId"
         WHERE shl.id = $1`,
        [id]
      );
      const suggestion = rows[0];
      if (!suggestion) throw new Error('Suggestion not found');
      if (suggestion.script_user !== userId) throw new Error('Unauthorized');

      const { rows: updatedRows } = await pool.query(
        `UPDATE "SelfHealingLocator" SET status = 'approved', "approvedAt" = now() WHERE id = $1 RETURNING *`,
        [id]
      );
      logger.info(`Self-healing suggestion ${id} approved`);
      return updatedRows[0];
    } catch (error) {
      logger.error('Error approving suggestion:', error);
      throw error;
    }
  }

  async rejectSuggestion(id: string, userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT s."userId" AS script_user
         FROM "SelfHealingLocator" shl JOIN "Script" s ON s.id = shl."scriptId"
         WHERE shl.id = $1`,
        [id]
      );
      const suggestion = rows[0];
      if (!suggestion) throw new Error('Suggestion not found');
      if (suggestion.script_user !== userId) throw new Error('Unauthorized');

      const { rows: updatedRows } = await pool.query(
        `UPDATE "SelfHealingLocator" SET status = 'rejected' WHERE id = $1 RETURNING *`,
        [id]
      );
      logger.info(`Self-healing suggestion ${id} rejected`);
      return updatedRows[0];
    } catch (error) {
      logger.error('Error rejecting suggestion:', error);
      throw error;
    }
  }

  async getLocatorStrategies(userId: string) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 AND enabled = true ORDER BY priority ASC`,
        [userId]
      );

      if (rows.length === 0) {
        return await this.createDefaultStrategies(userId);
      }
      return rows;
    } catch (error) {
      logger.error('Error getting locator strategies:', error);
      throw error;
    }
  }

  async updateStrategyPriority(
    userId: string,
    strategies: Array<{ strategy: string; priority: number; enabled: boolean }>
  ) {
    try {
      await pool.query(`DELETE FROM "LocatorStrategy" WHERE "userId" = $1`, [userId]);

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const s of strategies) {
          await client.query(
            `INSERT INTO "LocatorStrategy" (id, "userId", strategy, priority, enabled, "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now(), now())`,
            [userId, s.strategy, s.priority, s.enabled]
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }

      logger.info(`Locator strategies updated for user ${userId}`);
      const { rows } = await pool.query(
        `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 ORDER BY priority ASC`,
        [userId]
      );
      return rows;
    } catch (error) {
      logger.error('Error updating strategy priority:', error);
      throw error;
    }
  }

  private async createDefaultStrategies(userId: string) {
    const defaults = [
      { strategy: 'id', priority: 1, enabled: true },
      { strategy: 'testid', priority: 2, enabled: true },
      { strategy: 'css', priority: 3, enabled: true },
      { strategy: 'xpath', priority: 4, enabled: true },
      { strategy: 'name', priority: 5, enabled: true }
    ];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const s of defaults) {
        await client.query(
          `INSERT INTO "LocatorStrategy" (id, "userId", strategy, priority, enabled, "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::text, $1, $2, $3, $4, now(), now())`,
          [userId, s.strategy, s.priority, s.enabled]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const { rows } = await pool.query(
      `SELECT * FROM "LocatorStrategy" WHERE "userId" = $1 ORDER BY priority ASC`,
      [userId]
    );
    return rows;
  }

  findAlternativeLocator(
    element: { tag: string; id?: string; className?: string; attributes: Record<string, string> },
    strategies: string[]
  ): LocatorInfo | null {
    for (const strategy of strategies) {
      switch (strategy) {
        case 'id':
          if (element.id) return { locator: `#${element.id}`, type: 'id' };
          break;
        case 'testid':
          const testId = element.attributes['data-testid'] || element.attributes['data-test'];
          if (testId) return { locator: `[data-testid="${testId}"]`, type: 'testid' };
          break;
        case 'css':
          if (element.className) return { locator: `.${element.className.split(' ')[0]}`, type: 'css' };
          break;
        case 'name':
          if (element.attributes.name) return { locator: `[name="${element.attributes.name}"]`, type: 'name' };
          break;
        case 'xpath':
          return { locator: `//${element.tag}`, type: 'xpath' };
      }
    }
    return null;
  }
}

export const selfHealingService = new SelfHealingService();

