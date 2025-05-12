import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Widget, LayoutItem } from '@/types';

import { widgetMapping } from '@/data/widgetConfig';

// Setup GridLayout with width provider
const GridLayout = WidthProvider(RGL);

interface WidgetGridProps {
  widgets: Widget[];
  layout: LayoutItem[];
  selectedWidget: string | null;
  widgetConfigurations: Record<string, any>;
  previewData: any;
  onLayoutChange: (layout: LayoutItem[]) => void;
  onWidgetClick: (id: string, event: React.MouseEvent) => void;
  onRemoveWidget: (id: string) => void;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({
  widgets,
  layout,
  selectedWidget,
  widgetConfigurations,
  previewData,
  onLayoutChange,
  onWidgetClick,
  onRemoveWidget
}) => {

  return (
    <GridLayout
      className="layout w-full h-52"
      layout={layout}
      cols={12}
      rowHeight={80}
      width={80}
      isResizable={false}
      isDraggable={true}
      onLayoutChange={onLayoutChange}
    >
      {widgets.map(({ id, name }) => {
        const Component = widgetMapping[name];
        // Use previewData if available, otherwise use configuration
        const widgetProps =
          (previewData && selectedWidget === id)
            ? previewData
            : (widgetConfigurations[id] || {});

        return (
          <div
            key={id}
            className={`bg-white shadow-md rounded-lg relative z-100 ${
              selectedWidget === id ? "border-2 border-blue-500" : ""
            }`}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(e) => onWidgetClick(id, e)}
          >
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs z-50"
              style={{ pointerEvents: "auto" }}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onRemoveWidget(id);
              }}
            >
              ✕
            </button>
            <Component {...widgetProps} />
          </div>
        );
      })}
    </GridLayout>
  );
};

export default WidgetGrid;