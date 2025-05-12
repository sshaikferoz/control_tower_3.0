// components/DashboardBuilder/ConfigPanel/BasicConfigTab.tsx
import React from 'react';
import { Grid, FormControl, Typography } from '@mui/material';
import { WidgetTypes } from '@/types';
import { widgetConfigFields } from '@/data/widgetConfig';
import { getValueByPath } from '@/utils/widgetHelpers';
import ValueEditor from '@/components/Editors/ValueEditor';

interface BasicConfigTabProps {
  selectedWidget: string | null;
  widgetType: WidgetTypes | null;
  widgetConfigurations: Record<string, any>;
  onValueChange: (field: string, value: any) => void;
}

const BasicConfigTab: React.FC<BasicConfigTabProps> = ({
  selectedWidget,
  widgetType,
  widgetConfigurations,
  onValueChange
}) => {
  // Get configuration fields for the selected widget
  const getWidgetConfigFields = () => {
    return widgetType ? widgetConfigFields[widgetType] || [] : [];
  };

  if (!selectedWidget || !widgetType) {
    return (
      <Typography color="textSecondary">
        Select a widget to configure it
      </Typography>
    );
  }

  return (
    <Grid container spacing={2}>
      {getWidgetConfigFields().map(({ field, path }) => {
        const value = widgetConfigurations[selectedWidget] 
          ? getValueByPath(widgetConfigurations[selectedWidget], path)
          : undefined;
        
        return (
          <Grid item xs={12} key={field}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <Typography variant="subtitle2">{field}</Typography>
              <ValueEditor 
                field={field} 
                value={value} 
                widgetType={widgetType} 
                onChange={onValueChange} 
              />
            </FormControl>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default BasicConfigTab;