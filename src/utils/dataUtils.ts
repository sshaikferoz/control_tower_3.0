// utils/dataUtils.ts

/**
 * Utility functions for working with data structures in hybrid mapping
 */

import { TransformedData } from '@/helpers/types';

/**
 * Analyzes a data structure and returns all possible paths to access values
 * @param data - The data structure to analyze
 * @param maxDepth - Maximum depth to traverse
 * @param prefix - Current path prefix (used in recursion)
 * @returns An array of path objects with path strings and sample values
 */
export const analyzePaths = (
    data: any,
    maxDepth: number = 5,
    prefix: string = ""
): Array<{ path: string; type: string; sample: any }> => {
    if (!data || typeof data !== 'object' || maxDepth <= 0) {
        return [];
    }

    const paths: Array<{ path: string; type: string; sample: any }> = [];

    // Process arrays
    if (Array.isArray(data)) {
        // Add the array itself
        paths.push({
            path: prefix,
            type: 'array',
            sample: data.length > 0 ? `Array[${data.length}]` : '[]'
        });

        // Process only the first item for arrays to avoid explosion of paths
        if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
            const subpaths = analyzePaths(
                data[0],
                maxDepth - 1,
                prefix ? `${prefix}[0]` : '[0]'
            );
            paths.push(...subpaths);
        }
    }
    // Process objects
    else {
        // Add the object itself
        paths.push({
            path: prefix,
            type: 'object',
            sample: `Object{${Object.keys(data).length}}`
        });

        // Process each property
        Object.entries(data).forEach(([key, value]) => {
            const currentPath = prefix ? `${prefix}.${key}` : key;

            if (value === null) {
                paths.push({
                    path: currentPath,
                    type: 'null',
                    sample: null
                });
            } else if (typeof value === 'object') {
                // Recurse for objects
                const subpaths = analyzePaths(value, maxDepth - 1, currentPath);
                paths.push(...subpaths);
            } else {
                // For primitive values, add the leaf path
                paths.push({
                    path: currentPath,
                    type: typeof value,
                    sample: String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '')
                });
            }
        });
    }

    return paths;
};

/**
 * Get a value from a data structure using a path string
 * @param data - The data structure
 * @param path - The path to the value (dot notation for objects, bracket notation for arrays)
 * @returns The value at the path, or undefined if not found
 */
export const getValueByDataPath = (data: any, path: string): any => {
    if (!data || !path) return undefined;

    // Handle array indices in path like "data[0].property"
    const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
    const parts = normalizedPath.split('.');

    let current = data;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }

    return current;
};

/**
 * Extract all CHA fields from transformed data
 * @param data - The transformed data
 * @returns Array of CHA field objects with name and label
 */
export const extractChaFields = (data: TransformedData): Array<{ name: string; label: string }> => {
    if (!data || !data.FormMetadata) return [];

    return Object.entries(data.FormMetadata)
        .filter(([_, metadata]) => metadata.type === 'CHA')
        .map(([fieldName, metadata]) => ({
            name: fieldName,
            label: metadata.label
        }));
};

/**
 * Extract all KF fields from transformed data
 * @param data - The transformed data
 * @returns Array of KF field objects with name and label
 */
export const extractKfFields = (data: TransformedData): Array<{ name: string; label: string }> => {
    if (!data || !data.FormMetadata) return [];

    return Object.entries(data.FormMetadata)
        .filter(([_, metadata]) => metadata.type === 'KF')
        .map(([fieldName, metadata]) => ({
            name: fieldName,
            label: metadata.label
        }));
};

/**
 * Get available CHA values for a specific CHA field
 * @param data - The transformed data
 * @param chaField - The CHA field name
 * @returns Array of CHA values
 */
export const getChaValues = (data: TransformedData, chaField: string): string[] => {
    if (!data || !data.FormStructure || !chaField || !data.FormStructure[chaField]) return [];

    return Object.keys(data.FormStructure[chaField]);
};

/**
 * Format a value based on its type and formatting options
 * @param value - The value to format
 * @param type - The type of formatting to apply
 * @param options - Formatting options
 * @returns Formatted value
 */
export const formatDataValue = (
    value: any,
    type: 'currency' | 'number' | 'percentage' | 'date' | 'auto' = 'auto',
    options: Intl.NumberFormatOptions | Intl.DateTimeFormatOptions = {}
): string => {
    if (value === null || value === undefined || value === '') return '';

    // Auto-detect type if set to 'auto'
    if (type === 'auto') {
        if (typeof value === 'number') {
            type = 'number';
        } else if (!isNaN(Date.parse(value))) {
            type = 'date';
        }
    }

    // Format based on type
    switch (type) {
        case 'currency':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                ...options
            }).format(Number(value));

        case 'number':
            return new Intl.NumberFormat('en-US', options).format(Number(value));

        case 'percentage':
            return new Intl.NumberFormat('en-US', {
                style: 'percent',
                ...options
            }).format(Number(value) / 100);

        case 'date':
            return new Intl.DateTimeFormat('en-US', options).format(new Date(value));

        default:
            return String(value);
    }
};

/**
 * Transform data based on configuration
 * @param data - The data to transform
 * @param mapping - Mapping configuration
 * @param transformedData - The transformed data containing mapped values
 * @returns Transformed data
 */
export const transformDataWithMapping = (
    data: any,
    mapping: any,
    transformedData: TransformedData | null
): any => {
    if (!mapping) return data;

    // Process different input types
    if (mapping.inputType === 'manual') {
        return mapping.manualValue;
    }
    else if (mapping.inputType === 'mapped' && mapping.mappedConfig && transformedData) {
        const { chaField, chaValue, kfField } = mapping.mappedConfig;
        try {
            return transformedData.FormStructure[chaField][chaValue][kfField];
        } catch (error) {
            console.error('Error getting mapped value:', error);
            return null;
        }
    }
    else if (mapping.inputType === 'hybrid' && mapping.hybridMapping && transformedData) {
        const result: Record<string, any> = {};

        mapping.hybridMapping.forEach((item: any) => {
            if (item.type === 'manual') {
                result[item.field] = item.value;
            }
            else if (item.type === 'mapped' && typeof item.value === 'object') {
                const { chaField, chaValue, kfField } = item.value;
                try {
                    result[item.field] = transformedData.FormStructure[chaField][chaValue][kfField];
                } catch (error) {
                    console.error('Error getting mapped value for hybrid:', error);
                    result[item.field] = null;
                }
            }
        });

        return result;
    }

    return data;
};

/**
 * Generate empty mapping configuration for a set of fields
 * @param fields - Array of field objects with field and path properties
 * @returns Object with empty mapping configurations for each field
 */
export const generateEmptyMappings = (
    fields: Array<{ field: string; path: string }>
): Record<string, any> => {
    const mappings: Record<string, any> = {};

    fields.forEach(({ field, path }) => {
        mappings[field] = {
            fieldName: field,
            fieldPath: path,
            inputType: 'manual',
            manualValue: ''
        };
    });

    return mappings;
};