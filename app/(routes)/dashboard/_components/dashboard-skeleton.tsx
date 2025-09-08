"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';

// Skeleton for individual stat cards
export function StatCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="metric-card group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-xl animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse"></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton for stats cards grid
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <StatCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

// Skeleton for chart components
export function ChartSkeleton() {
  return (
    <Card className="fleetcare-card">
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64 w-full bg-gray-100 rounded animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

// Skeleton for recent alerts
export function RecentAlertsSkeleton() {
  return (
    <Card className="fleetcare-card">
      <CardHeader>
        <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mt-2"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-gray-100 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Skeleton for simulation modal content
export function SimulationModalSkeleton() {
  return (
    <div className="fleetcare-card w-96 shadow-xl p-6">
      <div className="space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
        
        <div className="space-y-3">
          <div className="h-20 w-full bg-gray-100 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-100 rounded animate-pulse"></div>
        </div>
        
        <div className="flex space-x-3">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Complete dashboard page skeleton
export function DashboardPageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-44 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Stats Cards */}
      <StatsCardsSkeleton />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <RecentAlertsSkeleton />
      </div>
    </motion.div>
  );
}