'use client'
import React, { useState, useEffect } from 'react';
import { ApiService } from './api-service';
import { ObjectPath } from './hybrid-mapping-system';

interface PathNode {
  key: string;
  label: string;
  path: string;
  children?: PathNode[];
  isLeaf?: boolean;
  value?: any;
}

interface PathExplorerProps {
  data: any;
  onSelectPath: (path: string, value: any) => void;
}

export const PathExplorer: React.FC<PathExplorerProps> = ({ data, onSelectPath }) => {
  const [treeData, setTreeData] = useState<PathNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [filteredPaths, setFilteredPaths] = useState<{path: string; preview: string}[]>([]);

  // Build tree data on component mount or when data changes
  useEffect(() => {
    if (data) {
      const rootNodes = buildTreeData(data);
      setTreeData(rootNodes);
      
      // Initialize with all root nodes expanded
      setExpandedKeys(rootNodes.map(node => node.key));
      
      // Get flat list of paths for search
      const paths = ApiService.getPathsPreview(data);
      setFilteredPaths(paths);
    }
  }, [data]);

  // Convert the nested object into tree structure
  const buildTreeData = (obj: any, parentPath: string = ''): PathNode[] => {
    if (!obj || typeof obj !== 'object') {
      return [];
    }
    
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
      const isArray = Array.isArray(value);
      
      let children: PathNode[] = [];
      let isLeaf = !isObject && !isArray;
      
      if (isObject) {
        children = buildTreeData(value, currentPath);
      } else if (isArray) {
        children = value.map((item: any, index: number) => {
          const arrayPath = `${currentPath}.${index}`;
          if (typeof item === 'object' && item !== null) {
            return {
              key: arrayPath,
              label: `[${index}]`,
              path: arrayPath,
              children: buildTreeData(item, arrayPath),
              isLeaf: false
            };
          } else {
            return {
              key: arrayPath,
              label: `[${index}]: ${String(item)}`,
              path: arrayPath,
              isLeaf: true,
              value: item
            };
          }
        });
      }
      
      return {
        key: currentPath,
        label: key,
        path: currentPath,
        children: children.length > 0 ? children : undefined,
        isLeaf,
        value: isLeaf ? value : undefined
      };
    });
  };

  // Handle path selection
  const handleSelect = (path: string) => {
    const value = ApiService.getValueAtPath(data, path);
    onSelectPath(path, value);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchValue(value);
    
    if (!value) {
      setFilteredPaths(ApiService.getPathsPreview(data));
      return;
    }
    
    const filtered = ApiService.getPathsPreview(data).filter(
      item => item.path.toLowerCase().includes(value) || 
              String(item.preview).toLowerCase().includes(value)
    );
    
    setFilteredPaths(filtered);
  };

  // Render tree view (recursive)
  const renderTreeNode = (node: PathNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.includes(node.key);
    
    return (
      <div key={node.key} className="tree-node">
        <div className="tree-node-header">
          {hasChildren && (
            <button 
              className="expand-button"
              onClick={() => {
                if (isExpanded) {
                  setExpandedKeys(expandedKeys.filter(k => k !== node.key));
                } else {
                  setExpandedKeys([...expandedKeys, node.key]);
                }
              }}
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}
          
          <div 
            className={`tree-node-label ${node.isLeaf ? 'leaf-node' : ''}`}
            onClick={() => handleSelect(node.path)}
          >
            {node.label}
            {node.isLeaf && node.value !== undefined && (
              <span className="node-value">: {String(node.value)}</span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="path-explorer">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search paths..."
          value={searchValue}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      
      {searchValue ? (
        <div className="search-results">
          <h4>Search Results</h4>
          <div className="path-list">
            {filteredPaths.map(item => (
              <div 
                key={item.path} 
                className="path-item"
                onClick={() => handleSelect(item.path)}
              >
                <div className="path">{item.path}</div>
                <div className="preview">{item.preview}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tree-view">
          {treeData.map(node => renderTreeNode(node))}
        </div>
      )}
    </div>
  );
};