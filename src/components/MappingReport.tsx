import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';

interface MappingReportProps {
  mappings: {
    widgetId: string;
    widgetType: string;
    mappingConfig: any;
  }[];
}

export const MappingReport: React.FC<MappingReportProps> = ({ mappings }) => {
  // Count types of mappings used
  const countMappingTypes = () => {
    const counts = {
      manual: 0,
      mapped: 0,
      total: 0
    };
    
    mappings.forEach(mapping => {
      Object.values(mapping.mappingConfig || {}).forEach((config: any) => {
        counts.total++;
        if (config.inputType === 'manual') {
          counts.manual++;
        } else if (config.inputType === 'mapped') {
          counts.mapped++;
        }
      });
    });
    
    return counts;
  };
  
  const mappingCounts = countMappingTypes();
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Dashboard Mapping Report
      </Typography>
      
      <Box display="flex" justifyContent="space-around" mb={3}>
        <Paper elevation={1} sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h4">{mappings.length}</Typography>
          <Typography variant="body2" color="text.secondary">Widgets</Typography>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h4">{mappingCounts.total}</Typography>
          <Typography variant="body2" color="text.secondary">Total Fields</Typography>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h4">{mappingCounts.mapped}</Typography>
          <Typography variant="body2" color="text.secondary">Mapped Fields</Typography>
        </Paper>
        
        <Paper elevation={1} sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h4">{mappingCounts.manual}</Typography>
          <Typography variant="body2" color="text.secondary">Manual Fields</Typography>
        </Paper>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Widget ID</TableCell>
              <TableCell>Widget Type</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Mapping Type</TableCell>
              <TableCell>Data Source</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mappings.map(({ widgetId, widgetType, mappingConfig }) => 
              Object.entries(mappingConfig || {}).map(([field, config]: [string, any]) => (
                <TableRow key={`${widgetId}-${field}`}>
                  <TableCell>{widgetId}</TableCell>
                  <TableCell>{widgetType}</TableCell>
                  <TableCell>{field}</TableCell>
                  <TableCell>
                    <Chip 
                      label={config.inputType || 'unknown'} 
                      color={config.inputType === 'mapped' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {config.inputType === 'mapped' && config.mappedConfig ? (
                      <>
                        {config.mappedConfig.chaField}.{config.mappedConfig.chaValue}.{config.mappedConfig.kfField}
                        {config.mappedConfig.path && ` (${config.mappedConfig.path})`}
                      </>
                    ) : config.inputType === 'manual' ? (
                      <Typography variant="body2" color="text.secondary">
                        Manual value
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No mapping
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};