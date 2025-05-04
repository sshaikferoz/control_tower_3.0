import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {
  generateId
} from './utils';
import {  WidgetType,
  Widget,
  WidgetLayout,
  FieldMapping,
  MappingConfiguration,
  widgetSizes} from './types'
import { isEqual } from './utils';
import ApiEndpointSelector from './ApiEndpointSelector';
import MappingEditor from './MappingEditor';
import WidgetConfigEditor, { WidgetConfig } from './WidgetConfigEditor';
import MappingRenderer from './MappingRenderer';

// Import widget components
import OrdersLineChart from '../grid-components/OrdersLineChart';
import DualLineChart from '../grid-components/DualLineChart';
import BarMetric from '../grid-components/BarMetric';
import TableMetric from '../grid-components/TableMetric';
import PieChartWithTotal from '../grid-components/PieChartWithTotal';
import QuadrantMetrics from '../grid-components/QuadrantMetrics';
import LoansAppTray from '../grid-components/LoansAppTray';
import SimpleMetric from '../grid-components/SimpleMetric';
import SimpleMetricDate from '../grid-components/SimpleMetricDate';
import MultiMetrics from '../grid-components/MultiMetrics';
import PieMetric from '../grid-components/PieMetric';
import SingleLineChart from '../grid-components/SingleLineChart';
import StackedBarChart from '../grid-components/StackedBarChart';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget component mapping
const widgetMapping: Record<WidgetType, React.ComponentType<any>> = {
  "one-metric": SimpleMetric,
  "one-metric-date": SimpleMetricDate,
  "two-metrics": MultiMetrics,
  "two-metrics-linechart": SingleLineChart,
  "two-metrics-piechart": PieMetric,
  "one-metric-table": TableMetric,
  "bar-chart": BarMetric,
  "stacked-bar-chart": StackedBarChart,
  "orders-line-chart": OrdersLineChart,
  "dual-line-chart": DualLineChart,
  "pie-chart-total": PieChartWithTotal,
  "quadrant-metrics": QuadrantMetrics,
  "loans-app-tray": LoansAppTray
};

// Available widget types for selection
const availableWidgets: Array<{ type: WidgetType; name: string; description: string }> = [
  { type: "one-metric", name: "Single Metric", description: "Display a single value with title" },
  { type: "one-metric-date", name: "Metric with Date", description: "Display a value with date and title" },
  { type: "two-metrics", name: "Two Metrics", description: "Display two related metrics side by side" },
  { type: "two-metrics-linechart", name: "Line Chart", description: "Time series data as a line chart" },
  { type: "two-metrics-piechart", name: "Pie Chart", description: "Data proportions as a pie chart" },
  { type: "one-metric-table", name: "Table", description: "Tabular data with multiple columns" },
  { type: "bar-chart", name: "Bar Chart", description: "Comparison data as a bar chart" },
  { type: "stacked-bar-chart", name: "Stacked Bar Chart", description: "Multi-series bar chart with stacking" },
  { type: "orders-line-chart", name: "Orders Line Chart", description: "Order values over time" },
  { type: "dual-line-chart", name: "Dual Line Chart", description: "Compare two series over time" },
  { type: "pie-chart-total", name: "Pie Chart with Total", description: "Pie chart with centralized total value" },
  { type: "quadrant-metrics", name: "Quadrant Metrics", description: "Four metrics in quadrant layout" },
  { type: "loans-app-tray", name: "App Tray", description: "Application tray with metrics and chart" }
];

interface DashboardBuilderProps {
  initialConfig?: MappingConfiguration;
  onSave?: (config: MappingConfiguration) => void;
  dashboardName?: string;
}

