'use client'
import React, { useState, useEffect } from 'react';
import { ApiService } from './api-service';
import { PathExplorer } from './path-explorer';
import {
  MappingSourceType,
  Mapping,
  LabelMapping,
  FieldMapping,
  MappingConfiguration
} from './hybrid-mapping-system';

interface MappingEditorProps {
  initialConfig?: MappingConfiguration;
  apiEndpoint?: string;
  onSave: (config: MappingConfiguration) => void;
}

export const MappingEditor: React.FC<MappingEditorProps> = ({
  initialConfig,
  apiEndpoint,
  onSave
}) => {
  // State
  const [config, setConfig] = useState<MappingConfiguration>(
    initialConfig || { mappings: [] }
  );
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(null);
  const [showPathExplorer, setShowPathExplorer] = useState<boolean>(false);
  const [explorerMode, setExplorerMode] = useState<'value' | 'label'>('value');
  const [endpointInput, setEndpointInput] = useState<string>(apiEndpoint || '');

  // Load API data when endpoint changes
  useEffect(() => {
    if (apiEndpoint) {
      fetchApiData(apiEndpoint);
    }
  }, [apiEndpoint]);

  // Load API response from config if available
  useEffect(() => {
    if (initialConfig?.apiResponse) {
      setApiResponse(initialConfig.apiResponse);
    }
  }, [initialConfig]);

  // Fetch API data
  const fetchApiData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ApiService.fetchData(endpoint);
      setApiResponse(data);
      
      // Update configuration with the new endpoint and response
      setConfig(prev => ({
        ...prev,
        apiEndpoint: endpoint,
        apiResponse: data
      }));
      
      setLoading(false);
    } catch (err) {
      setError(`Failed to fetch API data: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  // Handle endpoint input change
  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndpointInput(e.target.value);
  };

  // Handle endpoint form submission
  const handleEndpointSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endpointInput) {
      fetchApiData(endpointInput);
    }
  };

  // Add a new mapping
  const addMapping = () => {
    const newId = `mapping-${config.mappings.length + 1}`;
    
    const newMapping: FieldMapping = {
      id: newId,
      valueMapping: {
        id: `${newId}-value`,
        sourceType: MappingSourceType.MANUAL,
        manualValue: ''
      },
      labelMapping: {
        id: `${newId}-label`,
        sourceType: MappingSourceType.MANUAL,
        manualValue: `Field ${config.mappings.length + 1}`
      }
    };
    
    setConfig(prev => ({
      ...prev,
      mappings: [...prev.mappings, newMapping]
    }));
    
    setSelectedMappingId(newId);
  };

  // Remove a mapping
  const removeMapping = (id: string) => {
    setConfig(prev => ({
      ...prev,
      mappings: prev.mappings.filter(m => m.id !== id)
    }));
    
    if (selectedMappingId === id) {
      setSelectedMappingId(null);
    }
  };

  // Update a value mapping
  const updateValueMapping = (mappingId: string, updates: Partial<Mapping>) => {
    setConfig(prev => ({
      ...prev,
      mappings: prev.mappings.map(mapping => {
        if (mapping.id === mappingId) {
          return {
            ...mapping,
            valueMapping: {
              ...mapping.valueMapping,
              ...updates
            }
          };
        }
        return mapping;
      })
    }));
  };

  // Update a label mapping
  const updateLabelMapping = (mappingId: string, updates: Partial<LabelMapping>) => {
    setConfig(prev => ({
      ...prev,
      mappings: prev.mappings.map(mapping => {
        if (mapping.id === mappingId) {
          return {
            ...mapping,
            labelMapping: {
              ...mapping.labelMapping,
              ...updates
            }
          };
        }
        return mapping;
      })
    }));
  };

  // Handle selection from the path explorer
  const handlePathSelection = (path: string, value: any) => {
    if (!selectedMappingId) return;
    
    if (explorerMode === 'value') {
      updateValueMapping(selectedMappingId, {
        sourceType: MappingSourceType.API,
        path,
        manualValue: undefined
      });
    } else {
      updateLabelMapping(selectedMappingId, {
        sourceType: MappingSourceType.API,
        path,
        manualValue: undefined
      });
    }
    
    setShowPathExplorer(false);
  };

  // Find the currently selected mapping
  const selectedMapping = selectedMappingId 
    ? config.mappings.find(m => m.id === selectedMappingId) 
    : null;

  // Save the configuration
  const handleSave = () => {
    onSave(config);
  };

  // Get a preview value from a mapping
  const getPreviewValue = (mapping: Mapping | LabelMapping) => {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
      return mapping.manualValue;
    } else if (mapping.path && apiResponse) {
      return ApiService.getValueAtPath(apiResponse, mapping.path);
    }
    return undefined;
  };

  return (
    <div className="mapping-editor">
      <div className="endpoint-section">
        <form onSubmit={handleEndpointSubmit}>
          <div className="form-group">
            <label htmlFor="api-endpoint">API Endpoint:</label>
            <div className="input-group">
              <input
                id="api-endpoint"
                type="text"
                value={endpointInput}
                onChange={handleEndpointChange}
                placeholder="https://api.example.com/data"
                className="form-control"
              />
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Fetch Data'}
              </button>
            </div>
          </div>
        </form>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {apiResponse && (
          <div className="api-response-info">
            <div className="alert alert-success">
              API data loaded successfully
            </div>
          </div>
        )}
      </div>

      <div className="mappings-section">
        <div className="mappings-header">
          <h3>Mappings</h3>
          <button 
            className="btn btn-sm btn-primary" 
            onClick={addMapping}
          >
            Add Mapping
          </button>
        </div>
        
        <div className="mappings-container">
          <div className="mappings-list">
            {config.mappings.map(mapping => (
              <div 
                key={mapping.id}
                className={`mapping-item ${selectedMappingId === mapping.id ? 'selected' : ''}`}
                onClick={() => setSelectedMappingId(mapping.id)}
              >
                <div className="mapping-item-label">
                  {getPreviewValue(mapping.labelMapping) || 'Unnamed Field'}
                </div>
                <div className="mapping-item-value">
                  {mapping.valueMapping.sourceType === MappingSourceType.API 
                    ? `API: ${mapping.valueMapping.path}` 
                    : 'Manual Entry'}
                </div>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMapping(mapping.id);
                  }}
                >
                  &times;
                </button>
              </div>
            ))}
            
            {config.mappings.length === 0 && (
              <div className="empty-state">
                No mappings defined. Click "Add Mapping" to create one.
              </div>
            )}
          </div>
          
          {selectedMapping && (
            <div className="mapping-detail">
              <h4>Edit Mapping</h4>
              
              <div className="mapping-section">
                <h5>Value Mapping</h5>
                <div className="form-group">
                  <label>Source:</label>
                  <div className="source-toggle">
                    <label>
                      <input
                        type="radio"
                        name="value-source"
                        checked={selectedMapping.valueMapping.sourceType === MappingSourceType.API}
                        onChange={() => {
                          updateValueMapping(selectedMapping.id, {
                            sourceType: MappingSourceType.API,
                            manualValue: undefined
                          });
                        }}
                      />
                      API
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="value-source"
                        checked={selectedMapping.valueMapping.sourceType === MappingSourceType.MANUAL}
                        onChange={() => {
                          updateValueMapping(selectedMapping.id, {
                            sourceType: MappingSourceType.MANUAL,
                            path: undefined
                          });
                        }}
                      />
                      Manual
                    </label>
                  </div>
                </div>
                
                {selectedMapping.valueMapping.sourceType === MappingSourceType.API ? (
                  <div className="form-group">
                    <label>API Path:</label>
                    <div className="path-selector">
                      <input
                        type="text"
                        value={selectedMapping.valueMapping.path || ''}
                        readOnly
                        placeholder="Select from API response"
                      />
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setExplorerMode('value');
                          setShowPathExplorer(true);
                        }}
                      >
                        Select Path
                      </button>
                    </div>
                    <div className="preview">
                      Preview: {JSON.stringify(getPreviewValue(selectedMapping.valueMapping))}
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Manual Value:</label>
                    <input
                      type="text"
                      value={selectedMapping.valueMapping.manualValue || ''}
                      onChange={(e) => {
                        updateValueMapping(selectedMapping.id, {
                          manualValue: e.target.value
                        });
                      }}
                      placeholder="Enter value manually"
                    />
                  </div>
                )}
              </div>
              
              <div className="mapping-section">
                <h5>Label Mapping</h5>
                <div className="form-group">
                  <label>Source:</label>
                  <div className="source-toggle">
                    <label>
                      <input
                        type="radio"
                        name="label-source"
                        checked={selectedMapping.labelMapping.sourceType === MappingSourceType.API}
                        onChange={() => {
                          updateLabelMapping(selectedMapping.id, {
                            sourceType: MappingSourceType.API,
                            manualValue: undefined
                          });
                        }}
                      />
                      API
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="label-source"
                        checked={selectedMapping.labelMapping.sourceType === MappingSourceType.MANUAL}
                        onChange={() => {
                          updateLabelMapping(selectedMapping.id, {
                            sourceType: MappingSourceType.MANUAL,
                            path: undefined
                          });
                        }}
                      />
                      Manual
                    </label>
                  </div>
                </div>
                
                {selectedMapping.labelMapping.sourceType === MappingSourceType.API ? (
                  <div className="form-group">
                    <label>API Path:</label>
                    <div className="path-selector">
                      <input
                        type="text"
                        value={selectedMapping.labelMapping.path || ''}
                        readOnly
                        placeholder="Select from API response"
                      />
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setExplorerMode('label');
                          setShowPathExplorer(true);
                        }}
                      >
                        Select Path
                      </button>
                    </div>
                    <div className="preview">
                      Preview: {getPreviewValue(selectedMapping.labelMapping)}
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Manual Label:</label>
                    <input
                      type="text"
                      value={selectedMapping.labelMapping.manualValue || ''}
                      onChange={(e) => {
                        updateLabelMapping(selectedMapping.id, {
                          manualValue: e.target.value
                        });
                      }}
                      placeholder="Enter label manually"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={config.mappings.length === 0}
        >
          Save Mapping Configuration
        </button>
      </div>

      {showPathExplorer && apiResponse && (
        <div className="path-explorer-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>
                Select {explorerMode === 'value' ? 'Value' : 'Label'} Path from API Response
              </h4>
              <button 
                className="close-button"
                onClick={() => setShowPathExplorer(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <PathExplorer 
                data={apiResponse} 
                onSelectPath={handlePathSelection} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};