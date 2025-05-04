// Types for the mapping system

// Represents the source of a mapping value
export enum MappingSourceType {
    API = 'api',       // Value comes from an API response
    MANUAL = 'manual', // Value was manually entered by user
}

// A path to a specific value in a nested object structure
export type ObjectPath = string; // e.g. "FormStructure.ZSCMCMD.OCTG.VALUE001"

// Represents a single mapping configuration
export interface Mapping {
    id: string;
    sourceType: MappingSourceType;

    // For API-based mappings
    path?: ObjectPath;

    // For manual mappings
    manualValue?: any;

    // Optional transformation function to apply to the resolved value
    transform?: (value: any) => any;
}

// Configuration for mapping a field label
export interface LabelMapping {
    id: string;
    sourceType: MappingSourceType;

    // For API-based label mappings
    path?: ObjectPath;

    // For manual label mappings
    manualValue?: string;
}

// Complete mapping configuration for a field
export interface FieldMapping {
    id: string;
    valueMapping: Mapping;
    labelMapping: LabelMapping;
}

// Widget type definitions
export type WidgetType =
    | "one-metric"
    | "one-metric-date"
    | "two-metrics"
    | "two-metrics-linechart"
    | "two-metrics-piechart"
    | "one-metric-table"
    | "bar-chart"
    | "stacked-bar-chart"
    | "orders-line-chart"
    | "dual-line-chart"
    | "pie-chart-total"
    | "quadrant-metrics"
    | "loans-app-tray";

// Layout configuration for a widget
export interface WidgetLayout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
}

// Widget definition
export interface Widget {
    id: string;
    type: WidgetType;
    mappings: FieldMapping[];
}

// The complete mapping configuration
export interface MappingConfiguration {
    widgets: Widget[];
    layouts: WidgetLayout[];
    apiEndpoint?: string;
    apiResponse?: any; // Cached API response
}

// Chart Data Types
export interface ChartDataPoint {
    name: string;
    value: number;
    [key: string]: any;
}

export interface LineChartData {
    data: ChartDataPoint[];
    title: string;
    totalValue: string;
}

export interface MultiSeriesChartData {
    data: ChartDataPoint[];
    title: string;
    series: {
        name: string;
        dataKey: string;
        color: string;
    }[];
}

export interface PieChartData {
    data: {
        name: string;
        value: number;
        fill: string;
    }[];
    title: string;
    totalValue: string;
    subValue: string;
    variance: string;
}

export interface QuadrantData {
    metrics: {
        title: string;
        value: string;
        position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    }[];
}

export interface TableData {
    totalAmount: string;
    data: Array<Record<string, any>>;
    columns?: Array<{ field: string; header: string }>;
    title?: string;
}

// Widget data store
export interface WidgetDataStore {
    [widgetId: string]: any;
}

// Widget size configurations
export const widgetSizes: Record<WidgetType, { w: number; h: number }> = {
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