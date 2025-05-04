'use client'
import React, { useState, useEffect } from 'react';
import { ApiService } from './api-service';

interface JsonPathHelperProps {
  data: any;
  onPathSelect?: (path: string, value: any) => void;
}

export const JsonPathHelper: React.FC<JsonPathHelperProps> = ({
  data,
  onPathSelect
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paths, setPaths] = useState<{ path: string; preview: string }[]>([]);
  const [filteredPaths, setFilteredPaths] = useState<{ path: string; preview: string }[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [previewValue, setPreviewValue] = useState<any>(null);

  // Extract paths from data when it changes
  useEffect(() => {
    if (data) {
      const extractedPaths = ApiService.getPathsPreview(data);
      setPaths(extractedPaths);
      setFilteredPaths(extractedPaths);
    }
  }, [data]);

  // Filter paths when search term changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPaths(paths);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = paths.filter(
      item => item.path.toLowerCase().includes(term) || 
              item.preview.toLowerCase().includes(term)
    );
    
    setFilteredPaths(filtered);
  }, [searchTerm, paths]);

  // Handle path selection
  const handlePathSelect = (path: string) => {
    setSelectedPath(path);
    const value = ApiService.getValueAtPath(data, path);
    setPreviewValue(value);
    
    if (onPathSelect) {
      onPathSelect(path, value);
    }
  };

  // Format display value based on type
  const formatValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="null-value">null</span>;
    }
    
    if (typeof value === 'object') {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
    
    if (typeof value === 'string') {
      return <span className="string-value">"{value}"</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="number-value">{value}</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="boolean-value">{value ? 'true' : 'false'}</span>;
    }
    
    return String(value);
  };

  return (
    <div className="json-path-helper">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search paths..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="paths-container">
        <div className="paths-list">
          {filteredPaths.map((item, index) => (
            <div
              key={index}
              className={`path-item ${selectedPath === item.path ? 'selected' : ''}`}
              onClick={() => handlePathSelect(item.path)}
            >
              <div className="path">{item.path}</div>
              <div className="preview">{item.preview}</div>
            </div>
          ))}
          
          {filteredPaths.length === 0 && (
            <div className="no-results">
              No paths found matching "{searchTerm}"
            </div>
          )}
        </div>
        
        <div className="value-preview">
          <h4>Value Preview</h4>
          {selectedPath ? (
            <div className="preview-content">
              <div className="selected-path">Path: {selectedPath}</div>
              <div className="value-display">
                Value: {formatValue(previewValue)}
              </div>
            </div>
          ) : (
            <div className="no-selection">
              Select a path to view its value
            </div>
          )}
        </div>
      </div>
    </div>
  );
};