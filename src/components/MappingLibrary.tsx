import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { WidgetConfigMapping, WidgetTypes } from '@/components/field-mapping';

interface MappingConfig {
  id: string;
  name: string;
  description: string;
  widgetType: WidgetTypes;
  mappingConfig: WidgetConfigMapping;
}

interface MappingLibraryProps {
  onLoadMapping: (mapping: MappingConfig) => void;
  currentMapping?: WidgetConfigMapping;
  widgetType?: WidgetTypes;
}

export const MappingLibrary: React.FC<MappingLibraryProps> = ({
  onLoadMapping,
  currentMapping,
  widgetType
}) => {
  const [mappings, setMappings] = useState<MappingConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [newMappingName, setNewMappingName] = useState<string>('');
  const [newMappingDescription, setNewMappingDescription] = useState<string>('');
  
  // Fetch saved mappings
  const fetchMappings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, make API call
      // const response = await fetch('/api/dashboard-mapping');
      // const data = await response.json();
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMappings = [
        {
          id: 'mapping-1',
          name: 'Basic Inventory KPIs',
          description: 'Maps inventory KPIs to standard dashboard widgets',
          widgetType: 'one-metric',
          mappingConfig: {
            name: {
              inputType: 'manual',
              manualValue: 'Active Inventory'
            },
            value: {
              inputType: 'mapped',
              mappedConfig: {
                chaField: 'ZSCMCMD',
                chaValue: 'Overall Result',
                kfField: 'VALUE002'
              }
            }
          }
        },
        {
          id: 'mapping-2',
          name: 'Spend Analysis',
          description: 'Maps spend analysis data to stacked bar chart',
          widgetType: 'stacked-bar-chart',
          mappingConfig: {
            title: {
              inputType: 'manual',
              manualValue: 'Spend by Category'
            },
            data: {
              inputType: 'mapped',
              mappedConfig: {
                chaField: 'ZSCMCMD',
                chaValue: 'custom',
                kfField: 'custom',
                path: 'chartData'
              }
            }
          }
        }
      ];
      
      setMappings(mockMappings);
    } catch (err) {
      console.error("Error fetching mappings:", err);
      setError("Failed to fetch saved mappings.");
    } finally {
      setLoading(false);
    }
  };
  
  // Save current mapping
  const saveMapping = async () => {
    if (!currentMapping || !widgetType) return;
    
    try {
      // In a real implementation, make API call
      // const response = await fetch('/api/dashboard-mapping', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: newMappingName,
      //     description: newMappingDescription,
      //     widgetType,
      //     mappingConfig: currentMapping
      //   })
      // });
      // const savedMapping = await response.json();
      
      // For now, simulate saving
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedMapping = {
        id: `mapping-${Date.now()}`,
        name: newMappingName,
        description: newMappingDescription,
        widgetType,
        mappingConfig: currentMapping
      };
      
      // Add to list of mappings
      setMappings(prev => [...prev, savedMapping]);
      
      // Close dialog
      setSaveDialogOpen(false);
      setNewMappingName('');
      setNewMappingDescription('');
    } catch (err) {
      console.error("Error saving mapping:", err);
      setError("Failed to save mapping configuration.");
    }
  };
  
  // Delete a mapping
  const deleteMapping = async (id: string) => {
    try {
      // In a real implementation, make API call
      // await fetch(`/api/dashboard-mapping/${id}`, {
      //   method: 'DELETE'
      // });
      
      // For now, just update local state
      setMappings(prev => prev.filter(mapping => mapping.id !== id));
    } catch (err) {
      console.error("Error deleting mapping:", err);
      setError("Failed to delete mapping.");
    }
  };
  
  // Load mappings on component mount
  useEffect(() => {
    fetchMappings();
  }, []);
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Mapping Library</Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          disabled={!currentMapping || !widgetType}
        >
          Save Current Mapping
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box my={2}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchMappings} sx={{ mt: 1 }}>
            Retry
          </Button>
        </Box>
      ) : (
        <Paper elevation={1}>
          <List>
            {mappings.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No saved mappings found" 
                  secondary="Save your current mapping configuration to add it to the library"
                />
              </ListItem>
            ) : (
              mappings.map((mapping) => (
                <React.Fragment key={mapping.id}>
                  <ListItem>
                    <ListItemText
                      primary={mapping.name}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {mapping.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Widget Type: {mapping.widgetType}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="load"
                        onClick={() => onLoadMapping(mapping)}
                        sx={{ mr: 1 }}
                      >
                        <FolderOpenIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => deleteMapping(mapping.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      )}
      
      {/* Save Mapping Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Mapping Configuration</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Mapping Name"
            fullWidth
            value={newMappingName}
            onChange={(e) => setNewMappingName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newMappingDescription}
            onChange={(e) => setNewMappingDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={saveMapping}
            variant="contained"
            disabled={!newMappingName}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};