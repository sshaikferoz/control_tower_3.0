"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { createServer } from "miragejs";
import MyContractsIcon from "@/assets/MyContractsIcon";
import Header from "@/components/Header";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import RGL, { WidthProvider } from "react-grid-layout";
import MultiMetrics from "@/grid-components/MultiMetrics";
import PieMetric from "@/grid-components/PieMetric";
import SimpleMetric from "@/grid-components/SimpleMetric";
import SimpleMetricDate from "@/grid-components/SimpleMetricDate";
import SingleLineChart from "@/grid-components/SingleLineChart";
import TableMetric from "@/grid-components/TableMetric";
import BarMetric from "@/grid-components/BarMetric";
import StackedBarChart from "@/grid-components/StackedBarChart";
import OrdersLineChart from "@/grid-components/OrdersLineChart";
import DualLineChart from "@/grid-components/DualLineChart";
import PieChartWithTotal from "@/grid-components/PieChartWithTotal";
import QuadrantMetrics from "@/grid-components/QuadrantMetrics";
import LoansAppTray from "@/grid-components/LoansAppTray";

import { 
    CircularProgress, 
    Typography, 
    Button, 
    IconButton,
    Snackbar,
    Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import NewsFeed from "@/grid-components/NewsFeed";
import Sidebar from "@/components/Sidebar";

// Setup Mirage.js mock server
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    createServer({
        routes() {
            this.namespace = "api";

            this.get("/dashboard", () => {
                const savedLayout = sessionStorage.getItem("payload") || "[]";
                return {
                    sections: JSON.parse(savedLayout),
                };
            });

            this.post("/dashboard", (schema, request) => {
                const data = JSON.parse(request.requestBody);
                sessionStorage.setItem("payload", JSON.stringify(data.sections));
                return { success: true };
            });
        },
    });
}

const GridLayout = WidthProvider(RGL);

// Component mappings
const widgetMapping: any = {
    "two-metrics": MultiMetrics,
    "two-metrics-piechart": PieMetric,
    "one-metric": SimpleMetric,
    "one-metric-date": SimpleMetricDate,
    "two-metrics-linechart": SingleLineChart,
    "one-metric-table": TableMetric,
    "bar-chart": BarMetric,
    "stacked-bar-chart": StackedBarChart,
    "orders-line-chart": OrdersLineChart,
    "dual-line-chart": DualLineChart,
    "pie-chart-total": PieChartWithTotal,
    "quadrant-metrics": QuadrantMetrics,
    "loans-app-tray": LoansAppTray
};

