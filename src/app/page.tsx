"use client";
import { useEffect, useState } from "react";
import { createServer } from "miragejs";
import MyContractsIcon from "@/assets/MyContractsIcon";
import Header from "@/components/Header";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import RGL, { WidthProvider } from "react-grid-layout";
import MultiMetrics from "@/grid-components/MultiMetrics";
import PieMetric from "@/grid-components/PieMetric";
import SimpleMetric from "@/grid-components/SimpleMetric";
import SimpleMetricDate from "@/grid-components/SimpleMetricDate";
import SingleLineChart from "@/grid-components/SingleLineChart";
import TableMetric from "@/grid-components/TableMetric";
import MultiMetricComparsionChart from "@/grid-components/MultiMetricComparsionChart";

import {
    transformFormMetadata,
    processWidgetMappings,
    getValueByPath,
    setValueByPath,
    generateChartData,
    generateComparisonChartData,
    formatValue
} from "@/helpers/transformHelpers";
import {
    FormTransformInputType,
    TransformedData,
    WidgetMappingConfig
} from "@/helpers/types";
import { parseXMLToJson } from "@/lib/bexQueryXmlToJson";
import Sidebar from "@/components/Sidebar";
import { CircularProgress, Typography } from "@mui/material";
import NewsFeed from "@/grid-components/NewsFeed";
import StackedBarChart from "@/grid-components/StackedBarChart";
import DualLineChart from "@/grid-components/DualLineChart";
import OrdersLineChart from "@/grid-components/OrdersLineChart";
import PieChartWithTotal from "@/grid-components/PieChartWithTotal";
import QuadrantMetrics from "@/grid-components/QuadrantMetrics";
import BarMetric from "@/grid-components/BarMetric";
import FourMetricVisualizationChart from "@/grid-components/LoansAppTray";
import LoansAppTray from "@/grid-components/LoansAppTray";

// Setup Mirage.js mock server
// if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    createServer({
        routes() {
            this.namespace = "api";

            this.get("/dashboard", () => {
                const savedLayout = sessionStorage.getItem("payload") || "[]";

                return {
                    sections: JSON.parse(savedLayout),
                };
            });

            this.get("/widget-data", (schema, request) => {
                const widgetName: any = request.queryParams.name;
                return defaultPropsMapping[widgetName] || {};
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
                        return parsedResponse;
                    }
                    return { error: "Invalid query parameter" };
                }
            );
        },
    });
// }

const GridLayout = WidthProvider(RGL);


