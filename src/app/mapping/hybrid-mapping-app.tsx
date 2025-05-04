'use client'
import React, { useState, useEffect } from 'react';
import { MappingEditor } from './mapping-editor';
import { MappingRenderer } from './mapping-renderer';
import { MappingConfiguration } from './hybrid-mapping-system';

// Sample API data for testing/demo
const SAMPLE_DATA = {
  FormStructure: {
    ZSCMCMD: {
      OCTG: {
        VALUE001: 0,
        VALUE002: 51.4,
        VALUE003: 13.5,
        VALUE004: 0
      },
      "Mud &amp; Chemical": {
        VALUE001: 0,
        VALUE002: 277,
        VALUE003: 38.8,
        VALUE004: 1.8
      },
      Downhole: {
        VALUE001: 0,
        VALUE002: 352.1,
        VALUE003: 123.5,
        VALUE004: 0
      },
      "Line Poles and Hware": {
        VALUE001: 0,
        VALUE002: 0,
        VALUE003: 0,
        VALUE004: 0
      },
      "Overall Result": {
        VALUE001: 0,
        VALUE002: 680.5,
        VALUE003: 175.8,
        VALUE004: 1.8
      }
    }
  },
  FormMetadata: {
    ZSCMCMD: {
      type: "CHA",
      label: "OSS INV - Commodity",
      fieldName: "ZSCMCMD",
      axisType: "ROW",
      displayStyle: "5"
    },
    VALUE001: {
      type: "KF",
      label: "OSS INV - Value",
      fieldName: "VALUE001",
      axisType: "COLUMN",
      displayStyle: "1"
    },
    VALUE002: {
      type: "KF",
      label: "OSS INV - &lt;6 Months",
      fieldName: "VALUE002",
      axisType: "COLUMN",
      displayStyle: "1"
    },
    VALUE003: {
      type: "KF",
      label: "OSS INV - 6-12 Months",
      fieldName: "VALUE003",
      axisType: "COLUMN",
      displayStyle: "1"
    },
    VALUE004: {
      type: "KF",
      label: "OSS INV - &gt;12 Months",
      fieldName: "VALUE004",
      axisType: "COLUMN",
      displayStyle: "1"
    }
  }
};

// Sample config for demo with some predefined mappings
const createSampleConfig = (): MappingConfiguration => ({
  mappings: [],
  apiResponse: SAMPLE_DATA
});

interface HybridMappingAppProps {
  initialConfig?: MappingConfiguration;
  saveToLocalStorage?: boolean;
}

const HybridMappingApp: React.FC<HybridMappingAppProps> = ({
  initialConfig,
  saveToLocalStorage = true
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [config, setConfig] = useState<MappingConfiguration>(
    initialConfig || createSampleConfig()
  );
  const [renderLayout, setRenderLayout] = useState<'table' | 'form' | 'cards'>('table');

  // Load config from localStorage if available
  useEffect(() => {
    if (saveToLocalStorage) {
      const savedConfig = localStorage.getItem('hybridMappingConfig');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (err) {
          console.error('Failed to parse saved config:', err);
        }
      }
    }
  }, [saveToLocalStorage]);

  // Save config to localStorage when updated
  useEffect(() => {
    if (saveToLocalStorage && config) {
      localStorage.setItem('hybridMappingConfig', JSON.stringify(config));
    }
  }, [config, saveToLocalStorage]);

  // Handle config updates from the editor
  const handleConfigSave = (newConfig: MappingConfiguration) => {
    setConfig(newConfig);
    setActiveTab('preview');
  };

  // Reset to default config
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the configuration?')) {
      setConfig(createSampleConfig());
    }
  };

  // Export config as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', 'mapping-config.json');
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Import config from JSON file
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setConfig(imported);
      } catch (err) {
        alert(`Failed to import configuration: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="hybrid-mapping-app">
      <header className="app-header">
        <h1>Hybrid Mapping System</h1>
        <div className="app-controls">
          <button 
            className="btn btn-secondary" 
            onClick={handleReset}
          >
            Reset
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleExport}
          >
            Export
          </button>
          <label className="btn btn-secondary">
            Import
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={handleImport} 
            />
          </label>
        </div>
      </header>

      <div className="app-tabs">
        <button 
          className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Mapping Editor
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <main className="app-content">
        {activeTab === 'editor' ? (
          <MappingEditor
            initialConfig={config}
            onSave={handleConfigSave}
          />
        ) : (
          <div className="preview-container">
            <div className="preview-controls">
              <div className="layout-selector">
                <label>Layout:</label>
                <select
                  value={renderLayout}
                  onChange={(e) => setRenderLayout(e.target.value as any)}
                >
                  <option value="table">Table</option>
                  <option value="form">Form</option>
                  <option value="cards">Cards</option>
                </select>
              </div>
            </div>
            <MappingRenderer
              config={config}
              layout={renderLayout}
              refreshInterval={30000} // Auto-refresh every 30 seconds
            />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Hybrid Mapping System - Dynamic mapping from any API response</p>
      </footer>
    </div>
  );
};

export default HybridMappingApp;