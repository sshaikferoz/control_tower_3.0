'use client'
import React, { useState, useEffect } from 'react';
import { ApiService } from './api-service';
import {
  MappingConfiguration,
  resolveMappings
} from './hybrid-mapping-system';

interface MappingRendererProps {
  config: MappingConfiguration;
  layout?: 'table' | 'form' | 'cards';
  refreshInterval?: number; // In milliseconds, for auto-refresh
}

export const MappingRenderer: React.FC<MappingRendererProps> = ({
  config,
  layout = 'table',
  refreshInterval
}) => {
  const [resolvedData, setResolvedData] = useState<Record<string, { value: any; label: string }>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load and resolve data
  const loadData = async () => {
    if (!config.apiEndpoint && !config.apiResponse) {
      // If no API endpoint or cached response, use manual values only
      const resolved = resolveMappings(config);
      setResolvedData(resolved);
      setLastUpdated(new Date());
      return;
    }
    
    if (!config.apiEndpoint) {
      // Use cached API response
      const resolved = resolveMappings(config, config.apiResponse);
      setResolvedData(resolved);
      setLastUpdated(new Date());
      return;
    }
    
    // Fetch fresh data from API
    setLoading(true);
    setError(null);
    
    try {
      const apiData = await ApiService.fetchData(config.apiEndpoint);
      
      // Resolve mappings with the new data
      const resolved = resolveMappings({
        ...config,
        apiResponse: apiData
      }, apiData);
      
      setResolvedData(resolved);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch API data: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadData();
  }, [config]);

  // Set up auto-refresh interval if specified
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(loadData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, config]);

  // Format a value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Render as table
  const renderTable = () => (
    <table className="mapping-table">
      <thead>
        <tr>
          {Object.values(resolvedData).map(({ label }, index) => (
            <th key={index}>{label || `Column ${index + 1}`}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {Object.values(resolvedData).map(({ value }, index) => (
            <td key={index}>{formatValue(value)}</td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  // Render as form
  const renderForm = () => (
    <div className="mapping-form">
      {Object.values(resolvedData).map(({ label, value }, index) => (
        <div key={index} className="form-group">
          <label>{label || `Field ${index + 1}`}</label>
          <input 
            type="text" 
            value={formatValue(value)} 
            readOnly 
            className="form-control"
          />
        </div>
      ))}
    </div>
  );

  // Render as cards
  const renderCards = () => (
    <div className="mapping-cards">
      {Object.values(resolvedData).map(({ label, value }, index) => (
        <div key={index} className="card">
          <div className="card-header">{label || `Item ${index + 1}`}</div>
          <div className="card-body">{formatValue(value)}</div>
        </div>
      ))}
    </div>
  );

  // Render based on selected layout
  const renderContent = () => {
    switch (layout) {
      case 'form':
        return renderForm();
      case 'cards':
        return renderCards();
      case 'table':
      default:
        return renderTable();
    }
  };

  return (
    <div className="mapping-renderer">
      <div className="renderer-header">
        <h3>Dynamic Mapping Output</h3>
        <div className="renderer-controls">
          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          <button 
            className="btn btn-sm btn-secondary" 
            onClick={loadData}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="renderer-content">
        {Object.keys(resolvedData).length === 0 ? (
          <div className="empty-state">
            No data to display. Check your mapping configuration.
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};