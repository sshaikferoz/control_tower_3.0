import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MapIcon from '@mui/icons-material/Map';
import CodeIcon from '@mui/icons-material/Code';
import JSONMappingDialog, { FieldMapping } from './JSONMappingDialog';
import { TransformedData } from '@/helpers/types';
import { getValueByPath } from '@/utils/widgetHelpers';

interface FieldMappingComponentProps {
  fields: Array<{ field: string; path: string; type?: string }>;
  widgetType: string;
  widgetConfiguration: Record<string, any>;
  transformedData: TransformedData | null;
  onFieldUpdate: (field: string, path: string, value: any) => void;
}

const FieldMappingComponent: React.FC<FieldMappingComponentProps> = ({
  fields,
  widgetType,
  widgetConfiguration,
  transformedData,
  onFieldUpdate
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentField, setCurrentField] = useState<{ field: string; path: string; }>({ field: '', path: '' });
  const [fieldMappings, setFieldMappings] = useState<Record<string, FieldMapping>>({});
  
  // Initialize field mappings from widget configuration
  useEffect(() => {
    const mappings: Record<string, FieldMapping> = {};
    
    fields.forEach(({ field, path }) => {
      const value = getValueByPath(widgetConfiguration, path);
      
      // Try to detect if the value is already a mapping
      if (value && typeof value === 'object' && 
         (value.inputType === 'manual' || value.inputType === 'mapped' || value.inputType === 'hybrid')) {
        mappings[field] = {
          fieldName: field,
          fieldPath: path,
          ...value
        };
      } else {
        // Default to manual mapping with current value
        mappings[field] = {
          fieldName: field,
          fieldPath: path,
          inputType: 'manual',
          manualValue: value
        };
      }
    });
    
    setFieldMappings(mappings);
  }, [fields, widgetConfiguration]);
  
  // Function to open the mapping dialog for a field
  const openMappingDialog = (field: string, path: string) => {
    setCurrentField({ field, path });
    setDialogOpen(true);
  };
  
  // Function to handle saving a mapping
  const handleSaveMapping = (mapping: FieldMapping) => {
    // Save in state
    setFieldMappings(prev => ({
      ...prev,
      [mapping.fieldName]: mapping
    }));
    
    // Update the widget configuration
    onFieldUpdate(
      mapping.fieldName, 
      mapping.fieldPath, 
      {
        inputType: mapping.inputType,
        ...(mapping.inputType === 'manual' ? { manualValue: mapping.manualValue } : {}),
        ...(mapping.inputType === 'mapped' ? { mappedConfig: mapping.mappedConfig } : {}),
        ...(mapping.inputType === 'hybrid' ? { hybridMapping: mapping.hybridMapping } : {})
      }
    );
  };
  
  // Function to render field value or mapping info
  const renderFieldValue = (field: string) => {
    const mapping = fieldMappings[field];
    if (!mapping) return 'No mapping';
    
    if (mapping.inputType === 'manual') {
      // For manual values, show the actual value with preview
      return (
        <Box>
          <Chip 
            label="Manual" 
            color="primary" 
            size="small" 
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {typeof mapping.manualValue === 'object' 
              ? JSON.stringify(mapping.manualValue).substring(0, 100) + (JSON.stringify(mapping.manualValue).length > 100 ? '...' : '')
              : String(mapping.manualValue || '').substring(0, 100) + (String(mapping.manualValue || '').length > 100 ? '...' : '')
            }
          </Typography>
        </Box>
      );
    } else if (mapping.inputType === 'mapped') {
      // For mapped values, show the mapping info
      return (
        <Box>
          <Chip 
            label="Mapped" 
            color="secondary" 
            size="small" 
            sx={{ mb: 1 }}
          />
          {mapping.mappedConfig && (
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  CHA Field: 
                </Typography>
                <Typography variant="body2">
                  {mapping.mappedConfig.chaField}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  CHA Value: 
                </Typography>
                <Typography variant="body2">
                  {mapping.mappedConfig.chaValue}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  KF Field: 
                </Typography>
                <Typography variant="body2">
                  {mapping.mappedConfig.kfField}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      );
    } else if (mapping.inputType === 'hybrid') {
      // For hybrid mappings, show a summary
      return (
        <Box>
          <Chip 
            label="Hybrid" 
            color="info" 
            size="small" 
            sx={{ mb: 1 }}
          />
          {mapping.hybridMapping && (
            <Box>
              <Typography variant="body2">
                {mapping.hybridMapping.length} fields configured:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {mapping.hybridMapping.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.field} (${item.type})`}
                    size="small"
                    color={item.type === 'manual' ? 'primary' : 'secondary'}
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      );
    }
    
    return 'Unknown mapping type';
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Field Mappings
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure widget fields manually or map them to data from your dataset.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        {fields.map(({ field, path, type }) => (
          <Grid item xs={12} sm={6} key={field}>
            <Paper 
              elevation={1}
              sx={{ 
                p: 2, 
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1">
                    {field}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {path}
                    {type && ` (${type})`}
                  </Typography>
                </Box>
                
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => openMappingDialog(field, path)}
                >
                  <Tooltip title="Configure Mapping">
                    <EditIcon fontSize="small" />
                  </Tooltip>
                </IconButton>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box>
                {renderFieldValue(field)}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* JSON Mapping Dialog */}
      <JSONMappingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fieldName={currentField.field}
        fieldPath={currentField.path}
        currentValue={fieldMappings[currentField.field]}
        transformedData={transformedData}
        onSaveMapping={handleSaveMapping}
      />
    </Box>
  );
};

export default FieldMappingComponent;