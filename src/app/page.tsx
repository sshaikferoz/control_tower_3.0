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
import {
  transformFormMetadata,
  processWidgetMappings,
  getValueByPath,
  setValueByPath,
  generateChartData,
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

// Setup Mirage.js mock server
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
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
}

const GridLayout = WidthProvider(RGL);

// Default widget props for when data isn't available
const defaultPropsMapping: Record<string, any> = {
  "one-metric": { name: "Active Contracts", value: 45 },
  "one-metric-date": {
    name: "Open PO Orders",
    value: 18,
    date: "13-Aug-2024",
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
  "two-metrics": {
    metric1: "Long Form",
    value1: "12.3",
    metric2: "Short & Mid-Form",
    value2: "135",
  },
};

// Component mappings
const widgetMapping: Record<string, React.ComponentType<any>> = {
  "two-metrics": MultiMetrics,
  "two-metrics-piechart": PieMetric,
  "one-metric": SimpleMetric,
  "one-metric-date": SimpleMetricDate,
  "two-metrics-linechart": SingleLineChart,
  "one-metric-table": TableMetric,
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
        section.widgets?.forEach((widget: any) => {
          const widgetMapping = section.fieldMappings?.[widget.id];
          
          if (widgetMapping && widgetMapping.reportName === reportName) {
            // Process the widget mapping
            const processedProps = processWidgetData(widget, widgetMapping, transformedData);
            
            setWidgetProps(prev => ({
              ...prev,
              [widget.id]: processedProps
            }));
          }
        });
        
        setLoading(prev => ({ ...prev, [reportName]: false }));
      } catch (err) {
        console.error(`Error fetching data for report ${reportName}:`, err);
        setError(prev => ({ ...prev, [reportName]: "Failed to load report data" }));
        setLoading(prev => ({ ...prev, [reportName]: false }));
      }
    });
  }, [section]);

  // Process a widget's data based on its mapping configuration
  const processWidgetData = (
    widget: any, 
    mappingConfig: WidgetMappingConfig, 
    data: TransformedData
  ): any => {
    // Determine what kind of widget we're dealing with
    const mappingType = mappingConfig.mappingType;
    
    // Start with default props as a fallback
    let processedProps = defaultPropsMapping[widget.name] || {};
    
    if (mappingType === "simple") {
      // For simple metrics, process each field mapping
      Object.entries(mappingConfig.fields).forEach(([fieldName, fieldMapping]) => {
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
      
      if (xAxis.field && yAxis.field) {
        if (widget.name === "two-metrics-linechart") {
          // For line charts
          const chartData = generateChartData(data, xAxis.field, yAxis.field, ["Overall Result"])
            .map(item => ({
              date: item.label,
              [yAxis.field]: item.value,
              unit: data.FormMetadata[yAxis.field]?.type || "%"
            }));
          
          // Get overall value for metrics
          const overallValue = data.FormStructure[xAxis.field]["Overall Result"]?.[yAxis.field];
          
          processedProps= {
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
        else if (widget.name === "two-metrics-piechart") {
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
          const row: Record<string, any> = {
            supplier_name: chaValue // Assuming first column is the name column
          };
          
          // Skip the first column since we already set it
          columns.slice(1).forEach(column => {
            // Get value for this column
            const value = data.FormStructure[chaField][chaValue][column.field];
            
            // Determine field name based on column header
            const fieldName = column.header.toLowerCase().includes("contract") ? 
              "contracts" : "value";
            
            // Format the value appropriately
            if (fieldName === "contracts") {
              row[fieldName] = Number(value || 0);
            } else {
              row[fieldName] = formatValue(value, "currency");
            }
          });
          
          return row;
        });
        
        // Get total from "Overall Result"
        const total = data.FormStructure[chaField]["Overall Result"]?.[columns[1]?.field];
        
        processedProps = {
          totalAmount: formatValue(total, "currency"),
          data: tableData
        };
      }
    }
    
    return processedProps;
  };

  return (
    <div className="mb-8">
      <SectionHeader title={section.sectionName} />
      
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
    </div>
  );
};

export default function Home() {
  const [dashboardData, setDashboardData] = useState({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="absolute inset-0 bg-[url('/background/bg.png')] bg-cover bg-center"></div>
       
        <div className="relative z-10 flex flex-col text-white">
          <Header />

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