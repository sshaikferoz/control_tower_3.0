import { BackendData, TransformedData } from '@/components/field-mapping/types';

/**
 * Service to transform data from backend APIs to a format usable by widgets
 */
export class DataTransformService {
    /**
     * Transform SAP BW data into the common format used by our mapping system
     */
    static transformSapBwData(xmlResponse: string): BackendData {
        // In a real implementation, this would parse the XML response
        // For now, we just return mock data
        return {
            header: [
                { type: "CHA", label: "OSS INV - Commodity", fieldName: "ZSCMCMD" },
                { type: "KF", label: "OSS INV - Value", fieldName: "VALUE001" },
                { type: "KF", label: "OSS INV - <6 Months", fieldName: "VALUE002" },
                { type: "KF", label: "OSS INV - 6-12 Months", fieldName: "VALUE003" },
                { type: "KF", label: "OSS INV - >12 Months", fieldName: "VALUE004" }
            ],
            chartData: [
                { "ZSCMCMD": "OCTG", "VALUE001": "", "VALUE002": 51.4, "VALUE003": 13.5, "VALUE004": "" },
                { "ZSCMCMD": "Mud & Chemical", "VALUE001": "", "VALUE002": 277, "VALUE003": 38.8, "VALUE004": 1.8 },
                { "ZSCMCMD": "Downhole", "VALUE001": "", "VALUE002": 352.1, "VALUE003": 123.5, "VALUE004": "" },
                { "ZSCMCMD": "Line Poles and Hware", "VALUE001": "", "VALUE002": "", "VALUE003": "", "VALUE004": "" },
                { "ZSCMCMD": "Overall Result", "VALUE001": "", "VALUE002": 680.5, "VALUE003": 175.8, "VALUE004": 1.8 }
            ]
        };
    }

    /**
     * Transform REST API data into the common format
     */
    static transformRestApiData(jsonResponse: any): BackendData {
        // This would transform a standard REST API response 
        // For now, returning a placeholder implementation
        return {
            header: [],
            chartData: []
        };
    }

    /**
     * Process a data mapping configuration and generate props for a widget
     */
    static applyMapping(
        mappingConfig: Record<string, any>,
        widgetBaseProps: Record<string, any>,
        data: TransformedData
    ): Record<string, any> {
        const result = { ...widgetBaseProps };

        // Apply each mapping
        Object.entries(mappingConfig).forEach(([fieldKey, mapping]) => {
            if (mapping.inputType === 'mapped' && mapping.mappedConfig) {
                const { chaField, chaValue, kfField } = mapping.mappedConfig;

                try {
                    // Get value from data structure
                    const value = data.FormStructure[chaField]?.[chaValue]?.[kfField];

                    if (value !== undefined) {
                        // Set the value in the result object
                        result[fieldKey] = value;
                    }
                } catch (error) {
                    console.error(`Error applying mapping for ${fieldKey}:`, error);
                }
            }
        });

        return result;
    }
}