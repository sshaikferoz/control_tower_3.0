// components/DataFieldSelector.tsx
import React, { useState, useEffect } from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Box, 
  TextField, 
  Chip,
  Tooltip,
  Grid,
  FormHelperText
} from '@mui/material';
import { TransformedData } from '@/helpers/types';
import { extractChaFields, extractKfFields, getChaValues } from '@/utils/dataUtils';

interface DataFieldSelectorProps {
  transformedData: TransformedData | null;
  selectedChaField: string;
  selectedChaValue: string;
  selectedKfField: string;
  onChaFieldChange: (field: string) => void;
  onChaValueChange: (value: string) => void;
  onKfFieldChange: (field: string) => void;
  disabled?: boolean;
  helperText?: string;
}

const DataFieldSelector: React.FC<DataFieldSelectorProps> = ({
  transformedData,
  selectedChaField,
  selectedChaValue,
  selectedKfField,
  onChaFieldChange,
  onChaValueChange,
  onKfFieldChange,
  disabled = false,
  helperText
}) => {
  // Extract available fields
  const chaFields = transformedData ? extractChaFields(transformedData) : [];
  const kfFields = transformedData ? extractKfFields(transformedData) : [];
  
  // Get available CHA values
  const chaValues = transformedData && selectedChaField ? 
    getChaValues(transformedData, selectedChaField) : [];
  
  // Get available KF fields for selected CHA value
  const availableKfFields = transformedData && selectedChaField && selectedChaValue && 
    transformedData.FormStructure[selectedChaField] &&
    transformedData.FormStructure[selectedChaField][selectedChaValue] ?
    Object.keys(transformedData.FormStructure[selectedChaField][selectedChaValue])
      .filter(field => kfFields.some(kfField => kfField.name === field))
      .map(field => {
        const metadata = transformedData.FormMetadata[field];
        return {
          name: field,
          label: metadata?.label || field
        };
      }) : [];
  
  // Preview the selected value
  const previewValue = React.useMemo(() => {
    if (!transformedData || !selectedChaField || !selectedChaValue || !selectedKfField) return null;
    
    try {
      return transformedData.FormStructure[selectedChaField][selectedChaValue][selectedKfField];
    } catch (error) {
      return null;
    }
  }, [transformedData, selectedChaField, selectedChaValue, selectedKfField]);
  
  return (
    <Box width="100%">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small" disabled={disabled}>
            <InputLabel>Characteristic Field</InputLabel>
            <Select
              value={selectedChaField}
              onChange={(e) => onChaFieldChange(e.target.value)}
              label="Characteristic Field"
            >
              {chaFields.map((field) => (
                <MenuItem key={field.name} value={field.name}>
                  {field.label || field.name}
                </MenuItem>
              ))}
            </Select>
            {helperText && (
              <FormHelperText>{helperText}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl 
            fullWidth 
            size="small" 
            disabled={disabled || !selectedChaField}
          >
            <InputLabel>Characteristic Value</InputLabel>
            <Select
              value={selectedChaValue}
              onChange={(e) => onChaValueChange(e.target.value)}
              label="Characteristic Value"
            >
              {chaValues.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl 
            fullWidth 
            size="small" 
            disabled={disabled || !selectedChaField || !selectedChaValue}
          >
            <InputLabel>Key Figure Field</InputLabel>
            <Select
              value={selectedKfField}
              onChange={(e) => onKfFieldChange(e.target.value)}
              label="Key Figure Field"
            >
              {availableKfFields.map((field) => (
                <MenuItem key={field.name} value={field.name}>
                  {field.label || field.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {previewValue !== null && (
        <Box mt={2} p={1} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="caption" color="textSecondary">
            Preview Value:
          </Typography>
          <Typography variant="body2">
            {previewValue === "" ? 
              <Chip size="small" label="Empty" color="warning" /> : 
              previewValue
            }
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DataFieldSelector;