/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { aiSelfHealingService } from './aiSelfHealingService';

export interface LocatorInfo {
  locator: string;
  type: 'id' | 'css' | 'xpath' | 'testid' | 'name' | 'aria' | 'role' | 'text' | 'placeholder';
  elementTag?: string;
  elementText?: string;
  confidence?: number;
  stability?: number;
  aiEnhanced?: boolean;
  visualSimilarity?: number;
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
  reason?: string;
  aiEnhanced?: boolean;
  visualSimilarity?: number;
}

export class SelfHealingService {
  private suggestions: Map<string, HealingSuggestion[]> = new Map();
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

  // AI integration flag
  private aiEnabled: boolean = true;

  /**
   * Enable/disable AI enhancement
   */
  setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
  }

  /**
   * Check if AI is enabled
   */
  isAIEnabled(): boolean {
    return this.aiEnabled;
  }

  /**
   * Calculate comprehensive confidence score with AI enhancement
   */
  private async calculateConfidence(
    type: string,
    locator: string,
    element: { tag: string; id?: string; className?: string; attributes: Record<string, string> }
  ): Promise<number> {
    const strategy = this.locatorStrategies.find(s => s.type === type);
    const stabilityScore = strategy?.stability || 0.5;

    // Calculate uniqueness score
    let uniquenessScore = 0.5;
    if (type === 'id' || type === 'testid') uniquenessScore += 0.3;
    if (type === 'aria' || type === 'role') uniquenessScore += 0.2;
    if (locator.includes('div') || locator.includes('span')) uniquenessScore -= 0.2;
    if (element.attributes['data-testid'] || element.id) uniquenessScore += 0.2;

    uniquenessScore = Math.min(1.0, Math.max(0.0, uniquenessScore));

    // Base confidence calculation
    let confidence = stabilityScore * 0.6 + uniquenessScore * 0.4;

    // AI enhancement if enabled
    if (this.aiEnabled) {
      try {
        // Create a mock element for AI prediction
        const mockElement = document.createElement(element.tag);
        if (element.id) mockElement.id = element.id;
        if (element.className) mockElement.className = element.className;

        // Set attributes
        Object.entries(element.attributes).forEach(([key, value]) => {
          mockElement.setAttribute(key, value);
        });

        const aiPrediction = await aiSelfHealingService.predictLocatorSuccess(mockElement, locator);
        // Blend AI prediction with traditional scoring
        confidence = (confidence * 0.7) + (aiPrediction.confidence * 0.3);
      } catch (error) {
        // Fallback to traditional scoring if AI fails
        console.warn('AI prediction failed, using traditional scoring:', error);
      }
    }

    return confidence;
  }

  /**
   * Record a locator failure and suggest alternatives
   */
  async recordFailure(brokenLocator: LocatorInfo, validLocator?: LocatorInfo): Promise<HealingSuggestion | null> {
    try {
      // In a browser extension, we'll store suggestions in chrome.storage
      const scriptId = 'current-script'; // This would be dynamic in a real implementation
      const suggestions = this.suggestions.get(scriptId) || [];

      if (validLocator) {
        // Check if this combination already exists
        const existing = suggestions.find(s =>
          s.brokenLocator === brokenLocator.locator &&
          s.validLocator === validLocator.locator
        );

        if (existing) {
          // Update usage count (simplified for browser extension)
          return existing;
        }

        // Create new self-healing suggestion
        const suggestion: HealingSuggestion = {
          id: Math.random().toString(36).substr(2, 9),
          brokenLocator: brokenLocator.locator,
          validLocator: validLocator.locator,
          confidence: validLocator.confidence || 0.5,
          stability: 0.8, // Default stability
          status: 'pending',
          createdAt: new Date(),
          aiEnhanced: validLocator.aiEnhanced || false
        };

        suggestions.push(suggestion);
        this.suggestions.set(scriptId, suggestions);

        // Store in chrome.storage for persistence
        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });

        return suggestion;
      }

      return null;
    } catch (error) {
      console.error('Error recording locator failure:', error);
      return null;
    }
  }

  /**
   * Get self-healing suggestions for a script
   */
  async getSuggestions(): Promise<HealingSuggestion[]> {
    try {
      const scriptId = 'current-script'; // This would be dynamic in a real implementation
      const result = await chrome.storage.local.get([`healing_suggestions_${scriptId}`]);
      return result[`healing_suggestions_${scriptId}`] || [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Approve a self-healing suggestion
   */
  async approveSuggestion(id: string): Promise<boolean> {
    try {
      const scriptId = 'current-script'; // This would be dynamic in a real implementation
      const suggestions = await this.getSuggestions();
      const suggestion = suggestions.find(s => s.id === id);

      if (suggestion) {
        suggestion.status = 'approved';
        suggestion.confidence = Math.min(1.0, suggestion.confidence + 0.1);

        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });

        // Record success in AI service if AI-enhanced
        if (suggestion.aiEnhanced) {
          try {
            await aiSelfHealingService.recordHealingResult(id, true);
          } catch (error) {
            console.warn('Failed to record AI healing result:', error);
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error approving suggestion:', error);
      return false;
    }
  }

  /**
   * Reject a self-healing suggestion
   */
  async rejectSuggestion(id: string): Promise<boolean> {
    try {
      const scriptId = 'current-script'; // This would be dynamic in a real implementation
      const suggestions = await this.getSuggestions();
      const suggestion = suggestions.find(s => s.id === id);

      if (suggestion) {
        suggestion.status = 'rejected';

        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });

        // Record failure in AI service if AI-enhanced
        if (suggestion.aiEnhanced) {
          try {
            await aiSelfHealingService.recordHealingResult(id, false);
          } catch (error) {
            console.warn('Failed to record AI healing result:', error);
          }
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      return false;
    }
  }

  /**
   * Try to find element using alternative locators with AI enhancement
   */
  async findAlternativeLocator(
    element: { tag: string; id?: string; className?: string; attributes: Record<string, string> }
  ): Promise<LocatorInfo | null> {
    const locators: LocatorInfo[] = [];

    // Generate all possible locators
    for (const { type } of this.locatorStrategies) {
      let locator: LocatorInfo | null = null;

      switch (type) {
        case 'id':
          if (element.id && !element.id.match(/\d{6,}/)) {
            locator = { locator: `#${element.id}`, type: 'id' };
          }
          break;

        case 'testid':
          const testId = element.attributes['data-testid'] || element.attributes['data-test'];
          if (testId) {
            locator = { locator: `[data-testid="${testId}"]`, type: 'testid' };
          }
          break;

        case 'aria':
          const ariaLabel = element.attributes['aria-label'];
          if (ariaLabel) {
            locator = { locator: `[aria-label="${ariaLabel}"]`, type: 'aria' };
          }
          break;

        case 'role':
          const role = element.attributes.role;
          if (role) {
            locator = { locator: `[role="${role}"]`, type: 'role' };
          }
          break;

        case 'name':
          if (element.attributes.name) {
            locator = { locator: `[name="${element.attributes.name}"]`, type: 'name' };
          }
          break;

        case 'placeholder':
          const placeholder = element.attributes.placeholder;
          if (placeholder) {
            locator = { locator: `[placeholder="${placeholder}"]`, type: 'placeholder' };
          }
          break;

        case 'text':
          // Would need element text content, skip for now
          break;

        case 'css':
          if (element.className && !element.className.match(/\d{6,}/)) {
            locator = { locator: `.${element.className.split(' ')[0]}`, type: 'css' };
          }
          break;

        case 'xpath':
          locator = { locator: `//${element.tag}`, type: 'xpath' };
          break;
      }

      if (locator) {
        locator.confidence = await this.calculateConfidence(type, locator.locator, element);
        locators.push(locator);
      }
    }

    // AI enhancement if enabled
    if (this.aiEnabled && locators.length > 0) {
      try {
        // Create a mock element for AI prediction
        const mockElement = document.createElement(element.tag);
        if (element.id) mockElement.id = element.id;
        if (element.className) mockElement.className = element.className;

        // Set attributes
        Object.entries(element.attributes).forEach(([key, value]) => {
          mockElement.setAttribute(key, value);
        });

        // Get AI predictions for each locator
        const aiEnhancedLocators = await Promise.all(
          locators.map(async (locator) => {
            const aiPrediction = await aiSelfHealingService.predictLocatorSuccess(mockElement, locator.locator);
            return {
              ...locator,
              confidence: aiPrediction.confidence,
              aiEnhanced: true
            };
          })
        );

        // Sort by AI-enhanced confidence and return the best
        aiEnhancedLocators.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        return aiEnhancedLocators[0];
      } catch (error) {
        console.warn('AI enhancement failed, using traditional scoring:', error);
      }
    }

    // Sort by traditional confidence and return the best
    locators.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    return locators.length > 0 ? locators[0] : null;
  }

  /**
   * Update locator strategy priority
   */
  async updateStrategyPriority(strategies: Array<{ type: string; priority: number; stability: number }>): Promise<void> {
    this.locatorStrategies = strategies.sort((a, b) => a.priority - b.priority);
    await chrome.storage.local.set({ locator_strategies: strategies });
  }

  /**
   * Load saved strategies from storage
   */
  async loadStrategies(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['locator_strategies']);
      if (result.locator_strategies) {
        this.locatorStrategies = result.locator_strategies;
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  }

  /**
   * Detect unstable locators with AI pattern recognition
   */
  async detectUnstableLocator(locator: string, element?: Element): Promise<{
    isUnstable: boolean;
    reason?: string;
    suggestions?: LocatorInfo[];
    aiDetected?: boolean;
  }> {
    const unstablePatterns = [
      { pattern: /\d{6,}/, reason: 'Contains long numeric ID (likely dynamic)' },
      { pattern: /^\.(css|sc|jss)-\w+/, reason: 'CSS-in-JS class (changes on build)' },
      { pattern: /timestamp|uid|uuid|random/i, reason: 'Contains dynamic identifier' },
      { pattern: /\[\d+\]/, reason: 'Uses array index (fragile)' }
    ];

    // Traditional pattern detection
    for (const { pattern, reason } of unstablePatterns) {
      if (pattern.test(locator)) {
        return { isUnstable: true, reason, aiDetected: false };
      }
    }

    // AI-enhanced detection if enabled and element is provided
    if (this.aiEnabled && element) {
      try {
        // Get AI prediction instead of direct feature extraction
        const aiPrediction = await aiSelfHealingService.predictLocatorSuccess(element, locator);
        const features = aiPrediction.features;

        // Check if AI detects instability
        if (features.hasNumericId || features.hasCssModuleClass ||
            features.hasTimestamp || features.hasUuid || features.hasRandomId) {
          return {
            isUnstable: true,
            reason: 'AI-detected dynamic pattern',
            aiDetected: true
          };
        }
      } catch (error) {
        console.warn('AI instability detection failed:', error);
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
   * Get enhanced healing statistics with AI metrics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    averageConfidence: number;
    aiEnhancedCount: number;
    aiSuccessRate: number;
    visualSimilarityAvg: number;
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

    // AI-specific metrics
    const aiEnhanced = allSuggestions.filter(s => s.aiEnhanced);
    const aiEnhancedCount = aiEnhanced.length;
    const aiSuccesses = aiEnhanced.reduce((sum, s) => sum + (s.successCount || 0), 0);
    const aiAttempts = aiEnhanced.reduce((sum, s) =>
      sum + (s.successCount || 0) + (s.failureCount || 0), 0
    );
    const aiSuccessRate = aiAttempts > 0 ? aiSuccesses / aiAttempts : 0;

    // Visual similarity average
    const withSimilarity = allSuggestions.filter(s => s.visualSimilarity !== undefined);
    const visualSimilarityAvg = withSimilarity.length > 0
      ? withSimilarity.reduce((sum, s) => sum + (s.visualSimilarity || 0), 0) / withSimilarity.length
      : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      averageConfidence: avgConfidence,
      aiEnhancedCount,
      aiSuccessRate,
      visualSimilarityAvg
    };
  }

  /**
   * Auto-heal locator using AI service
   */
  async autoHealLocator(
    failedLocator: string,
    element: Element,
    context: { url: string; failureReason: string }
  ): Promise<{
    healedLocator: string;
    confidence: number;
    autoApplied: boolean;
    requiresApproval: boolean;
    aiEnhanced: boolean;
  }> {
    if (this.aiEnabled) {
      try {
        const aiResult = await aiSelfHealingService.autoHealLocator(failedLocator, element, context);

        // Record the healing in traditional service as well
        const suggestion: HealingSuggestion = {
          id: Math.random().toString(36).substr(2, 9),
          brokenLocator: failedLocator,
          validLocator: aiResult.healedLocator,
          confidence: aiResult.confidence,
          stability: 0.8, // Default stability
          status: aiResult.autoApplied ? 'approved' : 'pending',
          createdAt: new Date(),
          aiEnhanced: true
        };

        // Store suggestion
        const scriptId = context.url; // Use URL as script identifier
        if (!this.suggestions.has(scriptId)) {
          this.suggestions.set(scriptId, []);
        }
        this.suggestions.get(scriptId)!.push(suggestion);

        return {
          ...aiResult,
          aiEnhanced: true
        };
      } catch (error) {
        console.warn('AI auto-healing failed, falling back to traditional:', error);
      }
    }

    // Fallback to traditional healing
    const elementInfo = {
      tag: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      attributes: {} as Record<string, string>
    };

    // Extract attributes
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      elementInfo.attributes[attr.name] = attr.value;
    }

    const alternative = await this.findAlternativeLocator(elementInfo);
    if (alternative) {
      return {
        healedLocator: alternative.locator,
        confidence: alternative.confidence || 0.5,
        autoApplied: false,
        requiresApproval: true,
        aiEnhanced: false
      };
    }

    throw new Error('No suitable alternative locator found');
  }

  /**
   * Record healing result and sync with AI service
   */
  async recordHealingResult(
    healingId: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    // Find and update traditional healing record
    for (const [scriptId, suggestions] of this.suggestions.entries()) {
      const suggestion = suggestions.find(s => s.id === healingId);
      if (suggestion) {
        if (success) {
          suggestion.successCount = (suggestion.successCount || 0) + 1;
        } else {
          suggestion.failureCount = (suggestion.failureCount || 0) + 1;
        }
        suggestion.lastUsed = new Date();
        break;
      }
    }

    // Also record in AI service if AI-enhanced
    try {
      await aiSelfHealingService.recordHealingResult(healingId, success, error);
    } catch (error) {
      console.warn('Failed to record healing result in AI service:', error);
    }
  }

  /**
   * Get visual similarity between two elements
   */
  async getVisualSimilarity(element1: Element, element2: Element): Promise<number> {
    if (this.aiEnabled) {
      try {
        return await aiSelfHealingService.compareVisualSimilarity(element1, element2);
      } catch (error) {
        console.warn('AI visual similarity failed:', error);
      }
    }

    // Fallback to simple text comparison
    const text1 = element1.textContent?.trim() || '';
    const text2 = element2.textContent?.trim() || '';
    return text1 === text2 ? 1.0 : 0.0;
  }
}

// Export singleton instance
export const selfHealingService = new SelfHealingService();
