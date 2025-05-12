import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import LinkIcon from '@mui/icons-material/Link';
import ApiService from '@/helpers/ApiService';
import { WidgetTypes } from '@/types';
import { widgetConfigFields } from '@/data/widgetConfig';
import { transformFormMetadata } from '@/helpers/transformHelpers';
import FieldMappingComponent from './FieldMappingComponent';
import parseBExQueryXML from '@/lib/bexQueryXmlToJsonEnhanced';
import { parseXMLToJson } from '@/lib/bexQueryXmlToJson';

interface HybridMappingTabProps {
  selectedWidget: string | null;
  widgetType: WidgetTypes | null;
  widgetConfigurations: Record<string, any>;
  onValueChange: (field: string, value: any) => void;
}

const HybridMappingTab: React.FC<HybridMappingTabProps> = ({
  selectedWidget,
  widgetType,
  widgetConfigurations,
  onValueChange
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryName, setQueryName] = useState<string>('YSCM_CT_PROC_OSS');
  const [transformedData, setTransformedData] = useState<any>(null);
  
  // Get configuration fields for the selected widget
  const getWidgetConfigFields = () => {
    return widgetType ? widgetConfigFields[widgetType] || [] : [];
  };
  
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, use actual API endpoint
      // For demo, use a mock API endpoint
      const response = await fetch(`/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${queryName}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
    
      const data = parseXMLToJson(response.body ? response.body.toString() : "");
      
      // Transform data to the format needed for mapping
      const transformed = transformFormMetadata(data);
      setTransformedData(transformed);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(typeof error === 'string' ? error : 'An error occurred while fetching data');
      
      // For demo purposes, use a mock transformed data if fetch fails
      const mockData = {
        FormStructure: {
          ZSCMCMD: {
            OCTG: {
              VALUE001: 0,
              VALUE002: 51.4,
              VALUE003: 13.5,
              VALUE004: 0
            },
            "Mud & Chemical": {
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
            label: "OSS INV - <6 Months",
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
            label: "OSS INV - >12 Months",
            fieldName: "VALUE004",
            axisType: "COLUMN",
            displayStyle: "1"
          }
        }
      };
      
      setTransformedData(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, []);
  
  // Handle field value change
  const handleFieldUpdate = (field: string, path: string, value: any) => {
    onValueChange(field, value);
  };
  
  if (!selectedWidget || !widgetType) {
    return (
      <Typography color="text.secondary">
        Select a widget to configure it
      </Typography>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Hybrid Data Mapping
        </Typography>
        
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton 
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure widget fields to use data from your dataset or manual values. You can also create hybrid mappings that combine both.
      </Typography>
      
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <LinkIcon color="primary" />
          <Typography variant="subtitle1">
            Connected Data Source
          </Typography>
        </Box>
        <Typography variant="body2" paragraph>
          {queryName} (SAP BW Query)
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          disabled
        >
          Change Data Source
        </Button>
      </Paper>
      
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
      
      {transformedData && (
        <FieldMappingComponent
          fields={getWidgetConfigFields()}
          widgetType={widgetType}
          widgetConfiguration={widgetConfigurations[selectedWidget] || {}}
          transformedData={transformedData}
          onFieldUpdate={handleFieldUpdate}
        />
      )}
    </Box>
  );
};

export default HybridMappingTab;