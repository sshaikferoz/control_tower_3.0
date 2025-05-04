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

// The complete mapping configuration
export interface MappingConfiguration {
    mappings: FieldMapping[];
    apiEndpoint?: string;
    apiResponse?: any; // Cached API response
}

// Utility to resolve a value from an object using a path string
export function resolvePath(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}

// Resolves a mapping against provided data
export function resolveMapping(mapping: Mapping, data: any): any {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
        return mapping.manualValue;
    } else {
        const value = mapping.path ? resolvePath(data, mapping.path) : undefined;
        return mapping.transform ? mapping.transform(value) : value;
    }
}

// Resolves a label mapping against provided data
export function resolveLabelMapping(mapping: LabelMapping, data: any): string {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
        return mapping.manualValue || '';
    } else {
        return mapping.path ? resolvePath(data, mapping.path) : '';
    }
}

// Resolves all mappings in a configuration
export function resolveMappings(
    config: MappingConfiguration,
    data: any = config.apiResponse
): Record<string, { value: any; label: string }> {
    const result: Record<string, { value: any; label: string }> = {};

    config.mappings.forEach(mapping => {
        result[mapping.id] = {
            value: resolveMapping(mapping.valueMapping, data),
            label: resolveLabelMapping(mapping.labelMapping, data)
        };
    });

    return result;
}