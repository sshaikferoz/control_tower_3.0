import React from 'react';
import { TextField } from '@mui/material';
import { ValueEditorProps, WidgetTypes } from '@/types';
import { isArray, isObject, parseComplexValue } from '@/utils/widgetHelpers';
import { defaultPropsMapping } from '@/data/widgetDefaults';
import { widgetConfigFields } from '@/data/widgetConfig';
import ArrayEditor from './ArrayEditor';
import ObjectEditor from './ObjectEditor';

const ValueEditor: React.FC<ValueEditorProps> = ({ field, value, widgetType, onChange }) => {
  if (!widgetType) return null;
  
  try {
    // Get default structure for this field from default props
    const fieldConfig = widgetConfigFields[widgetType]?.find((f) => f.field === field);
    const fieldPath = fieldConfig?.path || "";
    const pathParts = fieldPath.split('.');
    
    // Navigate to the default value based on the path
    let defaultValue = defaultPropsMapping[widgetType];
    for (const part of pathParts) {
      if (!defaultValue) break;
      defaultValue = defaultValue[part];
    }
    
    // Parse string value that might be JSON
    if (typeof value === 'string') {
      value = parseComplexValue(value);
    }
    
    if (isArray(value) || (value === undefined && isArray(defaultValue))) {
      // Use ArrayEditor for arrays
      const safeValue = isArray(value) ? value : (isArray(defaultValue) ? [...defaultValue] : []);
      const itemStructure = safeValue.length > 0 ? 
        { ...safeValue[0] } : (isArray(defaultValue) && defaultValue.length > 0 ? 
          { ...defaultValue[0] } : {});
      
      // Provide defaults for any empty objects
      if (Object.keys(itemStructure).length === 0) {
        // Try to infer structure from widget type and field name
        if (field === 'data' && widgetType === WidgetTypes.BAR_CHART) {
          itemStructure.name = '';
          itemStructure.value = 0;
          itemStructure.fill = '#83bd01';
        } else if (field === 'data' && (widgetType === WidgetTypes.STACKED_BAR_CHART || widgetType === WidgetTypes.DUAL_LINE_CHART)) {
          itemStructure.name = '';
          // Add some default keys based on widget type
          if (widgetType === WidgetTypes.STACKED_BAR_CHART) {
            itemStructure.Supplier1 = 0;
            itemStructure.Supplier2 = 0;
          } else {
            itemStructure.line1 = 0;
            itemStructure.line2 = 0;
          }
        } else if (field === 'menuItems' && widgetType === WidgetTypes.LOANS_APP_TRAY) {
          itemStructure.id = 0;
          itemStructure.label = '';
          itemStructure.count = 0;
        } else {
          // Generic defaults
          itemStructure.name = '';
          itemStructure.value = 0;
        }
      }
      
      return (
        <ArrayEditor
          title={`${field} (Array)`}
          value={safeValue}
          onChange={(newValue) => onChange(field, newValue)}
          itemStructure={itemStructure}
        />
      );
    } else if (isObject(value) || (value === undefined && isObject(defaultValue))) {
      // Use ObjectEditor for objects with proper defaults
      const safeValue = isObject(value) ? value : (isObject(defaultValue) ? {...defaultValue} : {});
      const objectStructure = isObject(defaultValue) ? defaultValue : safeValue;
      
      // Provide defaults for any empty objects
      if (Object.keys(objectStructure).length === 0) {
        // Try to infer structure from widget type and field name
        if (field === 'metrics' && widgetType === WidgetTypes.TWO_METRICS_PIECHART) {
          objectStructure.amount = '';
          objectStructure.percentage = '';
          objectStructure.label = '';
        } else if (field.includes('metric_data') && widgetType === WidgetTypes.TWO_METRICS_LINECHART) {
          objectStructure.metric_value = '';
          objectStructure.metric_variance = '';
          objectStructure.metric_label = '';
        } else {
          // Generic defaults
          objectStructure.title = '';
          objectStructure.value = '';
        }
      }
      
      return (
        <ObjectEditor
          title={`${field} (Object)`}
          value={safeValue}
          onChange={(newValue) => onChange(field, newValue)}
          objectStructure={objectStructure}
        />
      );
    } else {
      // Use TextField for primitive values
      return (
        <TextField
          label={`Value for ${field}`}
          value={value !== undefined ? String(value) : ""}
          onChange={(e) => onChange(field, e.target.value)}
          fullWidth
          margin="normal"
          size="small"
        />
      );
    }
  } catch (error) {
    console.error(`Error rendering editor for field ${field}:`, error);
    // Fallback to simple text field
    return (
      <TextField
        label={`Value for ${field} (Error in editor)`}
        value={typeof value === 'object' ? JSON.stringify(value) : (value || "")}
        onChange={(e) => onChange(field, e.target.value)}
        fullWidth
        margin="normal"
        size="small"
      />
    );
  }
};

export default ValueEditor;