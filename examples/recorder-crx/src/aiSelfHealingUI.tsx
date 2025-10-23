/**
 * AI Self-Healing UI Component
 * Provides advanced interface for AI-powered self-healing features
 */

import * as React from 'react';
import { aiSelfHealingService, AutoHealingConfig, HealingHistory } from './aiSelfHealingService';
import { realDataIntegration } from './realDataIntegration';
import type { LocatorInfo } from './enhancedSelfHealing';

interface AISelfHealingUIProps {
  onClose: () => void;
}

interface HealingStatistics {
  totalHealings: number;
  successRate: number;
  autoHealRate: number;
  rollbackRate: number;
  averageConfidence: number;
  topStrategies: Array<{ strategy: string; count: number; successRate: number }>;
}

interface HealingRecord {
  id: string;
  originalLocator: string;
  healedLocator: string;
  success: boolean | null;
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

export const AISelfHealingUI: React.FC<AISelfHealingUIProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'history' | 'config' | 'training'>('dashboard');
  const [statistics, setStatistics] = React.useState<HealingStatistics | null>(null);
  const [history, setHistory] = React.useState<HealingRecord[]>([]);
  const [config, setConfig] = React.useState<AutoHealingConfig | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedRecord, setSelectedRecord] = React.useState<HealingRecord | null>(null);
  const [showDetails, setShowDetails] = React.useState(false);
  const [trainingData, setTrainingData] = React.useState<Array<{ features: any; label: number }>>([]);
  const [isTraining, setIsTraining] = React.useState(false);

  React.useEffect(() => {
    loadData();

    // Start listening for real data
    realDataIntegration.startListening();

    // Simulate some test executions for demonstration
    setTimeout(() => {
      realDataIntegration.simulateTestExecution('demo-script-1', true);
    }, 2000);

    setTimeout(() => {
      realDataIntegration.simulateTestExecution('demo-script-2', true);
    }, 5000);

    return () => {
      realDataIntegration.stopListening();
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get real statistics from integration service
      const realStats = await realDataIntegration.getRealHealingStatistics();

      // Get AI service statistics
      const aiStats = await aiSelfHealingService.getHealingStatistics();

      // Get real healing history
      const realHistory = await realDataIntegration.getRealHealingHistory();

      // Get current config
      const currentConfig = await aiSelfHealingService.getConfig();

      // Combine real and AI statistics
      const combinedStats = {
        totalHealings: realStats.totalHealings + aiStats.totalHealings,
        successRate: realStats.successRate || aiStats.successRate,
        autoHealRate: aiStats.autoHealRate,
        rollbackRate: aiStats.rollbackRate,
        averageConfidence: aiStats.averageConfidence,
        topStrategies: aiStats.topStrategies
      };

      setStatistics(combinedStats);
      setHistory(realHistory);
      setConfig(currentConfig);
    } catch (error) {
      console.error('Failed to load AI self-healing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHealingHistory = async (): Promise<HealingRecord[]> => {
    try {
      // Get real healing history
      const realHistory = await realDataIntegration.getRealHealingHistory();

      // Convert to HealingRecord format
      return realHistory.map(record => ({
        id: record.id,
        originalLocator: record.originalLocator,
        healedLocator: record.healedLocator || '',
        success: record.success,
        confidence: 0.8, // Default confidence
        timestamp: record.timestamp,
        context: {
          url: `test-${record.scriptId}`,
          elementType: record.elementType,
          failureReason: record.failureReason
        }
      }));
    } catch (error) {
      console.error('Failed to load healing history:', error);
      return [];
    }
  };

  const handleConfigUpdate = async (newConfig: Partial<AutoHealingConfig>) => {
    try {
      aiSelfHealingService.updateConfig(newConfig);
      setConfig({ ...config!, ...newConfig });
    } catch (error) {
      console.error('Failed to update config:', error);
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    try {
      // In a real implementation, this would collect training data
      // and train the ML model
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate training
      await loadData();
    } catch (error) {
      console.error('Failed to train model:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusIcon = (record: HealingRecord) => {
    if (record.success === null) return '⏳';
    if (record.success) return '✅';
    if (record.rollback) return '🔄';
    return '❌';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#dc3545';
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading AI Self-Healing...</p>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--vscode-sideBar-background)',
      color: 'var(--vscode-sideBar-foreground)'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid var(--vscode-panel-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🤖</span>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
            AI Self-Healing
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'var(--vscode-sideBar-foreground)',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--vscode-panel-border)',
        background: 'var(--vscode-editor-background)'
      }}>
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'history', label: 'History', icon: '📜' },
          { id: 'config', label: 'Config', icon: '⚙️' },
          { id: 'training', label: 'Training', icon: '🧠' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              background: activeTab === tab.id
                ? 'var(--vscode-tab-activeBackground)'
                : 'transparent',
              color: activeTab === tab.id
                ? 'var(--vscode-tab-activeForeground)'
                : 'var(--vscode-tab-inactiveForeground)',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '15px' }}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            statistics={statistics}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={history}
            selectedRecord={selectedRecord}
            onSelectRecord={setSelectedRecord}
            showDetails={showDetails}
            onToggleDetails={() => setShowDetails(!showDetails)}
          />
        )}

        {activeTab === 'config' && (
          <ConfigTab
            config={config}
            onUpdate={handleConfigUpdate}
          />
        )}

        {activeTab === 'training' && (
          <TrainingTab
            trainingData={trainingData}
            isTraining={isTraining}
            onTrain={handleTrainModel}
          />
        )}
      </div>
    </div>
  );
};

