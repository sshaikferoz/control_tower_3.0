// components/DashboardBuilder/index.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Typography } from '@mui/material';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Widget, LayoutItem, WidgetTypes } from '@/types';
import { widgetSizes } from '@/data/widgetDefaults';
import { useWidgetConfiguration } from '@/hooks/useWidgetConfiguration';
import SidebarMapping from '@/components/SidebarMapping';
import WidgetGrid from './WidgetGrid';
import ConfigPanel from './ConfigPanel';
import mirageServer from '@/lib/mirage/mirageServer';
import { widgetConfigFields } from '@/data/widgetConfig';

// MirageJS mock API server setup
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  mirageServer();
}

const DashboardBuilder: React.FC = () => {
  // Get query parameters
  const [sectionName, setSectionName] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Initialize query parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setSectionName(searchParams.get('sectionName') || '');
      setIsExpanded(searchParams.get('expanded') === 'true');
    }
  }, []);

  // State for widgets and layout
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Use the widget configuration hook
  const {
    widgetConfigurations,
    previewData,
    initializeWidgetConfig,
    updateWidgetConfig,
    generatePreview,
    savePreviewData,
    resetPreviewData,
    removeWidgetConfig,
    prepareWidgetsWithProps
  } = useWidgetConfiguration();

  // Add a new widget to the layout
  const addWidget = useCallback((name: string) => {
    const widgetId = `widget-${Date.now()}`;
    const { w, h } = widgetSizes[name] || { w: 2, h: 2 };

    // Add widget to widgets array
    setWidgets((prev) => [...prev, { id: widgetId, name, props: {} }]);

    // Add to layout
    setLayout((prev) => [
      ...prev,
      { i: widgetId, x: 0, y: Infinity, w, h, static: false }
    ]);

    // Initialize widget configuration with default props
    initializeWidgetConfig(widgetId, name);
  }, [initializeWidgetConfig]);

  // Remove a widget from the layout
  const removeWidget = useCallback((id: string) => {
    setWidgets((prev) => prev.filter((widget) => widget.id !== id));
    setLayout((prev) => prev.filter((item) => item.i !== id));
    
    // Remove from widgetConfigurations
    removeWidgetConfig(id);
  
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  }, [removeWidgetConfig, selectedWidget]);

  // Handle widget selection
  const handleWidgetClick = useCallback((id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (selectedWidget === id) return;
    
    // Save preview data to widget configurations if it exists
    if (selectedWidget && previewData) {
      savePreviewData(selectedWidget);
    }
    
    // Now select the new widget
    setSelectedWidget(id);
    
    // Reset preview data
    resetPreviewData();
  }, [selectedWidget, previewData, savePreviewData, resetPreviewData]);

  // Get the type of the currently selected widget
  const getSelectedWidgetType = useCallback((): WidgetTypes | null => {
    if (!selectedWidget) return null;
    const widget = widgets.find((w) => w.id === selectedWidget);
    return widget ? widget.name as WidgetTypes : null;
  }, [selectedWidget, widgets]);

  // Function to handle manual value change for a field
  const handleManualValueChange = useCallback((field: string, value: any) => {
    if (!selectedWidget) return;
    
    // Find the field configuration to get the path
    const widgetType = getSelectedWidgetType();
    if (!widgetType) return;
    
    const fieldConfig = widgetType ? 
      widgetConfigFields[widgetType]?.find(f => f.field === field) : undefined;
    
    updateWidgetConfig(
      selectedWidget, 
      fieldConfig?.path || field, 
      value
    );
  }, [selectedWidget, getSelectedWidgetType, updateWidgetConfig]);

  // Generate preview data for the selected widget
  const handleGeneratePreview = useCallback(() => {
    if (!selectedWidget) return;
    generatePreview(selectedWidget);
  }, [selectedWidget, generatePreview]);

  // Save the layout to session storage
  const saveLayout = useCallback(() => {
    // Create widgets with the final configured props
    const widgetsWithProps = prepareWidgetsWithProps(widgets);

    // Create layout with section information
    const layoutWithSection = layout.map((item) => ({
      ...item,
      sectionName
    }));

    // Create the section entry
    const sectionEntry = {
      sectionName,
      layout: layoutWithSection,
      widgets: widgetsWithProps,
      expanded: isExpanded
    };

    console.log("Saving section:", sectionEntry);

    // Get existing payload or initialize as empty array
    let payload = JSON.parse(sessionStorage.getItem("payload") || "[]");
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    // Add the new section
    payload.push(sectionEntry);

    // Save back to session storage
    sessionStorage.setItem("payload", JSON.stringify(payload));

    alert("Layout saved successfully!");

    // Navigate to the dashboard page
    window.location.href = "/";
  }, [widgets, layout, sectionName, isExpanded, prepareWidgetsWithProps]);

  return (
    <div className="relative w-full h-screen flex">
      {/* Sidebar with widget options */}
      <div className="h-full bg-white">
        <SidebarMapping onItemClick={addWidget} />
      </div>

      {/* Main content area with splitter */}
      <Splitter className="w-full h-100vh overflow-y-auto" layout="vertical">
        {/* Top panel: Grid layout preview */}
        <SplitterPanel>
          <div className="flex-1 flex flex-col p-4">
            <Typography variant="h5" component="h1" gutterBottom>
              Dashboard Builder
            </Typography>

            {/* Grid layout for widgets */}
            <WidgetGrid
              widgets={widgets}
              layout={layout}
              selectedWidget={selectedWidget}
              widgetConfigurations={widgetConfigurations}
              previewData={previewData}
              onLayoutChange={setLayout}
              onWidgetClick={handleWidgetClick}
              onRemoveWidget={removeWidget}
            />
          </div>
        </SplitterPanel>

        {/* Bottom panel: Configuration panel */}
        <SplitterPanel>
          <ConfigPanel
            selectedWidget={selectedWidget}
            widgetType={getSelectedWidgetType()}
            widgetConfigurations={widgetConfigurations}
            previewData={previewData}
            onValueChange={handleManualValueChange}
            onGeneratePreview={handleGeneratePreview}
            onSaveLayout={saveLayout}
          />
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default DashboardBuilder;