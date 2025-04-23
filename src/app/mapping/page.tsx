/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SidebarMapping from "@/components/SidebarMapping";
// import { useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import MultiMetrics from "@/grid-components/MultiMetrics";
import PieMetric from "@/grid-components/PieMetric";
import SimpleMetric from "@/grid-components/SimpleMetric";
import SimpleMetricDate from "@/grid-components/SimpleMetricDate";
import SingleLineChart from "@/grid-components/SingleLineChart";
import TableMetric from "@/grid-components/TableMetric";
import BarMetric from "@/grid-components/BarMetric";
import StackedBarChart from "@/grid-components/StackedBarChart";
import OrdersLineChart from "@/grid-components/OrdersLineChart";
import DualLineChart from "@/grid-components/DualLineChart";
import PieChartWithTotal from "@/grid-components/PieChartWithTotal";
import QuadrantMetrics from "@/grid-components/QuadrantMetrics";
import LoansAppTray from "@/grid-components/LoansAppTray";

import { Button } from "primereact/button";
import { Splitter, SplitterPanel } from "primereact/splitter";
import {
    TextField,
    FormControl,
    Typography,
    Box,
    Tabs,
    Tab,
    Grid,
    Paper,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemSecondaryAction,
    Divider
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { widgetConfigFields, WidgetTypes } from "@/helpers/types";
import mirageServer from "@/lib/mirage/mirageServer";

// Setup GridLayout with width provider
const GridLayout = WidthProvider(RGL);

// Component mapping
const widgetMapping:any = {
    "two-metrics": MultiMetrics,
    "two-metrics-piechart": PieMetric,
    "one-metric": SimpleMetric,
    "one-metric-date": SimpleMetricDate,
    "two-metrics-linechart": SingleLineChart,
    "one-metric-table": TableMetric,
    "bar-chart": BarMetric,
    "stacked-bar-chart": StackedBarChart,
    "orders-line-chart": OrdersLineChart,
    "dual-line-chart": DualLineChart,
    "pie-chart-total": PieChartWithTotal,
    "quadrant-metrics": QuadrantMetrics,
    "loans-app-tray": LoansAppTray
};

// Widget size configurations
const widgetSizes:any = {
    "one-metric": { w: 2, h: 1.5 },
    "one-metric-date": { w: 2, h: 1.5 },
    "two-metrics-linechart": { w: 4, h: 3 },
    "two-metrics": { w: 2.5, h: 1.5 },
    "two-metrics-piechart": { w: 2.5, h: 1.5 },
    "one-metric-table": { w: 3, h: 3 },
    "bar-chart": { w: 2.5, h: 3 },
    "stacked-bar-chart": { w: 6, h: 3 },
    "orders-line-chart": { w: 4, h: 3 },
    "dual-line-chart": { w: 4, h: 3 },
    "pie-chart-total": { w: 2.5, h: 3 },
    "quadrant-metrics": { w: 4, h: 3 },
    "loans-app-tray": { w: 6, h: 3 }
};

// Default widget props for preview
const defaultPropsMapping:any= {
    "one-metric": { name: "Active Contracts", value: 45 },
    "one-metric-date": {
        name: "Open PO Orders",
        value: 18,
        date: "13-Aug-2024",
    },
    "two-metrics": {
        metric1: "Long Form",
        value1: "12.3",
        metric2: "Short & Mid-Form",
        value2: "135",
    },
    "two-metrics-linechart": {
        data: {
            chart_data: [
                { date: "01-01-2024", Actual: 50, unit: "%" },
                { date: "01-02-2024", Actual: 100, unit: "%" },
                { date: "01-03-2024", Actual: 90, unit: "%" },
                { date: "01-04-2024", Actual: 150, unit: "%" },
                { date: "01-05-2024", Actual: 120, unit: "%" },
                { date: "01-06-2024", Actual: 195, unit: "%" },
            ],
            chart_yaxis: "Actual",
            metric_data: {
                metric_value: "$142",
                metric_variance: "+5.40%",
                metric_label: "Received Payments",
            },
            widget_name: "Successful Payments",
        },
    },
    "two-metrics-piechart": {
        data: [
            { label: "Flaring Intensity", value: 30, fill: "#84BD00" },
            { label: "SO2 Emissions", value: 70, fill: "#E1553F" },
        ],
        metrics: {
            amount: "$234K",
            percentage: "0.31%",
            label: "Contracts Under Development",
        },
    },
    "one-metric-table": {
        totalAmount: "$15,223,050",
        data: [
            { supplier_name: "Reliable Suppliers", contracts: 7, value: "$52,345" },
            { supplier_name: "Supply Solutions", contracts: 5, value: "$42,345" },
        ],
    },
    "bar-chart": {
        data: [
            { name: '2024', value: 163000, fill: '#83bd01' },
            { name: '2025', value: 118000, fill: '#FFC846' }
        ],
        title: "Spend Comparison",
        variance: "+5.40%"
    },
    "stacked-bar-chart": {
        data: [
            { name: 'Jan', Supplier1: 400, Supplier2: 240, Supplier3: 100 },
            { name: 'Feb', Supplier1: 300, Supplier2: 200, Supplier3: 150 },
            { name: 'Mar', Supplier1: 450, Supplier2: 220, Supplier3: 180 },
            { name: 'Apr', Supplier1: 470, Supplier2: 260, Supplier3: 120 },
            { name: 'May', Supplier1: 390, Supplier2: 210, Supplier3: 160 },
            { name: 'Jun', Supplier1: 520, Supplier2: 280, Supplier3: 220 }
        ],
        title: "Top Spend Supplier",
        series: [
            { name: "Supplier A", dataKey: "Supplier1", color: "#84BD00" },
            { name: "Supplier B", dataKey: "Supplier2", color: "#FFC846" },
            { name: "Supplier C", dataKey: "Supplier3", color: "#8979FF" }
        ]
    },
    "orders-line-chart": {
        data: [
            { name: 'Jan', value: 120000 },
            { name: 'Feb', value: 150000 },
            { name: 'Mar', value: 180000 },
            { name: 'Apr', value: 140000 },
            { name: 'May', value: 160000 },
            { name: 'Jun', value: 190000 },
            { name: 'Jul', value: 175000 },
            { name: 'Aug', value: 195000 },
            { name: 'Sep', value: 165000 },
            { name: 'Oct', value: 185000 },
            { name: 'Nov', value: 205000 },
            { name: 'Dec', value: 220000 }
        ],
        title: "Last 12 Months Orders",
        totalValue: "$235MM"
    },
    "dual-line-chart": {
        data: [
            { name: 'Jan', line1: 10000, line2: 15000 },
            { name: 'Feb', line1: 12000, line2: 18000 },
            { name: 'Mar', line1: 15000, line2: 14000 },
            { name: 'Apr', line1: 13000, line2: 19000 },
            { name: 'May', line1: 17000, line2: 16000 },
            { name: 'Jun', line1: 20000, line2: 21000 }
        ],
        title: "Spend Trends",
        series: [
            { name: "Contract Spend", dataKey: "line1", color: "#5899DA" },
            { name: "Material Spend", dataKey: "line2", color: "#FFC846" }
        ]
    },
    "pie-chart-total": {
        data: [
            { name: "Segment 1", value: 2000, fill: "#84BD00" },
            { name: "Segment 2", value: 1128, fill: "#E1553F" }
        ],
        title: "With P&SCM Buyers",
        totalValue: "$3,128B",
        subValue: "$339.1B",
        variance: "+23.98%"
    },
    "quadrant-metrics": {
        metrics: [
            { title: "In Process", value: "53", position: "top-left" },
            { title: "With Supplier", value: "18", position: "top-right" },
            { title: "B2B Order", value: "1,335", position: "bottom-left" },
            { title: "Completed Order", value: "1,247", position: "bottom-right" }
        ]
    },
    "loans-app-tray": {
        menuItems: [
            {
                id: 1,
                icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector.svg`,
                label: "Open PR",
                count: 13,
            },
            {
                id: 2,
                icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003443.png`,
                label: "Contract Expiring",
                count: 85,
            },
            {
                id: 3,
                icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/group-1000003444.png`,
                label: "Pending SES",
                count: 32,
            },
            {
                id: 4,
                icon: `${process.env.NEXT_PUBLIC_BSP_NAME}/vector-1.svg`,
                label: "Contract with 80%\nConsumed Values",
                count: 24,
            },
        ],
        chartData: [
            { name: 'PR', value: 86, color: '#449ca4' },
            { name: 'CE', value: 156, color: '#5899da' },
            { name: 'SES', value: 114, color: '#ffaa04' },
            { name: 'CV', value: 126, color: '#ff0000' }
        ]
    }
};

// MirageJS mock API server setup
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    mirageServer();
}

// TabPanel component for the tabbed interface
function TabPanel({ children, value, index, ...other }:any) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`mapping-tabpanel-${index}`}
            aria-labelledby={`mapping-tab-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
}

// Helper function to determine if a value is an array
const isArray = (value:any) => {
    return Array.isArray(value);
};

// Helper function to determine if a value is an object
const isObject = (value:any) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Function to parse a string that might be a JSON array or object
const parseComplexValue = (value:any) => {
    try {
        if ((value.startsWith('[') && value.endsWith(']')) || 
            (value.startsWith('{') && value.endsWith('}'))) {
            return JSON.parse(value);
        }
    } catch (e: any) {
        console.log(e)
        // Return the original string if parsing fails
    }
    return value;
};

// Array Editor Component
const ArrayEditor = ({ value, onChange, itemStructure, title }:any) => {
    // Initialize with an empty array if value is undefined, null, or not an array
    const [items, setItems] = useState(Array.isArray(value) ? value : []);

    // Function to add a new item based on the item structure
    const addItem = () => {
        const newItem = { ...itemStructure };
        const newItems = [...items, newItem];
        setItems(newItems);
        onChange(newItems);
    };

    // Function to remove an item
    const removeItem = (index:any) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        onChange(newItems);
    };

    // Function to update an item's property
    const updateItemProperty = (index:any, property:any, value:any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [property]: value };
        setItems(newItems);
        onChange(newItems);
    };

    // Generate field editors based on the item structure
    const renderFieldEditors = (item:any, index:any) => {
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
        setItems(Array.isArray(value) ? value : []);
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
                onClick={addItem} 
                icon={<AddIcon />}
                className="mt-2" 
            />
        </Box>
    );
};

// Object Editor Component
const ObjectEditor = ({ value, onChange, objectStructure, title }:any) => {
    // Initialize with empty object if value is undefined, null, or not an object
    const [object, setObject] = useState(
        isObject(value) ? value : (isObject(objectStructure) ? { ...objectStructure } : {})
    );

    // Function to update a property
    const updateProperty = (property:any, newValue:any) => {
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
                            onChange={(newValue:any) => updateProperty(key, newValue)}
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
                            onChange={(newValue:any) => updateProperty(key, newValue)}
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

// Function to render appropriate editor based on value type
const renderValueEditor = (field:any, value:any, widgetType:WidgetTypes, handleManualValueChange:any) => {
    if (!widgetType) return null;
    
    try {
        // Get default structure for this field from default props
        const fieldConfig = widgetConfigFields[widgetType]?.find((f:any) => f.field === field);
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
                if (field === 'data' && widgetType === 'bar-chart') {
                    itemStructure.name = '';
                    itemStructure.value = 0;
                    itemStructure.fill = '#83bd01';
                } else if (field === 'data' && (widgetType === 'stacked-bar-chart' || widgetType === 'dual-line-chart')) {
                    itemStructure.name = '';
                    // Add some default keys based on widget type
                    if (widgetType === 'stacked-bar-chart') {
                        itemStructure.Supplier1 = 0;
                        itemStructure.Supplier2 = 0;
                    } else {
                        itemStructure.line1 = 0;
                        itemStructure.line2 = 0;
                    }
                } else if (field === 'menuItems' && widgetType === 'loans-app-tray') {
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
                    onChange={(newValue:any) => handleManualValueChange(field, newValue)}
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
                if (field === 'metrics' && widgetType === 'two-metrics-piechart') {
                    objectStructure.amount = '';
                    objectStructure.percentage = '';
                    objectStructure.label = '';
                } else if (field.includes('metric_data') && widgetType === 'two-metrics-linechart') {
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
                    onChange={(newValue:any) => handleManualValueChange(field, newValue)}
                    objectStructure={objectStructure}
                />
            );
        } else {
            // Use TextField for primitive values
            return (
                <TextField
                    label={`Value for ${field}`}
                    value={value !== undefined ? String(value) : ""}
                    onChange={(e) => handleManualValueChange(field, e.target.value)}
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
                onChange={(e) => handleManualValueChange(field, e.target.value)}
                fullWidth
                margin="normal"
                size="small"
            />
        );
    }
};

// Helper function to get value from an object by path
const getValueByPath = (obj:any, path:any) => {
    if (!obj || !path) return undefined;
    
    const pathParts = path.split('.');
    let current = obj;
    
    for (const part of pathParts) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[part];
    }
    
    return current;
};

// Helper function to set value in an object by path
const setValueByPath = (obj:any, path:any, value:any) => {
    if (!obj || !path) return obj;
    
    const result = { ...obj };
    const pathParts = path.split('.');
    let current = result;
    
    // Navigate to the right location in the object
    for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        
        // If we're dealing with array notation like data[0]
        if (part.includes('[') && part.includes(']')) {
            const arrName = part.substring(0, part.indexOf('['));
            const index = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
            
            if (!current[arrName]) {
                current[arrName] = [];
            }
            while (current[arrName].length <= index) {
                current[arrName].push({});
            }
            current = current[arrName][index];
        } else {
            // Regular object path
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
    }
    
    // Set the value at the final property
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;
    
    return result;
};

// Function to parse value to appropriate type
const parseValueType = (value:any) => {
    // Try to parse as number
    if (!isNaN(Number(value)) && value !== "") {
        return Number(value);
    }
    
    // Try to parse as boolean
    if (value === "true" || value === "false") {
        return value === "true";
    }
    
    // Try to parse as JSON object/array
    if ((value.startsWith('{') && value.endsWith('}')) || 
        (value.startsWith('[') && value.endsWith(']'))) {
        try {
            return JSON.parse(value);
        } catch (e: any) {
            console.log(e)
            // Return as string if parsing fails
            return value;
        }
    }
    
    // Return as string
    return value;
};

const MappingScreen = () => {
    // const searchParams = useSearchParams();
    let sectionName:any = "";
    let isExpanded:any = "";
    if (typeof window !== "undefined") { 
    const searchParams = new URLSearchParams(window.location.search)
     sectionName = searchParams.get('sectionName');
     isExpanded = searchParams.get('expanded');
    }
    
    const [widgets, setWidgets] = useState<any>([]);
    const [layout, setLayout] = useState<any>([]);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [previewData, setPreviewData] = useState<any>(null);
    const [widgetConfigurations, setWidgetConfigurations] = useState<any>({});

    // Initialize widget configuration when a new widget is added
    const initializeWidgetConfig = (widgetId:any, widgetName:any) => {
        // Store the default widget props in widgetConfigurations
        setWidgetConfigurations((prev:any) => ({
            ...prev,
            [widgetId]: {
                ...JSON.parse(JSON.stringify(defaultPropsMapping[widgetName])), // Deep copy
                widgetType: widgetName
            }
        }));
    };

    // Add a new widget to the layout
    const addWidget = (name:any) => {
        if (!widgetMapping[name]) return;
        
        const widgetId = `widget-${Date.now()}`;
        const { w, h } = widgetSizes[name] || { w: 2, h: 2 };

        // Add widget to widgets array
        setWidgets((prev:any) => [...prev, { id: widgetId, name, props: {} }]);

        // Add to layout
        setLayout((prev:any) => [
            ...prev,
            { i: widgetId, x: 0, y: Infinity, w, h, static: false }
        ]);

        // Initialize widget configuration with default props
        initializeWidgetConfig(widgetId, name);
    };

    // Remove a widget from the layout
    const removeWidget = (id:any) => {
        setWidgets((prev:any) => prev.filter((widget:any) => widget.id !== id));
        setLayout((prev:any) => prev.filter((item:any) => item.i !== id));
        
        // Remove from widgetConfigurations
        setWidgetConfigurations((prev:any) => {
            const newConfigs = { ...prev };
            delete newConfigs[id];
            return newConfigs;
        });
    
        if (selectedWidget === id) {
            setSelectedWidget(null);
            setPreviewData(null);
        }
    };

    // Handle widget selection
    const handleWidgetClick = (id:any, event:any) => {
        event.stopPropagation();
        if (selectedWidget === id) return;
        
        // Save preview data to widget configurations if it exists
        if (selectedWidget && previewData) {
            setWidgetConfigurations((prev:any) => ({
                ...prev,
                [selectedWidget]: {
                    ...prev[selectedWidget],
                    ...previewData
                }
            }));
        }
        
        // Now select the new widget
        setSelectedWidget(id);
        
        // Reset preview data
        setPreviewData(null);
        
        // Reset tab to first tab
        setTabValue(0);
    };

    // Get the type of the currently selected widget
    const getSelectedWidgetType = () => {
        if (!selectedWidget) return null;
        const widget = widgets.find((w:any) => w.id === selectedWidget);
        return widget ? widget.name : null;
    };

    // Get configuration fields for the selected widget
    const getWidgetConfigFields = () => {
        const widgetType:WidgetTypes = getSelectedWidgetType();
        return widgetType ?
            widgetConfigFields[widgetType] || []
            : [];
    };

    // Handle tab change
    const handleTabChange = (event:any, newValue:any) => {
        setTabValue(newValue);
    };

    // Function to handle manual value change for a field
    const handleManualValueChange = (field:any, value:any) => {
        if (!selectedWidget) return;
        
        let processedValue = value;
        
        // If value is string but looks like it might be an object/array
        if (typeof value === 'string') {
            processedValue = parseValueType(value);
        }
        
        // Find the field configuration to get the path
        const widgetType:WidgetTypes = getSelectedWidgetType();
        const fieldConfig = widgetConfigFields[widgetType]?.find(f => f.field === field);
        
        if (fieldConfig && fieldConfig.path) {
            // Update the widget configuration by setting the value at the path
            setWidgetConfigurations((prev:any) => {
                const updatedConfig = JSON.parse(JSON.stringify(prev[selectedWidget] || {}));
                return {
                    ...prev,
                    [selectedWidget]: setValueByPath(updatedConfig, fieldConfig.path, processedValue)
                };
            });
        } else {
            // If no path found, set directly on the root object
            setWidgetConfigurations((prev:any) => ({
                ...prev,
                [selectedWidget]: {
                    ...(prev[selectedWidget] || {}),
                    [field]: processedValue
                }
            }));
        }
    };

    // Generate preview data based on current configuration
    const generatePreview = () => {
        if (!selectedWidget) return;

        // Use the current widget configuration directly
        const previewProps = JSON.parse(JSON.stringify(widgetConfigurations[selectedWidget] || {}));
        
        // Update preview data state
        setPreviewData(previewProps);
    };

    // Save the layout to session storage
    const saveLayout = () => {
        // Create widgets with the final configured props
        const widgetsWithProps = widgets.map((widget:any) => {
            const widgetConfig = widgetConfigurations[widget.id] || 
                                 defaultPropsMapping[widget.name] || {};
            
            // Remove any technical metadata like widgetType
            const { widgetType, ...cleanProps } = widgetConfig;
            
            console.log(widgetType);
            
            return {
                ...widget,
                props: cleanProps
            };
        });

        // Create layout with section information
        const layoutWithSection = layout.map((item:any) => ({
            ...item,
            sectionName: sectionName
        }));

        // Create the section entry
        const sectionEntry = {
            sectionName: sectionName,
            layout: layoutWithSection,
            widgets: widgetsWithProps,
            expanded: isExpanded === "true"
        };

        console.log("Saving section:", sectionEntry);

        // Get existing payload or initialize as empty array
        let payload = JSON.parse(sessionStorage.getItem("payload") || "[]");
        if (typeof payload === "string") {
            payload = JSON.parse(payload);
        }

        // Add the new section
        payload.push(sectionEntry);

        // Save back to session storage
        sessionStorage.setItem("payload", JSON.stringify(payload));

        alert("Layout saved successfully!");

        // Navigate to the dashboard page
        window.location.href = "/";
    };

    return (
        
        <>
        <Suspense>
        <div className="relative w-full h-screen flex">
          
            {/* Sidebar with widget options */}
            <div className="h-full bg-white">
                <SidebarMapping onItemClick={addWidget} />
            </div>

            {/* Main content area with splitter */}
            <Splitter className="w-full h-100vh overflow-y-auto" layout="vertical">
                {/* Top panel: Grid layout preview */}
                <SplitterPanel>
                    <div className="flex-1 flex flex-col p-4">
                        <Typography variant="h5" component="h1" gutterBottom>
                            Dashboard Builder
                        </Typography>

                        {/* Grid layout for widgets */}
                        <GridLayout
                            className="layout w-full h-52"
                            layout={layout}
                            cols={12}
                            rowHeight={80}
                            width={80}
                            isResizable={false}
                            isDraggable={true}
                            onLayoutChange={(newLayout) => setLayout(newLayout)}
                        >
                            {widgets.map(({ id, name }:any) => {
                                const Component = widgetMapping[name];
                                // Use previewData if available, otherwise use configuration
                                const widgetProps =
                                    (previewData && selectedWidget === id)
                                        ? previewData
                                        : (widgetConfigurations[id] || defaultPropsMapping[name]);

                                return (
                                    <div
                                        key={id}
                                        className={`bg-white shadow-md rounded-lg relative z-100 ${
                                            selectedWidget === id ? "border-2 border-blue-500" : ""
                                        }`}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={(e) => handleWidgetClick(id, e)}
                                    >
                                        <button
                                            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-50"
                                            style={{ pointerEvents: "auto" }}
                                            onMouseDown={(event) => event.stopPropagation()}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                removeWidget(id);
                                            }}
                                        >
                                            ✕
                                        </button>
                                        <Component {...widgetProps} />
                                    </div>
                                );
                            })}
                        </GridLayout>
                    </div>
                </SplitterPanel>

                {/* Bottom panel: Configuration panel */}
                <SplitterPanel>
                    <div className="p-4 m-auto max-h-[400px] min-w-[1200px] overflow-y-auto">
                        <Typography variant="h6" component="h2" gutterBottom>
                            Widget Configuration
                        </Typography>

                        {selectedWidget ? (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Configure {getSelectedWidgetType()} Widget
                                </Typography>

                                {/* Tabs for different configuration aspects */}
                                <Tabs value={tabValue} onChange={handleTabChange} aria-label="mapping tabs">
                                    <Tab label="Basic Configuration" />
                                    <Tab label="Preview" />
                                </Tabs>

                                {/* Basic Configuration Tab */}
                                <TabPanel value={tabValue} index={0}>
                                    <Grid container spacing={2}>
                                        {getWidgetConfigFields().map(({ field, path }:any) => {
                                            const widgetType = getSelectedWidgetType();
                                            const value = widgetConfigurations[selectedWidget] 
                                                ? getValueByPath(widgetConfigurations[selectedWidget], path)
                                                : undefined;
                                            
                                            return (
                                                <Grid item xs={12} key={field}>
                                                    <FormControl fullWidth variant="outlined" margin="normal">
                                                        <Typography variant="subtitle2">{field}</Typography>
                                                        {renderValueEditor(
                                                            field, 
                                                            value, 
                                                            widgetType, 
                                                            handleManualValueChange
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                            );
                                        })}
                                    </Grid>
                                </TabPanel>

                                {/* Preview Tab */}
                                <TabPanel value={tabValue} index={1}>
                                    <Box textAlign="center" mb={3}>
                                        <Button label="Generate Preview" onClick={generatePreview} />
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
                                </TabPanel>
                            </Box>
                        ) : (
                            <Typography color="textSecondary">
                                Select a widget to configure it
                            </Typography>
                        )}

                        <Box mt={4} pt={2} borderTop={1} borderColor="divider">
                            <Button
                                label="Save Layout"
                                className="mt-2"
                                onClick={saveLayout}
                            />
                        </Box>
                    </div>
                </SplitterPanel>
                </Splitter>
            
            </div>
            </Suspense>
            </>
    );
};

export default MappingScreen;
                        