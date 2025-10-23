/**
 * AI-Powered Self-Healing Service
 * Implements machine learning for intelligent locator healing
 */

export interface LocatorFeatures {
  // Structural features
  elementType: string;
  hasId: boolean;
  hasTestId: boolean;
  hasAriaLabel: boolean;
  hasRole: boolean;
  hasName: boolean;
  hasPlaceholder: boolean;
  hasText: boolean;
  hasClass: boolean;
  
  // Content features
  textLength: number;
  textWordCount: number;
  hasNumericText: boolean;
  hasSpecialChars: boolean;
  
  // Position features
  depth: number;
  siblingCount: number;
  indexAmongSiblings: number;
  
  // Style features
  isVisible: boolean;
  isClickable: boolean;
  hasUniqueColor: boolean;
  hasUniqueSize: boolean;
  
  // Dynamic patterns
  hasNumericId: boolean;
  hasCssModuleClass: boolean;
  hasTimestamp: boolean;
  hasUuid: boolean;
  hasRandomId: boolean;
}

export interface MLModel {
  predict(features: LocatorFeatures): number;
  train(trainingData: { features: LocatorFeatures; label: number }[]): void;
  save(): any;
  load(data?: any): void;
}

export interface VisualFingerprint {
  // Visual properties
  width: number;
  height: number;
  backgroundColor: string;
  color: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  border: string;
  borderRadius: string;
  
  // Position
  x: number;
  y: number;
  zIndex: number;
  
  // Content
  text: string;
  textHash: string;
  
  // Computed hash
  visualHash: string;
}

export interface HealingHistory {
  id: string;
  originalLocator: string;
  healedLocator: string;
  success: boolean;
  confidence: number;
  timestamp: Date;
  context: {
    url: string;
    elementType: string;
    failureReason: string;
  };
  rollback?: {
    timestamp: Date;
    reason: string;
  };
}

export interface AutoHealingConfig {
  enabled: boolean;
  confidenceThreshold: number;
  maxRetries: number;
  rollbackAfterFailures: number;
  requireUserApproval: boolean;
  autoApproveHighConfidence: boolean;
}

export class AISelfHealingService {
  private mlModel: MLModel;
  private healingHistory: Map<string, HealingHistory[]> = new Map();
  private visualCache: Map<string, VisualFingerprint> = new Map();
  private config: AutoHealingConfig = {
    enabled: true,
    confidenceThreshold: 0.85,
    maxRetries: 3,
    rollbackAfterFailures: 3,
    requireUserApproval: false,
    autoApproveHighConfidence: true
  };

  constructor() {
    this.mlModel = new SimpleMLModel();
    this.loadModel();
    this.loadHistory();
  }

  /**
   * Extract features from element for ML prediction
   */
  public extractFeatures(element: Element, locator: string): LocatorFeatures {
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Structural features
    const features: LocatorFeatures = {
      elementType: element.tagName.toLowerCase(),
      hasId: !!element.id,
      hasTestId: !!element.getAttribute('data-testid'),
      hasAriaLabel: !!element.getAttribute('aria-label'),
      hasRole: !!element.getAttribute('role'),
      hasName: !!element.getAttribute('name'),
      hasPlaceholder: !!element.getAttribute('placeholder'),
      hasText: !!(element.textContent?.trim()),
      hasClass: !!element.className,
      
      // Content features
      textLength: element.textContent?.length || 0,
      textWordCount: element.textContent?.trim().split(/\s+/).length || 0,
      hasNumericText: /\d/.test(element.textContent || ''),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(element.textContent || ''),
      
      // Position features
      depth: this.getElementDepth(element),
      siblingCount: element.parentElement?.children.length || 0,
      indexAmongSiblings: Array.from(element.parentElement?.children || []).indexOf(element),
      
      // Style features
      isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
      isClickable: ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase()),
      hasUniqueColor: this.isUniqueColor(computedStyle.color),
      hasUniqueSize: this.isUniqueSize(rect.width, rect.height),
      
      // Dynamic patterns
      hasNumericId: /\d{6,}/.test(element.id || ''),
      hasCssModuleClass: /^css-\w+/.test(element.className || ''),
      hasTimestamp: /timestamp|time|date/i.test(element.id + element.className),
      hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(element.id || ''),
      hasRandomId: /(random|rand|uuid|guid)/i.test(element.id + element.className)
    };

