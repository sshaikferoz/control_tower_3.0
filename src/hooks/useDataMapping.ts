import { useState, useEffect } from 'react';
import { BackendData, WidgetConfigMapping, transformBackendData, generateWidgetProps } from '@/components/field-mapping';

interface UseDataMappingResult {
    mappedProps: Record<string, any> | null;
    loading: boolean;
    error: string | null;
    refreshMapping: () => void;
}

export function useDataMapping(
    mappingConfig: WidgetConfigMapping,
    data: BackendData,
    baseProps: Record<string, any> = {}
): UseDataMappingResult {
    const [mappedProps, setMappedProps] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const applyMapping = async () => {
        setLoading(true);
        setError(null);

        try {
            // Transform backend data to the format needed for mapping
            const transformedData = transformBackendData(data);

            // Generate widget props based on the mapping configuration
            const props = generateWidgetProps(mappingConfig, transformedData);

            // Merge with base props
            setMappedProps({
                ...baseProps,
                ...props
            });
        } catch (err) {
            console.error("Error applying data mapping:", err);
            setError("Failed to apply data mapping. Please check your mapping configuration.");
            setMappedProps(null);
        } finally {
            setLoading(false);
        }
    };

    // Apply mapping when config or data changes
    useEffect(() => {
        if (Object.keys(mappingConfig).length > 0) {
            applyMapping();
        } else {
            // If no mapping config, just use the base props
            setMappedProps(baseProps);
        }
    }, [mappingConfig, data, JSON.stringify(baseProps)]);

    return {
        mappedProps,
        loading,
        error,
        refreshMapping: applyMapping
    };
}

// src/app/api/dashboard-mapping/route.ts
// This would be a Next.js API route handler
export async function GET(request: Request) {
    try {
        // Get existing mappings from database or storage
        const mappings = [
            {
                id: 'mapping-1',
                name: 'Basic Inventory KPIs',
                description: 'Maps inventory KPIs to standard dashboard widgets',
                widgetType: 'one-metric',
                mappingConfig: {
                    name: {
                        inputType: 'manual',
                        manualValue: 'Active Inventory'
                    },
                    value: {
                        inputType: 'mapped',
                        mappedConfig: {
                            chaField: 'ZSCMCMD',
                            chaValue: 'Overall Result',
                            kfField: 'VALUE002'
                        }
                    }
                }
            },
            {
                id: 'mapping-2',
                name: 'Spend Analysis',
                description: 'Maps spend analysis data to stacked bar chart',
                widgetType: 'stacked-bar-chart',
                mappingConfig: {
                    title: {
                        inputType: 'manual',
                        manualValue: 'Spend by Category'
                    },
                    data: {
                        inputType: 'mapped',
                        mappedConfig: {
                            chaField: 'ZSCMCMD',
                            chaValue: 'custom',
                            kfField: 'custom',
                            path: 'chartData'
                        }
                    }
                }
            }
        ];

        return new Response(JSON.stringify(mappings), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching mappings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch mappings' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Save mapping configuration
        // This would store the data in a database in a real implementation
        console.log('Saving mapping configuration:', body);

        // Return success response with a generated ID
        return new Response(JSON.stringify({
            id: `mapping-${Date.now()}`,
            ...body
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error saving mapping:', error);
        return new Response(JSON.stringify({ error: 'Failed to save mapping' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
