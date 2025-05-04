import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DashboardBuilder from './DashboardBuilder';
import WidgetFactory from './WidgetFactory';
import { MappingConfiguration } from './types';

const MainApp: React.FC = () => {
  const [dashboards, setDashboards] = useState<string[]>([]);
  
  // Load saved dashboards from localStorage on component mount
  useEffect(() => {
    const savedDashboards: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dashboard_')) {
        savedDashboards.push(key.replace('dashboard_', ''));
      }
    }
    
    setDashboards(savedDashboards);
  }, []);
  
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-blue-600">Hybrid Mapping System</span>
                </div>
                <div className="ml-6 flex space-x-8">
                  <Link
                    to="/"
                    className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Dashboards
                  </Link>
                  <Link
                    to="/builder"
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 text-sm font-medium"
                  >
                    Create New
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<DashboardList dashboards={dashboards} />} />
              <Route path="/builder" element={<DashboardBuilder onSave={handleDashboardSave} />} />
              <Route path="/dashboard/:name" element={<DashboardView />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
  
  // Handle dashboard save
  function handleDashboardSave(config: MappingConfiguration) {
    // Refresh dashboard list after save
    const newDashboards = [...dashboards];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dashboard_') && !dashboards.includes(key.replace('dashboard_', ''))) {
        newDashboards.push(key.replace('dashboard_', ''));
      }
    }
    
    setDashboards(newDashboards);
  }
};

// Dashboard List Component
const DashboardList: React.FC<{ dashboards: string[] }> = ({ dashboards }) => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your Dashboards</h1>
      
      {dashboards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No dashboards</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new dashboard.
          </p>
          <div className="mt-6">
            <Link
              to="/builder"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Create Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((name) => (
            <div key={name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">{name}</h3>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link
                    to={`/dashboard/${name}`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-gray-50 overflow-hidden shadow rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Link to="/builder" className="block">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">Create New Dashboard</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard View Component
const DashboardView: React.FC = () => {
  const [dashboard, setDashboard] = useState<MappingConfiguration | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get dashboard name from URL
  const dashboardName = window.location.pathname.split('/').pop() || '';
  
  // Load dashboard configuration from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(`dashboard_${dashboardName}`);
      if (savedConfig) {
        setDashboard(JSON.parse(savedConfig));
      } else {
        setError('Dashboard not found');
      }
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dashboardName]);
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error || !dashboard) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error || 'Failed to load dashboard'}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to Dashboard List
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{dashboardName}</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <Link
            to={`/builder?dashboard=${dashboardName}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Edit Dashboard
          </Link>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="grid grid-cols-12 gap-6">
          {dashboard.widgets.map((widget, index) => {
            const layout = dashboard.layouts.find(l => l.i === widget.id);
            
            if (!layout) return null;
            
            return (
              <div
                key={widget.id}
                className="col-span-12 sm:col-span-6 lg:col-span-4 xl:col-span-3"
                style={{
                  gridColumn: `span ${Math.min(layout.w, 12)}`
                }}
              >
                <WidgetFactory
                  type={widget.type}
                  mappings={widget.mappings}
                  apiData={dashboard.apiResponse}
                  className="h-full"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MainApp;