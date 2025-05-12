// utils/widgetHelpers.ts

// Helper function to determine if a value is an array
export const isArray = (value: any): boolean => {
    return Array.isArray(value);
};

// Helper function to determine if a value is an object
export const isObject = (value: any): boolean => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Function to parse a string that might be a JSON array or object
export const parseComplexValue = (value: any): any => {
    if (typeof value !== 'string') return value;

    try {
        if ((value.startsWith('[') && value.endsWith(']')) ||
            (value.startsWith('{') && value.endsWith('}'))) {
            return JSON.parse(value);
        }
    } catch (e) {
        console.log('Error parsing JSON string:', e);
        // Return the original string if parsing fails
    }
    return value;
};

// Helper function to get value from an object by path
export const getValueByPath = (obj: any, path: string): any => {
    if (!obj || !path) return undefined;

    const pathParts = path.split('.');
    let current = obj;

    for (const part of pathParts) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[part];
    }

    return current;
};

// Helper function to set value in an object by path
export const setValueByPath = (obj: any, path: string, value: any): any => {
    if (!obj || !path) return obj;

    const result = { ...obj };
    const pathParts = path.split('.');
    let current = result;

    // Navigate to the right location in the object
    for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];

        // If we're dealing with array notation like data[0]
        if (part.includes('[') && part.includes(']')) {
            const arrName = part.substring(0, part.indexOf('['));
            const index = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));

            if (!current[arrName]) {
                current[arrName] = [];
            }
            while (current[arrName].length <= index) {
                current[arrName].push({});
            }
            current = current[arrName][index];
        } else {
            // Regular object path
            if (!current[part]) {
                current[part] = {};
            }
            current = current[part];
        }
    }

    // Set the value at the final property
    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;

    return result;
};

// Function to parse value to appropriate type
export const parseValueType = (value: string): any => {
    // Return value if not a string
    if (typeof value !== 'string') return value;

    // Try to parse as number
    if (!isNaN(Number(value)) && value !== "") {
        return Number(value);
    }

    // Try to parse as boolean
    if (value === "true" || value === "false") {
        return value === "true";
    }

    // Try to parse as JSON object/array
    if ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))) {
        try {
            return JSON.parse(value);
        } catch (e) {
            console.log('Error parsing JSON:', e);
            // Return as string if parsing fails
            return value;
        }
    }

    // Return as string
    return value;
};