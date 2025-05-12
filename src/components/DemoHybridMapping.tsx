// components/DemoHybridMapping.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert
} from '@mui/material';
import { WidgetTypes } from '@/types';
import { transformFormMetadata } from '@/helpers/transformHelpers';
import { useWidgetConfiguration } from '@/hooks/useWidgetConfiguration';
import FieldMappingComponent from './FieldMappingComponent';
import SimpleMetric from '@/grid-components/SimpleMetric';
import PieMetric from '@/grid-components/PieMetric';
import SingleLineChart from '@/grid-components/SingleLineChart';
import TableMetric from '@/grid-components/TableMetric';
import BarMetric from '@/grid-components/BarMetric';
import { widgetConfigFields } from '@/data/widgetConfig';

// Mock widgets for demonstration
const demoWidgets = [
  { id: 'widget-1', name: WidgetTypes.ONE_METRIC, label: 'Simple Metric' },
  { id: 'widget-2', name: WidgetTypes.TWO_METRICS_PIECHART, label: 'Pie Chart' },
  { id: 'widget-3', name: WidgetTypes.TWO_METRICS_LINECHART, label: 'Line Chart' },
  { id: 'widget-4', name: WidgetTypes.ONE_METRIC_TABLE, label: 'Table' },
  { id: 'widget-5', name: WidgetTypes.BAR_CHART, label: 'Bar Chart' }
];

// Widget component mapping
const widgetComponents: Record<string, React.ComponentType<any>> = {
  [WidgetTypes.ONE_METRIC]: SimpleMetric,
  [WidgetTypes.TWO_METRICS_PIECHART]: PieMetric,
  [WidgetTypes.TWO_METRICS_LINECHART]: SingleLineChart,
  [WidgetTypes.ONE_METRIC_TABLE]: TableMetric,
  [WidgetTypes.BAR_CHART]: BarMetric
};

const DemoHybridMapping: React.FC = () => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the hook for widget configuration
  const {
    widgetConfigurations,
    transformedData,
    initializeWidgetConfig,
    updateWidgetConfig,
    generatePreview,
    previewData,
    setApiData
  } = useWidgetConfiguration();
  
  // Initialize widget configurations
  useEffect(() => {
    demoWidgets.forEach(widget => {
      initializeWidgetConfig(widget.id, widget.name);
    });
    
    // Fetch mock data
    fetchData();
  }, []);
  
  // Fetch mock data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, use actual API endpoint
      // For demo, use a mock data
      const mockData = {
        header: [
          { type: "CHA", label: "OSS INV - Commodity", fieldName: "ZSCMCMD" },
          { type: "KF", label: "OSS INV - Value", fieldName: "VALUE001" },
          { type: "KF", label: "OSS INV - <6 Months", fieldName: "VALUE002" },
          { type: "KF", label: "OSS INV - 6-12 Months", fieldName: "VALUE003" },
          { type: "KF", label: "OSS INV - >12 Months", fieldName: "VALUE004" }
        ],
        chartData: [
          { "ZSCMCMD": "OCTG", "VALUE001": "", "VALUE002": 51.4, "VALUE003": 13.5, "VALUE004": "" },
          { "ZSCMCMD": "Mud & Chemical", "VALUE001": "", "VALUE002": 277, "VALUE003": 38.8, "VALUE004": 1.8 },
          { "ZSCMCMD": "Downhole", "VALUE001": "", "VALUE002": 352.1, "VALUE003": 123.5, "VALUE004": "" },
          { "ZSCMCMD": "Line Poles and Hware", "VALUE001": "", "VALUE002": "", "VALUE003": "", "VALUE004": "" },
          { "ZSCMCMD": "Overall Result", "VALUE001": "", "VALUE002": 680.5, "VALUE003": 175.8, "VALUE004": 1.8 }
        ]
      };
      
      // Transform data
      const transformed = transformFormMetadata(mockData);
      setApiData(transformed);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(typeof error === 'string' ? error : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle widget selection
  const handleWidgetSelect = (widgetId: string) => {
    setSelectedWidget(widgetId);
    generatePreview(widgetId);
  };
  
  // Handle field update
  const handleFieldUpdate = (field: string, value: any) => {
    if (!selectedWidget) return;
    updateWidgetConfig(selectedWidget, field, value);
    generatePreview(selectedWidget);
  };
  
  // Render selected widget preview
  const renderWidgetPreview = () => {
    if (!selectedWidget) return null;
    
    const widget = demoWidgets.find(w => w.id === selectedWidget);
    if (!widget) return null;
    
    const WidgetComponent = widgetComponents[widget.name];
    if (!WidgetComponent) return null;
    
    // Get the configuration or preview data for the widget
    const widgetData = previewData || widgetConfigurations[selectedWidget] || {};
    
    return (
      <Box p={2} border="1px solid #e0e0e0" borderRadius={1} bgcolor="#f9f9f9" width="100%" height="300px">
        <Typography variant="subtitle2" gutterBottom>
          Widget Preview
        </Typography>
        <Box 
          sx={{
            height: "calc(100% - 30px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <WidgetComponent {...widgetData} />
        </Box>
      </Box>
    );
  };
  
  // Get configuration fields for a widget type
  const getConfigFields = (widgetType: WidgetTypes) => {
    return widgetConfigFields[widgetType] || [];
  };
  
  return (
    <Box p={4} maxWidth="1200px" mx="auto">
      <Typography variant="h5" gutterBottom>
        Hybrid Mapping Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the hybrid mapping feature that allows configuring widgets with both manual input and mapped data simultaneously.
      </Typography>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Widget Selection Panel */}
        <Grid item xs={12} md={3}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Widget
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {demoWidgets.map(widget => (
              <Button
                key={widget.id}
                variant={selectedWidget === widget.id ? "contained" : "outlined"}
                fullWidth
                sx={{ mb: 1, justifyContent: "flex-start" }}
                onClick={() => handleWidgetSelect(widget.id)}
              >
                {widget.label}
              </Button>
            ))}
          </Paper>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          {selectedWidget ? (
            <Grid container spacing={3}>
              {/* Widget Preview */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  {renderWidgetPreview()}
                </Paper>
              </Grid>
              
              {/* Field Mapping */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Field Mapping
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {transformedData && (
                    <FieldMappingComponent
                      fields={getConfigFields(demoWidgets.find(w => w.id === selectedWidget)?.name as WidgetTypes)}
                      widgetType={demoWidgets.find(w => w.id === selectedWidget)?.name as string}
                      widgetConfiguration={widgetConfigurations[selectedWidget] || {}}
                      transformedData={transformedData}
                      onFieldUpdate={handleFieldUpdate}
                    />
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                Select a widget to configure
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DemoHybridMapping;