// Dashboard Tab Component
const DashboardTab: React.FC<{
  statistics: HealingStatistics | null;
  onRefresh: () => void;
}> = ({ statistics, onRefresh }) => {
  if (!statistics) {
    return <div>No statistics available</div>;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>Performance Overview</h4>
        <button
          onClick={onRefresh}
          style={{
            padding: '5px 10px',
            border: '1px solid var(--vscode-button-border)',
            background: 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
            cursor: 'pointer',
            fontSize: '11px',
            borderRadius: '3px'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <MetricCard
          label="Total Healings"
          value={statistics.totalHealings.toString()}
          icon="🔧"
        />
        <MetricCard
          label="Success Rate"
          value={`${(statistics.successRate * 100).toFixed(1)}%`}
          icon="✅"
          color={statistics.successRate >= 0.8 ? '#28a745' : '#ffc107'}
        />
        <MetricCard
          label="Auto-Heal Rate"
          value={`${(statistics.autoHealRate * 100).toFixed(1)}%`}
          icon="🤖"
          color={statistics.autoHealRate >= 0.7 ? '#28a745' : '#ffc107'}
        />
        <MetricCard
          label="Avg Confidence"
          value={`${(statistics.averageConfidence * 100).toFixed(1)}%`}
          icon="📊"
          color={statistics.averageConfidence >= 0.8 ? '#28a745' : '#ffc107'}
        />
      </div>

      {/* Top Strategies */}
      <div>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '13px' }}>Top Healing Strategies</h5>
        <div style={{
          background: 'var(--vscode-editor-background)',
          border: '1px solid var(--vscode-panel-border)',
          borderRadius: '4px',
          padding: '10px'
        }}>
          {statistics.topStrategies.map((strategy, index) => (
            <div
              key={strategy.strategy}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: index < statistics.topStrategies.length - 1
                  ? '1px solid var(--vscode-panel-border)'
                  : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: 'var(--vscode-badge-background)',
                  color: 'var(--vscode-badge-foreground)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  #{index + 1}
                </span>
                <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                  {strategy.strategy}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: 'var(--vscode-descriptionForeground)' }}>
                  {strategy.count} uses
                </span>
                <span style={{
                  fontSize: '11px',
                  color: strategy.successRate >= 0.8 ? '#28a745' : '#ffc107',
                  fontWeight: 'bold'
                }}>
                  {(strategy.successRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// History Tab Component
const HistoryTab: React.FC<{
  history: HealingRecord[];
  selectedRecord: HealingRecord | null;
  onSelectRecord: (record: HealingRecord | null) => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}> = ({ history, selectedRecord, onSelectRecord, showDetails, onToggleDetails }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusIcon = (record: HealingRecord) => {
    if (record.success === null) return '⏳';
    if (record.success) return '✅';
    if (record.rollback) return '🔄';
    return '❌';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>Healing History</h4>
        <button
          onClick={onToggleDetails}
          style={{
            padding: '5px 10px',
            border: '1px solid var(--vscode-button-border)',
            background: showDetails ? 'var(--vscode-button-secondaryBackground)' : 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
            cursor: 'pointer',
            fontSize: '11px',
            borderRadius: '3px'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {history.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'var(--vscode-descriptionForeground)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📭</div>
          <p style={{ margin: 0, fontSize: '12px' }}>No healing history yet</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px' }}>
            Healing attempts will appear here
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--vscode-editor-background)',
          border: '1px solid var(--vscode-panel-border)',
          borderRadius: '4px',
          maxHeight: '400px',
          overflow: 'auto'
        }}>
          {history.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelectRecord(record)}
              style={{
                padding: '12px',
                borderBottom: '1px solid var(--vscode-panel-border)',
                cursor: 'pointer',
                background: selectedRecord?.id === record.id
                  ? 'var(--vscode-list-activeSelectionBackground)'
                  : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{getStatusIcon(record)}</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '500' }}>
                      {record.context.elementType}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--vscode-descriptionForeground)',
                      marginTop: '2px'
                    }}>
                      {formatDate(record.timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: getConfidenceColor(record.confidence),
                  fontWeight: 'bold',
                  textAlign: 'right'
                }}>
                  {(record.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {showDetails && (
                <div style={{
                  fontSize: '10px',
                  color: 'var(--vscode-descriptionForeground)',
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--vscode-panel-border)'
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Original:</strong>
                    <code style={{
                      background: 'var(--vscode-textBlockQuote-background)',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      fontSize: '9px',
                      marginLeft: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {record.originalLocator}
                    </code>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Healed:</strong>
                    <code style={{
                      background: 'var(--vscode-textBlockQuote-background)',
                      padding: '2px 4px',
                      borderRadius: '2px',
                      fontSize: '9px',
                      marginLeft: '4px',
                      wordBreak: 'break-all'
                    }}>
                      {record.healedLocator}
                    </code>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>Reason:</strong> {record.context.failureReason}
                  </div>
                  {record.rollback && (
                    <div style={{ color: '#dc3545' }}>
                      <strong>Rolled back:</strong> {record.rollback.reason}
                      ({formatDate(record.rollback.timestamp)})
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Config Tab Component
const ConfigTab: React.FC<{
  config: AutoHealingConfig | null;
  onUpdate: (config: Partial<AutoHealingConfig>) => void;
}> = ({ config, onUpdate }) => {
  if (!config) return <div>Loading configuration...</div>;

  return (
    <div>
      <h4 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>AI Configuration</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Enable/Disable */}
        <ConfigToggle
          label="Enable AI Self-Healing"
          description="Allow AI to automatically heal failed locators"
          enabled={config.enabled}
          onToggle={(enabled) => onUpdate({ enabled })}
        />

        {/* Confidence Threshold */}
        <ConfigSlider
          label="Confidence Threshold"
          description="Minimum confidence required for auto-healing"
          value={config.confidenceThreshold}
          min={0.5}
          max={1.0}
          step={0.05}
          onChange={(confidenceThreshold) => onUpdate({ confidenceThreshold })}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />

        {/* Max Retries */}
        <ConfigSlider
          label="Max Retries"
          description="Maximum number of healing attempts"
          value={config.maxRetries}
          min={1}
          max={5}
          step={1}
          onChange={(maxRetries) => onUpdate({ maxRetries })}
        />

        {/* Rollback Threshold */}
        <ConfigSlider
          label="Rollback After Failures"
          description="Auto-rollback after N consecutive failures"
          value={config.rollbackAfterFailures}
          min={2}
          max={10}
          step={1}
          onChange={(rollbackAfterFailures) => onUpdate({ rollbackAfterFailures })}
        />

        {/* User Approval */}
        <ConfigToggle
          label="Require User Approval"
          description="Always ask for user approval before applying healing"
          enabled={config.requireUserApproval}
          onToggle={(requireUserApproval) => onUpdate({ requireUserApproval })}
        />

        {/* Auto-approve High Confidence */}
        <ConfigToggle
          label="Auto-approve High Confidence"
          description="Automatically apply healing when confidence is very high"
          enabled={config.autoApproveHighConfidence}
          onToggle={(autoApproveHighConfidence) => onUpdate({ autoApproveHighConfidence })}
          disabled={config.requireUserApproval}
        />
      </div>
    </div>
  );
};

// Training Tab Component
const TrainingTab: React.FC<{
  trainingData: Array<{ features: any; label: number }>;
  isTraining: boolean;
  onTrain: () => void;
}> = ({ trainingData, isTraining, onTrain }) => {
  return (
    <div>
      <h4 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>ML Model Training</h4>

      <div style={{
        background: 'var(--vscode-editor-background)',
        border: '1px solid var(--vscode-panel-border)',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '15px'
      }}>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Model Information</h5>
        <div style={{ fontSize: '11px', color: 'var(--vscode-descriptionForeground)' }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Model Type:</strong> Simple Neural Network
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Features:</strong> 24 locator characteristics
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Training Samples:</strong> {trainingData.length}
          </div>
          <div>
            <strong>Last Trained:</strong> Never
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--vscode-textBlockQuote-background)',
        border: '1px solid var(--vscode-textBlockQuote-border)',
        borderRadius: '4px',
        padding: '15px',
        marginBottom: '15px'
      }}>
        <h5 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>How It Works</h5>
        <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
          The AI model learns from past healing attempts to predict which locators
          are most likely to succeed. It considers factors like:
        </div>
        <ul style={{
          margin: '10px 0 0 0',
          paddingLeft: '20px',
          fontSize: '11px',
          lineHeight: '1.4'
        }}>
          <li>Element type and attributes</li>
          <li>Text content and structure</li>
          <li>Position in DOM hierarchy</li>
          <li>Visual properties</li>
          <li>Historical success patterns</li>
        </ul>
      </div>

      <button
        onClick={onTrain}
        disabled={isTraining || trainingData.length < 10}
        style={{
          width: '100%',
          padding: '12px',
          border: 'none',
          borderRadius: '4px',
          background: isTraining || trainingData.length < 10
            ? 'var(--vscode-button-secondaryBackground)'
            : 'var(--vscode-button-background)',
          color: 'var(--vscode-button-foreground)',
          cursor: isTraining || trainingData.length < 10 ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        {isTraining ? (
          <>
            <div className="spinner" style={{ width: '12px', height: '12px' }}></div>
            Training Model...
          </>
        ) : (
          <>
            🧠 Train Model
          </>
        )}
      </button>

      {trainingData.length < 10 && (
        <div style={{
          fontSize: '10px',
          color: 'var(--vscode-descriptionForeground)',
          textAlign: 'center',
          marginTop: '8px'
        }}>
          Need at least 10 healing attempts to train the model
        </div>
      )}
    </div>
  );
};

// Helper Components
const MetricCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  color?: string;
}> = ({ label, value, icon, color }) => {
  return (
    <div style={{
      background: 'var(--vscode-editor-background)',
      border: '1px solid var(--vscode-panel-border)',
      borderRadius: '4px',
      padding: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '20px', marginBottom: '5px' }}>{icon}</div>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: color || 'var(--vscode-foreground)',
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--vscode-descriptionForeground)'
      }}>
        {label}
      </div>
    </div>
  );
};

const ConfigToggle: React.FC<{
  label: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, enabled, onToggle, disabled }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <label style={{
          fontSize: '12px',
          fontWeight: '500',
          color: disabled ? 'var(--vscode-disabledForeground)' : 'var(--vscode-foreground)'
        }}>
          {label}
        </label>
        <button
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          style={{
            width: '40px',
            height: '20px',
            borderRadius: '10px',
            border: 'none',
            background: enabled
              ? 'var(--vscode-button-background)'
              : 'var(--vscode-button-secondaryBackground)',
            position: 'relative',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '2px',
            left: enabled ? '20px' : '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--vscode-button-foreground)',
            transition: 'left 0.2s'
          }} />
        </button>
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--vscode-descriptionForeground)',
        paddingLeft: '0'
      }}>
        {description}
      </div>
    </div>
  );
};

const ConfigSlider: React.FC<{
  label: string;
  description: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}> = ({ label, description, value, min, max, step, onChange, formatValue }) => {
  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <label style={{ fontSize: '12px', fontWeight: '500' }}>
          {label}
        </label>
        <span style={{
          fontSize: '11px',
          color: 'var(--vscode-foreground)',
          fontWeight: 'bold'
        }}>
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%',
          marginBottom: '5px'
        }}
      />
      <div style={{
        fontSize: '10px',
        color: 'var(--vscode-descriptionForeground)'
      }}>
        {description}
      </div>
    </div>
  );
};
