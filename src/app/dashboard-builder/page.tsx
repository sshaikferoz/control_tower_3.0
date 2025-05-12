// app/dashboard-builder/page.tsx
"use client";

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import to avoid SSR issues with react-grid-layout
const DashboardBuilder = dynamic(
  () => import('@/components/DashboardBuilder'),
  { ssr: false, loading: () => <div>Loading...</div> }
);

const DashboardBuilderPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Dashboard Builder...</div>}>
      <DashboardBuilder />
    </Suspense>
  );
};

export default DashboardBuilderPage;