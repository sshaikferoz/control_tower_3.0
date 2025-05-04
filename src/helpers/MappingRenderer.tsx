import React, { useState, useEffect, useMemo } from 'react';
import { 
  FieldMapping,
  MappingSourceType
} from './types';
import apiService from './ApiService';
import { resolveWidgetMappings } from './utils';

interface MappingRendererProps {
  mappings: FieldMapping[];
  apiEndpoint?: string;
  apiResponse?: any;
  layout?: 'table' | 'grid' | 'list';
  refreshInterval?: number; // In milliseconds
}

const MappingRenderer: React.FC<MappingRendererProps> = ({
  mappings,
  apiEndpoint,
  apiResponse: initialResponse,
  layout = 'table',
  refreshInterval
}) => {
  const [apiResponse, setApiResponse] = useState<any>(initialResponse);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(!!refreshInterval);

  // Resolve mappings into data
  const resolvedData = useMemo(() => {
    if (!apiResponse && !mappings.some(m => m.valueMapping.sourceType === MappingSourceType.MANUAL)) {
      return {};
    }
    return resolveWidgetMappings(mappings, apiResponse);
  }, [mappings, apiResponse]);

  // Load data from API
  const loadData = async () => {
    if (!apiEndpoint) {
      // If no endpoint but we have cached or manual data, just use that
      if (apiResponse || mappings.some(m => m.valueMapping.sourceType === MappingSourceType.MANUAL)) {
        setLastUpdated(new Date());
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.fetchData(apiEndpoint);
      setApiResponse(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Failed to fetch data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (apiEndpoint && !apiResponse) {
      loadData();
    } else if (apiResponse) {
      setLastUpdated(new Date());
    }
  }, [apiEndpoint]);

  // Set up auto-refresh interval
  useEffect(() => {
    if (refreshInterval && autoRefreshEnabled && apiEndpoint) {
      const intervalId = setInterval(loadData, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, autoRefreshEnabled, apiEndpoint]);

  // Format a value for display
  const formatDisplayValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    // Format numbers with currency if they look like money
    if (typeof value === 'number' || !isNaN(Number(value))) {
      const num = Number(value);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
      } else {
        return `${num.toLocaleString(undefined, { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`;
      }
    }
    
    return String(value);
  };

  // Render as table
  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.values(resolvedData).map(({ label }, index) => (
              <th 
                key={index}
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {label || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            {Object.values(resolvedData).map(({ value }, index) => (
              <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDisplayValue(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Render as grid
  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Object.values(resolvedData).map(({ label, value }, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">
            {label || `Field ${index + 1}`}
          </div>
          <div className="px-4 py-4 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatDisplayValue(value)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render as list
  const renderList = () => (
    <ul className="divide-y divide-gray-200">
      {Object.values(resolvedData).map(({ label, value }, index) => (
        <li key={index} className="py-4">
          <div className="flex justify-between">
            <div className="text-sm font-medium text-gray-700">
              {label || `Field ${index + 1}`}
            </div>
            <div className="text-sm text-gray-500">
              {formatDisplayValue(value)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  // Render based on selected layout
  const renderContent = () => {
    switch (layout) {
      case 'grid':
        return renderGrid();
      case 'list':
        return renderList();
      case 'table':
      default:
        return renderTable();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Mapping Output
        </h3>
        
        <div className="flex items-center space-x-4">
          {refreshInterval && (
            <div className="flex items-center">
              <input
                id="auto-refresh"
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="auto-refresh" 
                className="ml-2 text-sm text-gray-600"
              >
                Auto-refresh
              </label>
            </div>
          )}
          
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          
          <button
            onClick={loadData}
            disabled={loading || !apiEndpoint}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm 
              leading-4 font-medium rounded-md shadow-sm text-white 
              ${loading || !apiEndpoint ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="p-5">
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {Object.keys(resolvedData).length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No data to display</h3>
            <p className="mt-1 text-sm text-gray-500">
              No mappings configured or no data available.
            </p>
            {!apiEndpoint && (
              <p className="mt-1 text-sm text-gray-500">
                Configure an API endpoint to fetch data.
              </p>
            )}
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default MappingRenderer;Object.values(resolvedData).map(({ label }, index) => (
              <th 
                key={index}
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {label || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            {