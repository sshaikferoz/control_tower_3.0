import React from 'react';
import { WidgetType } from './types';
import { resolveWidgetMappings } from './utils';

// Import all widget components
// import OrdersLineChart from './widgets/OrdersLineChart';
// import DualLineChart from './widgets/DualLineChart';
// import BarMetric from './widgets/BarMetric';
// import TableMetric from './widgets/TableMetric';
// import PieChartWithTotal from './widgets/PieChartWithTotal';
// import QuadrantMetrics from './widgets/QuadrantMetrics';
// import LoansAppTray from './widgets/LoansAppTray';
// import SimpleMetric from './widgets/SimpleMetric';
// import SimpleMetricDate from './widgets/SimpleMetricDate';
import MultiMetrics from './widgets/MultiMetrics';
import PieMetric from './widgets/PieMetric';
// import SingleLineChart from './widgets/SingleLineChart';
// import StackedBarChart from './widgets/StackedBarChart';

// Widget component mapping
const widgetComponents: Record<WidgetType, React.ComponentType<any>> = {
//   "one-metric": SimpleMetric,
//   "one-metric-date": SimpleMetricDate,
  "two-metrics": MultiMetrics,
//   "two-metrics-linechart": SingleLineChart,
  "two-metrics-piechart": PieMetric,
//   "one-metric-table": TableMetric,
//   "bar-chart": BarMetric,
//   "stacked-bar-chart": StackedBarChart,
//   "orders-line-chart": OrdersLineChart,
//   "dual-line-chart": DualLineChart,
//   "pie-chart-total": PieChartWithTotal,
//   "quadrant-metrics": QuadrantMetrics,
//   "loans-app-tray": LoansAppTray
};

interface WidgetFactoryProps {
  type: WidgetType;
  mappings: any[];
  config?: Record<string, any>;
  apiData?: any;
  className?: string;
}

/**
 * A factory component that renders the appropriate widget based on type and configuration
 */
const WidgetFactory: React.FC<WidgetFactoryProps> = ({
  type,
  mappings,
  config = {},
  apiData,
  className = ''
}) => {
  // Get the widget component
  const Component = widgetComponents[type];
  
  if (!Component) {
    return (
      <div className={`${className} bg-red-50 text-red-800 p-4 rounded-lg`}>
        <div className="font-medium">Widget Error</div>
        <div className="text-sm">Unknown widget type: {type}</div>
      </div>
    );
  }
  
  // Resolve mappings into actual data
  const resolvedData = apiData ? resolveWidgetMappings(mappings, apiData) : {};
  
  // Get widget props based on widget type
  const widgetProps = generateWidgetProps(type, resolvedData, config);
  
  return <Component {...widgetProps} className={className} />;
};

/**
 * Generate specific props for each widget type based on mappings and config
 */
function generateWidgetProps(
  type: WidgetType, 
  resolvedData: Record<string, any>, 
  config: Record<string, any>
): any {
  // Process data based on widget type
  switch (type) {
    case "one-metric":
      return {
        name: resolvedData.name || config.title || "Metric",
        value: resolvedData.value !== undefined ? resolvedData.value : 0
      };
      
    case "one-metric-date":
      return {
        name: resolvedData.name || config.title || "Metric",
        value: resolvedData.value !== undefined ? resolvedData.value : 0,
        date: resolvedData.date || new Date().toLocaleDateString()
      };
      
    case "two-metrics":
      return {
        metric1: resolvedData.metric1 || "Metric 1",
        value1: resolvedData.value1 !== undefined ? resolvedData.value1 : 0,
        metric2: resolvedData.metric2 || "Metric 2",
        value2: resolvedData.value2 !== undefined ? resolvedData.value2 : 0
      };
      
    case "two-metrics-linechart":
      // For line chart we need to process the data into the expected format
      return {
        data: {
          chart_data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
          chart_yaxis: resolvedData.yAxisLabel || "Value",
          metric_data: {
            metric_value: resolvedData.totalValue || "$0",
            metric_variance: resolvedData.variance || "+0%",
            metric_label: resolvedData.metricLabel || "Total"
          },
          widget_name: config.title || resolvedData.title || "Line Chart"
        }
      };
      
    case "two-metrics-piechart":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        metrics: {
          amount: resolvedData.amount || "$0",
          percentage: resolvedData.percentage || "0%",
          label: resolvedData.label || config.title || "Pie Chart"
        }
      };
      
    case "one-metric-table":
      return {
        totalAmount: resolvedData.totalAmount || "$0",
        data: Array.isArray(resolvedData.rows) ? resolvedData.rows : [],
        columns: Array.isArray(resolvedData.columns) ? resolvedData.columns : undefined,
        title: config.title || resolvedData.title || "Table"
      };
      
    case "bar-chart":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        title: config.title || resolvedData.title || "Bar Chart",
        variance: resolvedData.variance || "+0%"
      };
      
    case "stacked-bar-chart":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        title: config.title || resolvedData.title || "Stacked Bar Chart",
        totalValue: resolvedData.totalValue || "",
        series: Array.isArray(resolvedData.series) ? resolvedData.series : []
      };
      
    case "orders-line-chart":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        title: config.title || resolvedData.title || "Orders Line Chart",
        totalValue: resolvedData.totalValue || "$0"
      };
      
    case "dual-line-chart":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        title: config.title || resolvedData.title || "Dual Line Chart",
        series: Array.isArray(resolvedData.series) ? resolvedData.series : []
      };
      
    case "pie-chart-total":
      return {
        data: Array.isArray(resolvedData.data) ? resolvedData.data : [],
        title: config.title || resolvedData.title || "Pie Chart",
        totalValue: resolvedData.totalValue || "$0",
        subValue: resolvedData.subValue || "$0",
        variance: resolvedData.variance || "+0%"
      };
      
    case "quadrant-metrics":
      return {
        metrics: Array.isArray(resolvedData.metrics) ? resolvedData.metrics : [
          { title: "Top Left", value: "0", position: "top-left" },
          { title: "Top Right", value: "0", position: "top-right" },
          { title: "Bottom Left", value: "0", position: "bottom-left" },
          { title: "Bottom Right", value: "0", position: "bottom-right" }
        ]
      };
      
    case "loans-app-tray":
      return {
        menuItems: Array.isArray(resolvedData.menuItems) ? resolvedData.menuItems : [],
        chartData: Array.isArray(resolvedData.chartData) ? resolvedData.chartData : []
      };
      
    default:
      // Return a combination of resolved data and config for unknown widget types
      return { ...resolvedData, ...config };
  }
}

export default WidgetFactory;