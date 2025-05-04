import React, { useState, useEffect } from 'react';
import apiService from './ApiService';

interface ApiEndpointSelectorProps {
  initialEndpoint?: string;
  onEndpointSelected: (endpoint: string, data: any) => void;
  recentEndpoints?: string[];
}

const ApiEndpointSelector: React.FC<ApiEndpointSelectorProps> = ({
  initialEndpoint = '',
  onEndpointSelected,
  recentEndpoints = []
}) => {
  const [endpoint, setEndpoint] = useState<string>(initialEndpoint);
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savedEndpoints, setSavedEndpoints] = useState<string[]>(recentEndpoints);

  // Load saved endpoints from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedApiEndpoints');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedEndpoints(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved endpoints:', err);
      }
    }
  }, []);

  // Save endpoint to localStorage
  const saveEndpoint = (endpoint: string) => {
    if (!endpoint || savedEndpoints.includes(endpoint)) return;
    
    const updated = [endpoint, ...savedEndpoints].slice(0, 10); // Keep only latest 10
    setSavedEndpoints(updated);
    localStorage.setItem('savedApiEndpoints', JSON.stringify(updated));
  };

  // Test the connection to the API endpoint
  const testEndpoint = async () => {
    if (!endpoint) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await apiService.testConnection(endpoint);
      setTestResult(result);
      
      if (result.success) {
        saveEndpoint(endpoint);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  // Fetch data from the endpoint
  const fetchData = async () => {
    if (!endpoint) return;
    
    setLoading(true);
    
    try {
      const data = await apiService.fetchData(endpoint);
      const parsedData = apiService.parseApiResponse(data);
      
      onEndpointSelected(endpoint, parsedData);
      saveEndpoint(endpoint);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error 
          ? `Failed to fetch data: ${error.message}` 
          : 'Unknown error fetching data'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a saved endpoint
  const handleSelectSavedEndpoint = (savedEndpoint: string) => {
    setEndpoint(savedEndpoint);
    setTestResult(null);
  };

  return (
    <div className="border rounded-md shadow-sm p-4">
      <h2 className="text-lg font-medium mb-4">API Endpoint</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="endpoint" className="block text-sm font-medium text-gray-700 mb-1">
            Enter API URL
          </label>
          <div className="flex">
            <input
              id="endpoint"
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/data"
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <button
              onClick={testEndpoint}
              disabled={!endpoint || testing}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-r-md hover:bg-gray-200 transition"
            >
              {testing ? 'Testing...' : 'Test'}
            </button>
          </div>
        </div>
        
        {testResult && (
          <div className={`p-3 rounded-md ${
            testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {testResult.success 
              ? '✓ Connection successful' 
              : `✗ Connection failed: ${testResult.message}`}
          </div>
        )}
        
        {savedEndpoints.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Endpoints</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {savedEndpoints.map((saved, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSavedEndpoint(saved)}
                  className={`block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 truncate ${
                    endpoint === saved ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  {saved}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <button
            onClick={fetchData}
            disabled={!endpoint || loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading || !endpoint
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Loading Data...' : 'Fetch API Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiEndpointSelector;