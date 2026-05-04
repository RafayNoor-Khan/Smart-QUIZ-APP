'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizAnalytics } from '@/lib/actions';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function AnalyticsPage({ params }) {
  const router = useRouter();

  // ✅ THIS is the correct fix
  const { id } = use(params);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ======================
  // AUTH CHECK
  // ======================
  useEffect(() => {
    const userData = localStorage.getItem('user');

    if (!userData) {
      router.push('/');
      return;
    }

    const parsed = JSON.parse(userData);

    if (parsed.role !== 'instructor') {
      router.push('/dashboard');
    }
  }, [router]);

  // ======================
  // FETCH ANALYTICS
  // ======================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await getQuizAnalytics(Number(id));

        if (!res.success) {
          setError(res.message || 'Failed to load analytics');
        } else {
          setAnalytics(res.data);
        }
      } catch (err) {
        setError('Error loading analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ======================
  // STATES
  // ======================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-center">
        <div>
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => router.back()} className="underline text-white">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-center">
        <div>
          <p className="text-gray-500 mb-4">No analytics data</p>
          <button onClick={() => router.back()} className="underline text-white">
            Go back
          </button>
        </div>
      </div>
    );
  }

  // ======================
  // DATA
  // ======================
  const totalAssigned = analytics.totalAssigned || 0;
  const totalCompleted = analytics.totalAttempts || 0;

  const completionRate =
    totalAssigned > 0
      ? Math.round((totalCompleted / totalAssigned) * 100)
      : 0;

  const distributionData = [
    { name: 'Excellent', value: analytics.distribution?.excellent || 0 },
    { name: 'Good', value: analytics.distribution?.good || 0 },
    { name: 'Average', value: analytics.distribution?.average || 0 },
    { name: 'Poor', value: analytics.distribution?.poor || 0 },
  ];

  const statsData = [
    {
      name: 'Stats',
      Assigned: totalAssigned,
      Completed: totalCompleted,
    },
  ];

  // ======================
  // UI
  // ======================
  return (
    <div className="min-h-screen bg-black text-white px-4 md:px-6 lg:px-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto py-6 border-b border-zinc-800">
        <button onClick={() => router.back()} className="text-gray-500 mb-3">
          ← Back
        </button>

        <h1 className="text-3xl md:text-5xl font-light">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Performance insights & statistics
        </p>
      </div>

      <div className="max-w-7xl mx-auto py-8 space-y-10">

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Assigned" value={totalAssigned} />
          <StatCard title="Completed" value={totalCompleted} />
          <StatCard title="Completion" value={`${completionRate}%`} />
          <StatCard title="Average Score" value={`${analytics.averageScore || 0}%`} />
        </div>

        {/* CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* PIE */}
          <Card title="Score Distribution">
            {distributionData.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={distributionData} dataKey="value" outerRadius={80}>
                      {distributionData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <LegendList data={distributionData} />
              </>
            ) : (
              <EmptyChart />
            )}
          </Card>

          {/* BAR */}
          <Card title="Attempts">
            {totalAssigned > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={statsData}>
                  <CartesianGrid stroke="#333" />
                  <XAxis dataKey="name" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Assigned" fill="#3b82f6" />
                  <Bar dataKey="Completed" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </Card>
        </div>

        {/* SUMMARY */}
        <Card title="Summary">
          <div className="grid md:grid-cols-4 gap-6">
            <StatMini title="Pending" value={totalAssigned - totalCompleted} />
            <StatMini title="Top Performers" value={analytics.distribution?.excellent || 0} />
            <StatMini
              title="Needs Improvement"
              value={
                (analytics.distribution?.poor || 0) +
                (analytics.distribution?.average || 0)
              }
            />
            <StatMini
              title="Pass Rate"
              value={
                totalCompleted
                  ? Math.round(
                      ((analytics.distribution?.excellent || 0) +
                        (analytics.distribution?.good || 0)) /
                        totalCompleted *
                        100
                    ) + '%'
                  : '0%'
              }
            />
          </div>
        </Card>

      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-4 md:p-6">
      <p className="text-xs text-gray-500 uppercase">{title}</p>
      <p className="text-2xl md:text-4xl">{value}</p>
    </div>
  );
}

function StatMini({ title, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl">{value}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="border border-zinc-800 rounded-lg p-6">
      <h2 className="text-xl mb-4">{title}</h2>
      {children}
    </div>
  );
}

function LegendList({ data }) {
  return (
    <div className="mt-4 space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
          {d.name}: {d.value}
        </div>
      ))}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-60 flex items-center justify-center text-gray-600">
      No data available
    </div>
  );
}