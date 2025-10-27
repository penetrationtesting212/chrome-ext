var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class AISelfHealingService {
  constructor() {
    __publicField(this, "mlModel");
    __publicField(this, "healingHistory", /* @__PURE__ */ new Map());
    __publicField(this, "visualCache", /* @__PURE__ */ new Map());
    __publicField(this, "config", {
      enabled: true,
      confidenceThreshold: 0.85,
      maxRetries: 3,
      rollbackAfterFailures: 3,
      requireUserApproval: false,
      autoApproveHighConfidence: true
    });
    this.mlModel = new SimpleMLModel();
    this.loadModel();
    this.loadHistory();
  }
  /**
   * Extract features from element for ML prediction
   */
  extractFeatures(element, locator) {
    var _a, _b, _c, _d, _e;
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const features = {
      elementType: element.tagName.toLowerCase(),
      hasId: !!element.id,
      hasTestId: !!element.getAttribute("data-testid"),
      hasAriaLabel: !!element.getAttribute("aria-label"),
      hasRole: !!element.getAttribute("role"),
      hasName: !!element.getAttribute("name"),
      hasPlaceholder: !!element.getAttribute("placeholder"),
      hasText: !!((_a = element.textContent) == null ? void 0 : _a.trim()),
      hasClass: !!element.className,
      // Content features
      textLength: ((_b = element.textContent) == null ? void 0 : _b.length) || 0,
      textWordCount: ((_c = element.textContent) == null ? void 0 : _c.trim().split(/\s+/).length) || 0,
      hasNumericText: /\d/.test(element.textContent || ""),
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(element.textContent || ""),
      // Position features
      depth: this.getElementDepth(element),
      siblingCount: ((_d = element.parentElement) == null ? void 0 : _d.children.length) || 0,
      indexAmongSiblings: Array.from(((_e = element.parentElement) == null ? void 0 : _e.children) || []).indexOf(element),
      // Style features
      isVisible: computedStyle.display !== "none" && computedStyle.visibility !== "hidden",
      isClickable: ["button", "a", "input", "select", "textarea"].includes(element.tagName.toLowerCase()),
      hasUniqueColor: this.isUniqueColor(computedStyle.color),
      hasUniqueSize: this.isUniqueSize(rect.width, rect.height),
      // Dynamic patterns
      hasNumericId: /\d{6,}/.test(element.id || ""),
      hasCssModuleClass: /^css-\w+/.test(element.className || ""),
      hasTimestamp: /timestamp|time|date/i.test(element.id + element.className),
      hasUuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(element.id || ""),
      hasRandomId: /(random|rand|uuid|guid)/i.test(element.id + element.className)
    };
    return features;
  }
  /**
   * Create visual fingerprint for element comparison
   */
  async createVisualFingerprint(element) {
    var _a;
    const computedStyle = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Cannot create canvas context");
    canvas.width = Math.min(rect.width, 100);
    canvas.height = Math.min(rect.height, 100);
    ctx.fillStyle = computedStyle.backgroundColor || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (element.textContent) {
      ctx.fillStyle = computedStyle.color || "#000000";
      ctx.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
      ctx.fillText(element.textContent.substring(0, 20), 5, 20);
    }
    const visualHash = await this.canvasToHash(canvas);
    const fingerprint = {
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
      text: ((_a = element.textContent) == null ? void 0 : _a.substring(0, 100)) || "",
      textHash: this.hashString(element.textContent || ""),
      visualHash
    };
    const elementId = this.generateElementId(element);
    this.visualCache.set(elementId, fingerprint);
    return fingerprint;
  }
  /**
   * Compare visual similarity between two elements
   */
  async compareVisualSimilarity(element1, element2) {
    const fp1 = await this.createVisualFingerprint(element1);
    const fp2 = await this.createVisualFingerprint(element2);
    let similarity = 0;
    let factors = 0;
    const hashSimilarity = this.compareHashes(fp1.visualHash, fp2.visualHash);
    similarity += hashSimilarity * 0.4;
    factors += 0.4;
    const sizeSimilarity = this.calculateSizeSimilarity(fp1, fp2);
    similarity += sizeSimilarity * 0.2;
    factors += 0.2;
    const styleSimilarity = this.calculateStyleSimilarity(fp1, fp2);
    similarity += styleSimilarity * 0.2;
    factors += 0.2;
    const positionSimilarity = this.calculatePositionSimilarity(fp1, fp2);
    similarity += positionSimilarity * 0.1;
    factors += 0.1;
    const textSimilarity = this.calculateTextSimilarity(fp1.text, fp2.text);
    similarity += textSimilarity * 0.1;
    factors += 0.1;
    return factors > 0 ? similarity / factors : 0;
  }
  /**
   * Predict locator success using ML model
   */
  async predictLocatorSuccess(element, locator) {
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
  async autoHealLocator(failedLocator, element, context) {
    if (!this.config.enabled) {
      throw new Error("Auto-healing is disabled");
    }
    const historyKey = this.generateHistoryKey(failedLocator, context);
    const history = this.healingHistory.get(historyKey) || [];
    const alternatives = await this.generateAlternativeLocators(element);
    for (const alternative of alternatives) {
      const prediction = await this.predictLocatorSuccess(element, alternative.locator);
      const successfulHistory = history.filter(
        (h) => h.healedLocator === alternative.locator && h.success
      );
      const historicalBoost = successfulHistory.length > 0 ? 0.1 : 0;
      const finalConfidence = Math.min(1, prediction.confidence + historicalBoost);
      const autoApply = finalConfidence >= this.config.confidenceThreshold && this.config.autoApproveHighConfidence;
      if (finalConfidence >= this.config.confidenceThreshold) {
        const healingRecord = {
          id: this.generateId(),
          originalLocator: failedLocator,
          healedLocator: alternative.locator,
          success: false,
          // Default to false, will be updated later
          confidence: finalConfidence,
          timestamp: /* @__PURE__ */ new Date(),
          context: {
            ...context,
            elementType: alternative.locator.split(/[#.\[\]]/)[0] || "unknown"
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
    throw new Error("No suitable alternative locator found");
  }
  /**
   * Record healing result and handle rollback if needed
   */
  async recordHealingResult(healingId, success, error) {
    let healingRecord;
    for (const history of this.healingHistory.values()) {
      const record = history.find((h) => h.id === healingId);
      if (record) {
        healingRecord = record;
        break;
      }
    }
    if (!healingRecord) {
      throw new Error("Healing record not found");
    }
    healingRecord.success = success;
    if (!success) {
      const historyKey = this.generateHistoryKey(healingRecord.originalLocator, healingRecord.context);
      const history = this.healingHistory.get(historyKey) || [];
      const recentFailures = history.filter((h) => h.healedLocator === healingRecord.healedLocator).filter((h) => {
        const daysDiff = (Date.now() - h.timestamp.getTime()) / (1e3 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).filter((h) => !h.success);
      if (recentFailures.length >= this.config.rollbackAfterFailures) {
        healingRecord.rollback = {
          timestamp: /* @__PURE__ */ new Date(),
          reason: `Auto-rollback after ${recentFailures.length} failures`
        };
        await this.markLocatorUnreliable(healingRecord.healedLocator);
      }
    }
    this.saveHistory();
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
  async generateAlternativeLocators(element) {
    var _a;
    const alternatives = [];
    const testId = element.getAttribute("data-testid") || element.getAttribute("data-test");
    if (testId) {
      alternatives.push({ locator: `[data-testid="${testId}"]`, strategy: "testid" });
    }
    if (element.id && !this.isDynamicId(element.id)) {
      alternatives.push({ locator: `#${element.id}`, strategy: "id" });
    }
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) {
      alternatives.push({ locator: `[aria-label="${ariaLabel}"]`, strategy: "aria" });
    }
    const role = element.getAttribute("role");
    if (role) {
      alternatives.push({ locator: `[role="${role}"]`, strategy: "role" });
    }
    const name = element.getAttribute("name");
    if (name) {
      alternatives.push({ locator: `[name="${name}"]`, strategy: "name" });
    }
    const placeholder = element.getAttribute("placeholder");
    if (placeholder) {
      alternatives.push({ locator: `[placeholder="${placeholder}"]`, strategy: "placeholder" });
    }
    const text = (_a = element.textContent) == null ? void 0 : _a.trim();
    if (text && text.length < 50) {
      alternatives.push({ locator: `${element.tagName.toLowerCase()}:has-text("${text}")`, strategy: "text" });
    }
    if (element.className && !this.isDynamicClass(element.className)) {
      const firstClass = element.className.split(" ")[0];
      alternatives.push({ locator: `${element.tagName.toLowerCase()}.${firstClass}`, strategy: "css" });
    }
    const xpath = this.generateSmartXPath(element);
    alternatives.push({ locator: xpath, strategy: "xpath" });
    return alternatives;
  }
  /**
   * Get healing statistics and success rates
   */
  async getHealingStatistics() {
    const allHealings = [];
    for (const history of this.healingHistory.values()) {
      allHealings.push(...history);
    }
    const totalHealings = allHealings.length;
    const successfulHealings = allHealings.filter((h) => h.success).length;
    const successRate = totalHealings > 0 ? successfulHealings / totalHealings : 0;
    const autoAppliedHealings = allHealings.filter((h) => h.confidence >= this.config.confidenceThreshold).length;
    const autoHealRate = totalHealings > 0 ? autoAppliedHealings / totalHealings : 0;
    const rolledBackHealings = allHealings.filter((h) => h.rollback).length;
    const rollbackRate = totalHealings > 0 ? rolledBackHealings / totalHealings : 0;
    const avgConfidence = totalHealings > 0 ? allHealings.reduce((sum, h) => sum + h.confidence, 0) / totalHealings : 0;
    const strategyStats = /* @__PURE__ */ new Map();
    for (const healing of allHealings) {
      const strategy = this.extractStrategyFromLocator(healing.healedLocator);
      if (!strategyStats.has(strategy)) {
        strategyStats.set(strategy, { count: 0, successes: 0 });
      }
      const stats = strategyStats.get(strategy);
      stats.count++;
      if (healing.success) {
        stats.successes++;
      }
    }
    const topStrategies = Array.from(strategyStats.entries()).map(([strategy, stats]) => ({
      strategy,
      count: stats.count,
      successRate: stats.count > 0 ? stats.successes / stats.count : 0
    })).sort((a, b) => b.count - a.count).slice(0, 5);
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
  getElementDepth(element) {
    let depth = 0;
    let current = element;
    while (current.parentElement) {
      depth++;
      current = current.parentElement;
    }
    return depth;
  }
  isUniqueColor(color) {
    const commonColors = ["#000000", "#ffffff", "#808080", "#c0c0c0"];
    return !commonColors.includes(color.toLowerCase());
  }
  isUniqueSize(width, height) {
    const commonSizes = [
      { w: 200, h: 30 },
      // Standard button
      { w: 150, h: 30 },
      // Small button
      { w: 300, h: 150 }
      // Standard input
    ];
    return !commonSizes.some(
      (size) => Math.abs(width - size.w) < 10 && Math.abs(height - size.h) < 10
    );
  }
  async canvasToHash(canvas) {
    const dataUrl = canvas.toDataURL();
    return this.hashString(dataUrl);
  }
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  compareHashes(hash1, hash2) {
    const len = Math.max(hash1.length, hash2.length);
    let matches = 0;
    for (let i = 0; i < len; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }
    return matches / len;
  }
  calculateSizeSimilarity(fp1, fp2) {
    const widthDiff = Math.abs(fp1.width - fp2.width) / Math.max(fp1.width, fp2.width);
    const heightDiff = Math.abs(fp1.height - fp2.height) / Math.max(fp1.height, fp2.height);
    return 1 - (widthDiff + heightDiff) / 2;
  }
  calculateStyleSimilarity(fp1, fp2) {
    const colorSimilarity = fp1.color === fp2.color ? 1 : 0;
    const bgSimilarity = fp1.backgroundColor === fp2.backgroundColor ? 1 : 0;
    const fontSimilarity = fp1.fontFamily === fp2.fontFamily ? 1 : 0;
    return (colorSimilarity + bgSimilarity + fontSimilarity) / 3;
  }
  calculatePositionSimilarity(fp1, fp2) {
    const distance = Math.sqrt(
      Math.pow(fp1.x - fp2.x, 2) + Math.pow(fp1.y - fp2.y, 2)
    );
    const maxDistance = Math.sqrt(Math.pow(1920, 2) + Math.pow(1080, 2));
    return 1 - distance / maxDistance;
  }
  calculateTextSimilarity(text1, text2) {
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
    return maxLength > 0 ? 1 - distance / maxLength : 1;
  }
  generateElementId(element) {
    return `${element.tagName.toLowerCase()}-${element.id || "no-id"}-${Date.now()}`;
  }
  generateHistoryKey(locator, context) {
    return `${locator}-${context.url}`;
  }
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
  isDynamicId(id) {
    return /\d{6,}/.test(id) || /timestamp|uid|uuid|random/i.test(id) || /css-\w+/.test(id);
  }
  isDynamicClass(className) {
    return /^css-\w+/.test(className) || /\d{6,}/.test(className);
  }
  generateSmartXPath(element) {
    var _a;
    const path = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tagName = current.tagName.toLowerCase();
      const index = Array.from(((_a = current.parentElement) == null ? void 0 : _a.children) || []).filter((el) => current && el.tagName === current.tagName).indexOf(current) + 1;
      if (current.id && !this.isDynamicId(current.id)) {
        path.push(`//*[@id="${current.id}"]`);
        break;
      } else {
        path.push(`/${tagName}[${index}]`);
      }
      current = current.parentElement;
    }
    return path.reverse().join("");
  }
  extractStrategyFromLocator(locator) {
    if (locator.startsWith("[data-testid=")) return "testid";
    if (locator.startsWith("#")) return "id";
    if (locator.startsWith("[aria-label=")) return "aria";
    if (locator.startsWith("[role=")) return "role";
    if (locator.startsWith("[name=")) return "name";
    if (locator.startsWith("[placeholder=")) return "placeholder";
    if (locator.includes(":has-text(")) return "text";
    if (locator.startsWith("//")) return "xpath";
    return "css";
  }
  async findElementByLocator(locator) {
    var _a, _b;
    try {
      if (locator.startsWith("#")) {
        return document.querySelector(locator);
      } else if (locator.startsWith("[")) {
        return document.querySelector(locator);
      } else if (locator.includes(":has-text(")) {
        const text = (_a = locator.match(/:has-text\("([^"]+)"\)/)) == null ? void 0 : _a[1];
        if (text) {
          const elements = Array.from(document.querySelectorAll("*"));
          return elements.find((el) => {
            var _a2;
            return (_a2 = el.textContent) == null ? void 0 : _a2.includes(text);
          }) || null;
        }
      } else if (locator.startsWith("//")) {
        return (_b = document.evaluate(locator, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)) == null ? void 0 : _b.singleNodeValue;
      }
      return document.querySelector(locator);
    } catch {
      return null;
    }
  }
  async markLocatorUnreliable(locator) {
    const unreliable = await chrome.storage.local.get("unreliable_locators") || { unreliable_locators: [] };
    unreliable.unreliable_locators.push({
      locator,
      timestamp: /* @__PURE__ */ new Date(),
      reason: "Auto-rollback due to repeated failures"
    });
    await chrome.storage.local.set(unreliable);
  }
  async loadModel() {
    try {
      const stored = await chrome.storage.local.get("ai_healing_model");
      if (stored.ai_healing_model) {
        this.mlModel.load(stored.ai_healing_model);
      }
    } catch {
      console.log("Using default ML model");
    }
  }
  async saveModel() {
    try {
      await chrome.storage.local.set({
        ai_healing_model: this.mlModel.save()
      });
    } catch (error) {
      console.error("Failed to save ML model:", error);
    }
  }
  async loadHistory() {
    try {
      const stored = await chrome.storage.local.get("healing_history");
      if (stored.healing_history) {
        this.healingHistory = new Map(Object.entries(stored.healing_history));
      }
    } catch {
      console.log("No healing history found");
    }
  }
  async saveHistory() {
    try {
      const historyObject = Object.fromEntries(this.healingHistory);
      await chrome.storage.local.set({ healing_history: historyObject });
    } catch (error) {
      console.error("Failed to save healing history:", error);
    }
  }
  /**
   * Configure auto-healing behavior
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    chrome.storage.local.set({ ai_healing_config: this.config });
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
}
class SimpleMLModel {
  constructor() {
    __publicField(this, "weights", []);
    __publicField(this, "bias", 0);
    __publicField(this, "isTrained", false);
  }
  predict(features) {
    if (!this.isTrained) {
      return this.heuristicPrediction(features);
    }
    const featureVector = this.featuresToVector(features);
    let sum = this.bias;
    for (let i = 0; i < featureVector.length; i++) {
      sum += featureVector[i] * (this.weights[i] || 0);
    }
    return 1 / (1 + Math.exp(-sum));
  }
  train(trainingData) {
    if (trainingData.length === 0) return;
    const learningRate = 0.01;
    const epochs = 100;
    const featureCount = this.featuresToVector(trainingData[0].features).length;
    this.weights = Array(featureCount).fill(0.1);
    this.bias = 0;
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (const sample of trainingData) {
        const featureVector = this.featuresToVector(sample.features);
        let prediction = this.bias;
        for (let i = 0; i < featureVector.length; i++) {
          prediction += featureVector[i] * this.weights[i];
        }
        prediction = 1 / (1 + Math.exp(-prediction));
        const error = sample.label - prediction;
        for (let i = 0; i < featureVector.length; i++) {
          this.weights[i] += learningRate * error * featureVector[i];
        }
        this.bias += learningRate * error;
      }
    }
    this.isTrained = true;
  }
  save() {
    return {
      weights: this.weights,
      bias: this.bias,
      isTrained: this.isTrained
    };
  }
  load(data) {
    if (data && data.weights) {
      this.weights = data.weights;
      this.bias = data.bias || 0;
      this.isTrained = data.isTrained || false;
    }
  }
  heuristicPrediction(features) {
    let score = 0.5;
    if (features.hasTestId) score += 0.3;
    if (features.hasId && !features.hasNumericId) score += 0.25;
    if (features.hasAriaLabel) score += 0.2;
    if (features.hasRole) score += 0.15;
    if (features.hasNumericId) score -= 0.3;
    if (features.hasCssModuleClass) score -= 0.2;
    if (features.hasTimestamp) score -= 0.15;
    if (features.hasUuid) score -= 0.25;
    if (features.isClickable) score += 0.1;
    if (features.elementType === "div" || features.elementType === "span") {
      if (!features.hasId && !features.hasTestId && !features.hasClass) {
        score -= 0.2;
      }
    }
    return Math.max(0, Math.min(1, score));
  }
  featuresToVector(features) {
    return [
      features.hasId ? 1 : 0,
      features.hasTestId ? 1 : 0,
      features.hasAriaLabel ? 1 : 0,
      features.hasRole ? 1 : 0,
      features.hasName ? 1 : 0,
      features.hasPlaceholder ? 1 : 0,
      features.hasText ? 1 : 0,
      features.hasClass ? 1 : 0,
      features.textLength / 100,
      // Normalized
      features.textWordCount / 20,
      // Normalized
      features.hasNumericText ? 1 : 0,
      features.hasSpecialChars ? 1 : 0,
      features.depth / 10,
      // Normalized
      features.siblingCount / 10,
      // Normalized
      features.indexAmongSiblings / 10,
      // Normalized
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
const aiSelfHealingService = new AISelfHealingService();
class SelfHealingService {
  constructor() {
    __publicField(this, "suggestions", /* @__PURE__ */ new Map());
    __publicField(this, "locatorStrategies", [
      { type: "testid", priority: 1, stability: 0.95 },
      { type: "id", priority: 2, stability: 0.9 },
      { type: "aria", priority: 3, stability: 0.85 },
      { type: "role", priority: 4, stability: 0.8 },
      { type: "name", priority: 5, stability: 0.75 },
      { type: "placeholder", priority: 6, stability: 0.7 },
      { type: "text", priority: 7, stability: 0.65 },
      { type: "css", priority: 8, stability: 0.5 },
      { type: "xpath", priority: 9, stability: 0.4 }
    ]);
    // AI integration flag
    __publicField(this, "aiEnabled", true);
  }
  /**
   * Enable/disable AI enhancement
   */
  setAIEnabled(enabled) {
    this.aiEnabled = enabled;
  }
  /**
   * Check if AI is enabled
   */
  isAIEnabled() {
    return this.aiEnabled;
  }
  /**
   * Calculate comprehensive confidence score with AI enhancement
   */
  async calculateConfidence(type, locator, element) {
    const strategy = this.locatorStrategies.find((s) => s.type === type);
    const stabilityScore = (strategy == null ? void 0 : strategy.stability) || 0.5;
    let uniquenessScore = 0.5;
    if (type === "id" || type === "testid") uniquenessScore += 0.3;
    if (type === "aria" || type === "role") uniquenessScore += 0.2;
    if (locator.includes("div") || locator.includes("span")) uniquenessScore -= 0.2;
    if (element.attributes["data-testid"] || element.id) uniquenessScore += 0.2;
    uniquenessScore = Math.min(1, Math.max(0, uniquenessScore));
    let confidence = stabilityScore * 0.6 + uniquenessScore * 0.4;
    if (this.aiEnabled) {
      try {
        const mockElement = document.createElement(element.tag);
        if (element.id) mockElement.id = element.id;
        if (element.className) mockElement.className = element.className;
        Object.entries(element.attributes).forEach(([key, value]) => {
          mockElement.setAttribute(key, value);
        });
        const aiPrediction = await aiSelfHealingService.predictLocatorSuccess(mockElement, locator);
        confidence = confidence * 0.7 + aiPrediction.confidence * 0.3;
      } catch (error) {
        console.warn("AI prediction failed, using traditional scoring:", error);
      }
    }
    return confidence;
  }
  /**
   * Record a locator failure and suggest alternatives
   */
  async recordFailure(brokenLocator, validLocator) {
    try {
      const scriptId = "current-script";
      const suggestions = this.suggestions.get(scriptId) || [];
      if (validLocator) {
        const existing = suggestions.find(
          (s) => s.brokenLocator === brokenLocator.locator && s.validLocator === validLocator.locator
        );
        if (existing) {
          return existing;
        }
        const suggestion = {
          id: Math.random().toString(36).substr(2, 9),
          brokenLocator: brokenLocator.locator,
          validLocator: validLocator.locator,
          confidence: validLocator.confidence || 0.5,
          stability: 0.8,
          // Default stability
          status: "pending",
          createdAt: /* @__PURE__ */ new Date(),
          aiEnhanced: validLocator.aiEnhanced || false
        };
        suggestions.push(suggestion);
        this.suggestions.set(scriptId, suggestions);
        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });
        return suggestion;
      }
      return null;
    } catch (error) {
      console.error("Error recording locator failure:", error);
      return null;
    }
  }
  /**
   * Get self-healing suggestions for a script
   */
  async getSuggestions() {
    try {
      const scriptId = "current-script";
      const result = await chrome.storage.local.get([`healing_suggestions_${scriptId}`]);
      return result[`healing_suggestions_${scriptId}`] || [];
    } catch (error) {
      console.error("Error getting suggestions:", error);
      return [];
    }
  }
  /**
   * Approve a self-healing suggestion
   */
  async approveSuggestion(id) {
    try {
      const scriptId = "current-script";
      const suggestions = await this.getSuggestions();
      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion) {
        suggestion.status = "approved";
        suggestion.confidence = Math.min(1, suggestion.confidence + 0.1);
        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });
        if (suggestion.aiEnhanced) {
          try {
            await aiSelfHealingService.recordHealingResult(id, true);
          } catch (error) {
            console.warn("Failed to record AI healing result:", error);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error approving suggestion:", error);
      return false;
    }
  }
  /**
   * Reject a self-healing suggestion
   */
  async rejectSuggestion(id) {
    try {
      const scriptId = "current-script";
      const suggestions = await this.getSuggestions();
      const suggestion = suggestions.find((s) => s.id === id);
      if (suggestion) {
        suggestion.status = "rejected";
        await chrome.storage.local.set({
          [`healing_suggestions_${scriptId}`]: suggestions
        });
        if (suggestion.aiEnhanced) {
          try {
            await aiSelfHealingService.recordHealingResult(id, false);
          } catch (error) {
            console.warn("Failed to record AI healing result:", error);
          }
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error rejecting suggestion:", error);
      return false;
    }
  }
  /**
   * Try to find element using alternative locators with AI enhancement
   */
  async findAlternativeLocator(element) {
    const locators = [];
    for (const { type } of this.locatorStrategies) {
      let locator = null;
      switch (type) {
        case "id":
          if (element.id && !element.id.match(/\d{6,}/)) {
            locator = { locator: `#${element.id}`, type: "id" };
          }
          break;
        case "testid":
          const testId = element.attributes["data-testid"] || element.attributes["data-test"];
          if (testId) {
            locator = { locator: `[data-testid="${testId}"]`, type: "testid" };
          }
          break;
        case "aria":
          const ariaLabel = element.attributes["aria-label"];
          if (ariaLabel) {
            locator = { locator: `[aria-label="${ariaLabel}"]`, type: "aria" };
          }
          break;
        case "role":
          const role = element.attributes.role;
          if (role) {
            locator = { locator: `[role="${role}"]`, type: "role" };
          }
          break;
        case "name":
          if (element.attributes.name) {
            locator = { locator: `[name="${element.attributes.name}"]`, type: "name" };
          }
          break;
        case "placeholder":
          const placeholder = element.attributes.placeholder;
          if (placeholder) {
            locator = { locator: `[placeholder="${placeholder}"]`, type: "placeholder" };
          }
          break;
        case "text":
          break;
        case "css":
          if (element.className && !element.className.match(/\d{6,}/)) {
            locator = { locator: `.${element.className.split(" ")[0]}`, type: "css" };
          }
          break;
        case "xpath":
          locator = { locator: `//${element.tag}`, type: "xpath" };
          break;
      }
      if (locator) {
        locator.confidence = await this.calculateConfidence(type, locator.locator, element);
        locators.push(locator);
      }
    }
    if (this.aiEnabled && locators.length > 0) {
      try {
        const mockElement = document.createElement(element.tag);
        if (element.id) mockElement.id = element.id;
        if (element.className) mockElement.className = element.className;
        Object.entries(element.attributes).forEach(([key, value]) => {
          mockElement.setAttribute(key, value);
        });
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
        aiEnhancedLocators.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        return aiEnhancedLocators[0];
      } catch (error) {
        console.warn("AI enhancement failed, using traditional scoring:", error);
      }
    }
    locators.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    return locators.length > 0 ? locators[0] : null;
  }
  /**
   * Update locator strategy priority
   */
  async updateStrategyPriority(strategies) {
    this.locatorStrategies = strategies.sort((a, b) => a.priority - b.priority);
    await chrome.storage.local.set({ locator_strategies: strategies });
  }
  /**
   * Load saved strategies from storage
   */
  async loadStrategies() {
    try {
      const result = await chrome.storage.local.get(["locator_strategies"]);
      if (result.locator_strategies) {
        this.locatorStrategies = result.locator_strategies;
      }
    } catch (error) {
      console.error("Error loading strategies:", error);
    }
  }
  /**
   * Detect unstable locators with AI pattern recognition
   */
  async detectUnstableLocator(locator, element) {
    const unstablePatterns = [
      { pattern: /\d{6,}/, reason: "Contains long numeric ID (likely dynamic)" },
      { pattern: /^\.(css|sc|jss)-\w+/, reason: "CSS-in-JS class (changes on build)" },
      { pattern: /timestamp|uid|uuid|random/i, reason: "Contains dynamic identifier" },
      { pattern: /\[\d+\]/, reason: "Uses array index (fragile)" }
    ];
    for (const { pattern, reason } of unstablePatterns) {
      if (pattern.test(locator)) {
        return { isUnstable: true, reason, aiDetected: false };
      }
    }
    if (this.aiEnabled && element) {
      try {
        const aiPrediction = await aiSelfHealingService.predictLocatorSuccess(element, locator);
        const features = aiPrediction.features;
        if (features.hasNumericId || features.hasCssModuleClass || features.hasTimestamp || features.hasUuid || features.hasRandomId) {
          return {
            isUnstable: true,
            reason: "AI-detected dynamic pattern",
            aiDetected: true
          };
        }
      } catch (error) {
        console.warn("AI instability detection failed:", error);
      }
    }
    return { isUnstable: false };
  }
  /**
   * Auto-cleanup old suggestions
   */
  async cleanupSuggestions(daysOld = 30) {
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    let cleanedCount = 0;
    for (const [scriptId, suggestions] of this.suggestions.entries()) {
      const filtered = suggestions.filter((s) => {
        const shouldRemove = s.status === "rejected" && s.createdAt < cutoffDate;
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
  async getStatistics() {
    const allSuggestions = [];
    for (const suggestions of this.suggestions.values()) {
      allSuggestions.push(...suggestions);
    }
    const total = allSuggestions.length;
    const pending = allSuggestions.filter((s) => s.status === "pending").length;
    const approved = allSuggestions.filter((s) => s.status === "approved").length;
    const rejected = allSuggestions.filter((s) => s.status === "rejected").length;
    const avgConfidence = total > 0 ? allSuggestions.reduce((sum, s) => sum + s.confidence, 0) / total : 0;
    const aiEnhanced = allSuggestions.filter((s) => s.aiEnhanced);
    const aiEnhancedCount = aiEnhanced.length;
    const aiSuccesses = aiEnhanced.reduce((sum, s) => sum + (s.successCount || 0), 0);
    const aiAttempts = aiEnhanced.reduce(
      (sum, s) => sum + (s.successCount || 0) + (s.failureCount || 0),
      0
    );
    const aiSuccessRate = aiAttempts > 0 ? aiSuccesses / aiAttempts : 0;
    const withSimilarity = allSuggestions.filter((s) => s.visualSimilarity !== void 0);
    const visualSimilarityAvg = withSimilarity.length > 0 ? withSimilarity.reduce((sum, s) => sum + (s.visualSimilarity || 0), 0) / withSimilarity.length : 0;
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
  async autoHealLocator(failedLocator, element, context) {
    if (this.aiEnabled) {
      try {
        const aiResult = await aiSelfHealingService.autoHealLocator(failedLocator, element, context);
        const suggestion = {
          id: Math.random().toString(36).substr(2, 9),
          brokenLocator: failedLocator,
          validLocator: aiResult.healedLocator,
          confidence: aiResult.confidence,
          stability: 0.8,
          // Default stability
          status: aiResult.autoApplied ? "approved" : "pending",
          createdAt: /* @__PURE__ */ new Date(),
          aiEnhanced: true
        };
        const scriptId = context.url;
        if (!this.suggestions.has(scriptId)) {
          this.suggestions.set(scriptId, []);
        }
        this.suggestions.get(scriptId).push(suggestion);
        return {
          ...aiResult,
          aiEnhanced: true
        };
      } catch (error) {
        console.warn("AI auto-healing failed, falling back to traditional:", error);
      }
    }
    const elementInfo = {
      tag: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      attributes: {}
    };
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
    throw new Error("No suitable alternative locator found");
  }
  /**
   * Record healing result and sync with AI service
   */
  async recordHealingResult(healingId, success, error) {
    for (const [scriptId, suggestions] of this.suggestions.entries()) {
      const suggestion = suggestions.find((s) => s.id === healingId);
      if (suggestion) {
        if (success) {
          suggestion.successCount = (suggestion.successCount || 0) + 1;
        } else {
          suggestion.failureCount = (suggestion.failureCount || 0) + 1;
        }
        suggestion.lastUsed = /* @__PURE__ */ new Date();
        break;
      }
    }
    try {
      await aiSelfHealingService.recordHealingResult(healingId, success, error);
    } catch (error2) {
      console.warn("Failed to record healing result in AI service:", error2);
    }
  }
  /**
   * Get visual similarity between two elements
   */
  async getVisualSimilarity(element1, element2) {
    var _a, _b;
    if (this.aiEnabled) {
      try {
        return await aiSelfHealingService.compareVisualSimilarity(element1, element2);
      } catch (error) {
        console.warn("AI visual similarity failed:", error);
      }
    }
    const text1 = ((_a = element1.textContent) == null ? void 0 : _a.trim()) || "";
    const text2 = ((_b = element2.textContent) == null ? void 0 : _b.trim()) || "";
    return text1 === text2 ? 1 : 0;
  }
}
const selfHealingService = new SelfHealingService();
class ApiTestingService {
  constructor() {
    __publicField(this, "testCases", /* @__PURE__ */ new Map());
    __publicField(this, "mocks", /* @__PURE__ */ new Map());
    __publicField(this, "contracts", /* @__PURE__ */ new Map());
    __publicField(this, "benchmarks", /* @__PURE__ */ new Map());
    __publicField(this, "capturedRequests", /* @__PURE__ */ new Map());
    this.loadFromStorage();
  }
  /**
   * Load data from Chrome storage
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get([
        "api_test_cases",
        "api_mocks",
        "api_contracts",
        "api_benchmarks"
      ]);
      if (result.api_test_cases) {
        this.testCases = new Map(Object.entries(result.api_test_cases));
      }
      if (result.api_mocks) {
        this.mocks = new Map(Object.entries(result.api_mocks));
      }
      if (result.api_contracts) {
        this.contracts = new Map(Object.entries(result.api_contracts));
      }
      if (result.api_benchmarks) {
        this.benchmarks = new Map(Object.entries(result.api_benchmarks));
      }
    } catch (error) {
      console.error("Error loading API testing data:", error);
    }
  }
  /**
   * Save data to Chrome storage
   */
  async saveToStorage() {
    try {
      await chrome.storage.local.set({
        api_test_cases: Object.fromEntries(this.testCases),
        api_mocks: Object.fromEntries(this.mocks),
        api_contracts: Object.fromEntries(this.contracts),
        api_benchmarks: Object.fromEntries(this.benchmarks)
      });
    } catch (error) {
      console.error("Error saving API testing data:", error);
    }
  }
  /**
   * Capture network request from Playwright
   */
  captureRequest(request) {
    this.capturedRequests.set(request.id, { request });
  }
  /**
   * Capture network response from Playwright
   */
  captureResponse(response) {
    const captured = this.capturedRequests.get(response.requestId);
    if (captured) {
      captured.response = response;
    }
  }
  /**
   * Get all captured requests
   */
  getCapturedRequests() {
    return Array.from(this.capturedRequests.values());
  }
  /**
   * Clear captured requests
   */
  clearCapturedRequests() {
    this.capturedRequests.clear();
  }
  /**
   * Create test case from captured request
   */
  createTestCaseFromRequest(requestId, name) {
    const captured = this.capturedRequests.get(requestId);
    if (!captured) return null;
    const testCase = {
      id: `test-${Date.now()}`,
      name,
      request: captured.request,
      assertions: [],
      response: captured.response,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (captured.response) {
      testCase.assertions.push({
        id: `assert-${Date.now()}-1`,
        type: "status",
        operator: "equals",
        expected: captured.response.status,
        actual: captured.response.status,
        passed: true,
        message: `Status code should be ${captured.response.status}`
      });
      testCase.assertions.push({
        id: `assert-${Date.now()}-2`,
        type: "response-time",
        operator: "less-than",
        expected: 2e3,
        actual: captured.response.responseTime,
        passed: captured.response.responseTime < 2e3,
        message: "Response time should be less than 2000ms"
      });
    }
    this.testCases.set(testCase.id, testCase);
    this.saveToStorage();
    return testCase;
  }
  /**
   * Add test case
   */
  addTestCase(testCase) {
    this.testCases.set(testCase.id, testCase);
    this.saveToStorage();
  }
  /**
   * Update test case
   */
  updateTestCase(id, updates) {
    const testCase = this.testCases.get(id);
    if (testCase) {
      Object.assign(testCase, updates, { updatedAt: /* @__PURE__ */ new Date() });
      this.saveToStorage();
    }
  }
  /**
   * Delete test case
   */
  deleteTestCase(id) {
    this.testCases.delete(id);
    this.saveToStorage();
  }
  /**
   * Get all test cases
   */
  getTestCases() {
    return Array.from(this.testCases.values());
  }
  /**
   * Execute test case
   */
  async executeTestCase(id) {
    const testCase = this.testCases.get(id);
    if (!testCase) throw new Error("Test case not found");
    const startTime = Date.now();
    try {
      const response = await fetch(testCase.request.url, {
        method: testCase.request.method,
        headers: testCase.request.headers,
        body: testCase.request.body
      });
      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();
      const apiResponse = {
        id: `resp-${Date.now()}`,
        requestId: testCase.request.id,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        responseTime,
        timestamp: Date.now()
      };
      testCase.response = apiResponse;
      for (const assertion of testCase.assertions) {
        await this.executeAssertion(assertion, apiResponse, responseBody);
      }
      testCase.updatedAt = /* @__PURE__ */ new Date();
      this.saveToStorage();
      return testCase;
    } catch (error) {
      throw new Error(`Test execution failed: ${error}`);
    }
  }
  /**
   * Execute assertion
   */
  async executeAssertion(assertion, response, responseBody) {
    let actual;
    let passed = false;
    switch (assertion.type) {
      case "status":
        actual = response.status;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;
      case "header":
        actual = response.headers[assertion.path || ""];
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;
      case "body":
        actual = responseBody;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;
      case "json-path":
        try {
          const json = JSON.parse(responseBody);
          actual = this.getJsonPath(json, assertion.path || "");
          passed = this.compare(actual, assertion.expected, assertion.operator);
        } catch (error) {
          passed = false;
          assertion.message = `JSON parse error: ${error}`;
        }
        break;
      case "json-schema":
        try {
          const json = JSON.parse(responseBody);
          passed = await this.validateJsonSchema(json, assertion.expected);
        } catch (error) {
          passed = false;
          assertion.message = `Schema validation error: ${error}`;
        }
        break;
      case "response-time":
        actual = response.responseTime;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;
    }
    assertion.actual = actual;
    assertion.passed = passed;
  }
  /**
   * Compare values based on operator
   */
  compare(actual, expected, operator) {
    switch (operator) {
      case "equals":
        return actual === expected;
      case "contains":
        return String(actual).includes(String(expected));
      case "matches":
        return new RegExp(expected).test(String(actual));
      case "less-than":
        return Number(actual) < Number(expected);
      case "greater-than":
        return Number(actual) > Number(expected);
      case "exists":
        return actual !== void 0 && actual !== null;
      default:
        return false;
    }
  }
  /**
   * Get value from JSON using path
   */
  getJsonPath(obj, path) {
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
      if (current === void 0 || current === null) return void 0;
      current = current[key];
    }
    return current;
  }
  /**
   * Validate JSON against schema (basic implementation)
   */
  async validateJsonSchema(data, schema) {
    try {
      if (typeof schema === "string") {
        schema = JSON.parse(schema);
      }
      if (schema.type && typeof data !== schema.type) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Add API mock
   */
  addMock(mock) {
    this.mocks.set(mock.id, mock);
    this.saveToStorage();
  }
  /**
   * Update mock
   */
  updateMock(id, updates) {
    const mock = this.mocks.get(id);
    if (mock) {
      Object.assign(mock, updates);
      this.saveToStorage();
    }
  }
  /**
   * Delete mock
   */
  deleteMock(id) {
    this.mocks.delete(id);
    this.saveToStorage();
  }
  /**
   * Get all mocks
   */
  getMocks() {
    return Array.from(this.mocks.values());
  }
  /**
   * Get enabled mocks
   */
  getEnabledMocks() {
    return Array.from(this.mocks.values()).filter((m) => m.enabled);
  }
  /**
   * Add contract test
   */
  addContract(contract) {
    this.contracts.set(contract.id, contract);
    this.saveToStorage();
  }
  /**
   * Get all contracts
   */
  getContracts() {
    return Array.from(this.contracts.values());
  }
  /**
   * Add benchmark
   */
  addBenchmark(benchmark) {
    this.benchmarks.set(benchmark.id, benchmark);
    this.saveToStorage();
  }
  /**
   * Run benchmark
   */
  async runBenchmark(id, iterations = 10) {
    const benchmark = this.benchmarks.get(id);
    if (!benchmark) throw new Error("Benchmark not found");
    benchmark.measurements = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        const response = await fetch(benchmark.endpoint, {
          method: benchmark.method
        });
        const responseTime = Date.now() - startTime;
        benchmark.measurements.push({
          timestamp: /* @__PURE__ */ new Date(),
          responseTime,
          success: response.ok
        });
      } catch (error) {
        benchmark.measurements.push({
          timestamp: /* @__PURE__ */ new Date(),
          responseTime: Date.now() - startTime,
          success: false
        });
      }
    }
    const times = benchmark.measurements.map((m) => m.responseTime).sort((a, b) => a - b);
    benchmark.avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    benchmark.minResponseTime = Math.min(...times);
    benchmark.maxResponseTime = Math.max(...times);
    benchmark.p50 = times[Math.floor(times.length * 0.5)];
    benchmark.p95 = times[Math.floor(times.length * 0.95)];
    benchmark.p99 = times[Math.floor(times.length * 0.99)];
    this.saveToStorage();
    return benchmark;
  }
  /**
   * Get all benchmarks
   */
  getBenchmarks() {
    return Array.from(this.benchmarks.values());
  }
  /**
   * Generate code for API test
   */
  generateCode(testCase, language) {
    switch (language) {
      case "javascript":
      case "playwright-test":
        return this.generatePlaywrightCode(testCase);
      case "python":
      case "python-pytest":
        return this.generatePythonCode(testCase);
      case "java":
      case "java-junit":
        return this.generateJavaCode(testCase);
      default:
        return this.generatePlaywrightCode(testCase);
    }
  }
  /**
   * Generate Playwright test code
   */
  generatePlaywrightCode(testCase) {
    let code = `import { test, expect } from '@playwright/test';

`;
    code += `test('${testCase.name}', async ({ request }) => {
`;
    code += `  const response = await request.${testCase.request.method.toLowerCase()}('${testCase.request.url}'`;
    if (testCase.request.body || Object.keys(testCase.request.headers).length > 0) {
      code += `, {
`;
      if (Object.keys(testCase.request.headers).length > 0) {
        code += `    headers: ${JSON.stringify(testCase.request.headers, null, 2)},
`;
      }
      if (testCase.request.body) {
        code += `    data: ${testCase.request.body},
`;
      }
      code += `  }`;
    }
    code += `);

`;
    for (const assertion of testCase.assertions) {
      switch (assertion.type) {
        case "status":
          code += `  expect(response.status()).toBe(${assertion.expected});
`;
          break;
        case "header":
          code += `  expect(response.headers()['${assertion.path}']).toBe('${assertion.expected}');
`;
          break;
        case "json-path":
          code += `  const body = await response.json();
`;
          code += `  expect(body.${assertion.path}).toBe(${JSON.stringify(assertion.expected)});
`;
          break;
        case "response-time":
          code += `  // Response time assertion - implement with custom logic
`;
          break;
      }
    }
    code += `});
`;
    return code;
  }
  /**
   * Generate Python test code
   */
  generatePythonCode(testCase) {
    let code = `import pytest
from playwright.sync_api import sync_playwright

`;
    code += `def test_${testCase.name.toLowerCase().replace(/\s+/g, "_")}():
`;
    code += `    with sync_playwright() as p:
`;
    code += `        browser = p.chromium.launch()
`;
    code += `        context = browser.new_context()
`;
    code += `        page = context.new_page()

`;
    code += `        response = context.request.${testCase.request.method.toLowerCase()}("${testCase.request.url}")

`;
    for (const assertion of testCase.assertions) {
      if (assertion.type === "status") {
        code += `        assert response.status == ${assertion.expected}
`;
      }
    }
    code += `        browser.close()
`;
    return code;
  }
  /**
   * Generate Java test code
   */
  generateJavaCode(testCase) {
    let code = `import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;

`;
    code += `class ApiTest {
`;
    code += `    @Test
`;
    code += `    void ${testCase.name.replace(/\s+/g, "")}() {
`;
    code += `        try (Playwright playwright = Playwright.create()) {
`;
    code += `            APIRequestContext request = playwright.request().newContext();
`;
    code += `            APIResponse response = request.${testCase.request.method.toLowerCase()}("${testCase.request.url}");

`;
    for (const assertion of testCase.assertions) {
      if (assertion.type === "status") {
        code += `            assertEquals(${assertion.expected}, response.status());
`;
      }
    }
    code += `        }
`;
    code += `    }
`;
    code += `}
`;
    return code;
  }
}
const apiTestingService = new ApiTestingService();
export {
  aiSelfHealingService as a,
  apiTestingService as b,
  selfHealingService as s
};
//# sourceMappingURL=apiTestingService.js.map
