// API Service for fetching and exploring data

export class ApiService {
    // Fetch data from the specified endpoint
    static async fetchData(endpoint: string): Promise<any> {
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching API data:', error);
            throw error;
        }
    }

    // Convert a nested object into a flat list of paths
    static extractPaths(
        obj: any,
        parentPath: string = '',
        result: { path: string; value: any }[] = []
    ): { path: string; value: any }[] {
        // If null or undefined, return current result
        if (obj === null || obj === undefined) {
            return result;
        }

        // If not an object, add the leaf value and return
        if (typeof obj !== 'object') {
            result.push({ path: parentPath, value: obj });
            return result;
        }

        // Process arrays
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                const currentPath = parentPath ? `${parentPath}.${index}` : `${index}`;
                this.extractPaths(item, currentPath, result);
            });
            return result;
        }

        // Process objects
        Object.entries(obj).forEach(([key, value]) => {
            const currentPath = parentPath ? `${parentPath}.${key}` : key;

            // Add the current path/node
            if (typeof value === 'object' && value !== null) {
                result.push({ path: currentPath, value: '[Object]' });
            }

            // Recursively process children
            this.extractPaths(value, currentPath, result);
        });

        return result;
    }

    // Get a preview of the paths in a nested object
    static getPathsPreview(
        obj: any,
        maxDepth: number = 5,
        maxPaths: number = 100
    ): { path: string; preview: string }[] {
        const allPaths = this.extractPaths(obj);

        // Filter paths that are too deep
        const filteredPaths = allPaths.filter(item => {
            const depth = item.path.split('.').length;
            return depth <= maxDepth;
        });

        // Limit the number of paths and format the preview
        return filteredPaths.slice(0, maxPaths).map(item => {
            const value = item.value;
            let preview = '';

            if (value === '[Object]') {
                preview = '[Object]';
            } else if (typeof value === 'string') {
                preview = value.length > 50 ? `${value.substring(0, 47)}...` : value;
            } else if (Array.isArray(value)) {
                preview = `[Array(${value.length})]`;
            } else {
                preview = String(value);
            }

            return { path: item.path, preview };
        });
    }

    // Get a specific value from a path
    static getValueAtPath(obj: any, path: string): any {
        return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
    }
}