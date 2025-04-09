"use client";

import SidebarMapping from "@/components/SidebarMapping";
import { redirect, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import RGL, { WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import MultiMetrics from "@/grid-components/MultiMetrics";
import PieMetric from "@/grid-components/PieMetric";
import SimpleMetric from "@/grid-components/SimpleMetric";
import SimpleMetricDate from "@/grid-components/SimpleMetricDate";
import SingleLineChart from "@/grid-components/SingleLineChart";
import TableMetric from "@/grid-components/TableMetric";
import { Button } from "primereact/button";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { createServer } from "miragejs";
import { parseXMLToJson } from "../../../lib/bexQueryXmlToJson";
import {
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    CircularProgress,
    Typography,
    Box,
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    Tab,
    Tabs,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    transformFormMetadata,
    getValueByPath,
    setValueByPath,
    processWidgetMappings,
    generateChartData,
    formatValue
} from "@/helpers/transformHelpers";
import {
    FormTransformInputType,
    TransformedData,
    widgetConfigFields,
    WidgetFieldMapping,
    WidgetMappingConfig
} from "@/helpers/types";

const GridLayout = WidthProvider(RGL);

interface Widget {
    id: string;
    name: string;
    props: Record<string, any>;
}

interface FieldMappings {
    [key: string]: WidgetMappingConfig;
}

interface LayoutItem extends Layout {
    static: boolean;
    sectionName?: string;
}

interface ApiEndpoint {
    id: string;
    name: string;
    url: string;
}

interface Entity {
    id: string;
    name: string;
    properties: string[];
}

// Mock data
const mockApiEndpoints: ApiEndpoint[] = [
    { id: "contracts", name: "Contracts API", url: "/api/contracts" },
    { id: "suppliers", name: "Suppliers API", url: "/api/suppliers" },
    { id: "invoices", name: "Invoices API", url: "/api/invoices" },
];

const mockEntities: Record<string, Entity[]> = {
    contracts: [
        {
            id: "contract",
            name: "Contract",
            properties: [
                "ContractID",
                "Title",
                "StartDate",
                "EndDate",
                "Value",
                "Status",
            ],
        },
        {
            id: "amendment",
            name: "Amendment",
            properties: [
                "AmendmentID",
                "ContractID",
                "ChangeDate",
                "ChangeType",
                "ChangeDescription",
            ],
        },
    ],
    suppliers: [
        {
            id: "supplier",
            name: "Supplier",
            properties: [
                "SupplierID",
                "Name",
                "Category",
                "Rating",
                "ContactPerson",
                "Email",
                "Phone",
            ],
        },
        {
            id: "address",
            name: "Address",
            properties: [
                "AddressID",
                "SupplierID",
                "Street",
                "City",
                "State",
                "Country",
                "PostalCode",
            ],
        },
    ],
    invoices: [
        {
            id: "invoice",
            name: "Invoice",
            properties: [
                "InvoiceID",
                "ContractID",
                "SupplierID",
                "Amount",
                "Status",
                "DueDate",
                "PaidDate",
            ],
        },
        {
            id: "lineItem",
            name: "Line Item",
            properties: [
                "LineItemID",
                "InvoiceID",
                "Description",
                "Quantity",
                "UnitPrice",
                "TotalPrice",
            ],
        },
    ],
};

// MirageJS mock API server
createServer({
    routes() {
        this.namespace = "api";

        this.get("/endpoints", () => {
            return { endpoints: mockApiEndpoints };
        });

        this.get("/entities", (schema, request) => {
            const endpointId = request.queryParams.endpointId as string;
            return {
                entities:
                    endpointId && mockEntities[endpointId]
                        ? mockEntities[endpointId]
                        : [],
            };
        });

        this.get("/properties", (schema, request) => {
            const endpointId = request.queryParams.endpointId as string;
            const entityId = request.queryParams.entityId as string;

            if (endpointId && entityId && mockEntities[endpointId]) {
                const entity = mockEntities[endpointId].find((e) => e.id === entityId);
                return { properties: entity?.properties || [] };
            }
            return { properties: [] };
        });

        this.get(
            "/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm",
            (schema, request) => {
                const query = request.queryParams.query;
                if (query === "YSCM_CT_PROC_OSS") {
                    const xmlResponse = `<?xml version="1.0" encoding="UTF-8" ?><asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0"> <asx:values><metadata><infoprovider>ZSCSMPMI</infoprovider><query>YSCM_CT_PROC_OSS</query><description>Outsourced Inventory Report</description><author>SID_BWSCM_01</author><changed_by>SID_BWSCM_01</changed_by><changed_on>04/24/2022 12:34:43</changed_on><current_user>SID_BWSRV_01</current_user><load_date>12/21/2022 11:24:17</load_date></metadata>< META ><ZBW_QUERY_OUTPUT_METADATA type ="CHA" ><FIELDNAME>ZSCMCMD</FIELDNAME><OUTPUTLEN>000005</OUTPUTLEN><DATATYPE>CHAR</DATATYPE><SCRTEXT_L>OSS INV - Commodity</SCRTEXT_L><AXIS_TYPE>ROW</AXIS_TYPE><TYPE>CHA</TYPE><DISPLAY_STYLE>5</DISPLAY_STYLE></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE001</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - Value</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18H83</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE002</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - &lt;6 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18NJN</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE003</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - 6-12 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK18TV7</ELEM></ZBW_QUERY_OUTPUT_METADATA><ZBW_QUERY_OUTPUT_METADATA type ="KF" ><FIELDNAME>VALUE004</FIELDNAME><OUTPUTLEN>30</OUTPUTLEN><DATATYPE>NUMC</DATATYPE><SCRTEXT_L>OSS INV - &gt;12 Months</SCRTEXT_L><AXIS_TYPE>COLUMN</AXIS_TYPE><TYPE>KF</TYPE><DISPLAY_STYLE>1</DISPLAY_STYLE><ELEM>00O2TFUQ9IV0X4UCNKGK1906R</ELEM></ZBW_QUERY_OUTPUT_METADATA></META> <PAGING_INFO><RECORD_NO>5 </RECORD_NO><TOTAL_REC>5 </TOTAL_REC><PAGE_NO>1 </PAGE_NO></PAGING_INFO><OUTPUT><item><ZSCMCMD>OCTG</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>51.400</VALUE002><VALUE003>13.500</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Mud &amp; Chemical</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>277.000</VALUE002><VALUE003>38.800</VALUE003><VALUE004>1.800</VALUE004></item><item><ZSCMCMD>Downhole</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>352.100</VALUE002><VALUE003>123.500</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Line Poles and Hware</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>0.000</VALUE002><VALUE003>0.000</VALUE003><VALUE004>0.000</VALUE004></item><item><ZSCMCMD>Overall Result</ZSCMCMD><VALUE001>0.000</VALUE001><VALUE002>680.500</VALUE002><VALUE003>175.800</VALUE003><VALUE004>1.800</VALUE004></item></OUTPUT></asx:values></asx:abap>`;
                    const parsedResponse = parseXMLToJson(
                        xmlResponse
                    ) as FormTransformInputType;
                    console.log(
                        "TransformedResponse",
                        transformFormMetadata(parsedResponse)
                    );
                    console.log(parsedResponse);
                    return parsedResponse;
                }
                return { error: "Invalid query parameter" };
            }
        );
    },
});

const widgetMapping: Record<string, React.ComponentType<any>> = {
    "two-metrics": MultiMetrics,
    "two-metrics-piechart": PieMetric,
    "one-metric": SimpleMetric,
    "one-metric-date": SimpleMetricDate,
    "two-metrics-linechart": SingleLineChart,
    "one-metric-table": TableMetric,
};

const widgetSizes: Record<string, { w: number; h: number }> = {
    "one-metric": { w: 2, h: 1.5 },
    "one-metric-date": { w: 2, h: 1.5 },
    "two-metrics-linechart": { w: 4, h: 3 },
    "two-metrics": { w: 2.5, h: 1.5 },
    "two-metrics-piechart": { w: 2.5, h: 1.5 },
    "one-metric-table": { w: 3.5, h: 3 },
};

// Determine the widget mapping type based on widget name
const getWidgetMappingType = (widgetName: string): "simple" | "chart" | "table" => {
    if (widgetName.includes("linechart") || widgetName.includes("piechart")) {
        return "chart";
    } else if (widgetName.includes("table")) {
        return "table";
    } else {
        return "simple";
    }
};

// Default widget props for preview
const defaultPropsMapping: Record<string, any> = {
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
        value2: "135"
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
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
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

const MappingScreen: React.FC = () => {
    const params = useParams();
    const searchParams = useSearchParams();
    const sectionName = searchParams.get("sectionName");
    const [widgets, setWidgets] = useState<Widget[]>([]);
    const [layout, setLayout] = useState<LayoutItem[]>([]);
    const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
    const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
    const [entities, setEntities] = useState<Entity[]>([]);
    const [properties, setProperties] = useState<string[]>([]);
    const [fieldMappings, setFieldMappings] = useState<FieldMappings>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [reportName, setReportName] = useState<string>("");
    const [parsedResponse, setParsedResponse] = useState<any>(null);
    const [transformedData, setTransformedData] = useState<TransformedData | null>(null);
    const [isMappingDialogOpen, setIsMappingDialogOpen] = useState<boolean>(false);
    const [currentMappingField, setCurrentMappingField] = useState<string>("");
    const [tabValue, setTabValue] = useState(0);
    const [previewData, setPreviewData] = useState<any>(null);

    // For chart configuration
    const [chartXAxis, setChartXAxis] = useState<string>("");
    const [chartYAxis, setChartYAxis] = useState<string>("");

    // For table configuration
    const [tableColumns, setTableColumns] = useState<Array<{ field: string, header: string }>>([]);

    useEffect(() => {
        fetch("/api/endpoints")
            .then((res) => res.json())
            .then((data) => setApiEndpoints(data.endpoints))
            .catch((err) => console.error("Failed to fetch endpoints:", err));

        fetch(
            "/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=YSCM_CT_PROC_OSS"
        )
            .then((res) => res)
            .catch((err) => console.error("Failed to fetch endpoints:", err));
    }, []);

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setTabValue(newValue);
    };

    const initializeWidgetMappingConfig = (widgetId: string, widgetName: string) => {
        // Determine mapping type based on widget type
        const mappingType = getWidgetMappingType(widgetName);

        // Create empty field mappings based on widget config fields
        const fields: Record<string, WidgetFieldMapping> = {};

        // Get the fields from widget config
        const configFields = widgetConfigFields[widgetName as keyof typeof widgetConfigFields] || [];

        // Initialize each field with default mapping
        configFields.forEach(({ field, type, path }) => {
            fields[field] = {
                fieldPath: path,
                inputType: "manual", // Default to manual
                manualValue: getValueByPath(defaultPropsMapping[widgetName], path) // Get default value from default props
            };
        });

        // Create the widget mapping config
        setFieldMappings((prev) => ({
            ...prev,
            [widgetId]: {
                reportName: reportName,
                mappingType: mappingType,
                fields: fields,
                // Initialize chart config if it's a chart
                ...(mappingType === "chart" && {
                    chartConfig: {
                        xAxis: { field: "", type: "CHA" },
                        yAxis: { field: "", type: "KF" }
                    }
                }),
                // Initialize table config if it's a table
                ...(mappingType === "table" && {
                    tableConfig: {
                        columns: []
                    }
                })
            }
        }));
    };

    const addWidget = (name: string) => {
        if (!widgetMapping[name]) return;
        const widgetId = `widget-${Date.now()}`;
        const { w, h } = widgetSizes[name] || { w: 2, h: 2 };

        // Add widget to widgets array
        setWidgets((prev) => [...prev, { id: widgetId, name, props: {} }]);

        // Add to layout
        setLayout((prev: any) => [
            ...prev,
            { i: widgetId, x: 0, y: Infinity, w, h, static: false, sectionName },
        ]);

        // Initialize widget mapping config
        initializeWidgetMappingConfig(widgetId, name);
    };

    const removeWidget = (id: string) => {
        setWidgets((prev) => prev.filter((widget) => widget.id !== id));
        setLayout((prev) => prev.filter((item) => item.i !== id));

        // Remove from field mappings
        const updatedMappings = { ...fieldMappings };
        delete updatedMappings[id];
        setFieldMappings(updatedMappings);

        if (selectedWidget === id) {
            setSelectedWidget(null);
        }
    };

    const saveLayout = () => {
        // Add sectionName to the layout
        const updatedLayout = layout.map((item) => ({
            ...item,
        }));

        // Create a clean version of fieldMappings for saving
        const cleanedFieldMappings = Object.entries(fieldMappings).reduce(
            (acc, [widgetId, config]) => {
                // Deep copy to avoid reference issues
                acc[widgetId] = JSON.parse(JSON.stringify(config));
                return acc;
            },
            {} as FieldMappings
        );

        console.log("Layout Saved", {
            sectionName: sectionName,
            layout: updatedLayout,
            fieldMappings: cleanedFieldMappings,
            widgets,
        });

        // Retrieve the payload from sessionStorage or initialize it as an empty array
        let payload = JSON.parse(sessionStorage.getItem("payload") || "[]");

        // Parse the payload if it's a string (assuming it might be stored as a stringified array)
        if (typeof payload === "string") {
            payload = JSON.parse(payload);
        }

        // Create the new entry to be added to the payload
        const newEntry = {
            sectionName: sectionName,
            layout: updatedLayout,
            fieldMappings: cleanedFieldMappings,
            widgets: widgets,
        };

        // Add the new entry to the payload array
        payload.push(newEntry);

        // Store the updated payload back into sessionStorage
        sessionStorage.setItem("payload", JSON.stringify(payload));

        alert("Layout saved successfully!");

        redirect("/"); // Navigate to the new post page
    };

    const handleWidgetClick = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (selectedWidget === id) return;

        setSelectedWidget(id);

        // Reset preview data
        setPreviewData(null);

        // Reset tab to first tab
        setTabValue(0);

        // Load existing configuration for this widget
        const widget = widgets.find(w => w.id === id);
        if (!widget) return;

        // Initialize mapping config if not exists
        if (!fieldMappings[id]) {
            initializeWidgetMappingConfig(id, widget.name);
        }

        // Load chart/table specific configurations
        const config = fieldMappings[id];
        if (config?.mappingType === "chart" && config.chartConfig) {
            setChartXAxis(config.chartConfig.xAxis.field);
            setChartYAxis(config.chartConfig.yAxis.field);
        } else if (config?.mappingType === "table" && config.tableConfig) {
            setTableColumns(config.tableConfig.columns || []);
        }
    };

    const handleEndpointChange = (widgetId: string, endpointId: string) => {
        fetchEntities(endpointId);
    };

    const handleEntityChange = (widgetId: string, entityId: string) => {
        const endpointId = fieldMappings[widgetId]?.endpoint;
        if (endpointId) {
            fetchProperties(endpointId, entityId);
        }
    };

    const handleFieldMappingTypeChange = (field: string, inputType: "manual" | "mapped") => {
        if (!selectedWidget) return;

        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                fields: {
                    ...prev[selectedWidget].fields,
                    [field]: {
                        ...prev[selectedWidget].fields[field],
                        inputType
                    }
                }
            }
        }));
    };

    const handleManualValueChange = (field: string, value: any) => {
        if (!selectedWidget) return;

        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                fields: {
                    ...prev[selectedWidget].fields,
                    [field]: {
                        ...prev[selectedWidget].fields[field],
                        inputType: "manual",
                        manualValue: value
                    }
                }
            }
        }));
    };

    const handleMappedFieldSelection = (field: string, chaField: string, chaValue: string, kfField: string) => {
        if (!selectedWidget) return;

        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                fields: {
                    ...prev[selectedWidget].fields,
                    [field]: {
                        ...prev[selectedWidget].fields[field],
                        inputType: "mapped",
                        mappedConfig: {
                            chaField,
                            chaValue,
                            kfField
                        }
                    }
                }
            }
        }));
    };

    const handleChartAxisChange = (axisType: "xAxis" | "yAxis", field: string, fieldType: "CHA" | "KF") => {
        if (!selectedWidget) return;

        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                chartConfig: {
                    ...prev[selectedWidget].chartConfig,
                    [axisType]: {
                        field,
                        type: fieldType
                    }
                }
            }
        }));

        // Update local state for easier access
        if (axisType === "xAxis") {
            setChartXAxis(field);
        } else {
            setChartYAxis(field);
        }
    };

    const handleTableColumnAdd = (field: string, header: string) => {
        if (!selectedWidget) return;

        const newColumn = { field, header, path: `data.${field}` };

        // Add to local state
        setTableColumns(prev => [...prev, newColumn]);

        // Add to field mappings
        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                tableConfig: {
                    columns: [...(prev[selectedWidget].tableConfig?.columns || []), newColumn]
                }
            }
        }));
    };

    const handleTableColumnRemove = (index: number) => {
        if (!selectedWidget) return;

        // Update local state
        const newColumns = [...tableColumns];
        newColumns.splice(index, 1);
        setTableColumns(newColumns);

        // Update field mappings
        setFieldMappings(prev => ({
            ...prev,
            [selectedWidget]: {
                ...prev[selectedWidget],
                tableConfig: {
                    columns: newColumns
                }
            }
        }));
    };

    const fetchEntities = async (endpointId: string) => {
        if (!endpointId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/entities?endpointId=${endpointId}`);
            const data = await res.json();
            setEntities(data.entities);

            if (selectedWidget) {
                setFieldMappings((prev) => ({
                    ...prev,
                    [selectedWidget]: {
                        ...prev[selectedWidget],
                        endpoint: endpointId,
                        entity: undefined,
                        fields: {
                            ...prev[selectedWidget].fields
                        },
                    },
                }));
            }
            setProperties([]);
        } catch (error) {
            console.error("Error fetching entities:", error);
            setEntities([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async (endpointId: string, entityId: string) => {
        if (!endpointId || !entityId) return;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/properties?endpointId=${endpointId}&entityId=${entityId}`
            );
            const data = await res.json();
            setProperties(data.properties);

            if (selectedWidget) {
                setFieldMappings((prev) => ({
                    ...prev,
                    [selectedWidget]: {
                        ...prev[selectedWidget],
                        entity: entityId,
                        fields: {
                            ...prev[selectedWidget].fields
                        },
                    },
                }));
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const getSelectedWidgetType = () => {
        if (!selectedWidget) return null;
        const widget = widgets.find((w) => w.id === selectedWidget);
        return widget ? widget.name : null;
    };

    const getWidgetConfigFields = () => {
        const widgetType = getSelectedWidgetType();
        return widgetType ?
            widgetConfigFields[widgetType as keyof typeof widgetConfigFields] || []
            : [];
    };

    const handleReportNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newReportName = event.target.value;
        setReportName(newReportName);

        if (selectedWidget) {
            setFieldMappings((prev) => ({
                ...prev,
                [selectedWidget]: {
                    ...prev[selectedWidget],
                    reportName: newReportName,
                },
            }));
        }
    };

    const fetchReportData = async () => {
        if (!reportName) return;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
            );
            const data = await res.json();
            setParsedResponse(data);

            // Transform the data for easier access
            const transformed = transformFormMetadata(data);
            setTransformedData(transformed);

            console.log("Transformed data:", transformed);
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCHAFields = () => {
        if (!parsedResponse) return [];
        return parsedResponse.header.filter((field: any) => field.type === "CHA");
    };

    const getKFFields = () => {
        if (!parsedResponse) return [];
        return parsedResponse.header.filter((field: any) => field.type === "KF");
    };

    const getCHAValues = (selectedCHA: string) => {
        if (!transformedData || !selectedCHA) return [];

        // Get all CHA values from the transformed data
        if (transformedData.FormStructure[selectedCHA]) {
            return Object.keys(transformedData.FormStructure[selectedCHA]);
        }
        return [];
    };

    const getKFValue = (chaField: string, chaValue: string, kfField: string) => {
        if (!transformedData || !chaField || !chaValue || !kfField) return null;

        try {
            return transformedData.FormStructure[chaField][chaValue][kfField];
        } catch (error) {
            return null;
        }
    };

    const openMappingDialog = (field: string) => {
        setCurrentMappingField(field);
        setIsMappingDialogOpen(true);
    };

    const closeMappingDialog = () => {
        setIsMappingDialogOpen(false);
        setCurrentMappingField("");
    };

    const handleMappingSelection = (field: string) => {
        if (!selectedWidget) return;

        const widgetConfig = fieldMappings[selectedWidget];
        const chaField = widgetConfig?.chaField || "";
        const chaValue = widgetConfig?.chaValue || "";
        const kfField = widgetConfig?.kfField || "";

        if (chaField && chaValue && kfField) {
            handleMappedFieldSelection(field, chaField, chaValue, kfField);
        }

        closeMappingDialog();
    };

    const generatePreview = () => {
        if (!selectedWidget || !transformedData) return;

        const widgetType = getSelectedWidgetType();
        if (!widgetType) return;

        const config = fieldMappings[selectedWidget];

        // Generate preview based on widget type and mapping configuration
        let previewProps: any = {};

        if (config.mappingType === "simple") {
            // For simple metrics, process each field
            Object.entries(config.fields).forEach(([field, fieldMapping]) => {
                if (fieldMapping.inputType === "manual") {
                    // Use manual value directly
                    previewProps[field] = fieldMapping.manualValue;
                } else if (fieldMapping.inputType === "mapped" && fieldMapping.mappedConfig) {
                    // Get value from the data
                    const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;
                    const value = getKFValue(chaField, chaValue, kfField);
                    if (value !== null) {
                        previewProps[field] = value;
                    }
                }
            });
        }
        else if (config.mappingType === "chart" && config.chartConfig) {
            // For charts, process the chart data
            const { xAxis, yAxis } = config.chartConfig;

            if (xAxis.field && yAxis.field) {
                // Generate chart data
                if (widgetType === "two-metrics-linechart") {
                    // For line charts
                    const chartData = generateChartData(transformedData, xAxis.field, yAxis.field, ["Overall Result"]);

                    previewProps = {
                        data: {
                            chart_data: chartData,
                            chart_yaxis: yAxis.field,
                            metric_data: {
                                metric_value: formatValue(getKFValue(xAxis.field, "Overall Result", yAxis.field), "currency"),
                                metric_variance: "+0.00%", // This could be calculated
                                metric_label: transformedData.FormMetadata[yAxis.field]?.label || yAxis.field,
                            },
                            widget_name: transformedData.FormMetadata[yAxis.field]?.label || "Chart",
                        }
                    };
                }
                else if (widgetType === "two-metrics-piechart") {
                    // For pie charts
                    const chartData = generateChartData(transformedData, xAxis.field, yAxis.field, ["Overall Result"])
                        .map((item, index) => ({
                            label: item.label,
                            value: item.value,
                            fill: ["#84BD00", "#E1553F", "#2D7FF9", "#FFA500"][index % 4],
                        }));

                    // Total value from "Overall Result"
                    const totalValue = getKFValue(xAxis.field, "Overall Result", yAxis.field);

                    previewProps = {
                        data: chartData,
                        metrics: {
                            amount: formatValue(totalValue, "currency"),
                            percentage: "100%",
                            label: transformedData.FormMetadata[yAxis.field]?.label || yAxis.field,
                        }
                    };
                }
            }
        }
        else if (config.mappingType === "table" && config.tableConfig) {
            // For tables, generate table data
            const { columns } = config.tableConfig;

            if (columns && columns.length > 0) {
                // Get the CHA field (assuming first field is CHA)
                const chaField = columns[0].field;

                // Get all CHA values except "Overall Result"
                const chaValues = getCHAValues(chaField).filter(val => val !== "Overall Result");

                // Generate table rows
                const tableData = chaValues.map(chaValue => {
                    const row: Record<string, any> = {};

                    columns.forEach(column => {
                        // For CHA field, use the CHA value as the cell value
                        if (column.field === chaField) {
                            row.supplier_name = chaValue;
                        } else {
                            // For KF fields, get the value from the data
                            const value = getKFValue(chaField, chaValue, column.field);
                            if (column.field.includes("contracts")) {
                                row.contracts = Number(value || 0);
                            } else {
                                row.value = formatValue(value, "currency");
                            }
                        }
                    });

                    return row;
                });

                // Get total from "Overall Result"
                const total = getKFValue(chaField, "Overall Result", columns[1].field);

                previewProps = {
                    totalAmount: formatValue(total, "currency"),
                    data: tableData
                };
            }
        }

        setPreviewData(previewProps);
    };

    return (
        <div className="relative w-full h-screen flex">
            <div className="h-full bg-white">
                <SidebarMapping onItemClick={addWidget} />
            </div>

            <Splitter className="w-full h-100vh" layout="vertical">
                <SplitterPanel>
                    <div className="flex-1 flex flex-col p-4">
                        <Typography variant="h5" component="h1" gutterBottom>
                            Dashboard Builder
                        </Typography>
                        <GridLayout
                            className="layout w-full h-52"
                            layout={layout}
                            cols={12}
                            rowHeight={80}
                            width={window.innerWidth * 0.8}
                            isResizable={false}
                            isDraggable={true}
                            onLayoutChange={(newLayout) =>
                                setLayout(newLayout as LayoutItem[])
                            }
                        >
                            {widgets.map(({ id, name }) => {
                                const Component = widgetMapping[name];
                                // Use preview data if available, otherwise use default props
                                const widgetProps =
                                    (selectedWidget === id && previewData) ?
                                        previewData :
                                        defaultPropsMapping[name] || {};

                                return (
                                    <div
                                        key={id}
                                        className={`bg-white shadow-md rounded-lg relative z-100 ${selectedWidget === id ? "border-2 border-blue-500" : ""
                                            }`}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleWidgetClick(id, e);
                                        }}
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

                <SplitterPanel>
                    <div className="p-4 m-auto max-h-[400px] max-w-[900px] overflow-y-auto">
                        <Typography variant="h6" component="h2" gutterBottom>
                            Widget Configuration
                        </Typography>

                        {selectedWidget ? (
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Configure {getSelectedWidgetType()} Widget
                                </Typography>

                                {/* Report Configuration */}
                                <Paper elevation={2} className="p-4 mb-4">
                                    <FormControl fullWidth variant="outlined" margin="normal">
                                        <TextField
                                            label="Report Technical Name"
                                            value={reportName}
                                            onChange={handleReportNameChange}
                                            helperText="Enter the technical name of the SAP BW report"
                                        />
                                        <Button
                                            label="Fetch Report Data"
                                            onClick={fetchReportData}
                                            className="mt-2"
                                        />
                                    </FormControl>
                                </Paper>

                                {loading ? (
                                    <Box display="flex" justifyContent="center" my={4}>
                                        <CircularProgress />
                                    </Box>
                                ) : parsedResponse ? (
                                    <>
                                        <Tabs value={tabValue} onChange={handleTabChange} aria-label="mapping tabs">
                                            <Tab label="Basic Mapping" />
                                            {fieldMappings[selectedWidget]?.mappingType === "chart" && (
                                                <Tab label="Chart Configuration" />
                                            )}
                                            {fieldMappings[selectedWidget]?.mappingType === "table" && (
                                                <Tab label="Table Configuration" />
                                            )}
                                            <Tab label="Preview" />
                                        </Tabs>

                                        {/* Basic Field Mapping Tab */}
                                        <TabPanel value={tabValue} index={0}>
                                            {getWidgetConfigFields().map(({ field, type, path }) => {
                                                const fieldMapping = fieldMappings[selectedWidget]?.fields[field];
                                                const isManualInput = fieldMapping?.inputType === "manual";
                                                const mappedConfig = fieldMapping?.mappedConfig;

                                                return (
                                                    <FormControl
                                                        fullWidth
                                                        variant="outlined"
                                                        margin="normal"
                                                        key={field}
                                                    >
                                                        <Typography variant="subtitle2">{field}</Typography>

                                                        {/* Input Type Selection */}
                                                        <FormControl
                                                            fullWidth
                                                            variant="outlined"
                                                            margin="normal"
                                                            size="small"
                                                        >
                                                            <InputLabel>Input Type</InputLabel>
                                                            <Select
                                                                value={isManualInput ? "manual" : "mapped"}
                                                                onChange={(e) => handleFieldMappingTypeChange(field, e.target.value as "manual" | "mapped")}
                                                                label="Input Type"
                                                            >
                                                                <MenuItem value="manual">Manual Input</MenuItem>
                                                                <MenuItem value="mapped">Mapped Input</MenuItem>
                                                            </Select>
                                                        </FormControl>

                                                        {/* Manual Input Field */}
                                                        {isManualInput ? (
                                                            <TextField
                                                                label={`Value for ${field}`}
                                                                value={fieldMapping?.manualValue || ""}
                                                                onChange={(e) => handleManualValueChange(field, e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                size="small"
                                                            />
                                                        ) : (
                                                            /* Mapped Input Field Configuration */
                                                            <Box mt={2} p={2} border={1} borderColor="divider" borderRadius={1}>
                                                                <Grid container spacing={2}>
                                                                    <Grid item xs={12}>
                                                                        <FormControl fullWidth size="small">
                                                                            <InputLabel>CHA Field</InputLabel>
                                                                            <Select
                                                                                value={mappedConfig?.chaField || ""}
                                                                                onChange={(e) => {
                                                                                    const chaField = e.target.value as string;
                                                                                    handleMappedFieldSelection(
                                                                                        field,
                                                                                        chaField,
                                                                                        mappedConfig?.chaValue || "",
                                                                                        mappedConfig?.kfField || ""
                                                                                    );
                                                                                }}
                                                                                label="CHA Field"
                                                                            >
                                                                                {getCHAFields().map((chaField: any) => (
                                                                                    <MenuItem key={chaField.fieldName} value={chaField.fieldName}>
                                                                                        {chaField.label} ({chaField.fieldName})
                                                                                    </MenuItem>
                                                                                ))}
                                                                            </Select>
                                                                        </FormControl>
                                                                    </Grid>

                                                                    {mappedConfig?.chaField && (
                                                                        <Grid item xs={12}>
                                                                            <FormControl fullWidth size="small">
                                                                                <InputLabel>CHA Value</InputLabel>
                                                                                <Select
                                                                                    value={mappedConfig?.chaValue || ""}
                                                                                    onChange={(e) => {
                                                                                        const chaValue = e.target.value as string;
                                                                                        handleMappedFieldSelection(
                                                                                            field,
                                                                                            mappedConfig?.chaField || "",
                                                                                            chaValue,
                                                                                            mappedConfig?.kfField || ""
                                                                                        );
                                                                                    }}
                                                                                    label="CHA Value"
                                                                                >
                                                                                    {getCHAValues(mappedConfig?.chaField).map((value) => (
                                                                                        <MenuItem key={value} value={value}>
                                                                                            {value}
                                                                                        </MenuItem>
                                                                                    ))}
                                                                                </Select>
                                                                            </FormControl>
                                                                        </Grid>
                                                                    )}

                                                                    {mappedConfig?.chaField && mappedConfig?.chaValue && (
                                                                        <Grid item xs={12}>
                                                                            <FormControl fullWidth size="small">
                                                                                <InputLabel>KF Field</InputLabel>
                                                                                <Select
                                                                                    value={mappedConfig?.kfField || ""}
                                                                                    onChange={(e) => {
                                                                                        const kfField = e.target.value as string;
                                                                                        handleMappedFieldSelection(
                                                                                            field,
                                                                                            mappedConfig?.chaField || "",
                                                                                            mappedConfig?.chaValue || "",
                                                                                            kfField
                                                                                        );
                                                                                    }}
                                                                                    label="KF Field"
                                                                                >
                                                                                    {getKFFields().map((kfField: any) => (
                                                                                        <MenuItem key={kfField.fieldName} value={kfField.fieldName}>
                                                                                            {kfField.label} ({kfField.fieldName})
                                                                                        </MenuItem>
                                                                                    ))}


                                                                                </Select>
                                                                            </FormControl>
                                                                        </Grid>
                                                                    )}

                                                                    {mappedConfig?.chaField && mappedConfig?.chaValue && mappedConfig?.kfField && (
                                                                        <Grid item xs={12}>
                                                                            <TextField
                                                                                label="Mapped Value"
                                                                                value={getKFValue(
                                                                                    mappedConfig.chaField,
                                                                                    mappedConfig.chaValue,
                                                                                    mappedConfig.kfField
                                                                                ) || ""}
                                                                                disabled
                                                                                fullWidth
                                                                                size="small"
                                                                                helperText="This is the value that will be used"
                                                                            />
                                                                        </Grid>
                                                                    )}
                                                                </Grid>
                                                            </Box>
                                                        )}
                                                    </FormControl>
                                                );
                                            })}
                                        </TabPanel>

                                        {/* Chart Configuration Tab */}
                                        {fieldMappings[selectedWidget]?.mappingType === "chart" && (
                                            <TabPanel value={tabValue} index={1}>
                                                <Typography variant="h6" gutterBottom>
                                                    Chart Axis Configuration
                                                </Typography>

                                                <Box mt={3}>
                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel>X-Axis (Categories)</InputLabel>
                                                        <Select
                                                            value={chartXAxis}
                                                            onChange={(e) => handleChartAxisChange("xAxis", e.target.value as string, "CHA")}
                                                            label="X-Axis (Categories)"
                                                        >
                                                            {getCHAFields().map((field: any) => (
                                                                <MenuItem key={field.fieldName} value={field.fieldName}>
                                                                    {field.label} ({field.fieldName})
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        <FormHelperText>
                                                            Select the character field to use for X-axis labels
                                                        </FormHelperText>
                                                    </FormControl>

                                                    <FormControl fullWidth margin="normal">
                                                        <InputLabel>Y-Axis (Values)</InputLabel>
                                                        <Select
                                                            value={chartYAxis}
                                                            onChange={(e) => handleChartAxisChange("yAxis", e.target.value as string, "KF")}
                                                            label="Y-Axis (Values)"
                                                        >
                                                            {getKFFields().map((field: any) => (
                                                                <MenuItem key={field.fieldName} value={field.fieldName}>
                                                                    {field.label} ({field.fieldName})
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                        <FormHelperText>
                                                            Select the key figure field to use for Y-axis values
                                                        </FormHelperText>
                                                    </FormControl>

                                                    {chartXAxis && chartYAxis && (
                                                        <Box mt={3} p={2} border={1} borderRadius={1} borderColor="divider">
                                                            <Typography variant="subtitle2" gutterBottom>
                                                                Data Preview
                                                            </Typography>

                                                            <Box mt={1} maxHeight={200} overflow="auto">
                                                                <table className="min-w-full border-collapse">
                                                                    <thead>
                                                                        <tr>
                                                                            <th className="border p-2">X (Label)</th>
                                                                            <th className="border p-2">Y (Value)</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {getCHAValues(chartXAxis)
                                                                            .filter(value => value !== "Overall Result")
                                                                            .map((chaValue, idx) => (
                                                                                <tr key={idx}>
                                                                                    <td className="border p-2">{chaValue}</td>
                                                                                    <td className="border p-2">
                                                                                        {getKFValue(chartXAxis, chaValue, chartYAxis)}
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </table>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TabPanel>
                                        )}

                                        {/* Table Configuration Tab */}
                                        {fieldMappings[selectedWidget]?.mappingType === "table" && (
                                            <TabPanel value={tabValue} index={1}>
                                                <Typography variant="h6" gutterBottom>
                                                    Table Columns Configuration
                                                </Typography>

                                                <Box mt={3}>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Add Columns
                                                    </Typography>

                                                    <Grid container spacing={2} alignItems="flex-end">
                                                        <Grid item xs={5}>
                                                            <FormControl fullWidth size="small">
                                                                <InputLabel>Select Field</InputLabel>
                                                                <Select
                                                                    label="Select Field"
                                                                    value=""
                                                                    onChange={(e) => {
                                                                        const field = e.target.value as string;
                                                                        const header = parsedResponse.header.find(
                                                                            (h: any) => h.fieldName === field
                                                                        )?.label || field;
                                                                        handleTableColumnAdd(field, header);
                                                                    }}
                                                                >
                                                                    {parsedResponse.header.map((field: any) => (
                                                                        <MenuItem
                                                                            key={field.fieldName}
                                                                            value={field.fieldName}
                                                                            disabled={tableColumns.some(col => col.field === field.fieldName)}
                                                                        >
                                                                            {field.label} ({field.fieldName})
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={2}>
                                                            <Button label="Add Column" />
                                                        </Grid>
                                                    </Grid>

                                                    <Box mt={3}>
                                                        <Typography variant="subtitle2" gutterBottom>
                                                            Current Columns
                                                        </Typography>

                                                        {tableColumns.length === 0 ? (
                                                            <Typography color="textSecondary">
                                                                No columns added yet
                                                            </Typography>
                                                        ) : (
                                                            <Box>
                                                                {tableColumns.map((column, idx) => (
                                                                    <Chip
                                                                        key={idx}
                                                                        label={`${column.header} (${column.field})`}
                                                                        onDelete={() => handleTableColumnRemove(idx)}
                                                                        className="m-1"
                                                                    />
                                                                ))}
                                                            </Box>
                                                        )}
                                                    </Box>

                                                    {tableColumns.length > 0 && (
                                                        <Box mt={3} p={2} border={1} borderRadius={1} borderColor="divider">
                                                            <Typography variant="subtitle2" gutterBottom>
                                                                Data Preview
                                                            </Typography>

                                                            <Box mt={1} maxHeight={200} overflow="auto">
                                                                <table className="min-w-full border-collapse">
                                                                    <thead>
                                                                        <tr>
                                                                            {tableColumns.map((column, idx) => (
                                                                                <th key={idx} className="border p-2">
                                                                                    {column.header}
                                                                                </th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {tableColumns.length > 0 && tableColumns[0].field &&
                                                                            getCHAValues(tableColumns[0].field)
                                                                                .filter(value => value !== "Overall Result")
                                                                                .map((chaValue, rowIdx) => (
                                                                                    <tr key={rowIdx}>
                                                                                        {tableColumns.map((column, colIdx) => (
                                                                                            <td key={colIdx} className="border p-2">
                                                                                                {colIdx === 0
                                                                                                    ? chaValue
                                                                                                    : getKFValue(tableColumns[0].field, chaValue, column.field)}
                                                                                            </td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                    </tbody>
                                                                </table>
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TabPanel>
                                        )}

                                        {/* Preview Tab */}
                                        <TabPanel value={tabValue} index={fieldMappings[selectedWidget]?.mappingType === "simple" ? 1 : 2}>
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
                                                    Click "Generate Preview" to see how your widget will look with the mapped data
                                                </Typography>
                                            )}
                                        </TabPanel>
                                    </>
                                ) : (
                                    <Typography color="textSecondary">
                                        Enter a report name and fetch data to configure the widget
                                    </Typography>
                                )}

                                <Box mt={4} pt={2} borderTop={1} borderColor="divider">
                                    <Button
                                        label="Apply Configuration"
                                        className="mt-2 mr-2"
                                        severity="secondary"
                                        onClick={generatePreview}
                                    />
                                </Box>
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

            <Dialog
                open={isMappingDialogOpen}
                onClose={closeMappingDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Map Field: {currentMappingField}</DialogTitle>
                <DialogContent>
                    {parsedResponse && (
                        <Box p={2}>
                            <FormControl fullWidth variant="outlined" margin="normal">
                                <InputLabel>CHA Field</InputLabel>
                                <Select
                                    value={fieldMappings[selectedWidget || ""]?.chaField || ""}
                                    onChange={(e) => {
                                        const chaField = e.target.value as string;
                                        setFieldMappings((prev) => ({
                                            ...prev,
                                            [selectedWidget || ""]: {
                                                ...prev[selectedWidget || ""],
                                                chaField: chaField,
                                                chaValue: "", // Reset chaValue when chaField changes
                                                kfField: "",  // Reset kfField when chaField changes
                                            },
                                        }));
                                    }}
                                    label="CHA Field"
                                >
                                    {getCHAFields().map((field: any) => (
                                        <MenuItem key={field.fieldName} value={field.fieldName}>
                                            {field.label} ({field.fieldName})
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Select the character field (categories)
                                </FormHelperText>
                            </FormControl>

                            {fieldMappings[selectedWidget || ""]?.chaField && (
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel>CHA Value</InputLabel>
                                    <Select
                                        value={fieldMappings[selectedWidget || ""]?.chaValue || ""}
                                        onChange={(e) => {
                                            const chaValue = e.target.value as string;
                                            setFieldMappings((prev) => ({
                                                ...prev,
                                                [selectedWidget || ""]: {
                                                    ...prev[selectedWidget || ""],
                                                    chaValue: chaValue,
                                                    kfField: "",  // Reset kfField when chaValue changes
                                                },
                                            }));
                                        }}
                                        label="CHA Value"
                                    >
                                        {getCHAValues(
                                            fieldMappings[selectedWidget || ""]?.chaField || ""
                                        ).map((value: string) => (
                                            <MenuItem key={value} value={value}>
                                                {value}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        Select the specific category value
                                    </FormHelperText>
                                </FormControl>
                            )}

                            {fieldMappings[selectedWidget || ""]?.chaValue && (
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <InputLabel>KF Field</InputLabel>
                                    <Select
                                        value={fieldMappings[selectedWidget || ""]?.kfField || ""}
                                        onChange={(e) => {
                                            const kfField = e.target.value as string;
                                            setFieldMappings((prev) => ({
                                                ...prev,
                                                [selectedWidget || ""]: {
                                                    ...prev[selectedWidget || ""],
                                                    kfField: kfField,
                                                },
                                            }));
                                        }}
                                        label="KF Field"
                                    >
                                        {getKFFields().map((field: any) => (
                                            <MenuItem key={field.fieldName} value={field.fieldName}>
                                                {field.label} ({field.fieldName})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        Select the key figure field (values)
                                    </FormHelperText>
                                </FormControl>
                            )}

                            {fieldMappings[selectedWidget || ""]?.kfField && (
                                <FormControl fullWidth variant="outlined" margin="normal">
                                    <TextField
                                        label="KF Value"
                                        value={
                                            getKFValue(
                                                fieldMappings[selectedWidget || ""]?.chaField || "",
                                                fieldMappings[selectedWidget || ""]?.chaValue || "",
                                                fieldMappings[selectedWidget || ""]?.kfField || ""
                                            ) || ""
                                        }
                                        disabled
                                    />
                                    <FormHelperText>
                                        This is the value that will be used for {currentMappingField}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button label="Cancel" onClick={closeMappingDialog} />
                    <Button
                        label="Apply"
                        onClick={() => handleMappingSelection(currentMappingField)}
                        disabled={!fieldMappings[selectedWidget || ""]?.kfField}
                    />
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MappingScreen;