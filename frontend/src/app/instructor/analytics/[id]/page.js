'use client';

import { useState, useEffect } from 'react';
import { getQuizAnalytics } from '@/lib/actions';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsPage({ params }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const result = await getQuizAnalytics(Number(params.id));
      if (result.success) {
        setAnalytics(result.data);
      }
      setLoading(false);
    }

    fetchAnalytics();
  }, [params.id]);

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;
  if (!analytics) return <div className="text-center py-8 text-red-600">No data available</div>;

  const distributionData = [
    { name: 'Excellent (90+)', value: analytics.distribution.excellent },
    { name: 'Good (70-89)', value: analytics.distribution.good },
    { name: 'Average (50-69)', value: analytics.distribution.average },
    { name: 'Poor (<50)', value: analytics.distribution.poor },
  ];

  const statsData = [
    {
      name: 'Stats',
      'Assigned': analytics.totalAssigned,
      'Completed': analytics.totalAttempts,
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">📊 Quiz Analytics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm font-semibold">Total Assigned</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{analytics.totalAssigned}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm font-semibold">Completed</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{analytics.totalAttempts}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm font-semibold">Completion Rate</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{analytics.completionRate}%</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-6 text-center">
          <p className="text-gray-600 text-sm font-semibold">Average Score</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{analytics.averageScore}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Attempt Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Assigned" fill="#3b82f6" />
              <Bar dataKey="Completed" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}