// Simple drag-and-drop functionality with HTML5 native drag API
const DashboardSection = ({ section, index, isEditMode, onDragStart, onDragEnter, onDragEnd, onDragOver }: any) => {
    const [isExpanded, setIsExpanded] = useState(() => {
        return section.expanded !== undefined ? section.expanded : true;
    });
    const sectionRef = useRef<HTMLDivElement>(null);

    const toggleExpanded = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded((prev: boolean) => !prev);
    };

    const handleDragStart = (e: React.DragEvent) => {
        // Store the dragged section's index
        e.dataTransfer.setData('text/plain', index.toString());
        
        // Add a slight delay to improve visual feedback
        setTimeout(() => {
            if (sectionRef.current) {
                sectionRef.current.style.opacity = '0.4';
            }
        }, 0);
        
        onDragStart(index);
    };

    // Required to allow dropping
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        onDragOver(index);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        onDragEnter(index);
    };

    const handleDragEnd = () => {
        if (sectionRef.current) {
            sectionRef.current.style.opacity = '1';
        }
        onDragEnd();
    };

    return (
        <div
            ref={sectionRef}
            draggable={isEditMode}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            className={`mb-8 ${
                isEditMode ? 'border-2 border-dashed border-blue-300 rounded-lg cursor-move' : ''
            }`}
            data-index={index}
        >
            <div className="flex items-center p-4 m-2 gap-2">
                {isEditMode && (
                    <div className="mr-2">
                        <DragIndicatorIcon className="text-white" />
                    </div>
                )}
                <MyContractsIcon />
                <p className="text-[#fff]">{section.sectionName}</p>
                <div className="flex-grow h-px bg-[#E8E9EE80]"></div>
                <span className="text-white cursor-pointer" onClick={toggleExpanded}>
                    {isExpanded ? '▼' : '►'}
                </span>
            </div>

            {isExpanded && (
                <div className="px-6">
                    <GridLayout
                        className="layout w-full"
                        layout={section.layout}
                        cols={12}
                        rowHeight={80}
                        isResizable={false}
                        isDraggable={false}
                    >
                        {section.widgets?.map((widget: any) => {
                            const Component = widgetMapping[widget.name];
                            const props = widget.props || {};

                            return (
                                <div
                                    key={widget.id}
                                    className="bg-transparent shadow-md rounded-lg relative"
                                >
                                    {Component ? (
                                        <Component {...props} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-white bg-red-500 bg-opacity-30 rounded-lg">
                                            Widget type not found
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </GridLayout>
                </div>
            )}
        </div>
    );
};

export default function Home() {
    const [dashboardData, setDashboardData] = useState({ sections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    useEffect(() => {
        // Fetch dashboard configuration from API
        fetch("/api/dashboard")
            .then((res) => res.json())
            .then((data) => {
                setDashboardData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard configuration");
                setLoading(false);
            });
    }, []);

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    const saveDashboard = () => {
        setLoading(true);
        
        // Save the current dashboard layout to the API
        fetch("/api/dashboard", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dashboardData),
        })
            .then((res) => res.json())
            .then(() => {
                setIsEditMode(false);
                setLoading(false);
                setShowSaveSuccess(true);
            })
            .catch((err) => {
                console.error("Error saving dashboard data:", err);
                setError("Failed to save dashboard configuration");
                setLoading(false);
            });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
        setIsDragging(true);
    };

    const handleDragEnter = (targetIndex: number) => {
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        // Create a new array with reordered sections
        const reorderedSections = [...dashboardData.sections];
        const [movedSection] = reorderedSections.splice(draggedIndex, 1);
        reorderedSections.splice(targetIndex, 0, movedSection);

        // Update state with new order
        setDashboardData({ ...dashboardData, sections: reorderedSections });
        setDraggedIndex(targetIndex);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setIsDragging(false);
    };

    const handleDragOver = (index: number) => {
        // Used to enable dropping (handled in the DashboardSection component)
    };

    // Custom Header with Edit button
    const DashboardHeader = () => {
        return (
            <div className="flex justify-between items-center w-full mb-4 px-8">
                <Header />
                <div>
                    {isEditMode ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SaveIcon />}
                            onClick={saveDashboard}
                            className="bg-blue-500"
                        >
                            Save Layout
                        </Button>
                    ) : (
                        <IconButton
                            color="primary"
                            onClick={toggleEditMode}
                            className="bg-blue-500"
                            aria-label="Edit Layout"
                        >
                            <EditIcon className="text-white" />
                        </IconButton>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
                <div className="text-white ml-4">Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-white bg-red-500 p-4 rounded-lg">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <div className="flex min-h-screen">
                <Sidebar />
            </div>
            <div className="relative w-full min-h-screen">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('${process.env.NEXT_PUBLIC_BSP_NAME}/background/bg.png')`,
                    }}
                ></div>

                <div className="relative z-10 flex flex-col text-white max-h-screen overflow-y-auto">
                    <DashboardHeader />
                    <div className="flex flex-col w-full max-w-[1633px] mx-auto items-start gap-7 py-6 px-6">
                        <NewsFeed />
                    </div>

                    {/* Empty state if no sections */}
                    {dashboardData.sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <Typography variant="h5" className="text-white mb-4">
                                No dashboard sections found
                            </Typography>
                            <Typography className="text-white">
                                {`Create a "new section" by clicking "Create Section" in the header`}
                            </Typography>
                        </div>
                    ) : (
                        /* Render all sections with native HTML5 drag and drop */
                        <div className="flex flex-col">
                            {dashboardData.sections.map((section, index) => (
                                <DashboardSection
                                    key={`section-${index}`}
                                    section={section}
                                    index={index}
                                    isEditMode={isEditMode}
                                    onDragStart={handleDragStart}
                                    onDragEnter={handleDragEnter}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={handleDragOver}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Success notification */}
            <Snackbar 
                open={showSaveSuccess} 
                autoHideDuration={3000} 
                onClose={() => setShowSaveSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity="success" sx={{ width: '100%' }}>
                    Dashboard layout saved successfully!
                </Alert>
            </Snackbar>
        </div>
    );
}