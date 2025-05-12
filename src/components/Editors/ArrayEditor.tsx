// components/Editors/ArrayEditor.tsx
import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemSecondaryAction, 
  IconButton, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Divider, 
  TextField 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from 'primereact/button';
import { ArrayEditorProps } from '@/types';
import { isArray } from '@/utils/widgetHelpers';

const ArrayEditor: React.FC<ArrayEditorProps> = ({ value, onChange, itemStructure, title }) => {
  // Initialize with an empty array if value is undefined, null, or not an array
  const [items, setItems] = useState(isArray(value) ? value : []);

  // Function to add a new item based on the item structure
  const addItem = () => {
    const newItem = { ...itemStructure };
    const newItems = [...items, newItem];
    setItems(newItems);
    onChange(newItems);
  };

  // Function to remove an item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems);
  };

  // Function to update an item's property
  const updateItemProperty = (index: number, property: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [property]: value };
    setItems(newItems);
    onChange(newItems);
  };

  // Generate field editors based on the item structure
  const renderFieldEditors = (item: any, index: number) => {
    return Object.keys(itemStructure).map((key) => {
      const value = item[key] !== undefined ? item[key] : itemStructure[key];
      return (
        <Box key={`${index}-${key}`} mb={1}>
          <TextField
            label={key}
            value={value !== undefined ? value : ""}
            onChange={(e) => updateItemProperty(index, key, e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
          />
        </Box>
      );
    });
  };

  // Update items when value prop changes
  useEffect(() => {
    // Make sure value is an array before setting it
    setItems(isArray(value) ? value : []);
  }, [value]);

  return (
    <Box my={2}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <List>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <Box width="100%">
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Item {index + 1}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {renderFieldEditors(item, index)}
                  </AccordionDetails>
                </Accordion>
              </Box>
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            {index < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Button 
        label="Add Item" 
        icon={<AddIcon />}
        className="mt-2"
        onClick={addItem}
      />
    </Box>
  );
};

export default ArrayEditor;