import React from 'react';
import HybridMappingApp from '../app/mapping/hybrid-mapping-app';
import { MappingConfiguration } from './mapping/hybrid-mapping-system';

// Sample initial configuration (optional)
const sampleConfig:MappingConfiguration = {
  mappings: [
    {
      id: 'mapping-1',
      valueMapping: {
        id: 'mapping-1-value',
        sourceType: 'api',
        path: 'FormStructure.ZSCMCMD.OCTG.VALUE002'
      },
      labelMapping: {
        id: 'mapping-1-label',
        sourceType: 'api',
        path: 'FormMetadata.VALUE002.label'
      }
    },
    {
      id: 'mapping-2',
      valueMapping: {
        id: 'mapping-2-value',
        sourceType: 'api',
        path: 'FormStructure.ZSCMCMD.Downhole.VALUE003'
      },
      labelMapping: {
        id: 'mapping-2-label',
        sourceType: 'api',
        path: 'FormMetadata.VALUE003.label'
      }
    },
    {
      id: 'mapping-3',
      valueMapping: {
        id: 'mapping-3-value',
        sourceType: 'manual',
        manualValue: 'Custom Value'
      },
      labelMapping: {
        id: 'mapping-3-label',
        sourceType: 'manual',
        manualValue: 'Custom Field'
      }
    }
  ],
  apiResponse: {
    FormStructure: {
      ZSCMCMD: {
        OCTG: {
          VALUE001: 0,
          VALUE002: 51.4,
          VALUE003: 13.5,
          VALUE004: 0
        },
        "Mud &amp; Chemical": {
          VALUE001: 0,
          VALUE002: 277,
          VALUE003: 38.8,
          VALUE004: 1.8
        },
        Downhole: {
          VALUE001: 0,
          VALUE002: 352.1,
          VALUE003: 123.5,
          VALUE004: 0
        },
        "Line Poles and Hware": {
          VALUE001: 0,
          VALUE002: 0,
          VALUE003: 0,
          VALUE004: 0
        },
        "Overall Result": {
          VALUE001: 0,
          VALUE002: 680.5,
          VALUE003: 175.8,
          VALUE004: 1.8
        }
      }
    },
    FormMetadata: {
      ZSCMCMD: {
        type: "CHA",
        label: "OSS INV - Commodity",
        fieldName: "ZSCMCMD",
        axisType: "ROW",
        displayStyle: "5"
      },
      VALUE001: {
        type: "KF",
        label: "OSS INV - Value",
        fieldName: "VALUE001",
        axisType: "COLUMN",
        displayStyle: "1"
      },
      VALUE002: {
        type: "KF",
        label: "OSS INV - &lt;6 Months",
        fieldName: "VALUE002",
        axisType: "COLUMN",
        displayStyle: "1"
      },
      VALUE003: {
        type: "KF",
        label: "OSS INV - 6-12 Months",
        fieldName: "VALUE003",
        axisType: "COLUMN",
        displayStyle: "1"
      },
      VALUE004: {
        type: "KF",
        label: "OSS INV - &gt;12 Months",
        fieldName: "VALUE004",
        axisType: "COLUMN",
        displayStyle: "1"
      }
    }
  }
};

// Render the app
// eslint-disable-next-line react/no-deprecated
const HomeScreen = () => (<>
 <HybridMappingApp initialConfig={sampleConfig} />
</>)
export default HomeScreen;