// Default widget props for when data isn't available
// Complete update for defaultPropsMapping in page.tsx
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
    // New components default props
    "bar-chart": {
        data: [
            {
                name: '2024',
                value: 163000,
                fill: '#83bd01',
            },
            {
                name: '2025',
                value: 118000,
                fill: '#FFC846',
            }
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
        topLeftTitle: "In Process Requestions",
        topLeftValue: "53",
        topRightTitle: "With Supplier",
        topRightValue: "18",
        bottomLeftTitle: "B2B Order",
        bottomLeftValue: "1,335",
        bottomRightTitle: "Completed Order",
        bottomRightValue: "1,247"
    },
    "loans-app-tray":{
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

// Component mappings
const widgetMapping: Record<string, React.ComponentType<any>> = {
    "two-metrics": MultiMetrics,
    "two-metrics-piechart": PieMetric,
    "one-metric": SimpleMetric,
    "one-metric-date": SimpleMetricDate,
    "two-metrics-linechart": SingleLineChart,
    "one-metric-table": TableMetric,
    // New components
    "bar-chart": BarMetric,
    "stacked-bar-chart": StackedBarChart,
    "orders-line-chart": OrdersLineChart,
    "dual-line-chart": DualLineChart,
    "pie-chart-total": PieChartWithTotal,
    "quadrant-metrics": QuadrantMetrics,
    "four-metric-visualization-chart": FourMetricVisualizationChart,
    "loans-app-tray":LoansAppTray
};

// Component for section header with appropriate icon
const SectionHeader = ({ title }: any) => {
    return (
        <div className="flex items-center p-4 m-2 gap-2">
            <MyContractsIcon />
            <p className="text-[#fff]">{title}</p>
            <div className="flex-grow h-px bg-[#E8E9EE80]"></div>
        </div>
    );
};

interface SectionProps {
    section: any;
}

const DashboardSection: React.FC<SectionProps> = ({ section }) => {
    const [reportData, setReportData] = useState<Record<string, TransformedData | null>>({});
    const [widgetProps, setWidgetProps] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<Record<string, string | null>>({});
    const [isExpanded, setIsExpanded] = useState<boolean>(() => {
        // Initialize expanded state from section data
        // Default to true if not specified
        return section.expanded !== undefined ? section.expanded.toLowerCase() === "true" : true;
    });

    console.log(isExpanded);
    useEffect(() => {
        // Initialize widgetProps with default values
        const initialWidgetProps: Record<string, any> = {};
        section.widgets?.forEach((widget: any) => {
            initialWidgetProps[widget.id] = defaultPropsMapping[widget.name] || {};
        });
        setWidgetProps(initialWidgetProps);

        // Fetch report data for each widget
        const uniqueReports = new Set<string>();

        // Collect unique report names
        Object.values(section.fieldMappings || {}).forEach((mapping: any) => {
            if (mapping.reportName) {
                uniqueReports.add(mapping.reportName);
            }
        });

        // Fetch data for each unique report
        [...uniqueReports].forEach(async (reportName) => {
            setLoading(prev => ({ ...prev, [reportName]: true }));

            try {
                const response = await fetch(
                    `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${reportName}`
                );
                const data = await response.json();

                // Transform raw data into structured format
                const transformedData = transformFormMetadata(data);

                // Store the transformed data
                setReportData(prev => ({ ...prev, [reportName]: transformedData }));

                // Process widget props for all widgets using this report
                const updatedProps = { ...widgetProps };

                section.widgets?.forEach((widget: any) => {
                    const widgetMappingConfig = section.fieldMappings?.[widget.id];

                    if (widgetMappingConfig && widgetMappingConfig.reportName === reportName) {
                        // Process the widget mapping based on its type
                        try {
                            const processedProps = processWidgetData(widget, widgetMappingConfig, transformedData);
                            updatedProps[widget.id] = processedProps;
                        } catch (err) {
                            console.error(`Error processing widget ${widget.id}:`, err);
                            // Maintain default props if processing fails
                            updatedProps[widget.id] = defaultPropsMapping[widget.name] || {};
                        }
                    }
                });

                // Update all widgets after processing
                setWidgetProps(updatedProps);
                setLoading(prev => ({ ...prev, [reportName]: false }));
            } catch (err) {
                console.error(`Error fetching data for report ${reportName}:`, err);
                setError(prev => ({ ...prev, [reportName]: "Failed to load report data" }));
                setLoading(prev => ({ ...prev, [reportName]: false }));
            }
        });
    }, [section]);

    // Toggle expanded/collapsed state
    const toggleExpanded = () => {
        setIsExpanded(prev => !prev);
    };

    // Process a widget's data based on its mapping configuration
    const processWidgetData = (
        widget: any,
        mappingConfig: WidgetMappingConfig,
        data: TransformedData
    ): any => {
        console.log(`Processing widget ${widget.id}, type: ${widget.name}, mapping type: ${mappingConfig.mappingType}`);

        // Determine what kind of widget we're dealing with
        const mappingType = mappingConfig.mappingType;

        // Start with default props as a foundation
        let processedProps = JSON.parse(JSON.stringify(defaultPropsMapping[widget.name] || {}));

        try {
            if (mappingType === "simple") {
                // For simple metrics, process each field mapping
                Object.entries(mappingConfig.fields || {}).forEach(([fieldName, fieldMapping]) => {
                    if (fieldMapping.inputType === "manual") {
                        // Use manual value directly
                        processedProps = setValueByPath(
                            processedProps,
                            fieldMapping.fieldPath,
                            fieldMapping.manualValue
                        );
                    } else if (fieldMapping.inputType === "mapped" && fieldMapping.mappedConfig) {
                        // Extract mapped value from data
                        const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;

                        try {
                            const value = data.FormStructure[chaField][chaValue][kfField];
                            processedProps = setValueByPath(processedProps, fieldMapping.fieldPath, value);
                        } catch (err) {
                            console.error(`Error mapping field ${fieldName} for widget ${widget.id}:`, err);
                        }
                    }
                });
            }
            else if (mappingType === "chart" && mappingConfig.chartConfig) {
                // For charts, process the chart data
                const { xAxis, yAxis } = mappingConfig.chartConfig;

                if (xAxis && xAxis.field) {
                    // Handle different chart types
                    if (widget.name === "two-metrics-linechart" && yAxis && yAxis.field) {
                        // For line charts
                        const chartData = generateChartData(data, xAxis.field, yAxis.field, ["Overall Result"])
                            .map(item => ({
                                date: item.label,
                                [yAxis.field]: item.value,
                                unit: data.FormMetadata[yAxis.field]?.type || "%"
                            }));

                        // Get overall value for metrics
                        const overallValue = data.FormStructure[xAxis.field]["Overall Result"]?.[yAxis.field];

                        processedProps = {
                            data: {
                                chart_data: chartData,
                                chart_yaxis: yAxis.field,
                                metric_data: {
                                    metric_value: formatValue(overallValue, "currency"),
                                    metric_variance: "+0.00%", // This could be calculated with more data
                                    metric_label: data.FormMetadata[yAxis.field]?.label || yAxis.field,
                                },
                                widget_name: data.FormMetadata[yAxis.field]?.label || "Chart",
                            }
                        };
                    }
                    else if (widget.name === "two-metrics-piechart" && yAxis && yAxis.field) {
                        // For pie charts
                        const chartData = generateChartData(data, xAxis.field, yAxis.field, ["Overall Result"])
                            .map((item, index) => ({
                                label: item.label,
                                value: item.value,
                                fill: ["#84BD00", "#E1553F", "#2D7FF9", "#FFA500"][index % 4],
                            }));

                        // Get total value from "Overall Result"
                        const totalValue = data.FormStructure[xAxis.field]["Overall Result"]?.[yAxis.field];

                        processedProps = {
                            data: chartData,
                            metrics: {
                                amount: formatValue(totalValue, "currency"),
                                percentage: "100%",
                                label: data.FormMetadata[yAxis.field]?.label || yAxis.field,
                            }
                        };
                    }
                    else if (widget.name === "bar-chart" && yAxis && yAxis.field) {
                        // For bar charts
                        const chartData = Object.entries(data.FormStructure[xAxis.field] || {})
                            .filter(([chaValue]) => chaValue !== "Overall Result")
                            .map(([chaValue, values]: [string, any], index) => {
                                const value = values[yAxis.field] ? Number(values[yAxis.field]) : 0;
                                const colors = ['#83bd01', '#FFC846', '#E1553F', '#5899DA', '#8979FF'];

                                return {
                                    name: chaValue,
                                    value: value,
                                    fill: colors[index % colors.length],
                                };
                            });

                        const title = data.FormMetadata[yAxis.field]?.label || "Chart";

                        processedProps = {
                            data: chartData,
                            title: title,
                            variance: "+0.00%"
                        };
                    }
                    else if (widget.name === "stacked-bar-chart") {
                        // For stacked bar charts
                        if (mappingConfig.seriesConfig && mappingConfig.seriesConfig.series && yAxis.fields) {
                            // Get X-axis values (excluding "Overall Result")
                            const xValues = Object.keys(data.FormStructure[xAxis.field] || {})
                                .filter(key => key !== "Overall Result");

                            // Create data array with each X value and corresponding Y values
                            const chartData = xValues.map(xValue => {
                                const entry: Record<string, any> = { name: xValue };

                                // Add each Y series value
                                yAxis.fields.forEach((kfField:any) => {
                                    entry[kfField] = Number(data.FormStructure[xAxis.field][xValue][kfField] || 0);
                                });

                                return entry;
                            });

                            // Use the series configuration from the mapping
                            const series = mappingConfig.seriesConfig.series;
                            const title = data.FormMetadata[xAxis.field]?.label || "Stacked Chart";

                            processedProps = {
                                data: chartData,
                                series: series,
                                title: title
                            };
                        }
                    }
                    else if (widget.name === "orders-line-chart" && yAxis && yAxis.field) {
                        // For orders line chart
                        const chartData = Object.entries(data.FormStructure[xAxis.field] || {})
                            .filter(([chaValue]) => chaValue !== "Overall Result")
                            .map(([chaValue, values]: [string, any]) => {
                                return {
                                    name: chaValue,
                                    value: Number(values[yAxis.field] || 0)
                                };
                            });

                        // Calculate total value from "Overall Result"
                        let totalValue = "$0";
                        if (data.FormStructure[xAxis.field]["Overall Result"]) {
                            const total = Number(data.FormStructure[xAxis.field]["Overall Result"][yAxis.field] || 0);
                            totalValue = `$${total.toLocaleString()}`;
                        }

                        const title = data.FormMetadata[yAxis.field]?.label || "Line Chart";

                        processedProps = {
                            data: chartData,
                            title: title,
                            totalValue: totalValue
                        };
                    }
                    else if (widget.name === "dual-line-chart" && Array.isArray(yAxis) && yAxis.length >= 2) {
                        // For dual line chart
                        const chartData = Object.entries(data.FormStructure[xAxis.field] || {})
                            .filter(([chaValue]) => chaValue !== "Overall Result")
                            .map(([chaValue, values]: [string, any]) => {
                                return {
                                    name: chaValue,
                                    line1: Number(values[yAxis[0].field] || 0),
                                    line2: Number(values[yAxis[1].field] || 0)
                                };
                            });

                        // Create series configuration
                        const series = [
                            {
                                name: data.FormMetadata[yAxis[0].field]?.label || yAxis[0].field,
                                dataKey: "line1",
                                color: "#5899DA"
                            },
                            {
                                name: data.FormMetadata[yAxis[1].field]?.label || yAxis[1].field,
                                dataKey: "line2",
                                color: "#FFC846"
                            }
                        ];

                        const title =
                            `${data.FormMetadata[yAxis[0].field]?.label || yAxis[0].field} vs ${data.FormMetadata[yAxis[1].field]?.label || yAxis[1].field}`;

                        processedProps = {
                            data: chartData,
                            series: series,
                            title: title
                        };
                    }
                    else if (widget.name === "pie-chart-total" && yAxis && yAxis.field) {
                        // For pie chart with total
                        const chartData = Object.entries(data.FormStructure[xAxis.field] || {})
                            .filter(([chaValue]) => chaValue !== "Overall Result")
                            .map(([chaValue, values]: [string, any], index) => {
                                const value = Number(values[yAxis.field] || 0);
                                const colors = ['#84BD00', '#E1553F', '#5899DA', '#FFC846', '#8979FF'];

                                return {
                                    name: chaValue,
                                    value: value,
                                    fill: colors[index % colors.length]
                                };
                            });

                        // Get total value (sum of all segments)
                        const totalSum = chartData.reduce((sum, item) => sum + item.value, 0);
                        const totalValue = `$${totalSum.toLocaleString()}`;

                        // Get "Overall Result" value if available
                        let overallValue = 0;
                        if (data.FormStructure[xAxis.field]["Overall Result"]) {
                            overallValue = Number(data.FormStructure[xAxis.field]["Overall Result"][yAxis.field] || 0);
                        }
                        const subValue = `$${overallValue.toLocaleString()}`;

                        // Calculate variance
                        let variance = "+0.00%";
                        if (chartData.length > 0 && totalSum > 0) {
                            const diff = ((overallValue - totalSum) / totalSum) * 100;
                            variance = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}%`;
                        }

                        const title = data.FormMetadata[yAxis.field]?.label || "Pie Chart";

                        processedProps = {
                            data: chartData,
                            title: title,
                            totalValue: totalValue,
                            subValue: subValue,
                            variance: variance
                        };
                    }
                }
            }
            else if (mappingType === "quadrant" && mappingConfig.quadrantConfig) {
                // For quadrant metrics
                const { chaField, metrics } = mappingConfig.quadrantConfig;

                if (chaField && metrics && metrics.length > 0) {
                    // Define positions
                    const positions = ["top-left", "top-right", "bottom-left", "bottom-right"];

                    // Create metrics array with configured values
                    const quadrantMetrics = metrics.map((metricName:any, index:number) => {
                        // Find the value for this metric
                        let value = "0";

                        if (metricName) {
                            // For simplicity, just grab the first KF field's value for the given metric CHA value
                            const kfFields = Object.keys(data.FormStructure[chaField][metrics[0] || ""] || {});
                            if (kfFields.length > 0) {
                                const kfField = kfFields[0];
                                const metricValue = data.FormStructure[chaField][metricName]?.[kfField];
                                if (metricValue !== undefined) {
                                    value = String(metricValue);
                                }
                            }
                        }

                        return {
                            title: metricName || "No Data",
                            value: value,
                            position: positions[index] as "top-left" | "top-right" | "bottom-left" | "bottom-right"
                        };
                    });

                    // Fill in any missing metrics to ensure we have 4
                    while (quadrantMetrics.length < 4) {
                        quadrantMetrics.push({
                            title: "No Data",
                            value: "0",
                            position: positions[quadrantMetrics.length] as "top-left" | "top-right" | "bottom-left" | "bottom-right"
                        });
                    }

                    processedProps = { metrics: quadrantMetrics };
                }
            }
            else if (mappingType === "table" && mappingConfig.tableConfig) {
                // For tables, generate the table data
                const { columns } = mappingConfig.tableConfig;
            
                if (columns && columns.length > 0) {
                    // Get the CHA field (assuming first column is CHA)
                    const chaField = columns[0].field;
            
                    // Get all CHA values except "Overall Result"
                    const chaValues = Object.keys(data.FormStructure[chaField] || {})
                        .filter(val => val !== "Overall Result");
            
                    // Generate table rows
                    const tableData = chaValues.map(chaValue => {
                        const row:any= {};
            
                        // Process each column
                        columns.forEach((column, index) => {
                            // For the first column (CHA field), use the CHA value as the cell value
                            if (index === 0) {
                                row[column.field] = chaValue;
                            } else {
                                // For KF fields, get the value from the data
                                const value = data.FormStructure[chaField][chaValue][column.field];
                                // Format appropriately based on field type
                                row[column.field] = column.field.toLowerCase().includes('value') ? 
                                    formatValue(value, "currency") : Number(value || 0);
                            }
                        });
            
                        return row;
                    });
            
                    // Get total from "Overall Result"
                    let totalField = columns.length > 1 ? columns[1].field : null;
                    // If no second column, find first numeric column
                    if (!totalField) {
                        for (let i = 1; i < columns.length; i++) {
                            const sampleValue = data.FormStructure[chaField][chaValues[0]][columns[i].field];
                            if (!isNaN(Number(sampleValue))) {
                                totalField = columns[i].field;
                                break;
                            }
                        }
                    }
                    
                    const total = totalField ? data.FormStructure[chaField]["Overall Result"]?.[totalField] : 0;
                    const title = data.FormMetadata[chaField]?.label || "Table Data";
                    
                    processedProps = {
                        totalAmount: formatValue(total, "currency"),
                        title: title,
                        data: tableData,
                        // Include the column configurations
                        columns: columns.map(col => {
                            // Use the label from the metadata for header
                            const headerLabel = data.FormMetadata[col.field]?.label || col.header || col.field;
                            return {
                                field: col.field,
                                header: headerLabel
                            };
                        })
                    };
                }
            }
            // Add this to the processWidgetData function in your DashboardSection component

            // For LoansAppTray widget
            else if (widget.name === "loans-app-tray") {
                try {
                    // Start with default props
                    let processedProps = JSON.parse(JSON.stringify(defaultPropsMapping[widget.name]));
                    
                    const getKFFields = () => {
                        if (!processedProps || !processedProps.header) return [];
                        return processedProps.header.filter((field: any) => field.type === "KF");
                    };

                    // Check if we have field mappings for menuItems
                    if (mappingConfig.fields?.menuItems?.inputType === "mapped" &&
                        mappingConfig.fields.menuItems.mappedConfig) {

                        const { chaField } = mappingConfig.fields.menuItems.mappedConfig;

                        // Get all CHA values except "Overall Result"
                        const chaValues = Object.keys(data.FormStructure[chaField] || {})
                            .filter(val => val !== "Overall Result");

                        // Get the first KF field for counts
                        const kfFields = getKFFields();
                        const countField = kfFields[0]?.fieldName;

                        if (countField) {
                            // Create menu items from CHA values and counts
                            const menuItems = chaValues.map((chaValue, index) => {
                                // Use the count value from the data
                                const count = Number(data.FormStructure[chaField][chaValue][countField] || 0);

                                // Use default icons or map from config if available
                                const defaultIcon = index < processedProps.menuItems.length ?
                                    processedProps.menuItems[index].icon :
                                    `${process.env.NEXT_PUBLIC_BSP_NAME}/vector.svg`;

                                return {
                                    id: index + 1,
                                    icon: defaultIcon,
                                    label: chaValue,
                                    count: count
                                };
                            });

                            processedProps.menuItems = menuItems;
                        }
                    }

                    // Check if we have field mappings for chartData
                    if (mappingConfig.fields?.chartData?.inputType === "mapped" &&
                        mappingConfig.fields.chartData.mappedConfig) {

                        const { chaField } = mappingConfig.fields.chartData.mappedConfig;

                        // Get all CHA values except "Overall Result"
                        const chaValues = Object.keys(data.FormStructure[chaField] || {})
                            .filter(val => val !== "Overall Result");

                        // Get the first KF field for values
                        const kfFields = getKFFields();
                        const valueField = kfFields[0]?.fieldName;

                        if (valueField) {
                            // Create chart data from CHA values and values
                            const colors = ['#449ca4', '#5899da', '#ffaa04', '#ff0000', '#84BD00'];
                            const chartData = chaValues.map((chaValue, index) => {
                                // Use the value from the data
                                const value = Number(data.FormStructure[chaField][chaValue][valueField] || 0);

                                return {
                                    name: chaValue.substring(0, 2), // Use first 2 chars as short name
                                    value: value,
                                    color: colors[index % colors.length]
                                };
                            });

                            processedProps.chartData = chartData;
                        }
                    }

                    return processedProps;
                } catch (error) {
                    console.error("Error processing LoansAppTray widget:", error);
                    return defaultPropsMapping[widget.name];
                }
            }
        }

        catch (error) {
            console.error(`Error processing widget data for ${widget.id}:`, error);
            // Keep the default props if an error occurs
        }

        console.log(`Processed props for widget ${widget.id}:`, processedProps);
        return processedProps;
    };

    return (
        <div className="mb-8">
            <div
                className="flex items-center p-4 m-2 gap-2 cursor-pointer"
                onClick={toggleExpanded}
            >
                <MyContractsIcon />
                <p className="text-[#fff]">{section.sectionName}</p>
                <div className="flex-grow h-px bg-[#E8E9EE80]"></div>
                {/* Optional: Add expand/collapse indicator */}
                <span className="text-white">
                    {isExpanded ? '▼' : '►'}
                </span>
            </div>

            {isExpanded && (
                <div className="px-6">
                    {/* Show loading indicator if any reports are still loading */}
                    {Object.values(loading).some(isLoading => isLoading) && (
                        <div className="flex justify-center items-center h-20 mb-4">
                            <CircularProgress size={24} />
                            <Typography className="ml-2 text-white">Loading widget data...</Typography>
                        </div>
                    )}

                    {/* Show error message if any reports failed to load */}
                    {Object.entries(error).map(([reportName, errorMsg]) =>
                        errorMsg && (
                            <div key={reportName} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                <Typography>Error loading data for report {reportName}: {errorMsg}</Typography>
                            </div>
                        )
                    )}

                    <GridLayout
                        className="layout w-full"
                        layout={section.layout}
                        cols={12}
                        rowHeight={80}
                        isResizable={false}
                        isDraggable={false}
                    >
                        {section.widgets?.map((widget: any) => {
                            const Component = widgetMapping[widget.name];
                            const props = widgetProps[widget.id] || defaultPropsMapping[widget.name] || {};

                            return (
                                <div
                                    key={widget.id}
                                    className="bg-transparent shadow-md rounded-lg relative"
                                >
                                    {Component ? (
                                        <Component {...props} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-white bg-red-500 bg-opacity-30 rounded-lg">
                                            Widget type not found
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </GridLayout>
                </div>
            )}
        </div>
    );
};

export default function Home() {
    const [dashboardData, setDashboardData] = useState({ sections: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // setLoading(false);
     useEffect(() => {
        // Fetch dashboard configuration from API
        fetch("/api/dashboard")
            .then((res) => res.json())
            .then((data) => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard configuration");
                setLoading(false);
            });
    }, []); 

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
                <div className="text-white ml-4">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-white bg-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <div className="flex min-h-screen">
                <Sidebar />
            </div>
            <div className="relative w-full min-h-screen">
                {/* Background Image */}
                <div
  className="absolute inset-0 bg-cover bg-center"
  style={{
    backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
  }}
></div>


                <div className="relative z-10 flex flex-col text-white max-h-screen overflow-y-auto">
                    <Header />
                    <div className="flex flex-col w-full max-w-[1633px] mx-auto items-start gap-7 py-11 px-6">
                        <NewsFeed />
                    </div>


                    {/* Empty state if no sections */}
                    {dashboardData.sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <Typography variant="h5" className="text-white mb-4">
                                No dashboard sections found
                            </Typography>
                            <Typography className="text-white">
                                Create a new section by clicking "Create Section" in the header
                            </Typography>
                        </div>
                    ) : (
                        /* Render all sections vertically */
                        <div className="flex flex-col">
                            {dashboardData.sections.map((section, index) => (
                                <DashboardSection key={index} section={section} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}