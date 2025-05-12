// components/DashboardBuilder/ConfigPanel/PreviewTab.tsx
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Button } from 'primereact/button';

interface PreviewTabProps {
  previewData: any;
  onGeneratePreview: () => void;
}

const PreviewTab: React.FC<PreviewTabProps> = ({ previewData, onGeneratePreview }) => {
  return (
    <>
      <Box textAlign="center" mb={3}>
        <Button label="Generate Preview" onClick={onGeneratePreview} />
      </Box>

      {previewData ? (
        <Paper elevation={3} className="p-4">
          <Typography variant="subtitle1" gutterBottom>
            Widget Preview Data
          </Typography>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </Paper>
      ) : (
        <Typography color="textSecondary" textAlign="center">
          Click Generate Preview to see how your widget will look with the current configuration
        </Typography>
      )}
    </>
  );
};

export default PreviewTab;