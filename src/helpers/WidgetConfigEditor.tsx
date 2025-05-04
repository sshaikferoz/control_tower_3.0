
import React, { useState, useEffect } from 'react';
import { WidgetType } from './types';

// Widget-specific configuration options
export interface WidgetConfig {
  title?: string;
  subtitle?: string;
  showLegend?: boolean;
  height?: number;
  colorPalette?: string;
  showLabels?: boolean;
  layout?: 'horizontal' | 'vertical';
  [key: string]: any; // Allow for dynamic properties
}

interface WidgetConfigEditorProps {
  widgetType: WidgetType;
  config: WidgetConfig;
  onChange: (config: WidgetConfig) => void;
}

// Default configurations by widget type
const defaultConfigs: Record<WidgetType, Partial<WidgetConfig>> = {
  "one-metric": {
    title: "Metric",
    colorPalette: "blue",
  },
  "one-metric-date": {
    title: "Metric with Date",
    colorPalette: "blue",
  },
  "two-metrics": {
    title: "Two Metrics",
    layout: "horizontal",
    colorPalette: "blue",
  },
  "two-metrics-linechart": {
    title: "Line Chart",
    showLegend: true,
    height: 300,
    colorPalette: "blue",
    showLabels: true,
  },
  "two-metrics-piechart": {
    title: "Pie Chart",
    showLegend: true,
    height: 300,
    colorPalette: "multi",
    showLabels: true,
  },
  "one-metric-table": {
    title: "Table",
    colorPalette: "blue",
  },
  "bar-chart": {
    title: "Bar Chart",
    showLegend: true,
    height: 300,
    colorPalette: "green",
    showLabels: true,
  },
  "stacked-bar-chart": {
    title: "Stacked Bar Chart",
    showLegend: true,
    height: 300,
    colorPalette: "multi",
    showLabels: true,
  },
  "orders-line-chart": {
    title: "Orders Line Chart",
    showLegend: true,
    height: 300,
    colorPalette: "blue",
    showLabels: true,
  },
  "dual-line-chart": {
    title: "Dual Line Chart",
    showLegend: true,
    height: 300,
    colorPalette: "multi",
    showLabels: true,
  },
  "pie-chart-total": {
    title: "Pie Chart with Total",
    showLegend: true,
    height: 300,
    colorPalette: "multi",
    showLabels: true,
  },
  "quadrant-metrics": {
    title: "Quadrant Metrics",
    colorPalette: "multi",
  },
  "loans-app-tray": {
    title: "App Tray",
    colorPalette: "multi",
  }
};

// Available color palettes
const colorPalettes = [
  { id: "blue", name: "Blue", colors: ["#2c7be5", "#1a68d1", "#1860c4", "#165bba"] },
  { id: "green", name: "Green", colors: ["#00d97e", "#00c670", "#00b463", "#00a256"] },
  { id: "red", name: "Red", colors: ["#e63757", "#d61a3c", "#c61938", "#b61735"] },
  { id: "multi", name: "Multi-color", colors: ["#2c7be5", "#00d97e", "#e63757", "#f6c343"] }
];

const WidgetConfigEditor: React.FC<WidgetConfigEditorProps> = ({
  widgetType,
  config,
  onChange
}) => {
  // Initialize with default config for the widget type
  const [localConfig, setLocalConfig] = useState<WidgetConfig>({
    ...defaultConfigs[widgetType],
    ...config
  });

  // Apply changes when widget type changes
  useEffect(() => {
    setLocalConfig({
      ...defaultConfigs[widgetType],
      ...config
    });
  }, [widgetType, config]);

  // Handle field change
  const handleChange = (field: string, value: any) => {
    const updatedConfig = {
      ...localConfig,
      [field]: value
    };
    setLocalConfig(updatedConfig);
    onChange(updatedConfig);
  };

  // Get config fields based on widget type
  const getConfigFields = () => {
    // Common fields for all widget types
    const fields = [
      { id: "title", label: "Title", type: "text" }
    ];

    // Add widget-specific fields
    switch (widgetType) {
      case "one-metric":
      case "one-metric-date":
        fields.push({ id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes });
        break;
        
      case "two-metrics":
        fields.push(
          { id: "layout", label: "Layout", type: "select", options: [
            { id: "horizontal", name: "Horizontal" },
            { id: "vertical", name: "Vertical" }
          ]},
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
        
      case "two-metrics-linechart":
      case "orders-line-chart":
      case "dual-line-chart":
        fields.push(
          { id: "subtitle", label: "Subtitle", type: "text" },
          { id: "height", label: "Height (px)", type: "number" },
          { id: "showLegend", label: "Show Legend", type: "checkbox" },
          { id: "showLabels", label: "Show Value Labels", type: "checkbox" },
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
        
      case "bar-chart":
      case "stacked-bar-chart":
        fields.push(
          { id: "subtitle", label: "Subtitle", type: "text" },
          { id: "height", label: "Height (px)", type: "number" },
          { id: "showLegend", label: "Show Legend", type: "checkbox" },
          { id: "showLabels", label: "Show Value Labels", type: "checkbox" },
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
        
      case "two-metrics-piechart":
      case "pie-chart-total":
        fields.push(
          { id: "subtitle", label: "Subtitle", type: "text" },
          { id: "height", label: "Height (px)", type: "number" },
          { id: "showLegend", label: "Show Legend", type: "checkbox" },
          { id: "showLabels", label: "Show Value Labels", type: "checkbox" },
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
        
      case "one-metric-table":
        fields.push(
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
        
      // For quadrant metrics and app tray, limit configuration options
      case "quadrant-metrics":
      case "loans-app-tray":
        fields.push(
          { id: "colorPalette", label: "Color Theme", type: "select", options: colorPalettes }
        );
        break;
    }

    return fields;
  };

  // Render the appropriate input for each field type
  const renderInput = (field: { id: string; label: string; type: string; options?: any[] }) => {
    const value = localConfig[field.id];
    
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        );
        
      case "number":
        return (
          <input
            type="number"
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, parseInt(e.target.value, 10))}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        );
        
      case "checkbox":
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={!!value}
            onChange={(e) => handleChange(field.id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        );
        
      case "select":
        return (
          <select
            id={field.id}
            value={value || ""}
            onChange={(e) => handleChange(field.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {field.options?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        );
        
      default:
        return null;
    }
  };

  const fields = getConfigFields();

  return (
    <div className="bg-white shadow rounded-md p-4">
      <h2 className="text-lg font-medium mb-4">Widget Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {renderInput(field)}
          </div>
        ))}
      </div>
      
      {widgetType === "one-metric-table" && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Table columns and data will be configured through field mappings.
          </p>
        </div>
      )}
    </div>
  );
};

export default WidgetConfigEditor;