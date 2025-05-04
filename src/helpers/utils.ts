import {
    MappingSourceType,
    Mapping,
    LabelMapping,
    FieldMapping,
    MappingConfiguration,
    ObjectPath
} from './types';

// Utility to resolve a value from an object using a path string
export function resolvePath(obj: any, path: string): any {
    if (!path) return undefined;
    return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}

// Resolves a mapping against provided data
export function resolveMapping(mapping: Mapping, data: any): any {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
        return mapping.manualValue;
    } else if (mapping.path) {
        const value = resolvePath(data, mapping.path);
        return mapping.transform ? mapping.transform(value) : value;
    }
    return undefined;
}

// Resolves a label mapping against provided data
export function resolveLabelMapping(mapping: LabelMapping, data: any): string {
    if (mapping.sourceType === MappingSourceType.MANUAL) {
        return mapping.manualValue || '';
    } else if (mapping.path) {
        const value = resolvePath(data, mapping.path);
        return value !== undefined ? String(value) : '';
    }
    return '';
}

// Resolves all mappings in a widget
export function resolveWidgetMappings(
    mappings: FieldMapping[],
    data: any
): Record<string, { value: any; label: string }> {
    const result: Record<string, { value: any; label: string }> = {};

    mappings.forEach(mapping => {
        result[mapping.id] = {
            value: resolveMapping(mapping.valueMapping, data),
            label: resolveLabelMapping(mapping.labelMapping, data)
        };
    });

    return result;
}

// Set a value in a nested object at the specified path
export function setValueByPath(obj: any, path: string, value: any): any {
    if (!path) return obj;

    // Create a deep copy of the object to avoid mutations
    const result = JSON.parse(JSON.stringify(obj || {}));

    const segments = path.split('.');
    let current = result;

    // Navigate to the target location and create intermediate objects if needed
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];

        if (current[segment] === undefined) {
            // Create the next level object
            current[segment] = {};
        }

        current = current[segment];
    }

    // Set the value at the final segment
    const lastSegment = segments[segments.length - 1];
    current[lastSegment] = value;

    return result;
}

// Extract all possible paths from a nested object
export function extractAllPaths(
    obj: any,
    parentPath: string = '',
    result: { path: string; value: any }[] = []
): { path: string; value: any }[] {
    // Handle null/undefined values
    if (obj === null || obj === undefined) {
        return result;
    }

    // Handle primitive values
    if (typeof obj !== 'object') {
        if (parentPath) {
            result.push({ path: parentPath, value: obj });
        }
        return result;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        if (parentPath) {
            result.push({ path: parentPath, value: `[Array(${obj.length})]` });
        }

        obj.forEach((item, index) => {
            const itemPath = parentPath ? `${parentPath}.${index}` : `${index}`;
            extractAllPaths(item, itemPath, result);
        });

        return result;
    }

    // Handle objects
    if (parentPath) {
        result.push({ path: parentPath, value: '[Object]' });
    }

    Object.entries(obj).forEach(([key, value]) => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        extractAllPaths(value, currentPath, result);
    });

    return result;
}

// Generate a preview of paths with their values
export function getPathsPreview(
    obj: any,
    maxDepth: number = 5,
    maxPaths: number = 100
): { path: string; preview: string }[] {
    const allPaths = extractAllPaths(obj);

    // Filter paths that are too deep
    const filteredPaths = allPaths.filter(item => {
        const depth = item.path.split('.').length;
        return depth <= maxDepth;
    });

    // Format the preview for each path
    return filteredPaths.slice(0, maxPaths).map(item => {
        let preview = '';

        if (item.value === '[Object]' || item.value === null) {
            preview = String(item.value);
        } else if (typeof item.value === 'string') {
            preview = item.value.length > 50 ? `${item.value.substring(0, 47)}...` : item.value;
        } else if (typeof item.value === 'number' || typeof item.value === 'boolean') {
            preview = String(item.value);
        } else if (Array.isArray(item.value)) {
            preview = `[Array(${item.value.length})]`;
        } else {
            preview = String(item.value);
        }

        return { path: item.path, preview };
    });
}

// Format a value for display based on its type and formatting options
export function formatValue(
    value: any,
    formatType: 'currency' | 'percentage' | 'number' | 'none' = 'number'
): string {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
        return String(value);
    }

    switch (formatType) {
        case 'currency':
            if (numValue >= 1000000) {
                return `$${(numValue / 1000000).toFixed(1)}M`;
            } else if (numValue >= 1000) {
                return `$${(numValue / 1000).toFixed(1)}K`;
            } else {
                return `$${numValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            }
        case 'percentage':
            return `${numValue.toFixed(2)}%`;
        case 'number':
            return numValue.toLocaleString();
        case 'none':
        default:
            return String(value);
    }
}

// Build a tree structure from paths for hierarchical navigation
export function buildPathTree(paths: { path: string; preview: string }[]): any[] {
    const tree: any[] = [];
    const map: Record<string, any> = {};

    // Add each path to the tree
    paths.forEach(({ path, preview }) => {
        const parts = path.split('.');
        let current = { children: tree };

        parts.forEach((part, index) => {
            // Check if this node already exists
            if (!map[part] || index === parts.length - 1) {
                const isLeaf = index === parts.length - 1;
                const node = {
                    key: part,
                    path: parts.slice(0, index + 1).join('.'),
                    label: part,
                    isLeaf,
                    preview: isLeaf ? preview : undefined,
                    children: isLeaf ? undefined : []
                };

                map[part] = node;

                if (current.children) {
                    current.children.push(node);
                }
            }

            current = map[part];
        });
    });

    return tree;
}

// Generate a unique ID
export function generateId(): string {
    return `mapping-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Deep comparison of two objects
export function isEqual(a: any, b: any): boolean {
    if (a === b) return true;

    if (a === null || b === null || a === undefined || b === undefined) {
        return a === b;
    }

    if (typeof a !== 'object' || typeof b !== 'object') {
        return a === b;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => isEqual(a[key], b[key]));
}