// hooks/useWidgetConfiguration.ts
import { useState, useCallback } from 'react';
import { Widget } from '@/types';
import { defaultPropsMapping } from '@/data/widgetDefaults';
import { setValueByPath, parseValueType } from '@/utils/widgetHelpers';

export const useWidgetConfiguration = () => {
    const [widgetConfigurations, setWidgetConfigurations] = useState<Record<string, any>>({});
    const [previewData, setPreviewData] = useState<any>(null);

    // Initialize widget configuration when a new widget is added
    const initializeWidgetConfig = useCallback((widgetId: string, widgetName: string) => {
        // Store the default widget props in widgetConfigurations
        setWidgetConfigurations((prev) => ({
            ...prev,
            [widgetId]: {
                ...JSON.parse(JSON.stringify(defaultPropsMapping[widgetName])), // Deep copy
                widgetType: widgetName
            }
        }));
    }, []);

    // Update a value in the widget configuration
    const updateWidgetConfig = useCallback((widgetId: string, path: string, value: any) => {
        if (!widgetId) return;

        let processedValue = value;

        // If value is string but looks like it might be an object/array
        if (typeof value === 'string') {
            processedValue = parseValueType(value);
        }

        // Update the widget configuration by setting the value at the path
        setWidgetConfigurations((prev) => {
            const updatedConfig = JSON.parse(JSON.stringify(prev[widgetId] || {}));
            return {
                ...prev,
                [widgetId]: path ? setValueByPath(updatedConfig, path, processedValue) : {
                    ...updatedConfig,
                    [value]: processedValue
                }
            };
        });
    }, []);

    // Generate preview data based on current configuration
    const generatePreview = useCallback((widgetId: string) => {
        if (!widgetId) return;

        // Use the current widget configuration directly
        const previewProps = JSON.parse(JSON.stringify(widgetConfigurations[widgetId] || {}));

        // Update preview data state
        setPreviewData(previewProps);
    }, [widgetConfigurations]);

    // Save preview data to widget configuration
    const savePreviewData = useCallback((widgetId: string) => {
        if (!widgetId || !previewData) return;

        setWidgetConfigurations((prev) => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                ...previewData
            }
        }));

        setPreviewData(null);
    }, [previewData]);

    // Reset preview data
    const resetPreviewData = useCallback(() => {
        setPreviewData(null);
    }, []);

    // Get the configuration for a specific widget
    const getWidgetConfig = useCallback((widgetId: string, defaultWidgetType = '') => {
        return widgetConfigurations[widgetId] || (defaultWidgetType ? defaultPropsMapping[defaultWidgetType] : {});
    }, [widgetConfigurations]);

    // Remove widget configuration
    const removeWidgetConfig = useCallback((widgetId: string) => {
        setWidgetConfigurations((prev) => {
            const newConfigs = { ...prev };
            delete newConfigs[widgetId];
            return newConfigs;
        });

        if (previewData) {
            setPreviewData(null);
        }
    }, [previewData]);

    // Prepare widgets with final props for saving
    const prepareWidgetsWithProps = useCallback((widgets: Widget[]) => {
        return widgets.map((widget) => {
            const widgetConfig = widgetConfigurations[widget.id] ||
                defaultPropsMapping[widget.name] || {};

            // Remove any technical metadata like widgetType
            const { widgetType, ...cleanProps } = widgetConfig;

            return {
                ...widget,
                props: cleanProps
            };
        });
    }, [widgetConfigurations]);

    return {
        widgetConfigurations,
        previewData,
        initializeWidgetConfig,
        updateWidgetConfig,
        generatePreview,
        savePreviewData,
        resetPreviewData,
        getWidgetConfig,
        removeWidgetConfig,
        prepareWidgetsWithProps
    };
};