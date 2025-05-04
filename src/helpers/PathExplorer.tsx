import React, { useState, useEffect, useMemo } from 'react';
import { getPathsPreview, buildPathTree } from './utils';
import apiService from './ApiService';

interface PathExplorerProps {
  data: any;
  onSelectPath: (path: string, value: any) => void;
  initialPath?: string;
  className?: string;
}

interface TreeNode {
  key: string;
  path: string;
  label: string;
  isLeaf?: boolean;
  preview?: string;
  children?: TreeNode[];
}

const PathExplorer: React.FC<PathExplorerProps> = ({
  data,
  onSelectPath,
  initialPath,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [selectedPath, setSelectedPath] = useState<string | null>(initialPath || null);
  const [previewValue, setPreviewValue] = useState<any>(null);

  // Generate paths and tree structure from data
  const { pathsList, treeData } = useMemo(() => {
    if (!data) return { pathsList: [], treeData: [] };
    
    const paths = getPathsPreview(data);
    return {
      pathsList: paths,
      treeData: buildPathTree(paths)
    };
  }, [data]);

  // Filtered paths based on search term
  const filteredPaths = useMemo(() => {
    if (!searchTerm.trim()) return pathsList;
    
    const term = searchTerm.toLowerCase();
    return pathsList.filter(({ path, preview }) => 
      path.toLowerCase().includes(term) || 
      preview.toLowerCase().includes(term)
    );
  }, [pathsList, searchTerm]);

  // Initialize expanded keys for the first levels
  useEffect(() => {
    if (treeData.length > 0) {
      const initialExpanded = new Set<string>();
      
      // Expand root nodes by default
      treeData.forEach(node => {
        initialExpanded.add(node.path);
      });
      
      // If initial path is provided, expand all parent paths
      if (initialPath) {
        const parts = initialPath.split('.');
        let currentPath = '';
        
        parts.forEach(part => {
          currentPath = currentPath ? `${currentPath}.${part}` : part;
          initialExpanded.add(currentPath);
        });
      }
      
      setExpandedKeys(initialExpanded);
    }
  }, [treeData, initialPath]);

  // Update preview value when selectedPath changes
  useEffect(() => {
    if (selectedPath && data) {
      const value = apiService.getValueAtPath(data, selectedPath);
      setPreviewValue(value);
    } else {
      setPreviewValue(null);
    }
  }, [selectedPath, data]);

  // Handle path selection
  const handleSelectPath = (path: string) => {
    setSelectedPath(path);
    const value = apiService.getValueAtPath(data, path);
    onSelectPath(path, value);
  };

  // Toggle a tree node's expanded state
  const toggleExpand = (path: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // Render a tree node and its children recursively
  const renderTreeNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedKeys.has(node.path);
    const isSelected = selectedPath === node.path;
    
    return (
      <div key={node.path} className="px-1">
        <div 
          className={`flex items-center py-1 hover:bg-blue-50 rounded cursor-pointer ${
            isSelected ? 'bg-blue-100' : ''
          }`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.path);
              }}
              className="w-5 h-5 flex items-center justify-center text-gray-500"
            >
              {isExpanded ? '▼' : '►'}
            </button>
          )}
          
          <div 
            className={`flex-1 truncate ml-1 ${!hasChildren ? 'ml-6' : ''}`}
            onClick={() => handleSelectPath(node.path)}
          >
            <span className="font-medium">{node.label}</span>
            {node.isLeaf && node.preview && (
              <span className="ml-2 text-gray-500 text-sm">{node.preview}</span>
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="pl-5 border-l border-gray-200 ml-2">
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  // Format preview value for display
  const formatPreviewValue = (value: any): React.ReactNode => {
    if (value === undefined) {
      return <span className="text-gray-400">undefined</span>;
    }
    
    if (value === null) {
      return <span className="text-gray-400">null</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-blue-600">{value}</span>;
    }
    
    if (typeof value === 'boolean') {
      return <span className="text-purple-600">{value.toString()}</span>;
    }
    
    if (Array.isArray(value)) {
      return <span className="text-gray-600">Array[{value.length}]</span>;
    }
    
    if (typeof value === 'object') {
      return <span className="text-gray-600">Object</span>;
    }
    
    return String(value);
  };

  return (
    <div className={`flex flex-col h-full border border-gray-200 rounded-md ${className}`}>
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search paths..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r p-2">
          {searchTerm ? (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">
                Search Results
              </div>
              {filteredPaths.length > 0 ? (
                <div>
                  {filteredPaths.map(({ path, preview }) => (
                    <div
                      key={path}
                      className={`py-1 px-2 hover:bg-blue-50 cursor-pointer rounded ${
                        selectedPath === path ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleSelectPath(path)}
                    >
                      <div className="font-medium truncate">{path}</div>
                      <div className="text-sm text-gray-500 truncate">{preview}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">No matching paths found</div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium text-gray-500 mb-2">
                API Response Structure
              </div>
              {treeData.map(node => renderTreeNode(node))}
            </div>
          )}
        </div>
        
        <div className="w-1/2 p-3 overflow-y-auto bg-gray-50">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Preview
          </div>
          
          {selectedPath ? (
            <div>
              <div className="mb-2">
                <span className="font-medium">Path:</span> 
                <span className="ml-2 font-mono text-sm">{selectedPath}</span>
              </div>
              
              <div className="mb-2">
                <span className="font-medium">Type:</span>
                <span className="ml-2 text-gray-700">
                  {previewValue === null ? 'null' : 
                   Array.isArray(previewValue) ? 'array' : 
                   typeof previewValue}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Value:</span>
                <div className="mt-1 p-2 bg-white border border-gray-200 rounded-md font-mono text-sm">
                  {typeof previewValue === 'object' && previewValue !== null ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(previewValue, null, 2)}
                    </pre>
                  ) : (
                    formatPreviewValue(previewValue)
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Select a path to view preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PathExplorer;