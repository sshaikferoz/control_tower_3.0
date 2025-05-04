/**
 * Utilities for handling JSON paths and nested objects
 */

// Resolves a value from a nested object using a path string
// Handles arrays and nested objects safely
export function getValueByPath(obj: any, path: string): any {
    if (!path) return undefined;

    // Split the path into segments, handling array indices
    const segments = parsePath(path);

    // Navigate through each segment
    let current = obj;
    for (const segment of segments) {
        // Handle undefined/null case
        if (current === undefined || current === null) {
            return undefined;
        }

        // Access the property
        current = current[segment];
    }

    return current;
}

// Set a value in a nested object at the specified path
// Creates intermediate objects if they don't exist
export function setValueByPath(obj: any, path: string, value: any): any {
    if (!path) return obj;

    // Create a deep copy of the object to avoid mutations
    const result = structuredClone(obj) || {};

    // Split the path into segments, handling array indices
    const segments = parsePath(path);

    // Navigate to the target location
    let current = result;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];
        const nextSegment = segments[i + 1];

        // Check if the next segment is an array index
        const isNextSegmentArrayIndex = !isNaN(Number(nextSegment));

        // Create intermediate objects/arrays if they don't exist
        if (current[segment] === undefined || current[segment] === null) {
            current[segment] = isNextSegmentArrayIndex ? [] : {};
        }

        current = current[segment];
    }

    // Set the value at the final segment
    const lastSegment = segments[segments.length - 1];
    current[lastSegment] = value;

    return result;
}

// Delete a property at the specified path
export function deleteByPath(obj: any, path: string): any {
    if (!path) return obj;

    // Create a deep copy of the object to avoid mutations
    const result = structuredClone(obj);

    // Split the path into segments, handling array indices
    const segments = parsePath(path);

    // Navigate to the parent of the target location
    let current = result;
    for (let i = 0; i < segments.length - 1; i++) {
        const segment = segments[i];

        // Return if we encounter undefined/null
        if (current[segment] === undefined || current[segment] === null) {
            return result;
        }

        current = current[segment];
    }

    // Delete the property at the final segment
    const lastSegment = segments[segments.length - 1];
    if (Array.isArray(current)) {
        current.splice(Number(lastSegment), 1);
    } else {
        delete current[lastSegment];
    }

    return result;
}

// Parse a path string into segments, handling array indices
function parsePath(path: string): string[] {
    // Handle empty path
    if (!path) return [];

    // Split the path by dots
    return path.split('.');
}

// Get all paths in a nested object
export function getAllPaths(
    obj: any,
    parentPath: string = '',
    result: string[] = []
): string[] {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return result;
    }

    // Handle primitive values
    if (typeof obj !== 'object') {
        if (parentPath) result.push(parentPath);
        return result;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        if (parentPath) result.push(parentPath);

        obj.forEach((item, index) => {
            const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;
            getAllPaths(item, currentPath, result);
        });

        return result;
    }

    // Handle objects
    if (parentPath) result.push(parentPath);

    Object.entries(obj).forEach(([key, value]) => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        getAllPaths(value, currentPath, result);
    });

    return result;
}

// Get paths with their types
export function getPathsWithTypes(
    obj: any,
    parentPath: string = ''
): { path: string; type: string; value: any }[] {
    const result: { path: string; type: string; value: any }[] = [];

    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return result;
    }

    // Handle primitive values
    if (typeof obj !== 'object') {
        if (parentPath) {
            result.push({
                path: parentPath,
                type: typeof obj,
                value: obj
            });
        }
        return result;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        if (parentPath) {
            result.push({
                path: parentPath,
                type: 'array',
                value: `Array(${obj.length})`
            });
        }

        obj.forEach((item, index) => {
            const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;
            result.push(...getPathsWithTypes(item, currentPath));
        });

        return result;
    }

    // Handle objects
    if (parentPath) {
        result.push({
            path: parentPath,
            type: 'object',
            value: 'Object'
        });
    }

    Object.entries(obj).forEach(([key, value]) => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        result.push(...getPathsWithTypes(value, currentPath));
    });

    return result;
}

// Find paths that match a value
export function findPathsByValue(
    obj: any,
    searchValue: any,
    exactMatch: boolean = false
): string[] {
    const allPaths = getPathsWithTypes(obj);

    return allPaths
        .filter(item => {
            if (exactMatch) {
                return item.value === searchValue;
            } else if (typeof searchValue === 'string' && typeof item.value === 'string') {
                return item.value.toLowerCase().includes(searchValue.toLowerCase());
            } else {
                return String(item.value).includes(String(searchValue));
            }
        })
        .map(item => item.path);
}

// Find paths that match a specific type
export function findPathsByType(
    obj: any,
    type: string
): string[] {
    const allPaths = getPathsWithTypes(obj);

    return allPaths
        .filter(item => item.type === type)
        .map(item => item.path);
}