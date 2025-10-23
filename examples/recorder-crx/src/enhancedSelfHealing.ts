/**
 * Enhanced Self-Healing Service with Advanced Locator Strategies
 * Implements intelligent locator generation and confidence scoring
 */

export interface LocatorInfo {
  locator: string;
  type: 'id' | 'css' | 'xpath' | 'testid' | 'name' | 'aria' | 'role' | 'text' | 'placeholder';
  elementTag?: string;
  elementText?: string;
  confidence?: number;
  stability?: number;
}

export interface HealingSuggestion {
  id: string;
  brokenLocator: string;
  validLocator: string;
  confidence: number;
  stability: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastUsed?: Date;
  successCount?: number;
  failureCount?: number;
}

export interface ElementFingerprint {
  tag: string;
  textContent: string;
  attributes: Record<string, string>;
  cssProperties: Record<string, string>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  parentPath: string;
}

export class EnhancedSelfHealingService {
  private suggestions: Map<string, HealingSuggestion[]> = new Map();
  
  // Enhanced locator strategies with priority and stability scores
  private locatorStrategies = [
    { type: 'testid', priority: 1, stability: 0.95 },
    { type: 'id', priority: 2, stability: 0.90 },
    { type: 'aria', priority: 3, stability: 0.85 },
    { type: 'role', priority: 4, stability: 0.80 },
    { type: 'name', priority: 5, stability: 0.75 },
    { type: 'placeholder', priority: 6, stability: 0.70 },
    { type: 'text', priority: 7, stability: 0.65 },
    { type: 'css', priority: 8, stability: 0.50 },
    { type: 'xpath', priority: 9, stability: 0.40 }
  ];

