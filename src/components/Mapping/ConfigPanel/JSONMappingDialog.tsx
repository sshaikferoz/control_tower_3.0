import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import MapIcon from '@mui/icons-material/Map';
import { TransformedData } from '@/helpers/types';

interface JSONMappingDialogProps {
  open: boolean;
  onClose: () => void;
  fieldName: string;
  fieldPath: string;
  currentValue: any;
  transformedData: TransformedData | null;
  onSaveMapping: (mapping: FieldMapping) => void;
}

export interface FieldMapping {
  fieldName: string;
  fieldPath: string;
  inputType: 'manual' | 'mapped' | 'hybrid';
  manualValue?: any;
  mappedConfig?: {
    chaField: string;
    chaValue: string;
    kfField: string;
    path?: string;
  };
  transformations?: {
    type: 'format' | 'aggregate' | 'filter' | 'custom';
    params: Record<string, any>;
  }[];
}

const JSONMappingDialog: React.FC<JSONMappingDialogProps> = ({
  open,
  onClose,
  fieldName,
  fieldPath,
  currentValue,
  transformedData,
  onSaveMapping
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [mappingType, setMappingType] = useState<'manual' | 'mapped' | 'hybrid'>('manual');
  const [manualValue, setManualValue] = useState<any>(currentValue);
  
  // For mapped data
  const [selectedChaField, setSelectedChaField] = useState<string>('');
  const [selectedChaValue, setSelectedChaValue] = useState<string>('');
  const [selectedKfField, setSelectedKfField] = useState<string>('');
  
  // For hybrid mapping
  const [hybridMapping, setHybridMapping] = useState<Array<{field: string; value: any; type: 'manual' | 'mapped'}>>([]);
  
  // Preview state
  const [previewValue, setPreviewValue] = useState<any>(null);
  
  // Get available CHA fields from transformedData
  const getChaFields = (): string[] => {
    if (!transformedData || !transformedData.FormStructure) return [];
    return Object.keys(transformedData.FormStructure);
  };
  
  // Get available CHA values for the selected CHA field
  const getChaValues = (): string[] => {
    if (!transformedData || !transformedData.FormStructure || !selectedChaField) return [];
    return Object.keys(transformedData.FormStructure[selectedChaField]);
  };
  
  // Get available KF fields for the selected CHA field and value
  const getKfFields = (): string[] => {
    if (!transformedData || !transformedData.FormStructure || !selectedChaField || !selectedChaValue) return [];
    const chaValueData = transformedData.FormStructure[selectedChaField][selectedChaValue];
    return chaValueData ? Object.keys(chaValueData) : [];
  };
  
  // Get all KF fields from metadata
  const getAllKfFields = (): {fieldName: string, label: string}[] => {
    if (!transformedData || !transformedData.FormMetadata) return [];
    
    return Object.entries(transformedData.FormMetadata)
      .filter(([_, metadata]) => metadata.type === 'KF')
      .map(([fieldName, metadata]) => ({
        fieldName,
        label: metadata.label
      }));
  };
  
  // Reset state when dialog opens with new field
  useEffect(() => {
    if (open) {
      setManualValue(currentValue);
      setMappingType('manual');
      setTabValue(0);
      setPreviewValue(null);
      setHybridMapping([]);
      
      // Try to detect if current value is already a mapping
      if (typeof currentValue === 'object' && currentValue !== null) {
        if (currentValue.inputType === 'manual') {
          setMappingType('manual');
          setManualValue(currentValue.manualValue);
        } else if (currentValue.inputType === 'mapped' && currentValue.mappedConfig) {
          setMappingType('mapped');
          setSelectedChaField(currentValue.mappedConfig.chaField || '');
          setSelectedChaValue(currentValue.mappedConfig.chaValue || '');
          setSelectedKfField(currentValue.mappedConfig.kfField || '');
        } else if (currentValue.inputType === 'hybrid' && Array.isArray(currentValue.hybridMapping)) {
          setMappingType('hybrid');
          setHybridMapping(currentValue.hybridMapping);
        }
      }
    }
  }, [open, currentValue, fieldName]);
  
  // Update preview when mapping changes
  useEffect(() => {
    if (mappingType === 'manual') {
      setPreviewValue(manualValue);
    } else if (mappingType === 'mapped') {
      if (transformedData && selectedChaField && selectedChaValue && selectedKfField) {
        try {
          const value = transformedData.FormStructure[selectedChaField][selectedChaValue][selectedKfField];
          setPreviewValue(value);
        } catch (error) {
          setPreviewValue(null);
        }
      } else {
        setPreviewValue(null);
      }
    } else if (mappingType === 'hybrid') {
      // For hybrid, we'll show a combined preview
      const preview: Record<string, any> = {};
      hybridMapping.forEach(item => {
        if (item.type === 'manual') {
          preview[item.field] = item.value;
        } else if (item.type === 'mapped' && typeof item.value === 'object') {
          const { chaField, chaValue, kfField } = item.value;
          try {
            preview[item.field] = transformedData?.FormStructure[chaField][chaValue][kfField];
          } catch (error) {
            preview[item.field] = null;
          }
        }
      });
      setPreviewValue(preview);
    }
  }, [mappingType, manualValue, selectedChaField, selectedChaValue, selectedKfField, hybridMapping, transformedData]);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Add a field to hybrid mapping
  const addHybridField = () => {
    setHybridMapping([...hybridMapping, { field: '', value: '', type: 'manual' }]);
  };
  
  // Update a hybrid field
  const updateHybridField = (index: number, field: string, value: any, type: 'manual' | 'mapped') => {
    const newMapping = [...hybridMapping];
    newMapping[index] = { field, value, type };
    setHybridMapping(newMapping);
  };
  
  // Remove a hybrid field
  const removeHybridField = (index: number) => {
    const newMapping = [...hybridMapping];
    newMapping.splice(index, 1);
    setHybridMapping(newMapping);
  };
  
  // Handle save
  const handleSave = () => {
    let mapping: FieldMapping = {
      fieldName,
      fieldPath,
      inputType: mappingType
    };
    
    if (mappingType === 'manual') {
      mapping.manualValue = manualValue;
    } else if (mappingType === 'mapped') {
      mapping.mappedConfig = {
        chaField: selectedChaField,
        chaValue: selectedChaValue,
        kfField: selectedKfField
      };
    } else if (mappingType === 'hybrid') {
      mapping.inputType = 'hybrid';
      mapping.hybridMapping = hybridMapping;
    }
    
    onSaveMapping(mapping);
    onClose();
  };
  
  // Render the appropriate content based on the selected tab
  const renderContent = () => {
    if (tabValue === 0) {
      // Configuration Tab
      return (
        <Box sx={{ p: 1 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Mapping Type</InputLabel>
            <Select
              value={mappingType}
              onChange={(e) => setMappingType(e.target.value as 'manual' | 'mapped' | 'hybrid')}
              label="Mapping Type"
            >
              <MenuItem value="manual">Manual Value</MenuItem>
              <MenuItem value="mapped">Mapped Value</MenuItem>
              <MenuItem value="hybrid">Hybrid Mapping</MenuItem>
            </Select>
          </FormControl>
          
          {mappingType === 'manual' && (
            <TextField
              label="Manual Value"
              fullWidth
              value={manualValue === null ? '' : manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              multiline
              maxRows={4}
            />
          )}
          
          {mappingType === 'mapped' && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Characteristic Field</InputLabel>
                <Select
                  value={selectedChaField}
                  onChange={(e) => {
                    setSelectedChaField(e.target.value);
                    setSelectedChaValue('');
                    setSelectedKfField('');
                  }}
                  label="Characteristic Field"
                >
                  {getChaFields().map((field) => (
                    <MenuItem key={field} value={field}>
                      {transformedData?.FormMetadata[field]?.label || field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedChaField}>
                <InputLabel>Characteristic Value</InputLabel>
                <Select
                  value={selectedChaValue}
                  onChange={(e) => {
                    setSelectedChaValue(e.target.value);
                    setSelectedKfField('');
                  }}
                  label="Characteristic Value"
                >
                  {getChaValues().map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth disabled={!selectedChaValue}>
                <InputLabel>Key Figure Field</InputLabel>
                <Select
                  value={selectedKfField}
                  onChange={(e) => setSelectedKfField(e.target.value)}
                  label="Key Figure Field"
                >
                  {getKfFields().map((field) => (
                    <MenuItem key={field} value={field}>
                      {transformedData?.FormMetadata[field]?.label || field}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          
          {mappingType === 'hybrid' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Configure Hybrid Mapping
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a mapping with multiple fields - some manual, some from data.
              </Typography>
              
              {hybridMapping.map((mapping, index) => (
                <Accordion key={index} defaultExpanded={true} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      {mapping.field || `Field ${index + 1}`}
                      <Chip 
                        label={mapping.type} 
                        size="small" 
                        color={mapping.type === 'manual' ? 'primary' : 'secondary'}
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Field Name"
                          fullWidth
                          value={mapping.field}
                          onChange={(e) => updateHybridField(
                            index, 
                            e.target.value, 
                            mapping.value, 
                            mapping.type
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Field Type</InputLabel>
                          <Select
                            value={mapping.type}
                            onChange={(e) => updateHybridField(
                              index, 
                              mapping.field, 
                              mapping.type === e.target.value ? mapping.value : '',
                              e.target.value as 'manual' | 'mapped'
                            )}
                            label="Field Type"
                          >
                            <MenuItem value="manual">Manual Value</MenuItem>
                            <MenuItem value="mapped">Mapped Value</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {mapping.type === 'manual' ? (
                        <Grid item xs={12}>
                          <TextField
                            label="Value"
                            fullWidth
                            value={mapping.value}
                            onChange={(e) => updateHybridField(
                              index, 
                              mapping.field, 
                              e.target.value, 
                              mapping.type
                            )}
                          />
                        </Grid>
                      ) : (
                        <Grid item xs={12}>
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <FormControl fullWidth size="small">
                                <InputLabel>CHA Field</InputLabel>
                                <Select
                                  value={mapping.value?.chaField || ''}
                                  onChange={(e) => {
                                    const newValue = {
                                      ...(typeof mapping.value === 'object' ? mapping.value : {}),
                                      chaField: e.target.value,
                                      chaValue: '',
                                      kfField: ''
                                    };
                                    updateHybridField(index, mapping.field, newValue, mapping.type);
                                  }}
                                  label="CHA Field"
                                >
                                  {getChaFields().map((field) => (
                                    <MenuItem key={field} value={field}>
                                      {transformedData?.FormMetadata[field]?.label || field}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl fullWidth size="small">
                                <InputLabel>CHA Value</InputLabel>
                                <Select
                                  value={mapping.value?.chaValue || ''}
                                  onChange={(e) => {
                                    const newValue = {
                                      ...(typeof mapping.value === 'object' ? mapping.value : {}),
                                      chaValue: e.target.value,
                                      kfField: ''
                                    };
                                    updateHybridField(index, mapping.field, newValue, mapping.type);
                                  }}
                                  label="CHA Value"
                                  disabled={!mapping.value?.chaField}
                                >
                                  {mapping.value?.chaField && transformedData?.FormStructure[mapping.value.chaField] ? 
                                    Object.keys(transformedData.FormStructure[mapping.value.chaField]).map((value) => (
                                      <MenuItem key={value} value={value}>
                                        {value}
                                      </MenuItem>
                                    )) : []
                                  }
                                </Select>
                              </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                              <FormControl fullWidth size="small">
                                <InputLabel>KF Field</InputLabel>
                                <Select
                                  value={mapping.value?.kfField || ''}
                                  onChange={(e) => {
                                    const newValue = {
                                      ...(typeof mapping.value === 'object' ? mapping.value : {}),
                                      kfField: e.target.value
                                    };
                                    updateHybridField(index, mapping.field, newValue, mapping.type);
                                  }}
                                  label="KF Field"
                                  disabled={!mapping.value?.chaField || !mapping.value?.chaValue}
                                >
                                  {mapping.value?.chaField && 
                                   mapping.value?.chaValue && 
                                   transformedData?.FormStructure[mapping.value.chaField]?.[mapping.value.chaValue] ? 
                                    Object.keys(transformedData.FormStructure[mapping.value.chaField][mapping.value.chaValue]).map((field) => (
                                      <MenuItem key={field} value={field}>
                                        {transformedData.FormMetadata[field]?.label || field}
                                      </MenuItem>
                                    )) : []
                                  }
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </Grid>
                      )}
                      
                      <Grid item xs={12} sx={{ textAlign: 'right' }}>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => removeHybridField(index)}
                        >
                          Remove
                        </Button>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
              
              <Button 
                variant="contained" 
                onClick={addHybridField}
                fullWidth
                sx={{ mt: 2 }}
              >
                Add Field
              </Button>
            </Box>
          )}
        </Box>
      );
    } else {
      // Preview Tab
      return (
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Preview
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            backgroundColor: '#f5f5f5',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(previewValue, null, 2)}
            </pre>
          </Box>
          
          {mappingType === 'mapped' && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Mapping Configuration
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      CHA Field
                    </Typography>
                    <Typography>
                      {selectedChaField ? 
                        `${selectedChaField} (${transformedData?.FormMetadata[selectedChaField]?.label || 'Unknown'})` : 
                        'Not selected'
                      }
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      CHA Value
                    </Typography>
                    <Typography>
                      {selectedChaValue || 'Not selected'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      KF Field
                    </Typography>
                    <Typography>
                      {selectedKfField ? 
                        `${selectedKfField} (${transformedData?.FormMetadata[selectedKfField]?.label || 'Unknown'})` : 
                        'Not selected'
                      }
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      );
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Configure Field Mapping: {fieldName}
        <Typography variant="caption" display="block" color="text.secondary">
          Path: {fieldPath}
        </Typography>
      </DialogTitle>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<MapIcon />} label="Configure" />
        <Tab icon={<CodeIcon />} label="Preview" />
      </Tabs>
      
      <DialogContent dividers>
        {renderContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={
            mappingType === 'mapped' && (!selectedChaField || !selectedChaValue || !selectedKfField) ||
            mappingType === 'hybrid' && hybridMapping.length === 0
          }
        >
          Save Mapping
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JSONMappingDialog;