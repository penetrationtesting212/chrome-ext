/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { selfHealingService, HealingSuggestion } from './selfHealing';
import { realDataIntegration } from './realDataIntegration';

interface SelfHealingManagerProps {
  onSuggestionApproved?: (suggestion: HealingSuggestion) => void;
  onClose?: () => void;
}

export const SelfHealingManager: React.FC<SelfHealingManagerProps> = ({ onSuggestionApproved, onClose }) => {
  const [suggestions, setSuggestions] = React.useState<HealingSuggestion[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [statistics, setStatistics] = React.useState<any>(null);

  // Load suggestions on component mount
  React.useEffect(() => {
    loadSuggestions();
    
    // Start listening for real data
    realDataIntegration.startListening();
    
    // Simulate some test executions for demonstration
    setTimeout(() => {
      realDataIntegration.simulateTestExecution('demo-script-1', true);
    }, 2000);
    
    return () => {
      realDataIntegration.stopListening();
    };
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      // Get real statistics from integration service
      const realStats = await realDataIntegration.getRealHealingStatistics();
      
      // Get traditional service statistics
      const traditionalStats = await selfHealingService.getStatistics();
      
      // Get suggestions
      const healingSuggestions = await selfHealingService.getSuggestions();
      
      // Combine real and traditional statistics
      const combinedStats = {
        total: realStats.totalTests + traditionalStats.total,
        pending: healingSuggestions.filter(s => s.status === 'pending').length,
        approved: healingSuggestions.filter(s => s.status === 'approved').length,
        rejected: healingSuggestions.filter(s => s.status === 'rejected').length,
        averageConfidence: traditionalStats.averageConfidence,
        aiEnhancedCount: realStats.aiHealings,
        aiSuccessRate: realStats.successRate,
        visualSimilarityAvg: traditionalStats.visualSimilarityAvg
      };
      
      setSuggestions(healingSuggestions);
      setStatistics(combinedStats);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      const success = await selfHealingService.approveSuggestion(id);
      if (success) {
        // Update local state
        setSuggestions(prev => 
          prev.map(s => s.id === id ? { ...s, status: 'approved' } : s)
        );
        
        // Notify parent
        const suggestion = suggestions.find(s => s.id === id);
        if (suggestion && onSuggestionApproved) {
          onSuggestionApproved(suggestion);
        }
      }
    } catch (error) {
      console.error('Error approving suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      const success = await selfHealingService.rejectSuggestion(id);
      if (success) {
        // Update local state
        setSuggestions(prev => 
          prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s)
        );
      }
    } catch (error) {
      console.error('Error rejecting suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
  const approvedSuggestions = suggestions.filter(s => s.status === 'approved');
  const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected');

  return (
    <div className="self-healing-manager">
      <div className="healing-header">
        <h3>Self-Healing Suggestions</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadSuggestions} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          {onClose && (
            <button onClick={onClose}>Close</button>
          )}
        </div>
      </div>
      
      {pendingSuggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>Pending ({pendingSuggestions.length})</h4>
          <div className="suggestions-list">
            {pendingSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item pending">
                <div className="suggestion-content">
                  <div className="locator-pair">
                    <div className="broken-locator">
                      <label>Broken:</label>
                      <code>{suggestion.brokenLocator}</code>
                    </div>
                    <div className="valid-locator">
                      <label>Valid:</label>
                      <code>{suggestion.validLocator}</code>
                    </div>
                  </div>
                  <div className="confidence">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
                <div className="suggestion-actions">
                  <button 
                    onClick={() => handleApprove(suggestion.id)}
                    disabled={loading}
                    className="approve-btn"
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(suggestion.id)}
                    disabled={loading}
                    className="reject-btn"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {approvedSuggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>Approved ({approvedSuggestions.length})</h4>
          <div className="suggestions-list">
            {approvedSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item approved">
                <div className="suggestion-content">
                  <div className="locator-pair">
                    <div className="broken-locator">
                      <label>Broken:</label>
                      <code>{suggestion.brokenLocator}</code>
                    </div>
                    <div className="valid-locator">
                      <label>Valid:</label>
                      <code>{suggestion.validLocator}</code>
                    </div>
                  </div>
                  <div className="confidence">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
                <div className="status-badge approved">Approved</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {rejectedSuggestions.length > 0 && (
        <div className="suggestions-section">
          <h4>Rejected ({rejectedSuggestions.length})</h4>
          <div className="suggestions-list">
            {rejectedSuggestions.map(suggestion => (
              <div key={suggestion.id} className="suggestion-item rejected">
                <div className="suggestion-content">
                  <div className="locator-pair">
                    <div className="broken-locator">
                      <label>Broken:</label>
                      <code>{suggestion.brokenLocator}</code>
                    </div>
                    <div className="valid-locator">
                      <label>Valid:</label>
                      <code>{suggestion.validLocator}</code>
                    </div>
                  </div>
                  <div className="confidence">
                    Confidence: {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
                <div className="status-badge rejected">Rejected</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {suggestions.length === 0 && !loading && (
        <p>No self-healing suggestions found.</p>
      )}
    </div>
  );
};

// Export both the manager and a simple UI wrapper
export const SelfHealingUI: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return <SelfHealingManager onClose={onClose} />;
};