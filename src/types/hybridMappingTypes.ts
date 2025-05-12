// types/hybridMappingTypes.ts

// For input field mapping configuration
export interface FieldMappingConfig {
    inputType: 'manual' | 'mapped' | 'hybrid';
    manualValue?: any;
    mappedConfig?: {
        chaField: string;
        chaValue: string;
        kfField: string;
        path?: string;
    };
    hybridMapping?: Array<HybridMappingField>;
    transformations?: Array<DataTransformation>;
}

// For hybrid mapping fields
export interface HybridMappingField {
    field: string;
    type: 'manual' | 'mapped';
    value: any;
}

// For data transformations
export interface DataTransformation {
    type: 'format' | 'filter' | 'aggregate' | 'custom';
    params: Record<string, any>;
}

// Extended widget mapping types
export interface WidgetMapping {
    name: string;
    id: string;
    fields: Record<string, FieldMappingConfig>;
    dataSource?: {
        type: 'sap' | 'api' | 'file';
        config: {
            endpoint?: string;
            query?: string;
            path?: string;
        };
    };
}

// Extended interface for widget configuration
export interface WidgetConfiguration {
    id: string;
    widgetType: string;
    properties: Record<string, any>;
    mapping?: WidgetMapping;
    dataPreview?: any;
}

// For Data Source connections
export interface DataSourceConnection {
    id: string;
    name: string;
    type: 'sap' | 'api' | 'file' | 'database';
    config: {
        url?: string;
        method?: 'GET' | 'POST';
        headers?: Record<string, string>;
        body?: string;
        query?: string;
        params?: Record<string, string>;
        path?: string;
    };
    metadata?: {
        lastUpdated: string;
        fields: Array<{
            name: string;
            type: string;
            label: string;
        }>;
    };
}

// For saved mapping configurations
export interface SavedMapping {
    id: string;
    name: string;
    description?: string;
    widgetType: string;
    mappingConfig: Record<string, FieldMappingConfig>;
    createdAt: string;
    updatedAt: string;
}
