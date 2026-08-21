import React, { useState, useEffect } from 'react';

interface AggregateReadiness {
  uniqueStudentsWithGoals: number;
  uniqueStudentsWithSkills: number;
  totalAssessmentsTaken: number;
}

interface AnalyticsData {
  topGoals: { role: string; count: number }[];
  popularSkills: { skill: string; count: number }[];
  aggregateReadiness: AggregateReadiness;
  lastUpdated: string;
}

export function CareerAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/v1/career/analytics/dashboard', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Failed to fetch analytics.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading Career Analytics...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!data) return <div className="p-6 text-gray-500">No data available.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Career Analytics Dashboard</h1>
        <p className="text-gray-500 mt-2">Aggregate view of student career readiness, goals, and skills.</p>
        <p className="text-xs text-gray-400">Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded shadow-sm bg-blue-50 text-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Students w/ Goals</h3>
          <p className="text-3xl font-bold text-blue-900 mt-2">{data.aggregateReadiness.uniqueStudentsWithGoals}</p>
        </div>
        <div className="p-6 border rounded shadow-sm bg-green-50 text-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Students w/ Skills</h3>
          <p className="text-3xl font-bold text-green-900 mt-2">{data.aggregateReadiness.uniqueStudentsWithSkills}</p>
        </div>
        <div className="p-6 border rounded shadow-sm bg-purple-50 text-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Assessments Taken</h3>
          <p className="text-3xl font-bold text-purple-900 mt-2">{data.aggregateReadiness.totalAssessmentsTaken}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded shadow-sm bg-white">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Career Goals</h3>
          {data.topGoals.length === 0 ? (
            <p className="text-sm text-gray-500">No career goals recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.topGoals.map((goal, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span className="font-medium text-gray-700">{goal.role}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{goal.count} students</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-6 border rounded shadow-sm bg-white">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Most Popular Skills</h3>
          {data.popularSkills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {data.popularSkills.map((skill, idx) => (
                <li key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <span className="font-medium text-gray-700">{skill.skill}</span>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">{skill.count} students</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
