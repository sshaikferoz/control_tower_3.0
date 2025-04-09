import { 
    FormTransformHeaders, 
    FormTransformInputType, 
    TransformedData, 
    WidgetFieldMapping,
    WidgetMappingConfig,
    ObjectPath
  } from "./types";
  
  // Transform the raw response data into a more usable structure
  export function transformFormMetadata(data: FormTransformInputType): TransformedData {
    const chaHeader = data.header.find((h) => h.type === "CHA");
    if (!chaHeader) throw new Error("No CHA type header found");
  
    const chaKey = chaHeader.fieldName;
  
    // Create a nested structure where the CHA values are the keys
    const FormStructure: Record<string, any> = { [chaKey]: {} };
    data.chartData.forEach((row) => {
      const key = row[chaKey];
      if (key !== undefined) {
        FormStructure[chaKey][key] = Object.fromEntries(
          Object.entries(row).filter(([k]) => k !== chaKey)
        );
      }
    });
  
    // Organize metadata for easy access
    const FormMetadata: Record<string, FormTransformHeaders> = {};
    data.header.forEach((header) => {
      FormMetadata[header.fieldName] = {
        type: header.type,
        label: header.label,
        fieldName: header.fieldName,
        axisType: header.axisType, // For charting purposes
        displayStyle: header.displayStyle
      };
    });
  
    return { FormStructure, FormMetadata };
  }
  
  // Get value from an object using a path string (e.g., "data.chart_data.0.value")
  export function getValueByPath(obj: any, path: string): any {
    if (!path) return obj;
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      // Handle array indexing
      if (!isNaN(Number(part)) && Array.isArray(current)) {
        current = current[Number(part)];
      } else {
        current = current[part];
      }
    }
    
    return current;
  }
  
  // Set value in an object using a path string
  export function setValueByPath(obj: any, path: string, value: any): any {
    if (!path) return value;
    
    const result = { ...obj };
    const parts = path.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      // Create path if it doesn't exist
      if (!current[part]) {
        // If next part is a number, create an array, otherwise an object
        const nextIsNumber = !isNaN(Number(parts[i + 1]));
        current[part] = nextIsNumber ? [] : {};
      }
      
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
    
    return result;
  }
  
  // Process field mappings to generate actual widget props
  export function processWidgetMappings(
    widgetConfig: WidgetMappingConfig,
    reportData: TransformedData
  ): Record<string, any> {
    // Result object that will hold all processed values
    const result: Record<string, any> = {};
    
    // Process each field
    Object.entries(widgetConfig.fields).forEach(([fieldName, fieldMapping]) => {
      if (fieldMapping.inputType === "manual" && fieldMapping.manualValue !== undefined) {
        // Use manual value directly
        result[fieldName] = fieldMapping.manualValue;
      } else if (fieldMapping.inputType === "mapped" && fieldMapping.mappedConfig) {
        // Process mapped field
        const { chaField, chaValue, kfField } = fieldMapping.mappedConfig;
        
        // Access data using the path
        if (reportData.FormStructure[chaField] && 
            reportData.FormStructure[chaField][chaValue] &&
            reportData.FormStructure[chaField][chaValue][kfField] !== undefined) {
          
          result[fieldName] = reportData.FormStructure[chaField][chaValue][kfField];
        }
      }
    });
    
    // Special handling for charts
    if (widgetConfig.mappingType === "chart" && widgetConfig.chartConfig) {
      // Process chart data - this will depend on the specific chart structure
      // Here we're creating a sample chart data structure
      const { xAxis, yAxis } = widgetConfig.chartConfig;
      
      if (xAxis.type === "CHA" && yAxis.type === "KF") {
        // Find CHA values
        const chaField = xAxis.field;
        const chaValues = Object.keys(reportData.FormStructure[chaField] || {});
        
        // Generate chart data array
        const chartData = chaValues.map(chaValue => {
          const kfValue = reportData.FormStructure[chaField][chaValue][yAxis.field];
          return {
            x: chaValue,  // X-axis label (CHA value)
            y: kfValue,   // Y-axis value (KF value)
            [yAxis.field]: kfValue // Include the original field name
          };
        });
        
        // Set chart data in the result
        result.data = {
          chart_data: chartData,
          chart_yaxis: yAxis.field,
          // Include other chart metadata as needed
          metric_data: {
            metric_label: reportData.FormMetadata[yAxis.field]?.label || yAxis.field,
            // Other metrics can be calculated or fetched
            metric_value: "",
            metric_variance: "",
          },
          widget_name: reportData.FormMetadata[yAxis.field]?.label || "Chart",
        };
      }
    }
    
    // Special handling for tables
    if (widgetConfig.mappingType === "table" && widgetConfig.tableConfig) {
      // Process table data
      const { columns } = widgetConfig.tableConfig;
      
      // For tables, we often use the entire dataset with specific columns
      // This is just an example approach - actual implementation might differ
      // based on your specific table component needs
      const tableData = [];
      
      // Find the CHA field (assuming first column is from CHA)
      const chaField = columns[0].field;
      const chaValues = Object.keys(reportData.FormStructure[chaField] || {});
      
      // For each CHA value, create a row
      chaValues.forEach(chaValue => {
        const row: Record<string, any> = {};
        
        // For each column, get the corresponding value
        columns.forEach(column => {
          // If it's the CHA column
          if (column.field === chaField) {
            row[column.header] = chaValue;
          } 
          // Otherwise it's a KF column
          else {
            row[column.header] = reportData.FormStructure[chaField][chaValue][column.field];
          }
        });
        
        tableData.push(row);
      });
      
      result.data = tableData;
      
      // Calculate total amount if needed
      if (columns.some(col => col.field.includes("VALUE"))) {
        // Example: Sum all values for a specific KF field
        const kfField = columns.find(col => col.field.includes("VALUE"))?.field;
        if (kfField) {
          let total = 0;
          chaValues.forEach(chaValue => {
            const value = reportData.FormStructure[chaField][chaValue][kfField];
            if (!isNaN(Number(value))) {
              total += Number(value);
            }
          });
          result.totalAmount = `$${total.toLocaleString()}`;
        }
      }
    }
    
    return result;
  }
  
  // Generate chart data from FormStructure based on mapping
  export function generateChartData(
    formData: TransformedData,
    chaField: string,
    kfField: string,
    excludeValues: string[] = []
  ): any[] {
    const chartData = [];
    
    // Ensure the required fields exist
    if (!formData.FormStructure[chaField]) {
      return [];
    }
    
    // For each CHA value, create a data point
    Object.entries(formData.FormStructure[chaField]).forEach(([chaValue, kfValues]: [string, any]) => {
      // Skip excluded values (like "Overall Result")
      if (excludeValues.includes(chaValue)) {
        return;
      }
      
      // Get the KF value for this CHA value
      const value = kfValues[kfField];
      
      // Only add if the value exists
      if (value !== undefined && value !== "") {
        chartData.push({
          date: chaValue, // For line charts, assuming CHA values are dates
          [kfField]: Number(value),
          label: chaValue, // For pie charts
          value: Number(value), // For pie charts
          // Add other needed properties here
        });
      }
    });
    
    return chartData;
  }
  
  // Format values for display (add currency symbols, percentages, etc.)
  export function formatValue(value: any, type: string = "number"): string {
    if (value === undefined || value === null || value === "") {
      return "";
    }
    
    switch (type) {
      case "currency":
        return `$${Number(value).toLocaleString()}`;
      case "percentage":
        return `${Number(value).toFixed(2)}%`;
      case "number":
        return Number(value).toLocaleString();
      default:
        return String(value);
    }
  }
  
  // Generate a unique color for chart elements
  export function generateChartColors(index: number): string {
    const colors = [
      "#84BD00", "#E1553F", "#2D7FF9", "#FFA500", 
      "#8E44AD", "#16A085", "#DC143C", "#4682B4"
    ];
    return colors[index % colors.length];
  }