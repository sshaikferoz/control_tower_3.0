// hooks/useWidgetConfiguration.ts
import { useState, useCallback, useEffect } from 'react';
import { Widget, WidgetTypes } from '@/types';
import { defaultPropsMapping } from '@/data/widgetDefaults';
import { setValueByPath, parseValueType, getValueByPath } from '@/utils/widgetHelpers';
import { TransformedData } from '@/helpers/types';

export const useWidgetConfiguration = () => {
    const [widgetConfigurations, setWidgetConfigurations] = useState<Record<string, any>>({});
    const [previewData, setPreviewData] = useState<any>(null);
    const [transformedData, setTransformedData] = useState<TransformedData | null>(null);

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

    // Process mapped values based on configuration and transformed data
    const processMappedValues = useCallback((widgetId: string, transformedData: TransformedData | null) => {
        if (!widgetId || !transformedData) return null;

        const config = widgetConfigurations[widgetId];
        if (!config) return null;

        // Create a copy of the configuration
        const processedConfig = { ...config };

        // Process all properties recursively
        const processObject = (obj: any): any => {
            if (!obj || typeof obj !== 'object') return obj;

            if (Array.isArray(obj)) {
                return obj.map(item => processObject(item));
            }

            // Process hybrid/mapped values
            if (obj.inputType === 'mapped' && obj.mappedConfig) {
                const { chaField, chaValue, kfField } = obj.mappedConfig;
                try {
                    // Get value from transformed data
                    const value = transformedData.FormStructure[chaField][chaValue][kfField];
                    return value;
                } catch (error) {
                    console.error('Error getting mapped value:', error);
                    return null;
                }
            } else if (obj.inputType === 'hybrid' && obj.hybridMapping) {
                // For hybrid mapping, process each field
                const result: Record<string, any> = {};
                obj.hybridMapping.forEach((mapping: any) => {
                    if (mapping.type === 'manual') {
                        result[mapping.field] = mapping.value;
                    } else if (mapping.type === 'mapped' && typeof mapping.value === 'object') {
                        const { chaField, chaValue, kfField } = mapping.value;
                        try {
                            result[mapping.field] = transformedData.FormStructure[chaField][chaValue][kfField];
                        } catch (error) {
                            console.error('Error getting mapped value for hybrid mapping:', error);
                            result[mapping.field] = null;
                        }
                    }
                });
                return result;
            } else if (obj.inputType === 'manual') {
                return obj.manualValue;
            }

            // For regular objects, process each property
            const result: Record<string, any> = {};
            Object.entries(obj).forEach(([key, value]) => {
                result[key] = processObject(value);
            });
            return result;
        };

        return processObject(processedConfig);
    }, [widgetConfigurations]);

    // Generate preview data based on current configuration
    const generatePreview = useCallback((widgetId: string) => {
        if (!widgetId) return;

        // First, process any mapped values
        const processedConfig = processMappedValues(widgetId, transformedData);

        // Use the processed configuration for preview
        const previewProps = processedConfig || JSON.parse(JSON.stringify(widgetConfigurations[widgetId] || {}));

        // Update preview data state
        setPreviewData(previewProps);
    }, [widgetConfigurations, processMappedValues, transformedData]);

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

    // Set transformed data from API
    const setApiData = useCallback((data: TransformedData) => {
        setTransformedData(data);
    }, []);

    // Prepare widgets with final props for saving
    const prepareWidgetsWithProps = useCallback((widgets: Widget[]) => {
        return widgets.map((widget) => {
            const widgetConfig = widgetConfigurations[widget.id] ||
                defaultPropsMapping[widget.name] || {};

            // Process mapped values if transformed data is available
            const processedConfig = processMappedValues(widget.id, transformedData) || widgetConfig;

            // Remove any technical metadata like widgetType
            const { widgetType, ...cleanProps } = processedConfig;

            return {
                ...widget,
                props: cleanProps
            };
        });
    }, [widgetConfigurations, processMappedValues, transformedData]);

    return {
        widgetConfigurations,
        previewData,
        transformedData,
        initializeWidgetConfig,
        updateWidgetConfig,
        generatePreview,
        savePreviewData,
        resetPreviewData,
        getWidgetConfig,
        removeWidgetConfig,
        setApiData,
        prepareWidgetsWithProps
    };
};