const DashboardBuilder: React.FC<DashboardBuilderProps> = ({
  initialConfig,
  onSave,
  dashboardName = "New Dashboard"
}) => {
  // Dashboard state
  const [widgets, setWidgets] = useState<Widget[]>(initialConfig?.widgets || []);
  const [layouts, setLayouts] = useState<WidgetLayout[]>(initialConfig?.layouts || []);
  const [apiEndpoint, setApiEndpoint] = useState<string>(initialConfig?.apiEndpoint || '');
  const [apiResponse, setApiResponse] = useState<any>(initialConfig?.apiResponse || null);
  
  // UI state
  const [editMode, setEditMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'api' | 'preview'>('dashboard');
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [showWidgetSelector, setShowWidgetSelector] = useState<boolean>(false);
  const [showMappingEditor, setShowMappingEditor] = useState<boolean>(false);
  const [dashboardNameEdit, setDashboardNameEdit] = useState<string>(dashboardName);
  const [showDashboardSaveDialog, setShowDashboardSaveDialog] = useState<boolean>(false);
  
  // Widget configuration state
  const [widgetConfigs, setWidgetConfigs] = useState<Record<string, WidgetConfig>>({});
  
  // Selected widget data
  const selectedWidget = selectedWidgetId
    ? widgets.find(w => w.id === selectedWidgetId)
    : null;
  
  const selectedWidgetLayout = selectedWidgetId
    ? layouts.find(l => l.i === selectedWidgetId)
    : null;
  
  const selectedWidgetConfig = selectedWidgetId
    ? widgetConfigs[selectedWidgetId] || {}
    : {};
  
  // Save the current configuration
  const saveConfiguration = (dashboardName: string) => {
    const config: MappingConfiguration = {
      widgets,
      layouts,
      apiEndpoint,
      apiResponse
    };
    
    // Save to localStorage
    localStorage.setItem(`dashboard_${dashboardName}`, JSON.stringify(config));
    
    // Call onSave prop if provided
    if (onSave) {
      onSave(config);
    }
    
    setShowDashboardSaveDialog(false);
  };
  
  // Load a saved configuration
  const loadConfiguration = (name: string) => {
    const savedConfig = localStorage.getItem(`dashboard_${name}`);
    if (savedConfig) {
      try {
        const config: MappingConfiguration = JSON.parse(savedConfig);
        setWidgets(config.widgets || []);
        setLayouts(config.layouts || []);
        setApiEndpoint(config.apiEndpoint || '');
        setApiResponse(config.apiResponse || null);
        setDashboardNameEdit(name);
      } catch (error) {
        console.error('Failed to load dashboard configuration:', error);
      }
    }
  };
  
  // Handle API endpoint selection
  const handleApiEndpointSelected = (endpoint: string, data: any) => {
    setApiEndpoint(endpoint);
    setApiResponse(data);
    setActiveTab('dashboard');
  };
  
  // Add a new widget
  const addWidget = (type: WidgetType) => {
    const widgetId = generateId();
    
    // Create new widget
    const newWidget: Widget = {
      id: widgetId,
      type,
      mappings: []
    };
    
    // Create layout for the widget
    const { w, h } = widgetSizes[type];
    const newLayout: WidgetLayout = {
      i: widgetId,
      x: 0,
      y: Infinity, // Place at the bottom
      w,
      h,
      static: false
    };
    
    // Update state
    setWidgets(prev => [...prev, newWidget]);
    setLayouts(prev => [...prev, newLayout]);
    setSelectedWidgetId(widgetId);
    setShowWidgetSelector(false);
  };
  
  // Remove a widget
  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    setLayouts(prev => prev.filter(l => l.i !== id));
    
    // Clear widget config
    setWidgetConfigs(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    
    // Update selected widget if needed
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
      setShowMappingEditor(false);
    }
  };
  
  // Handle layout changes
  const handleLayoutChange = (newLayout: any[]) => {
    // Convert to our WidgetLayout type
    const updatedLayouts: WidgetLayout[] = newLayout.map(item => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      static: !!item.static
    }));
    
    setLayouts(updatedLayouts);
  };
  
  // Handle widget selection
  const handleWidgetSelect = (id: string) => {
    setSelectedWidgetId(prevId => prevId === id ? null : id);
    setShowMappingEditor(false);
  };
  
  // Open mapping editor for selected widget
  const openMappingEditor = () => {
    if (selectedWidgetId) {
      setShowMappingEditor(true);
    }
  };
  
  // Handle mappings save from editor
  const handleMappingsSave = (mappings: FieldMapping[]) => {
    if (!selectedWidgetId) return;
    
    setWidgets(prev =>
      prev.map(widget =>
        widget.id === selectedWidgetId
          ? { ...widget, mappings }
          : widget
      )
    );
    
    setShowMappingEditor(false);
  };
  
  // Handle widget config change
  const handleWidgetConfigChange = (config: WidgetConfig) => {
    if (!selectedWidgetId) return;
    
    setWidgetConfigs(prev => ({
      ...prev,
      [selectedWidgetId]: config
    }));
  };
  
  // Generate widget preview data based on mappings and API response
  const getWidgetPreviewData = (widget: Widget) => {
    if (!widget) return {};
    
    // Start with widget configuration
    const config = widgetConfigs[widget.id] || {};
    
    // Add widget-specific data based on mappings
    const mappingsData: Record<string, any> = {};
    
    // Process based on widget type
    switch (widget.type) {
      case "one-metric":
        // Expects name and value
        widget.mappings.forEach(mapping => {
          if (mapping.labelMapping.manualValue === "name") {
            mappingsData.name = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                "Metric Name");
          } else if (mapping.labelMapping.manualValue === "value") {
            mappingsData.value = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                0);
          }
        });
        break;
        
      case "one-metric-date":
        // Expects name, value, and date
        widget.mappings.forEach(mapping => {
          if (mapping.labelMapping.manualValue === "name") {
            mappingsData.name = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                "Metric Name");
          } else if (mapping.labelMapping.manualValue === "value") {
            mappingsData.value = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                0);
          } else if (mapping.labelMapping.manualValue === "date") {
            mappingsData.date = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                new Date().toLocaleDateString());
          }
        });
        break;
        
      // Add similar processing for other widget types
      case "two-metrics":
        // Expects metric1, value1, metric2, value2
        widget.mappings.forEach(mapping => {
          if (mapping.labelMapping.manualValue === "metric1") {
            mappingsData.metric1 = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                "Metric 1");
          } else if (mapping.labelMapping.manualValue === "value1") {
            mappingsData.value1 = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                0);
          } else if (mapping.labelMapping.manualValue === "metric2") {
            mappingsData.metric2 = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                "Metric 2");
          } else if (mapping.labelMapping.manualValue === "value2") {
            mappingsData.value2 = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                0);
          }
        });
        break;
        
      case "one-metric-table":
        // Process table data
        let tableData: any[] = [];
        let tableColumns: any[] = [];
        let tableTotalAmount = "$0";
        
        widget.mappings.forEach(mapping => {
          if (mapping.labelMapping.manualValue === "rows") {
            // Handle row data
            const rowData = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                []);
                
            if (Array.isArray(rowData)) {
              tableData = rowData;
            }
          } else if (mapping.labelMapping.manualValue === "columns") {
            // Handle column definitions
            const columnDefs = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                []);
                
            if (Array.isArray(columnDefs)) {
              tableColumns = columnDefs;
            }
          } else if (mapping.labelMapping.manualValue === "totalAmount") {
            // Handle total amount
            tableTotalAmount = mapping.valueMapping.manualValue || 
              (mapping.valueMapping.path && apiResponse ? 
                mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
                "$0");
          }
        });
        
        mappingsData.data = tableData;
        if (tableColumns.length > 0) {
          mappingsData.columns = tableColumns;
        }
        mappingsData.totalAmount = tableTotalAmount;
        break;
        
      case "bar-chart":
      case "stacked-bar-chart":
      case "orders-line-chart":
      case "dual-line-chart":
      case "pie-chart-total":
      case "two-metrics-linechart":
      case "two-metrics-piechart":
      case "quadrant-metrics":
      case "loans-app-tray":
        // Process chart data (simplified for brevity)
        widget.mappings.forEach(mapping => {
          const label = mapping.labelMapping.manualValue;
          if (!label) return;
          
          let value = mapping.valueMapping.manualValue;
          if (mapping.valueMapping.path && apiResponse) {
            value = mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse);
          }
          
          // Try to parse as JSON if it's a string that looks like JSON
          if (typeof value === 'string' && (value.startsWith('[') || value.startsWith('{'))) {
            try {
              value = JSON.parse(value);
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
          
          mappingsData[label] = value;
        });
        break;
        
      default:
        // Generic processing for any mappings
        widget.mappings.forEach(mapping => {
          const label = mapping.labelMapping.manualValue || 
            (mapping.labelMapping.path && apiResponse ? 
              mapping.labelMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
              "Field");
              
          const value = mapping.valueMapping.manualValue || 
            (mapping.valueMapping.path && apiResponse ? 
              mapping.valueMapping.path.split('.').reduce((o, p) => (o ? o[p] : undefined), apiResponse) : 
              null);
              
          mappingsData[label] = value;
        });
    }
    
    return {
      ...config,
      ...mappingsData
    };
  };
  
  // Render widget preview in the editor
  const renderWidgetPreview = (widget: Widget) => {
    const Component = widgetMapping[widget.type];
    if (!Component) {
      return (
        <div className="bg-red-100 p-4 rounded-md text-red-800 text-center">
          Widget type {widget.type} not found
        </div>
      );
    }
    
    const previewData = getWidgetPreviewData(widget);
    
    return <Component {...previewData} />;
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  {editMode ? (
                    <input
                      type="text"
                      value={dashboardNameEdit}
                      onChange={(e) => setDashboardNameEdit(e.target.value)}
                      className="border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    dashboardNameEdit
                  )}
                </h1>
              </div>
              <div className="ml-6 flex space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`border-b-2 ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center px-1 pt-1 text-sm font-medium`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`border-b-2 ${
                    activeTab === 'api'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center px-1 pt-1 text-sm font-medium`}
                >
                  API Configuration
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`border-b-2 ${
                    activeTab === 'preview'
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex items-center px-1 pt-1 text-sm font-medium`}
                >
                  Preview
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setEditMode(prev => !prev)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  editMode
                    ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                    : 'text-gray-700 bg-white hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {editMode ? 'Exit Edit Mode' : 'Edit'}
              </button>
              
              <button
                onClick={() => setShowDashboardSaveDialog(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex">
            {/* Dashboard Editor */}
            <div className={`flex-1 overflow-auto p-4 ${editMode ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="max-w-7xl mx-auto">
                {widgets.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No widgets</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new widget to your dashboard.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowWidgetSelector(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <svg
                          className="-ml-1 mr-2 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Widget
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={editMode ? 'pb-20' : ''}>
                    {editMode && (
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() => setShowWidgetSelector(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <svg
                            className="-ml-1 mr-2 h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add Widget
                        </button>
                      </div>
                    )}
                    
                    <ResponsiveGridLayout
                      className="layout"
                      layouts={{ lg: layouts }}
                      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                      rowHeight={80}
                      isResizable={editMode}
                      isDraggable={editMode}
                      isDroppable={editMode}
                      onLayoutChange={handleLayoutChange}
                      margin={[16, 16]}
                    >
                      {widgets.map(widget => (
                        <div
                          key={widget.id}
                          className={`rounded-lg overflow-hidden shadow bg-white ${
                            selectedWidgetId === widget.id && editMode
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                          onClick={() => editMode && handleWidgetSelect(widget.id)}
                        >
                          {editMode && (
                            <div className="absolute top-2 right-2 z-10 flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWidgetId(widget.id);
                                  openMappingEditor();
                                }}
                                className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 flex items-center justify-center"
                                title="Edit Mappings"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeWidget(widget.id);
                                }}
                                className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center"
                                title="Remove Widget"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          )}
                          {renderWidgetPreview(widget)}
                        </div>
                      ))}
                    </ResponsiveGridLayout>
                  </div>
                )}
              </div>
            </div>
            
            {/* Widget Configuration Panel (when a widget is selected) */}
            {editMode && selectedWidget && (
              <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Configure {selectedWidget.type}
                </h2>
                
                <WidgetConfigEditor
                  widgetType={selectedWidget.type}
                  config={selectedWidgetConfig}
                  onChange={handleWidgetConfigChange}
                />
                
                <div className="mt-6">
                  <button
                    onClick={openMappingEditor}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Edit Data Mappings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'api' && (
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <ApiEndpointSelector
                initialEndpoint={apiEndpoint}
                onEndpointSelected={handleApiEndpointSelected}
              />
              
              {apiResponse && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    API Response Preview
                  </h2>
                  <div className="bg-gray-800 text-white rounded-md overflow-auto max-h-96 p-4">
                    <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'preview' && (
          <div className="flex-1 p-4 overflow-auto bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Dashboard Preview
              </h2>
              
              {widgets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                  <h3 className="text-sm font-medium text-gray-900">No widgets added yet</h3>
                  <p className="text-sm text-gray-500">
                    Switch to the Dashboard tab to add widgets.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {widgets.map(widget => (
                    <div key={widget.id} className="bg-white rounded-lg shadow overflow-hidden">
                      {renderWidgetPreview(widget)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Widget Selector Modal */}
      {showWidgetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">Add Widget</h2>
                <button
                  onClick={() => setShowWidgetSelector(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {availableWidgets.map(widget => (
                  <div
                    key={widget.type}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md cursor-pointer"
                    onClick={() => addWidget(widget.type)}
                  >
                    <h3 className="text-base font-medium text-gray-900 mb-1">{widget.name}</h3>
                    <p className="text-sm text-gray-500">{widget.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mapping Editor Modal */}
      {showMappingEditor && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-900">
                  Edit Mappings for {selectedWidget.type}
                </h2>
                <button
                  onClick={() => setShowMappingEditor(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <MappingEditor
                widgetType={selectedWidget.type}
                mappings={selectedWidget.mappings}
                apiResponse={apiResponse}
                onSave={handleMappingsSave}
                onCancel={() => setShowMappingEditor(false)}
                availableFields={getFieldsForWidget(selectedWidget.type)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Dashboard Save Dialog */}
      {showDashboardSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Save Dashboard</h2>
              
              <div className="mb-4">
                <label htmlFor="dashboard-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Dashboard Name
                </label>
                <input
                  type="text"
                  id="dashboard-name"
                  value={dashboardNameEdit}
                  onChange={(e) => setDashboardNameEdit(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDashboardSaveDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveConfiguration(dashboardNameEdit)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  disabled={!dashboardNameEdit.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get available fields for each widget type
function getFieldsForWidget(widgetType: WidgetType): string[] {
  switch (widgetType) {
    case "one-metric":
      return ["name", "value"];
      
    case "one-metric-date":
      return ["name", "value", "date"];
      
    case "two-metrics":
      return ["metric1", "value1", "metric2", "value2"];
      
    case "two-metrics-linechart":
      return ["title", "yAxisLabel", "xAxisLabel", "data", "totalValue"];
      
    case "two-metrics-piechart":
      return ["title", "label", "value", "percentage"];
      
    case "one-metric-table":
      return ["title", "columns", "rows", "totalAmount"];
      
    case "bar-chart":
      return ["title", "xAxisLabel", "yAxisLabel", "data", "variance"];
      
    case "stacked-bar-chart":
      return ["title", "data", "series", "totalValue"];
      
    case "orders-line-chart":
      return ["title", "data", "totalValue"];
      
    case "dual-line-chart":
      return ["title", "data", "series"];
      
    case "pie-chart-total":
      return ["title", "data", "totalValue", "subValue", "variance"];
      
    case "quadrant-metrics":
      return ["metrics", "topLeft", "topRight", "bottomLeft", "bottomRight"];
      
    case "loans-app-tray":
      return ["title", "menuItems", "chartData"];
      
    default:
      return [];
  }
}

export default DashboardBuilder;