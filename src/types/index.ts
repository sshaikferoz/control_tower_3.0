// types/index.ts
import { ReactNode } from 'react';

// Widget types enum matching the widget keys in widgetMapping
export enum WidgetTypes {
    ONE_METRIC = "one-metric",
    ONE_METRIC_DATE = "one-metric-date",
    TWO_METRICS_LINECHART = "two-metrics-linechart",
    TWO_METRICS = "two-metrics",
    TWO_METRICS_PIECHART = "two-metrics-piechart",
    ONE_METRIC_TABLE = "one-metric-table",
    BAR_CHART = "bar-chart",
    STACKED_BAR_CHART = "stacked-bar-chart",
    ORDERS_LINE_CHART = "orders-line-chart",
    DUAL_LINE_CHART = "dual-line-chart",
    PIE_CHART_TOTAL = "pie-chart-total",
    QUADRANT_METRICS = "quadrant-metrics",
    LOANS_APP_TRAY = "loans-app-tray"
}

// Widget configuration field
export interface WidgetConfigField {
    field: string;
    path: string;
}

// Layout item interface
export interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    static?: boolean;
    sectionName?: string;
}

// Widget interface
export interface Widget {
    id: string;
    name: WidgetTypes | string;
    props?: Record<string, any>;
}

// Widget size configuration
export interface WidgetSize {
    w: number;
    h: number;
}

// Section interface
export interface Section {
    sectionName: string;
    layout: LayoutItem[];
    widgets: Widget[];
    expanded: boolean;
}

// Tab panel props
export interface TabPanelProps {
    children?: ReactNode;
    value: number;
    index: number;
    [key: string]: any;
}

// Array editor props
export interface ArrayEditorProps {
    value: any[];
    onChange: (value: any[]) => void;
    itemStructure: Record<string, any>;
    title: string;
}

// Object editor props
export interface ObjectEditorProps {
    value: Record<string, any>;
    onChange: (value: Record<string, any>) => void;
    objectStructure: Record<string, any>;
    title: string;
}

// Value editor props
export interface ValueEditorProps {
    field: string;
    value: any;
    widgetType: WidgetTypes;
    onChange: (field: string, value: any) => void;
}