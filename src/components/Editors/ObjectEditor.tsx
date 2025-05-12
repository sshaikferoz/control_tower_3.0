// components/Editors/ObjectEditor.tsx
import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, TextField } from '@mui/material';
import { ObjectEditorProps } from '@/types';
import { isObject, isArray } from '@/utils/widgetHelpers';
import ArrayEditor from './ArrayEditor';

const ObjectEditor: React.FC<ObjectEditorProps> = ({ value, onChange, objectStructure, title }) => {
  // Initialize with empty object if value is undefined, null, or not an object
  const [object, setObject] = useState(
    isObject(value) ? value : (isObject(objectStructure) ? { ...objectStructure } : {})
  );

  // Function to update a property
  const updateProperty = (property: string, newValue: any) => {
    const updatedObject = { ...object, [property]: newValue };
    setObject(updatedObject);
    onChange(updatedObject);
  };

  // Generate field editors based on the object structure
  const renderFieldEditors = () => {
    // Make sure objectStructure is an object
    const safeStructure = isObject(objectStructure) ? objectStructure : {};
    
    return Object.keys(safeStructure).map((key) => {
      let fieldValue = object[key];
      if (fieldValue === undefined) {
        fieldValue = safeStructure[key];
      }
      
      if (isArray(safeStructure[key])) {
        // If the property is an array, use the ArrayEditor
        const itemStructure = isArray(safeStructure[key]) && safeStructure[key].length > 0 ? 
          { ...safeStructure[key][0] } : {};
        
        return (
          <Box key={key} mb={2}>
            <ArrayEditor
              title={`${key} (Array)`}
              value={isArray(fieldValue) ? fieldValue : []}
              onChange={(newValue) => updateProperty(key, newValue)}
              itemStructure={itemStructure}
            />
          </Box>
        );
      } else if (isObject(safeStructure[key])) {
        // If the property is an object, use the ObjectEditor recursively
        return (
          <Box key={key} mb={2}>
            <ObjectEditor
              title={`${key} (Object)`}
              value={isObject(fieldValue) ? fieldValue : {}}
              onChange={(newValue) => updateProperty(key, newValue)}
              objectStructure={safeStructure[key]}
            />
          </Box>
        );
      } else {
        // For primitive values, use a simple TextField
        return (
          <Box key={key} mb={1}>
            <TextField
              label={key}
              value={fieldValue !== undefined ? String(fieldValue) : ""}
              onChange={(e) => updateProperty(key, e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
            />
          </Box>
        );
      }
    });
  };

  // Update object when value prop changes
  useEffect(() => {
    // Make sure value is an object before setting it
    setObject(isObject(value) ? value : (isObject(objectStructure) ? { ...objectStructure } : {}));
  }, [value, objectStructure]);

  return (
    <Box my={2}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <Paper elevation={1} sx={{ p: 2 }}>
        {Object.keys(isObject(objectStructure) ? objectStructure : {}).length > 0 ? (
          renderFieldEditors()
        ) : (
          <Typography color="textSecondary">
            No properties defined for this object
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ObjectEditor;