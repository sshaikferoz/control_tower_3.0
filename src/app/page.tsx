"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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

import { CircularProgress, Typography } from "@mui/material";
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
        },
    });
}

const GridLayout = WidthProvider(RGL);

// Component mappings
const widgetMapping:any = {
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

// Component for section header with appropriate icon
const SectionHeader = ({ title, isExpanded, toggleExpanded }:any) => {
    return (
        <div
            className="flex items-center p-4 m-2 gap-2 cursor-pointer"
            onClick={toggleExpanded}
        >
            <MyContractsIcon />
            <p className="text-[#fff]">{title}</p>
            <div className="flex-grow h-px bg-[#E8E9EE80]"></div>
            {/* Expand/collapse indicator */}
            <span className="text-white">
                {isExpanded ? '▼' : '►'}
            </span>
        </div>
    );
};

const DashboardSection = ({ section }:any) => {
    const [isExpanded, setIsExpanded] = useState(() => {
        // Initialize expanded state from section data
        // Default to true if not specified
        return section.expanded !== undefined ? section.expanded : true
    });

    const toggleExpanded = () => {
        setIsExpanded((prev:any) => !prev);
    };

    return (
        <div className="mb-8">
            <SectionHeader 
                title={section.sectionName} 
                isExpanded={isExpanded} 
                toggleExpanded={toggleExpanded} 
            />

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
                        {section.widgets?.map((widget:any) => {
                            const Component = widgetMapping[widget.name];
                            // Use widget's props directly - they're already preprocessed
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
                    <Header />
                    <div className="flex flex-col w-full max-w-[1633px] mx-auto items-start gap-7 py-11 px-6">
                        <NewsFeed />
                    </div>

                    {/* Empty state if no sections */}
                    {dashboardData.sections.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh]">
                            <Typography variant="h5" className="text-white mb-4">
                                No dashboard sections found
                            </Typography>
                            <Typography className="text-white">
                                {`Create a "new section" by clicking Create Section" in the header`}
                            </Typography>
                        </div>
                    ) : (
                        /* Render all sections vertically */
                        <div className="flex flex-col">
                            {dashboardData.sections.map((section, index) => (
                                <DashboardSection key={index} section={section} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}