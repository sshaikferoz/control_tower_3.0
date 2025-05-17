'use client'
import React, { useState, useEffect } from 'react';
import { transformFormMetadata } from "@/helpers/transformHelpers";
import { parseXMLToJson } from "@/lib/bexQueryXmlToJson";
import mirageServer from '@/lib/mirage/mirageServer';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

mirageServer()
const DynamicJsonTableSelector = () => {
    // State for storing various pieces of data
    const [jsonData, setJsonData] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [groupedByRow, setGroupedByRow] = useState(false);
    const [groupedByColumn, setGroupedByColumn] = useState(false);
    const [pathsResult, setPathsResult] = useState({
        paths: [],
        groupedByCHA: {},
        groupedByKF: {}
    });
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'cha', 'kf'
    const [tableStructure, setTableStructure] = useState({ headers: [], rows: [], rowHeaders: [] });
    const [jsonInputVisible, setJsonInputVisible] = useState(false);
    const [jsonInputText, setJsonInputText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [query, setQuery] = useState('');
    const [chartData, setChartData] = useState([]);

    // Load the initial JSON data
    useEffect(() => {
        const sampleData = {
            "FormStructure": {
                "ZCATEGORY1": {
                    "OCTG": {
                        "OCTG1": {
                            "VALUE001": 10,
                            "VALUE002": 5
                        },
                        "OCTG2": {
                            "VALUE001": 20,
                            "VALUE002": 15
                        }
                    },
                    "Chemical": {
                        "Chem1": {
                            "VALUE001": 30,
                            "VALUE002": 25
                        },
                        "Chem2": {
                            "VALUE001": 40,
                            "VALUE002": 35
                        }
                    }
                }
            },
            "FormMetadata": {
                "ZCATEGORY": {
                    "type": "CHA",
                    "label": "Category"
                },
                "ZSUBCATEGORY": {
                    "type": "CHA",
                    "label": "Subcategory"
                },
                "VALUE001": {
                    "type": "KF",
                    "label": "Value"
                },
                "VALUE002": {
                    "type": "KF",
                    "label": "<6 Months"
                }
            }
        };
        processJsonData(sampleData);
    }, []);

    // Process JSON data and transform it for the table
    const processJsonData = (data) => {
        try {
            setJsonData(data);

            // For cleaning up previous selections on new data
            setSelectedRows([]);
            setSelectedColumns([]);
            setPathsResult({
                paths: [],
                groupedByCHA: {},
                groupedByKF: {}
            });
            setErrorMessage('');

            // Parse the structure and create the table data
            const parsed = parseJsonToTableStructure(data);
            setTableStructure(parsed);
        } catch (error) {
            console.error("Error processing JSON data:", error);
            setErrorMessage(`Error processing JSON data: ${error.message}`);
        }
    };

    // Core logic for converting JSON to table structure
    const parseJsonToTableStructure = (data) => {
        if (!data || !data.FormStructure || !data.FormMetadata) {
            throw new Error("Invalid JSON structure. Expected FormStructure and FormMetadata.");
        }

        // Get all metadata fields and their types
        const metadataFields = Object.entries(data.FormMetadata);

        // Find all characteristic (CHA) fields - these become row headers
        const chaFields = metadataFields
            .filter(([_, metadata]) => metadata.type === "CHA")
            .map(([key, metadata]) => ({
                id: key,
                label: metadata.label || key,
                fieldName: metadata.fieldName || key,
                type: 'CHA'
            }));

        // Find all key figure (KF) fields - these become columns
        const kfFields = metadataFields
            .filter(([_, metadata]) => metadata.type === "KF")
            .map(([key, metadata]) => ({
                id: key,
                label: metadata.label || key,
                fieldName: metadata.fieldName || key,
                type: 'KF'
            }));

        if (chaFields.length === 0 || kfFields.length === 0) {
            throw new Error("JSON must contain at least one CHA (characteristic) and one KF (key figure) field.");
        }

        // Determine the structure of the form data
        // We start by getting the first key in FormStructure
        const formStructureKeys = Object.keys(data.FormStructure);
        if (formStructureKeys.length === 0) {
            throw new Error("FormStructure is empty.");
        }

        const firstKey = formStructureKeys[0];
        const structureRoot = data.FormStructure[firstKey];

        // Prepare rows and headers for the table
        const flattenedRows = [];
        const mappedData = [];

        // Function to traverse the nested structure and flatten it
        const traverseStructure = (obj, path = [], values = []) => {
            // If this is a leaf node (contains KF fields)
            const hasKfFields = Object.keys(obj).some(key =>
                kfFields.some(field => field.id === key)
            );

            if (hasKfFields) {
                // Create an entry for this leaf node
                const rowData = {};

                // Add KF values
                kfFields.forEach(field => {
                    rowData[field.id] = obj[field.id] !== undefined ? obj[field.id] : '';
                });

                mappedData.push({
                    path,
                    values: [...values],
                    kfValues: rowData
                });
            } else {
                // This is an intermediate node, continue traversing
                Object.entries(obj).forEach(([key, value]) => {
                    if (typeof value === 'object' && value !== null) {
                        traverseStructure(value, [...path, key], [...values, key]);
                    }
                });
            }
        };

        // Start the traversal
        traverseStructure(structureRoot, [firstKey], []);

        // Create a structured representation based on the CHA fields
        // We need to match the nesting levels with CHA fields
        mappedData.forEach((item, index) => {
            const rowId = `row-${index}`;
            const isTotal = item.values.some(val => val === "Overall Result");

            // Map values to the appropriate CHA fields
            // If we have more values than CHA fields, we'll use the last values
            const displayValues = {};
            const chaValues = [];

            // Map values to CHA fields - we may have more or fewer values than CHA fields
            const numValues = Math.min(item.values.length, chaFields.length);
            for (let i = 0; i < numValues; i++) {
                displayValues[chaFields[i].id] = item.values[i];
                chaValues.push(item.values[i]);
            }

            flattenedRows.push({
                id: rowId,
                path: item.path,
                displayValues,
                chaValues,
                kfValues: item.kfValues,
                isTotal
            });
        });

        return {
            headers: kfFields,
            rows: flattenedRows,
            rowHeaders: chaFields,
            structurePath: ['FormStructure', firstKey]
        };
    };

    // Handle JSON input from user
    const handleJsonInputChange = (e) => {
        setJsonInputText(e.target.value);
    };

    const handleJsonSubmit = () => {
        try {
            const parsedJson = JSON.parse(jsonInputText);
            processJsonData(parsedJson);
            setJsonInputVisible(false);
        } catch (error) {
            setErrorMessage(`Invalid JSON: ${error.message}`);
        }
    };

    // Toggle JSON input visibility
    const toggleJsonInput = () => {
        setJsonInputVisible(!jsonInputVisible);
        if (!jsonInputVisible) {
            setJsonInputText(JSON.stringify(jsonData, null, 2));
        }
    };

    // Handle row selection
    const handleRowSelect = (rowId) => {
        if (selectedRows.includes(rowId)) {
            setSelectedRows(selectedRows.filter(id => id !== rowId));
        } else {
            setSelectedRows([...selectedRows, rowId]);
        }
    };

    // Handle column selection
    const handleColumnSelect = (colId) => {
        if (selectedColumns.includes(colId)) {
            setSelectedColumns(selectedColumns.filter(id => id !== colId));
        } else {
            setSelectedColumns([...selectedColumns, colId]);
        }
    };

    // Generate paths for selected cells with grouping by CHA and KF
    const generatePaths = () => {
        const { rows, structurePath, rowHeaders, headers } = tableStructure;

        // Results object to store grouped paths
        const result = {
            paths: [], // All paths
            groupedByCHA: {}, // Paths grouped by characteristic fields
            groupedByKF: {} // Paths grouped by key figure fields
        };

        // If either no rows or no columns are selected, don't generate paths
        if (selectedRows.length === 0 || selectedColumns.length === 0) {
            return result;
        }

        // Determine which rows to include
        const rowsToProcess = selectedRows.length > 0
            ? rows.filter(row => selectedRows.includes(row.id))
            : [];

        // Determine which columns to include
        const columnsToProcess = selectedColumns.length > 0
            ? selectedColumns
            : [];

        // If either rows or columns are empty, no intersections exist
        if (rowsToProcess.length === 0 || columnsToProcess.length === 0) {
            return result;
        }

        // Initialize grouping structures
        // For CHA (rows), create an entry for each selected row
        rowsToProcess.forEach(row => {
            // Create a key based on all CHA values of this row
            const chaKey = row.chaValues.join(' → ');
            if (!result.groupedByCHA[chaKey]) {
                result.groupedByCHA[chaKey] = {
                    chaValues: row.chaValues,
                    paths: []
                };
            }
        });

        // For KF (columns), create an entry for each selected column
        columnsToProcess.forEach(colId => {
            const column = headers.find(h => h.id === colId);
            if (column && !result.groupedByKF[column.label]) {
                result.groupedByKF[column.label] = {
                    kfId: colId,
                    kfLabel: column.label,
                    paths: []
                };
            }
        });

        // Generate paths based on grouping options
        if (groupedByRow) {
            // For each selected row, include only selected columns
            rowsToProcess.forEach(row => {
                const chaKey = row.chaValues.join(' → ');

                columnsToProcess.forEach(colId => {
                    // Create array-style path notation
                    const pathParts = [...structurePath, ...row.path, colId];
                    const arrayPath = pathParts.map(part => `["${part}"]`).join('');
                    const fullPath = `FormStructure${arrayPath}`;

                    // Add to all paths
                    result.paths.push(fullPath);

                    // Add to CHA grouping
                    result.groupedByCHA[chaKey].paths.push(fullPath);

                    // Add to KF grouping
                    const column = headers.find(h => h.id === colId);
                    if (column) {
                        result.groupedByKF[column.label].paths.push(fullPath);
                    }
                });
            });
        } else if (groupedByColumn) {
            // For each selected column, include only selected rows
            columnsToProcess.forEach(colId => {
                const column = headers.find(h => h.id === colId);

                rowsToProcess.forEach(row => {
                    // Create array-style path notation
                    const pathParts = [...structurePath, ...row.path, colId];
                    const arrayPath = pathParts.map(part => `["${part}"]`).join('');
                    const fullPath = `FormStructure${arrayPath}`;

                    // Add to all paths
                    result.paths.push(fullPath);

                    // Add to CHA grouping
                    const chaKey = row.chaValues.join(' → ');
                    result.groupedByCHA[chaKey].paths.push(fullPath);

                    // Add to KF grouping
                    if (column) {
                        result.groupedByKF[column.label].paths.push(fullPath);
                    }
                });
            });
        } else {
            // Individual cell selection (intersection of rows × columns)
            rowsToProcess.forEach(row => {
                const chaKey = row.chaValues.join(' → ');

                columnsToProcess.forEach(colId => {
                    // Create array-style path notation
                    const pathParts = [...structurePath, ...row.path, colId];
                    const arrayPath = pathParts.map(part => `["${part}"]`).join('');
                    const fullPath = `FormStructure${arrayPath}`;

                    // Add to all paths
                    result.paths.push(fullPath);

                    // Add to CHA grouping
                    result.groupedByCHA[chaKey].paths.push(fullPath);

                    // Add to KF grouping
                    const column = headers.find(h => h.id === colId);
                    if (column) {
                        result.groupedByKF[column.label].paths.push(fullPath);
                    }
                });
            });
        }

        return result;
    };

    /* const handleSave = () => {
        const result = generatePaths();
        setPathsResult(result);

        if (result.paths.length > 0) {
            console.log("All Paths:", result.paths);
            console.log("Grouped by CHA:", result.groupedByCHA);
            console.log("Grouped by KF:", result.groupedByKF);
        } else {
            console.log("No paths generated. Please select both rows and columns.");
        }
    }; */
    const handleSave = () => {
        const result = generatePaths();
        setPathsResult(result);

        if (result.paths.length > 0) {
            const { rows } = tableStructure;

            const selectedData = rows
                .filter(row => selectedRows.includes(row.id))
                .map(row => {
                    const chaLabel = row.chaValues.join(' → ');
                    const dataEntry = { category: chaLabel };
                    selectedColumns.forEach(kf => {
                        dataEntry[kf] = row.kfValues[kf];
                    });
                    return dataEntry;
                });

            setChartData(selectedData);
            console.log(chartData)
        } else {
            setChartData([]); // No chart if no valid paths
        }
    };


    // Toggle row grouping
    /* const toggleRowGrouping = () => {
      // Only allow grouping if rows are selected
      if (selectedRows.length === 0) {
        setErrorMessage("Please select at least one row before enabling row grouping.");
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      
      setGroupedByRow(!groupedByRow);
      if (!groupedByRow) {
        setGroupedByColumn(false);
      }
    }; */

    // Toggle column grouping
    /*   const toggleColumnGrouping = () => {
        // Only allow grouping if columns are selected
        if (selectedColumns.length === 0) {
          setErrorMessage("Please select at least one column before enabling column grouping.");
          setTimeout(() => setErrorMessage(""), 3000);
          return;
        }
        
        setGroupedByColumn(!groupedByColumn);
        if (!groupedByColumn) {
          setGroupedByRow(false);
        }
      }; */
    //Fetch Data
    const handleFetchData = async () => {

        const res = await fetch(
            `/api/sap/bc/bsp/sap/zbw_reporting/execute_report_oo.htm?query=${query}`
        );
        const data = await res.text();
        const parsedJSON = parseXMLToJson(data);
        // setParsedResponse(parsedJSON);

        // Transform the data for easier access
        const transformed = transformFormMetadata(parsedJSON);
        processJsonData(transformed)
        console.log(transformed);

    };
    // Reset all selections
    const resetSelections = () => {
        setSelectedRows([]);
        setSelectedColumns([]);
        setGroupedByRow(false);
        setGroupedByColumn(false);
        setPathsResult({
            paths: [],
            groupedByCHA: {},
            groupedByKF: {}
        });
        setActiveTab('all');
    };

    if (!jsonData) return <div className="flex justify-center items-center h-64">Loading...</div>;

    return (
        <div className="p-4 max-w-full overflow-x-auto bg-gray-50 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Table Selector</h2>
                <button
                    onClick={toggleJsonInput}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    {jsonInputVisible ? 'Hide JSON Input' : 'Load New JSON'}
                </button>
            </div>

            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
                    {errorMessage}
                </div>
            )}

            {jsonInputVisible && (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                    <h3 className="text-lg font-medium mb-2">Enter JSON Data</h3>
                    <textarea
                        value={jsonInputText}
                        onChange={handleJsonInputChange}
                        className="w-full h-64 p-2 border border-gray-300 rounded-md mb-2 font-mono text-sm"
                        placeholder="Paste your JSON data here..."
                    />
                    <button
                        onClick={handleJsonSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                        Process JSON
                    </button>
                </div>
            )}

            <div className="mb-4 flex flex-wrap gap-3">
                {/* <button 
          onClick={toggleRowGrouping} 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${groupedByRow 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {groupedByRow ? 'Row Grouping Active' : 'Group by Row'}
        </button> */}

                {/*   <button 
          onClick={toggleColumnGrouping} 
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${groupedByColumn 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          {groupedByColumn ? 'Column Grouping Active' : 'Group by Column'}
        </button> */}

                <button
                    onClick={handleSave}
                    className={`px-3 py-2 rounded-md text-sm font-medium
            ${selectedRows.length > 0 && selectedColumns.length > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        } transition-colors`}
                    disabled={selectedRows.length === 0 || selectedColumns.length === 0}
                >
                    Save Selections
                </button>

                <button
                    onClick={resetSelections}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
                >
                    Reset
                </button>
            </div>

            <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">
                    {selectedRows.length > 0 && (
                        <div className="mb-1">
                            <span className="font-medium">Selected Rows:</span> {selectedRows.join(', ')}
                        </div>
                    )}
                    {selectedColumns.length > 0 && (
                        <div>
                            <span className="font-medium">Selected Columns:</span> {selectedColumns.join(', ')}
                        </div>
                    )}
                </div>
                {selectedRows.length === 0 || selectedColumns.length === 0 ? (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-600 text-sm">
                        Please select both rows and columns to generate intersection paths.
                    </div>
                ) : null}
            </div>
            <div className="w-full max-w-4xl mx-auto mb-6">

                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="relative w-full group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-500 group-focus-within:text-blue-600"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-mono"
                            placeholder="Enter API endpoint..."
                            required
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            >
                                <svg
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 14 14"
                                >
                                    <path
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="m1 1 12 12M13 1 1 13"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleFetchData}
                        className="px-3 py-2 h-9 bg-blue-400 text-white rounded-md text-sm font-medium hover:bg-blue-800 transition-colors"
                    >
                        Load
                    </button>
                </div>


                <div className="mt-2 text-xs text-gray-500 flex items-center px-2">
                    <svg
                        className="w-4 h-4 mr-1 text-blue-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 9h2v5m-2 0h4M9.408 5.5h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                    Enter a valid API endpoint to fetch data for the table
                </div>
            </div>



            {tableStructure.rows.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                {/* Row header columns */}
                                {tableStructure.rowHeaders.map((header) => (
                                    <th key={`header-${header.id}`} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {header.label}
                                    </th>
                                ))}

                                {/* Data columns */}
                                {tableStructure.headers.map((header) => (
                                    <th
                                        key={`header-${header.id}`}
                                        onClick={() => handleColumnSelect(header.id)}
                                        className={`
                      px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider
                      cursor-pointer hover:bg-gray-200
                      ${selectedColumns.includes(header.id) ? 'bg-blue-100 border-b-2 border-blue-500' : ''}
                    `}
                                    >
                                        {header.label}
                                        {selectedColumns.includes(header.id) && (
                                            <span className="ml-2 text-blue-500">✓</span>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {tableStructure.rows.map((row) => (
                                <tr
                                    key={`row-${row.id}`}
                                    onClick={() => handleRowSelect(row.id)}
                                    className={`
                    cursor-pointer
                    ${selectedRows.includes(row.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${row.isTotal ? 'font-bold bg-gray-100' : ''}
                  `}
                                >
                                    {/* Display row identifiers (CHA values) */}
                                    {tableStructure.rowHeaders.map((header, idx) => (
                                        <td
                                            key={`row-${row.id}-cha-${header.id}`}
                                            className={`
                        px-6 py-4 whitespace-nowrap text-sm 
                        ${row.isTotal ? 'font-bold' : 'text-gray-700'}
                        ${selectedRows.includes(row.id) ? 'bg-blue-100' : ''}
                      `}
                                        >
                                            {row.chaValues[idx] || ''}
                                        </td>
                                    ))}

                                    {/* Display data cells (KF values) */}
                                    {tableStructure.headers.map((header) => {
                                        const isCellSelected = selectedRows.includes(row.id) && selectedColumns.includes(header.id);
                                        return (
                                            <td
                                                key={`row-${row.id}-kf-${header.id}`}
                                                className={`
                          px-6 py-4 whitespace-nowrap text-sm 
                          ${row.isTotal ? 'font-bold' : 'text-black'}
                          ${selectedColumns.includes(header.id) ? 'bg-blue-100' : ''}
                          ${isCellSelected ? 'bg-blue-300 border border-blue-500' : ''}
                        `}
                                            >
                                                {row.kfValues[header.id]}
                                                {isCellSelected && (
                                                    <span className="ml-1 text-blue-800 text-xs">✓</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded text-yellow-700">
                    No data available. Please check the JSON structure.
                </div>
            )}

            {pathsResult.paths.length > 0 ? (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-800">
                            Generated Paths <span className="text-sm text-gray-500">({pathsResult.paths.length} paths)</span>
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    let textToCopy = '';

                                    if (activeTab === 'all') {
                                        textToCopy = pathsResult.paths.join('\n');
                                    } else if (activeTab === 'cha') {
                                        const chaGroups = Object.entries(pathsResult.groupedByCHA)
                                            .map(([key, group]) => `// ${key}\n${group.paths.join('\n')}`)
                                            .join('\n\n');
                                        textToCopy = chaGroups;
                                    } else if (activeTab === 'kf') {
                                        const kfGroups = Object.entries(pathsResult.groupedByKF)
                                            .map(([key, group]) => `// ${key}\n${group.paths.join('\n')}`)
                                            .join('\n\n');
                                        textToCopy = kfGroups;
                                    }

                                    navigator.clipboard.writeText(textToCopy).then(() => {
                                        setErrorMessage("Paths copied to clipboard!");
                                        setTimeout(() => setErrorMessage(""), 2000);
                                    });
                                }}
                                className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>

                    {/* Tab navigation */}
                    <div className="flex border-b border-gray-300 mb-3">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            All Paths
                        </button>
                        <button
                            onClick={() => setActiveTab('cha')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'cha'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Grouped by CHA
                        </button>
                        <button
                            onClick={() => setActiveTab('kf')}
                            className={`px-4 py-2 text-sm font-medium ${activeTab === 'kf'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            Grouped by KF
                        </button>
                    </div>

                    {/* Content tabs */}
                    <div className="bg-white p-3 rounded border border-gray-300 max-h-64 overflow-y-auto">
                        {activeTab === 'all' && (
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                                {pathsResult.paths.join('\n')}
                            </pre>
                        )}

                        {activeTab === 'cha' && (
                            <div className="space-y-4">
                                {Object.entries(pathsResult.groupedByCHA).map(([key, group], idx) => (
                                    <div key={`cha-group-${idx}`} className="border-b border-gray-200 pb-3 last:border-0">
                                        <div className="font-medium text-gray-700 mb-1 bg-gray-50 p-1 rounded">
                                            {tableStructure.rowHeaders.map((header, i) => (
                                                <span key={`cha-header-${i}`}>
                                                    {i > 0 && ' → '}
                                                    <span className="text-gray-500">{header.label}:</span> {group.chaValues[i] || ''}
                                                </span>
                                            ))}
                                        </div>
                                        <pre className="text-xs text-gray-800 whitespace-pre-wrap pl-2">
                                            {group.paths.join('\n')}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'kf' && (
                            <div className="space-y-4">
                                {Object.entries(pathsResult.groupedByKF).map(([key, group], idx) => (
                                    <div key={`kf-group-${idx}`} className="border-b border-gray-200 pb-3 last:border-0">
                                        <div className="font-medium text-gray-700 mb-1 bg-gray-50 p-1 rounded">
                                            {group.kfLabel}
                                        </div>
                                        <pre className="text-xs text-gray-800 whitespace-pre-wrap pl-2">
                                            {group.paths.join('\n')}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : selectedRows.length > 0 && selectedColumns.length > 0 ? (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-medium mb-2 text-yellow-800">No Paths Generated</h3>
                    <p className="text-sm text-yellow-700">
                        Click "Save Selections" to generate paths for the selected rows and columns.
                    </p>
                </div>
            ) : null}
            {chartData.length > 0 && (
                <div className="mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Chart Visualization</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedColumns.map((colId, index) => (
                                <Bar
                                    key={colId}
                                    dataKey={colId}
                                    fill={['#8884d8', '#82ca9d', '#ffc658'][index % 3]} // cycle colors
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default DynamicJsonTableSelector;