/**
 * Performance Dashboard Component
 *
 * Admin dashboard component for viewing Web Vitals and performance metrics.
 * Shows real-time performance data and alerts.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
}

interface PerformanceSummary {
  total: number;
  good: number;
  needsImprovement: number;
  poor: number;
  averageValue: number;
}

export default function PerformanceDashboard() {
  const [webVitals, setWebVitals] = useState<WebVital[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('24h');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        timeframe,
        limit: '100',
        ...(selectedMetric !== 'all' && { metric: selectedMetric }),
      });

      const response = await fetch(`/api/analytics/web-vitals?${params}`);
      const data = await response.json();

      setWebVitals(data.data ?? []);
      setSummary(data.summary ?? null);
    } catch (error) {
      void console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMetric, timeframe]);

  useEffect(() => {
    void fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(() => void fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getScorePercentage = (summary: PerformanceSummary) => {
    if (summary.total === 0) return 0;
    return Math.round((summary.good / summary.total) * 100);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => i).map((skeletonId) => (
              <div key={`perf-skeleton-${skeletonId}`} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
        <div className="flex gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Metrics</option>
            <option value="LCP">LCP (Largest Contentful Paint)</option>
            <option value="FID">FID (First Input Delay)</option>
            <option value="CLS">CLS (Cumulative Layout Shift)</option>
            <option value="FCP">FCP (First Contentful Paint)</option>
            <option value="TTFB">TTFB (Time to First Byte)</option>
          </select>

          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Performance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getScorePercentage(summary)}%
              </div>
              <div className="text-xs text-gray-500">Good ratings</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedMetric === 'CLS' || selectedMetric === 'all'
                  ? summary.averageValue.toFixed(3)
                  : `${Math.round(summary.averageValue)}ms`}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.poor}</div>
              <div className="text-xs text-gray-500">Poor ratings</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {summary && summary.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-4 rounded-lg overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(summary.good / summary.total) * 100}%` }}
              ></div>
              <div
                className="bg-yellow-500"
                style={{ width: `${(summary.needsImprovement / summary.total) * 100}%` }}
              ></div>
              <div
                className="bg-red-500"
                style={{ width: `${(summary.poor / summary.total) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Good: {summary.good}</span>
              <span>Needs Improvement: {summary.needsImprovement}</span>
              <span>Poor: {summary.poor}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Measurements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          {webVitals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No data available for the selected timeframe.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {webVitals.slice(0, 20).map((vital) => (
                <div
                  key={`vital-${vital.name}-${vital.timestamp}-${vital.value}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{vital.name}</span>
                    <div className="text-sm text-gray-500">
                      {new Date(vital.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatValue(vital.name, vital.value)}</div>
                    <div className={`text-sm ${getRatingColor(vital.rating)}`}>
                      {vital.rating.replace('-', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
