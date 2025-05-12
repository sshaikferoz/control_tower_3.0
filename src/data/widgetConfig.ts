// data/widgetConfig.ts
import BarMetric from '@/grid-components/BarMetric';
import DualLineChart from '@/grid-components/DualLineChart';
import LoansAppTray from '@/grid-components/LoansAppTray';
import MultiMetrics from '@/grid-components/MultiMetrics';
import OrdersLineChart from '@/grid-components/OrdersLineChart';
import PieChartWithTotal from '@/grid-components/PieChartWithTotal';
import PieMetric from '@/grid-components/PieMetric';
import QuadrantMetrics from '@/grid-components/QuadrantMetrics';
import SimpleMetric from '@/grid-components/SimpleMetric';
import SingleLineChart from '@/grid-components/SingleLineChart';
import StackedBarChart from '@/grid-components/StackedBarChart';
import TableMetric from '@/grid-components/TableMetric';
import { WidgetTypes } from '@/types';

// Configuration fields for different widget types
export const widgetConfigFields: Record<string, Array<{ field: string; path: string }>> = {
    [WidgetTypes.ONE_METRIC]: [
        { field: 'name', path: 'name' },
        { field: 'value', path: 'value' }
    ],
    [WidgetTypes.ONE_METRIC_DATE]: [
        { field: 'name', path: 'name' },
        { field: 'value', path: 'value' },
        { field: 'date', path: 'date' }
    ],
    [WidgetTypes.TWO_METRICS]: [
        { field: 'metric1', path: 'metric1' },
        { field: 'value1', path: 'value1' },
        { field: 'metric2', path: 'metric2' },
        { field: 'value2', path: 'value2' }
    ],
    [WidgetTypes.TWO_METRICS_LINECHART]: [
        { field: 'chart_data', path: 'data.chart_data' },
        { field: 'chart_yaxis', path: 'data.chart_yaxis' },
        { field: 'metric_data', path: 'data.metric_data' },
        { field: 'widget_name', path: 'data.widget_name' }
    ],
    [WidgetTypes.TWO_METRICS_PIECHART]: [
        { field: 'data', path: 'data' },
        { field: 'metrics', path: 'metrics' }
    ],
    [WidgetTypes.ONE_METRIC_TABLE]: [
        { field: 'totalAmount', path: 'totalAmount' },
        { field: 'data', path: 'data' }
    ],
    [WidgetTypes.BAR_CHART]: [
        { field: 'data', path: 'data' },
        { field: 'title', path: 'title' },
        { field: 'variance', path: 'variance' }
    ],
    [WidgetTypes.STACKED_BAR_CHART]: [
        { field: 'data', path: 'data' },
        { field: 'title', path: 'title' },
        { field: 'series', path: 'series' }
    ],
    [WidgetTypes.ORDERS_LINE_CHART]: [
        { field: 'data', path: 'data' },
        { field: 'title', path: 'title' },
        { field: 'totalValue', path: 'totalValue' }
    ],
    [WidgetTypes.DUAL_LINE_CHART]: [
        { field: 'data', path: 'data' },
        { field: 'title', path: 'title' },
        { field: 'series', path: 'series' }
    ],
    [WidgetTypes.PIE_CHART_TOTAL]: [
        { field: 'data', path: 'data' },
        { field: 'title', path: 'title' },
        { field: 'totalValue', path: 'totalValue' },
        { field: 'subValue', path: 'subValue' },
        { field: 'variance', path: 'variance' }
    ],
    [WidgetTypes.QUADRANT_METRICS]: [
        { field: 'metrics', path: 'metrics' }
    ],
    [WidgetTypes.LOANS_APP_TRAY]: [
        { field: 'menuItems', path: 'menuItems' },
        { field: 'chartData', path: 'chartData' }
    ]
};

// Component mapping for widgets
export const widgetMapping: Record<string, React.ComponentType<any>> = {
    [WidgetTypes.TWO_METRICS]: MultiMetrics,
    [WidgetTypes.TWO_METRICS_PIECHART]: PieMetric,
    [WidgetTypes.ONE_METRIC]: SimpleMetric,
    [WidgetTypes.ONE_METRIC_DATE]: SimpleMetric,
    [WidgetTypes.TWO_METRICS_LINECHART]: SingleLineChart,
    [WidgetTypes.ONE_METRIC_TABLE]: TableMetric,
    [WidgetTypes.BAR_CHART]: BarMetric,
    [WidgetTypes.STACKED_BAR_CHART]: StackedBarChart,
    [WidgetTypes.ORDERS_LINE_CHART]: OrdersLineChart,
    [WidgetTypes.DUAL_LINE_CHART]: DualLineChart,
    [WidgetTypes.PIE_CHART_TOTAL]: PieChartWithTotal,
    [WidgetTypes.QUADRANT_METRICS]: QuadrantMetrics,
    [WidgetTypes.LOANS_APP_TRAY]: LoansAppTray
};
