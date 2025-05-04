import React, { useState } from 'react';
import { 
  MappingSourceType, 
  Mapping, 
  LabelMapping, 
  FieldMapping,
} from './types';
import { generateId } from './utils';
import apiService from './ApiService';
import PathExplorer from './PathExplorer';

interface MappingEditorProps {
  widgetType: string;
  mappings: FieldMapping[];
  apiResponse: any;
  onSave: (mappings: FieldMapping[]) => void;
  onCancel: () => void;
  availableFields?: string[];
}

const MappingEditor: React.FC<MappingEditorProps> = ({
  widgetType,
  mappings: initialMappings,
  apiResponse,
  onSave,
  onCancel,
  availableFields = []
}) => {
  const [mappings, setMappings] = useState<FieldMapping[]>(initialMappings);
  const [selectedMappingId, setSelectedMappingId] = useState<string | null>(
    initialMappings.length > 0 ? initialMappings[0].id : null
  );
  const [showPathExplorer, setShowPathExplorer] = useState<boolean>(false);
  const [explorerMode, setExplorerMode] = useState<'value' | 'label'>('value');

  // Find the selected mapping
  const selectedMapping = selectedMappingId 
    ? mappings.find(m => m.id === selectedMappingId) 
    : null;

  // Add a new mapping
  const addMapping = () => {
    const newId = generateId();
    
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
        manualValue: availableFields.length > 0 
          ? availableFields[0] 
          : `Field ${mappings.length + 1}`
      }
    };
    
    setMappings(prev => [...prev, newMapping]);
    setSelectedMappingId(newId);
  };

  // Remove a mapping
  const removeMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
    
    if (selectedMappingId === id) {
      const remaining = mappings.filter(m => m.id !== id);
      setSelectedMappingId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Update a value mapping
  const updateValueMapping = (mappingId: string, updates: Partial<Mapping>) => {
    setMappings(prev => 
      prev.map(mapping => 
        mapping.id === mappingId 
          ? {
              ...mapping,
              valueMapping: {
                ...mapping.valueMapping,
                ...updates
              }
            }
          : mapping
      )
    );
  };

  // Update a label mapping
  const updateLabelMapping = (mappingId: string, updates: Partial<LabelMapping>) => {
    setMappings(prev =>
      prev.map(mapping =>
        mapping.id === mappingId
          ? {
              ...mapping,
              labelMapping: {
                ...mapping.labelMapping,
                ...updates
              }
            }
          : mapping
      )
    );
  };

  // Handle selection from path explorer
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

  // Get a preview value from a mapping
  const getPreviewValue = (mapping: Mapping | LabelMapping) => {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
      return mapping.manualValue;
    } else if (mapping.path && apiResponse) {
      return apiService.getValueAtPath(apiResponse, mapping.path);
    }
    return undefined;
  };

  // Handle save
  const handleSave = () => {
    onSave(mappings);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Field Mappings for {widgetType}
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={addMapping}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Add Mapping
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {/* Left panel: Mapping list */}
        <div className="col-span-1 border rounded-md">
          <div className="p-2 bg-gray-50 border-b font-medium">
            Available Mappings
          </div>
          
          <div className="p-2 max-h-80 overflow-y-auto">
            {mappings.length > 0 ? (
              <ul className="divide-y">
                {mappings.map(mapping => (
                  <li 
                    key={mapping.id}
                    className={`py-2 px-2 cursor-pointer hover:bg-gray-50 transition ${
                      selectedMappingId === mapping.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedMappingId(mapping.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {getPreviewValue(mapping.labelMapping) || 'Unnamed Field'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {mapping.valueMapping.sourceType === MappingSourceType.API 
                            ? `API: ${mapping.valueMapping.path}` 
                            : 'Manual Value'}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMapping(mapping.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                                   No mappings defined.Click Add Mapping to create one.
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel: Mapping editor */}
        <div className="col-span-2 border rounded-md">
          {selectedMapping ? (
            <div className="p-4">
              <h3 className="text-lg font-medium mb-4">Edit Mapping</h3>
              
              {/* Value Mapping Section */}
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h4 className="text-md font-medium mb-2">Value Mapping</h4>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
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
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">API Path</span>
                    </label>
                    
                    <label className="inline-flex items-center">
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
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Manual Value</span>
                    </label>
                  </div>
                </div>
                
                {selectedMapping.valueMapping.sourceType === MappingSourceType.API ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Path
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={selectedMapping.valueMapping.path || ''}
                        readOnly
                        placeholder="Select from API response"
                        className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          setExplorerMode('value');
                          setShowPathExplorer(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                      >
                        Select Path
                      </button>
                    </div>
                    {selectedMapping.valueMapping.path && (
                      <div className="mt-2 text-sm text-gray-600">
                        Preview: {JSON.stringify(getPreviewValue(selectedMapping.valueMapping))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manual Value
                    </label>
                    <input
                      type="text"
                      value={selectedMapping.valueMapping.manualValue || ''}
                      onChange={(e) => {
                        updateValueMapping(selectedMapping.id, {
                          manualValue: e.target.value
                        });
                      }}
                      placeholder="Enter value manually"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              
              {/* Label Mapping Section */}
              <div className="mb-6 p-4 border rounded-md bg-gray-50">
                <h4 className="text-md font-medium mb-2">Label Mapping</h4>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
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
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">API Path</span>
                    </label>
                    
                    <label className="inline-flex items-center">
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
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2">Manual Value</span>
                    </label>
                  </div>
                </div>
                
                {selectedMapping.labelMapping.sourceType === MappingSourceType.API ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Path
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={selectedMapping.labelMapping.path || ''}
                        readOnly
                        placeholder="Select from API response"
                        className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          setExplorerMode('label');
                          setShowPathExplorer(true);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                      >
                        Select Path
                      </button>
                    </div>
                    {selectedMapping.labelMapping.path && (
                      <div className="mt-2 text-sm text-gray-600">
                        Preview: {getPreviewValue(selectedMapping.labelMapping)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manual Label
                    </label>
                    {availableFields.length > 0 ? (
                      <select
                        value={selectedMapping.labelMapping.manualValue || ''}
                        onChange={(e) => {
                          updateLabelMapping(selectedMapping.id, {
                            manualValue: e.target.value
                          });
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        {availableFields.map(field => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={selectedMapping.labelMapping.manualValue || ''}
                        onChange={(e) => {
                          updateLabelMapping(selectedMapping.id, {
                            manualValue: e.target.value
                          });
                        }}
                        placeholder="Enter label manually"
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Select a mapping to edit or add a new one
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          disabled={mappings.length === 0}
        >
          Save Mappings
        </button>
      </div>
      
      {/* Path Explorer Modal */}
      {showPathExplorer && apiResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Select {explorerMode === 'value' ? 'Value' : 'Label'} Path
              </h2>
              
              <button
                onClick={() => setShowPathExplorer(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <PathExplorer
                data={apiResponse}
                onSelectPath={handlePathSelection}
                initialPath={
                  explorerMode === 'value'
                    ? selectedMapping?.valueMapping.path
                    : selectedMapping?.labelMapping.path
                }
                className="h-full"
              />
            </div>
            
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setShowPathExplorer(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingEditor;