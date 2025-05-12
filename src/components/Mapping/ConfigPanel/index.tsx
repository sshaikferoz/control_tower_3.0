// components/DashboardBuilder/ConfigPanel/index.tsx
import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { Button } from 'primereact/button';
import { WidgetTypes } from '@/types';
import TabPanel from '../TabPanel';
import BasicConfigTab from './BasicConfigTab';
import HybridMappingTab from './HybridMappingTab';
import PreviewTab from './PreviewTab';
import DataIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ConfigPanelProps {
  selectedWidget: string | null;
  widgetType: WidgetTypes | null;
  widgetConfigurations: Record<string, any>;
  previewData: any;
  onValueChange: (field: string, value: any) => void;
  onGeneratePreview: () => void;
  onSaveLayout: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  selectedWidget,
  widgetType,
  widgetConfigurations,
  previewData,
  onValueChange,
  onGeneratePreview,
  onSaveLayout
}) => {
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="p-4 m-auto max-h-[calc(100vh-250px)] min-w-[1200px] overflow-y-auto">
      <Typography variant="h6" component="h2" gutterBottom>
        Widget Configuration
      </Typography>

      {selectedWidget ? (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Configure {widgetType} Widget
          </Typography>

          {/* Tabs for different configuration aspects */}
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="mapping tabs">
            <Tab icon={<SettingsIcon />} label="Basic Configuration" />
            <Tab icon={<DataIcon />} label="Data Mapping" />
            <Tab icon={<VisibilityIcon />} label="Preview" />
          </Tabs>

          {/* Basic Configuration Tab */}
          <TabPanel value={tabValue} index={0}>
            <BasicConfigTab
              selectedWidget={selectedWidget}
              widgetType={widgetType}
              widgetConfigurations={widgetConfigurations}
              onValueChange={onValueChange}
            />
          </TabPanel>

          {/* Hybrid Mapping Tab */}
          <TabPanel value={tabValue} index={1}>
            <HybridMappingTab
              selectedWidget={selectedWidget}
              widgetType={widgetType}
              widgetConfigurations={widgetConfigurations}
              onValueChange={onValueChange}
            />
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel value={tabValue} index={2}>
            <PreviewTab
              previewData={previewData}
              onGeneratePreview={onGeneratePreview}
            />
          </TabPanel>
        </Box>
      ) : (
        <Typography color="text.secondary">
          Select a widget to configure it
        </Typography>
      )}

      <Box mt={4} pt={2} borderTop={1} borderColor="divider">
        <Button
          label="Save Layout"
          className="mt-2"
          onClick={onSaveLayout}
        />
      </Box>
    </div>
  );
};

export default ConfigPanel;