  /**
   * Calculate comprehensive confidence score
   */
  private calculateConfidence(
    locatorInfo: LocatorInfo,
    element: ElementFingerprint,
    historicalData?: { successCount: number; totalCount: number }
  ): number {
    // Get stability score from strategy
    const strategy = this.locatorStrategies.find(s => s.type === locatorInfo.type);
    const stabilityScore = strategy?.stability || 0.5;

    // Calculate uniqueness score
    const uniquenessScore = this.calculateUniqueness(locatorInfo, element);

    // Calculate historical success rate
    const historicalScore = historicalData
      ? historicalData.successCount / historicalData.totalCount
      : 0.5;

    // Weighted average
    const confidence = (
      stabilityScore * 0.4 +
      uniquenessScore * 0.3 +
      historicalScore * 0.3
    );

    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Calculate element uniqueness score
   */
  private calculateUniqueness(locatorInfo: LocatorInfo, element: ElementFingerprint): number {
    let score = 0.5;

    // Boost score for specific identifiers
    if (locatorInfo.type === 'id' || locatorInfo.type === 'testid') {
      score += 0.3;
    }

    // Boost for ARIA attributes
    if (locatorInfo.type === 'aria' || locatorInfo.type === 'role') {
      score += 0.2;
    }

    // Penalize generic selectors
    if (locatorInfo.locator.includes('div') || locatorInfo.locator.includes('span')) {
      score -= 0.2;
    }

    // Boost for unique attributes
    if (element.attributes['data-testid'] || element.attributes['id']) {
      score += 0.2;
    }

    return Math.min(1.0, Math.max(0.0, score));
  }

  /**
   * Generate element fingerprint for comparison
   */
  async createFingerprint(element: Element): Promise<ElementFingerprint> {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    return {
      tag: element.tagName.toLowerCase(),
      textContent: element.textContent?.trim() || '',
      attributes,
      cssProperties: {
        fontSize: computedStyle.fontSize,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        display: computedStyle.display
      },
      position: { x: rect.left, y: rect.top },
      size: { width: rect.width, height: rect.height },
      parentPath: this.generateParentPath(element)
    };
  }

  /**
   * Generate stable parent path
   */
  private generateParentPath(element: Element): string {
    const path: string[] = [];
    let current: Element | null = element.parentElement;
    let depth = 0;

    while (current && depth < 5) {
      const id = current.id ? `#${current.id}` : '';
      const className = current.className ? `.${current.className.split(' ')[0]}` : '';
      path.push(`${current.tagName.toLowerCase()}${id}${className}`);
      current = current.parentElement;
      depth++;
    }

    return path.join(' > ');
  }

  /**
   * Find best alternative locator with multiple strategies
   */
  async findBestLocator(element: Element): Promise<LocatorInfo[]> {
    const locators: LocatorInfo[] = [];
    const fingerprint = await this.createFingerprint(element);

    // Try all strategies in priority order
    for (const strategy of this.locatorStrategies) {
      const locator = this.generateLocatorByStrategy(element, strategy.type, fingerprint);
      if (locator) {
        locators.push(locator);
      }
    }

    // Sort by confidence
    return locators.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
  }

  /**
   * Generate locator by specific strategy
   */
  private generateLocatorByStrategy(
    element: Element,
    strategy: string,
    fingerprint: ElementFingerprint
  ): LocatorInfo | null {
    const historicalData = { successCount: 0, totalCount: 1 }; // Placeholder

    switch (strategy) {
      case 'testid': {
        const testid = fingerprint.attributes['data-testid'] || fingerprint.attributes['data-test'];
        if (testid) {
          const locatorInfo: LocatorInfo = {
            locator: `[data-testid="${testid}"]`,
            type: 'testid',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'id': {
        if (fingerprint.attributes.id && !fingerprint.attributes.id.match(/\d{6,}/)) {
          const locatorInfo: LocatorInfo = {
            locator: `#${fingerprint.attributes.id}`,
            type: 'id',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'aria': {
        const ariaLabel = fingerprint.attributes['aria-label'];
        if (ariaLabel) {
          const locatorInfo: LocatorInfo = {
            locator: `[aria-label="${ariaLabel}"]`,
            type: 'aria',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'role': {
        const role = fingerprint.attributes.role;
        if (role) {
          const locatorInfo: LocatorInfo = {
            locator: `[role="${role}"]`,
            type: 'role',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'name': {
        const name = fingerprint.attributes.name;
        if (name) {
          const locatorInfo: LocatorInfo = {
            locator: `[name="${name}"]`,
            type: 'name',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'placeholder': {
        const placeholder = fingerprint.attributes.placeholder;
        if (placeholder) {
          const locatorInfo: LocatorInfo = {
            locator: `[placeholder="${placeholder}"]`,
            type: 'placeholder',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'text': {
        if (fingerprint.textContent && fingerprint.textContent.length < 50) {
          const locatorInfo: LocatorInfo = {
            locator: `${fingerprint.tag}:has-text("${fingerprint.textContent}")`,
            type: 'text',
            elementTag: fingerprint.tag,
            elementText: fingerprint.textContent
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'css': {
        const className = fingerprint.attributes.class;
        if (className && !className.match(/\d{6,}/)) {
          const locatorInfo: LocatorInfo = {
            locator: `.${className.split(' ')[0]}`,
            type: 'css',
            elementTag: fingerprint.tag
          };
          locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
          return locatorInfo;
        }
        break;
      }

      case 'xpath': {
        const locatorInfo: LocatorInfo = {
          locator: this.generateSmartXPath(element, fingerprint),
          type: 'xpath',
          elementTag: fingerprint.tag
        };
        locatorInfo.confidence = this.calculateConfidence(locatorInfo, fingerprint, historicalData);
        return locatorInfo;
      }
    }

    return null;
  }

  /**
   * Generate smart XPath with parent context
   */
  private generateSmartXPath(element: Element, fingerprint: ElementFingerprint): string {
    // Use parent context for better stability
    const parent = element.parentElement;
    if (parent?.id) {
      return `//*[@id="${parent.id}"]//${fingerprint.tag}`;
    }

    // Fallback to simple XPath
    return `//${fingerprint.tag}`;
  }

  /**
   * Detect unstable locators during recording
   */
  async detectUnstableLocator(locator: string, element: Element): Promise<{
    isUnstable: boolean;
    reason?: string;
    suggestions?: LocatorInfo[];
  }> {
    // Check for common unstable patterns
    const unstablePatterns = [
      { pattern: /\d{6,}/, reason: 'Contains long numeric ID (likely dynamic)' },
      { pattern: /^\.css-\w+/, reason: 'CSS Modules class (changes on build)' },
      { pattern: /timestamp|uid|uuid|random/i, reason: 'Contains dynamic identifier' },
      { pattern: /\[\d+\]/, reason: 'Uses array index (fragile)' }
    ];

    for (const { pattern, reason } of unstablePatterns) {
      if (pattern.test(locator)) {
        const suggestions = await this.findBestLocator(element);
        return {
          isUnstable: true,
          reason,
          suggestions: suggestions.filter(s => s.confidence && s.confidence > 0.7)
        };
      }
    }

    return { isUnstable: false };
  }

  /**
   * Auto-cleanup old suggestions
   */
  async cleanupSuggestions(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let cleanedCount = 0;

    for (const [scriptId, suggestions] of this.suggestions.entries()) {
      const filtered = suggestions.filter(s => {
        const shouldRemove = (
          s.status === 'rejected' &&
          s.createdAt < cutoffDate
        );
        if (shouldRemove) cleanedCount++;
        return !shouldRemove;
      });

      this.suggestions.set(scriptId, filtered);
      await chrome.storage.local.set({
        [`healing_suggestions_${scriptId}`]: filtered
      });
    }

    return cleanedCount;
  }

  /**
   * Get healing statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageConfidence: number;
    successRate: number;
  }> {
    const allSuggestions: HealingSuggestion[] = [];
    
    for (const suggestions of this.suggestions.values()) {
      allSuggestions.push(...suggestions);
    }

    const total = allSuggestions.length;
    const pending = allSuggestions.filter(s => s.status === 'pending').length;
    const approved = allSuggestions.filter(s => s.status === 'approved').length;
    const rejected = allSuggestions.filter(s => s.status === 'rejected').length;

    const avgConfidence = total > 0
      ? allSuggestions.reduce((sum, s) => sum + s.confidence, 0) / total
      : 0;

    const totalAttempts = allSuggestions.reduce((sum, s) => 
      sum + (s.successCount || 0) + (s.failureCount || 0), 0
    );
    const totalSuccesses = allSuggestions.reduce((sum, s) => 
      sum + (s.successCount || 0), 0
    );
    const successRate = totalAttempts > 0 ? totalSuccesses / totalAttempts : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      averageConfidence: avgConfidence,
      successRate
    };
  }
}

// Export singleton
export const enhancedSelfHealingService = new EnhancedSelfHealingService();