    return features;
  }

  /**
   * Create visual fingerprint for element comparison
   */
  async createVisualFingerprint(element: Element): Promise<VisualFingerprint> {
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    // Create a canvas for visual hash generation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot create canvas context');
    
    canvas.width = Math.min(rect.width, 100);
    canvas.height = Math.min(rect.height, 100);
    
    // Draw element representation
    ctx.fillStyle = computedStyle.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text if present
    if (element.textContent) {
      ctx.fillStyle = computedStyle.color || '#000000';
      ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      ctx.fillText(element.textContent.substring(0, 20), 5, 20);
    }
    
    // Generate hash from canvas
    const visualHash = await this.canvasToHash(canvas);
    
    const fingerprint: VisualFingerprint = {
      width: rect.width,
      height: rect.height,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontFamily: computedStyle.fontFamily,
      fontWeight: computedStyle.fontWeight,
      border: computedStyle.border,
      borderRadius: computedStyle.borderRadius,
      x: rect.left,
      y: rect.top,
      zIndex: parseInt(computedStyle.zIndex) || 0,
      text: element.textContent?.substring(0, 100) || '',
      textHash: this.hashString(element.textContent || ''),
      visualHash
    };
    
    // Cache the fingerprint
    const elementId = this.generateElementId(element);
    this.visualCache.set(elementId, fingerprint);
    
    return fingerprint;
  }

  /**
   * Compare visual similarity between two elements
   */
  async compareVisualSimilarity(element1: Element, element2: Element): Promise<number> {
    const fp1 = await this.createVisualFingerprint(element1);
    const fp2 = await this.createVisualFingerprint(element2);
    
    // Calculate similarity score (0-1)
    let similarity = 0;
    let factors = 0;
    
    // Visual hash comparison (40% weight)
    const hashSimilarity = this.compareHashes(fp1.visualHash, fp2.visualHash);
    similarity += hashSimilarity * 0.4;
    factors += 0.4;
    
    // Size similarity (20% weight)
    const sizeSimilarity = this.calculateSizeSimilarity(fp1, fp2);
    similarity += sizeSimilarity * 0.2;
    factors += 0.2;
    
    // Style similarity (20% weight)
    const styleSimilarity = this.calculateStyleSimilarity(fp1, fp2);
    similarity += styleSimilarity * 0.2;
    factors += 0.2;
    
    // Position similarity (10% weight)
    const positionSimilarity = this.calculatePositionSimilarity(fp1, fp2);
    similarity += positionSimilarity * 0.1;
    factors += 0.1;
    
    // Text similarity (10% weight)
    const textSimilarity = this.calculateTextSimilarity(fp1.text, fp2.text);
    similarity += textSimilarity * 0.1;
    factors += 0.1;
    
    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Predict locator success using ML model
   */
  async predictLocatorSuccess(element: Element, locator: string): Promise<{
    confidence: number;
    features: LocatorFeatures;
    prediction: number;
  }> {
    const features = this.extractFeatures(element, locator);
    const prediction = this.mlModel.predict(features);
    
    return {
      confidence: prediction,
      features,
      prediction
    };
  }

  /**
   * Auto-heal failed locator with rollback capability
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
  }> {
    // Check if auto-healing is enabled
    if (!this.config.enabled) {
      throw new Error('Auto-healing is disabled');
    }
    
    // Get healing history for this context
    const historyKey = this.generateHistoryKey(failedLocator, context);
    const history = this.healingHistory.get(historyKey) || [];
    
    // Try alternative locators
    const alternatives = await this.generateAlternativeLocators(element);
    
    for (const alternative of alternatives) {
      // Predict success using ML
      const prediction = await this.predictLocatorSuccess(element, alternative.locator);
      
      // Check if we have successful history with this alternative
      const successfulHistory = history.filter(h => 
        h.healedLocator === alternative.locator && h.success
      );
      
      // Boost confidence based on historical success
      const historicalBoost = successfulHistory.length > 0 ? 0.1 : 0;
      const finalConfidence = Math.min(1.0, prediction.confidence + historicalBoost);
      
      // Determine if auto-apply
      const autoApply = finalConfidence >= this.config.confidenceThreshold && 
                       this.config.autoApproveHighConfidence;
      
      if (finalConfidence >= this.config.confidenceThreshold) {
        // Record healing attempt
        const healingRecord: HealingHistory = {
          id: this.generateId(),
          originalLocator: failedLocator,
          healedLocator: alternative.locator,
          success: false, // Default to false, will be updated later
          confidence: finalConfidence,
          timestamp: new Date(),
          context: {
            ...context,
            elementType: alternative.locator.split(/[#.\[\]]/)[0] || 'unknown'
          }
        };
        
        history.push(healingRecord);
        this.healingHistory.set(historyKey, history);
        this.saveHistory();
        
        return {
          healedLocator: alternative.locator,
          confidence: finalConfidence,
          autoApplied: autoApply,
          requiresApproval: !autoApply
        };
      }
    }
    
    throw new Error('No suitable alternative locator found');
  }

  /**
   * Record healing result and handle rollback if needed
   */
  async recordHealingResult(
    healingId: string,
    success: boolean,
    error?: string
  ): Promise<void> {
    // Find the healing record
    let healingRecord: HealingHistory | undefined;
    for (const history of this.healingHistory.values()) {
      const record = history.find(h => h.id === healingId);
      if (record) {
        healingRecord = record;
        break;
      }
    }
    
    if (!healingRecord) {
      throw new Error('Healing record not found');
    }
    
    // Update the record
    healingRecord.success = success;
    
    // If failed, check if rollback is needed
    if (!success) {
      const historyKey = this.generateHistoryKey(healingRecord.originalLocator, healingRecord.context);
      const history = this.healingHistory.get(historyKey) || [];
      
      // Count recent failures for this healed locator
      const recentFailures = history
        .filter(h => h.healedLocator === healingRecord.healedLocator)
        .filter(h => {
          const daysDiff = (Date.now() - h.timestamp.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 7; // Last 7 days
        })
        .filter(h => !h.success);
      
      // Auto-rollback if too many failures
      if (recentFailures.length >= this.config.rollbackAfterFailures) {
        healingRecord.rollback = {
          timestamp: new Date(),
          reason: `Auto-rollback after ${recentFailures.length} failures`
        };
        
        // Mark this locator as unreliable
        await this.markLocatorUnreliable(healingRecord.healedLocator);
      }
    }
    
    this.saveHistory();
    
    // Retrain ML model with new data
    if (healingRecord.context) {
      const element = await this.findElementByLocator(healingRecord.healedLocator);
      if (element) {
        const features = this.extractFeatures(element, healingRecord.healedLocator);
        this.mlModel.train([{ features, label: success ? 1 : 0 }]);
        this.saveModel();
      }
    }
  }

  /**
   * Generate alternative locators using multiple strategies
   */
  private async generateAlternativeLocators(element: Element): Promise<Array<{ locator: string; strategy: string }>> {
    const alternatives: Array<{ locator: string; strategy: string }> = [];
    
    // Strategy 1: Test ID (highest priority)
    const testId = element.getAttribute('data-testid') || element.getAttribute('data-test');
    if (testId) {
      alternatives.push({ locator: `[data-testid="${testId}"]`, strategy: 'testid' });
    }
    
    // Strategy 2: ID (if not dynamic)
    if (element.id && !this.isDynamicId(element.id)) {
      alternatives.push({ locator: `#${element.id}`, strategy: 'id' });
    }
    
    // Strategy 3: ARIA attributes
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      alternatives.push({ locator: `[aria-label="${ariaLabel}"]`, strategy: 'aria' });
    }
    
    // Strategy 4: Role
    const role = element.getAttribute('role');
    if (role) {
      alternatives.push({ locator: `[role="${role}"]`, strategy: 'role' });
    }
    
    // Strategy 5: Name attribute
    const name = element.getAttribute('name');
    if (name) {
      alternatives.push({ locator: `[name="${name}"]`, strategy: 'name' });
    }
    
    // Strategy 6: Placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
      alternatives.push({ locator: `[placeholder="${placeholder}"]`, strategy: 'placeholder' });
    }
    
    // Strategy 7: Text content (if short)
    const text = element.textContent?.trim();
    if (text && text.length < 50) {
      alternatives.push({ locator: `${element.tagName.toLowerCase()}:has-text("${text}")`, strategy: 'text' });
    }
    
    // Strategy 8: CSS class (if not dynamic)
    if (element.className && !this.isDynamicClass(element.className)) {
      const firstClass = element.className.split(' ')[0];
      alternatives.push({ locator: `${element.tagName.toLowerCase()}.${firstClass}`, strategy: 'css' });
    }
    
    // Strategy 9: XPath with context
    const xpath = this.generateSmartXPath(element);
    alternatives.push({ locator: xpath, strategy: 'xpath' });
    
    return alternatives;
  }

  /**
   * Get healing statistics and success rates
   */
  async getHealingStatistics(): Promise<{
    totalHealings: number;
    successRate: number;
    autoHealRate: number;
    rollbackRate: number;
    averageConfidence: number;
    topStrategies: Array<{ strategy: string; count: number; successRate: number }>;
  }> {
    const allHealings: HealingHistory[] = [];
    
    for (const history of this.healingHistory.values()) {
      allHealings.push(...history);
    }
    
    const totalHealings = allHealings.length;
    const successfulHealings = allHealings.filter(h => h.success).length;
    const successRate = totalHealings > 0 ? successfulHealings / totalHealings : 0;
    
    const autoAppliedHealings = allHealings.filter(h => h.confidence >= this.config.confidenceThreshold).length;
    const autoHealRate = totalHealings > 0 ? autoAppliedHealings / totalHealings : 0;
    
    const rolledBackHealings = allHealings.filter(h => h.rollback).length;
    const rollbackRate = totalHealings > 0 ? rolledBackHealings / totalHealings : 0;
    
    const avgConfidence = totalHealings > 0 
      ? allHealings.reduce((sum, h) => sum + h.confidence, 0) / totalHealings 
      : 0;
    
    // Calculate strategy statistics
    const strategyStats = new Map<string, { count: number; successes: number }>();
    
    for (const healing of allHealings) {
      const strategy = this.extractStrategyFromLocator(healing.healedLocator);
      if (!strategyStats.has(strategy)) {
        strategyStats.set(strategy, { count: 0, successes: 0 });
      }
      const stats = strategyStats.get(strategy)!;
      stats.count++;
      if (healing.success) {
        stats.successes++;
      }
    }
    
    const topStrategies = Array.from(strategyStats.entries())
      .map(([strategy, stats]) => ({
        strategy,
        count: stats.count,
        successRate: stats.count > 0 ? stats.successes / stats.count : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalHealings,
      successRate,
      autoHealRate,
      rollbackRate,
      averageConfidence: avgConfidence,
      topStrategies
    };
  }

  // Helper methods
  private getElementDepth(element: Element): number {
    let depth = 0;
    let current: Element | null = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }

  private isUniqueColor(color: string): boolean {
    // Simple heuristic - unique colors are less common
    const commonColors = ['#000000', '#ffffff', '#808080', '#c0c0c0'];
    return !commonColors.includes(color.toLowerCase());
  }

  private isUniqueSize(width: number, height: number): boolean {
    // Check if size is uncommon (not standard button/input sizes)
    const commonSizes = [
      { w: 200, h: 30 },  // Standard button
      { w: 150, h: 30 },  // Small button
      { w: 300, h: 150 }, // Standard input
    ];
    
    return !commonSizes.some(size => 
      Math.abs(width - size.w) < 10 && Math.abs(height - size.h) < 10
    );
  }

  private async canvasToHash(canvas: HTMLCanvasElement): Promise<string> {
    const dataUrl = canvas.toDataURL();
    return this.hashString(dataUrl);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private compareHashes(hash1: string, hash2: string): number {
    // Simple hash similarity (can be improved with more sophisticated algorithms)
    const len = Math.max(hash1.length, hash2.length);
    let matches = 0;
    for (let i = 0; i < len; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    return matches / len;
  }

  private calculateSizeSimilarity(fp1: VisualFingerprint, fp2: VisualFingerprint): number {
    const widthDiff = Math.abs(fp1.width - fp2.width) / Math.max(fp1.width, fp2.width);
    const heightDiff = Math.abs(fp1.height - fp2.height) / Math.max(fp1.height, fp2.height);
    return 1 - (widthDiff + heightDiff) / 2;
  }

  private calculateStyleSimilarity(fp1: VisualFingerprint, fp2: VisualFingerprint): number {
    const colorSimilarity = fp1.color === fp2.color ? 1 : 0;
    const bgSimilarity = fp1.backgroundColor === fp2.backgroundColor ? 1 : 0;
    const fontSimilarity = fp1.fontFamily === fp2.fontFamily ? 1 : 0;
    return (colorSimilarity + bgSimilarity + fontSimilarity) / 3;
  }

  private calculatePositionSimilarity(fp1: VisualFingerprint, fp2: VisualFingerprint): number {
    const distance = Math.sqrt(
      Math.pow(fp1.x - fp2.x, 2) + Math.pow(fp1.y - fp2.y, 2)
    );
    // Normalize by screen size (assuming 1920x1080)
    const maxDistance = Math.sqrt(Math.pow(1920, 2) + Math.pow(1080, 2));
    return 1 - (distance / maxDistance);
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Levenshtein distance
    const matrix = Array(text2.length + 1).fill(null).map(() => Array(text1.length + 1).fill(null));
    
    for (let i = 0; i <= text2.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= text1.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= text2.length; i++) {
      for (let j = 1; j <= text1.length; j++) {
        const cost = text1[j - 1] === text2[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const distance = matrix[text2.length][text1.length];
    const maxLength = Math.max(text1.length, text2.length);
    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  }

  private generateElementId(element: Element): string {
    return `${element.tagName.toLowerCase()}-${element.id || 'no-id'}-${Date.now()}`;
  }

  private generateHistoryKey(locator: string, context: { url: string }): string {
    return `${locator}-${context.url}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private isDynamicId(id: string): boolean {
    return /\d{6,}/.test(id) || 
           /timestamp|uid|uuid|random/i.test(id) ||
           /css-\w+/.test(id);
  }

  private isDynamicClass(className: string): boolean {
    return /^css-\w+/.test(className) || 
           /\d{6,}/.test(className);
  }

  private generateSmartXPath(element: Element): string {
    const path: string[] = [];
    let current: Element | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tagName = current.tagName.toLowerCase();
      const index = Array.from(current.parentElement?.children || [])
        .filter(el => current && el.tagName === current.tagName)
        .indexOf(current) + 1;
      
      if (current.id && !this.isDynamicId(current.id)) {
        path.push(`//*[@id="${current.id}"]`);
        break;
      } else {
        path.push(`/${tagName}[${index}]`);
      }
      
      current = current.parentElement;
    }
    
    return path.reverse().join('');
  }

  private extractStrategyFromLocator(locator: string): string {
    if (locator.startsWith('[data-testid=')) return 'testid';
    if (locator.startsWith('#')) return 'id';
    if (locator.startsWith('[aria-label=')) return 'aria';
    if (locator.startsWith('[role=')) return 'role';
    if (locator.startsWith('[name=')) return 'name';
    if (locator.startsWith('[placeholder=')) return 'placeholder';
    if (locator.includes(':has-text(')) return 'text';
    if (locator.startsWith('//')) return 'xpath';
    return 'css';
  }

  private async findElementByLocator(locator: string): Promise<Element | null> {
    try {
      // Simple locator parsing (can be enhanced)
      if (locator.startsWith('#')) {
        return document.querySelector(locator);
      } else if (locator.startsWith('[')) {
        return document.querySelector(locator);
      } else if (locator.includes(':has-text(')) {
        const text = locator.match(/:has-text\("([^"]+)"\)/)?.[1];
        if (text) {
          const elements = Array.from(document.querySelectorAll('*'));
          return elements.find(el => el.textContent?.includes(text)) || null;
        }
      } else if (locator.startsWith('//')) {
        return document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)?.singleNodeValue as Element;
      }
      
      return document.querySelector(locator);
    } catch {
      return null;
    }
  }

  private async markLocatorUnreliable(locator: string): Promise<void> {
    // Store unreliable locators in Chrome storage
    const unreliable = await chrome.storage.local.get('unreliable_locators') || { unreliable_locators: [] };
    unreliable.unreliable_locators.push({
      locator,
      timestamp: new Date(),
      reason: 'Auto-rollback due to repeated failures'
    });
    await chrome.storage.local.set(unreliable);
  }

  private async loadModel(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get('ai_healing_model');
      if (stored.ai_healing_model) {
        this.mlModel.load(stored.ai_healing_model);
      }
    } catch {
      // Use default model if loading fails
      console.log('Using default ML model');
    }
  }

  private async saveModel(): Promise<void> {
    try {
      await chrome.storage.local.set({
        ai_healing_model: this.mlModel.save()
      });
    } catch (error) {
      console.error('Failed to save ML model:', error);
    }
  }

  private async loadHistory(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get('healing_history');
      if (stored.healing_history) {
        this.healingHistory = new Map(Object.entries(stored.healing_history));
      }
    } catch {
      console.log('No healing history found');
    }
  }

  private async saveHistory(): Promise<void> {
    try {
      const historyObject = Object.fromEntries(this.healingHistory);
      await chrome.storage.local.set({ healing_history: historyObject });
    } catch (error) {
      console.error('Failed to save healing history:', error);
    }
  }

  /**
   * Configure auto-healing behavior
   */
  updateConfig(newConfig: Partial<AutoHealingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    chrome.storage.local.set({ ai_healing_config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoHealingConfig {
    return { ...this.config };
  }
}

/**
 * Simple ML Model implementation
 * In production, replace with TensorFlow.js or similar
 */
class SimpleMLModel implements MLModel {
  private weights: number[] = [];
  private bias: number = 0;
  private isTrained: boolean = false;

  predict(features: LocatorFeatures): number {
    if (!this.isTrained) {
      // Default prediction based on heuristics
      return this.heuristicPrediction(features);
    }
    
    // Simple linear regression
    const featureVector = this.featuresToVector(features);
    let sum = this.bias;
    
    for (let i = 0; i < featureVector.length; i++) {
      sum += featureVector[i] * (this.weights[i] || 0);
    }
    
    // Sigmoid activation
    return 1 / (1 + Math.exp(-sum));
  }

  train(trainingData: { features: LocatorFeatures; label: number }[]): void {
    if (trainingData.length === 0) return;
    
    // Simple gradient descent
    const learningRate = 0.01;
    const epochs = 100;
    
    // Initialize weights
    const featureCount = this.featuresToVector(trainingData[0].features).length;
    this.weights = Array(featureCount).fill(0.1);
    this.bias = 0;
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const sample of trainingData) {
        const featureVector = this.featuresToVector(sample.features);
        
        // Forward pass
        let prediction = this.bias;
        for (let i = 0; i < featureVector.length; i++) {
          prediction += featureVector[i] * this.weights[i];
        }
        prediction = 1 / (1 + Math.exp(-prediction));
        
        // Backward pass
        const error = sample.label - prediction;
        
        // Update weights
        for (let i = 0; i < featureVector.length; i++) {
          this.weights[i] += learningRate * error * featureVector[i];
        }
        this.bias += learningRate * error;
      }
    }
    
    this.isTrained = true;
  }

  save(): any {
    return {
      weights: this.weights,
      bias: this.bias,
      isTrained: this.isTrained
    };
  }

  load(data?: any): void {
    if (data && data.weights) {
      this.weights = data.weights;
      this.bias = data.bias || 0;
      this.isTrained = data.isTrained || false;
    }
  }

  private heuristicPrediction(features: LocatorFeatures): number {
    let score = 0.5;
    
    // Boost for stable identifiers
    if (features.hasTestId) score += 0.3;
    if (features.hasId && !features.hasNumericId) score += 0.25;
    if (features.hasAriaLabel) score += 0.2;
    if (features.hasRole) score += 0.15;
    
    // Penalize dynamic patterns
    if (features.hasNumericId) score -= 0.3;
    if (features.hasCssModuleClass) score -= 0.2;
    if (features.hasTimestamp) score -= 0.15;
    if (features.hasUuid) score -= 0.25;
    
    // Boost for interactive elements
    if (features.isClickable) score += 0.1;
    
    // Penalize generic elements
    if (features.elementType === 'div' || features.elementType === 'span') {
      if (!features.hasId && !features.hasTestId && !features.hasClass) {
        score -= 0.2;
      }
    }
    
    return Math.max(0, Math.min(1, score));
  }

  private featuresToVector(features: LocatorFeatures): number[] {
    return [
      features.hasId ? 1 : 0,
      features.hasTestId ? 1 : 0,
      features.hasAriaLabel ? 1 : 0,
      features.hasRole ? 1 : 0,
      features.hasName ? 1 : 0,
      features.hasPlaceholder ? 1 : 0,
      features.hasText ? 1 : 0,
      features.hasClass ? 1 : 0,
      features.textLength / 100, // Normalized
      features.textWordCount / 20, // Normalized
      features.hasNumericText ? 1 : 0,
      features.hasSpecialChars ? 1 : 0,
      features.depth / 10, // Normalized
      features.siblingCount / 10, // Normalized
      features.indexAmongSiblings / 10, // Normalized
      features.isVisible ? 1 : 0,
      features.isClickable ? 1 : 0,
      features.hasUniqueColor ? 1 : 0,
      features.hasUniqueSize ? 1 : 0,
      features.hasNumericId ? 1 : 0,
      features.hasCssModuleClass ? 1 : 0,
      features.hasTimestamp ? 1 : 0,
      features.hasUuid ? 1 : 0,
      features.hasRandomId ? 1 : 0
    ];
  }
}

// Export singleton instance
export const aiSelfHealingService = new AISelfHealingService();