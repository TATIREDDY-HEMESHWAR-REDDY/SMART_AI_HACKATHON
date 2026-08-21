import React from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export const Attendance = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Dashboard</h2>
          <p className="text-sm text-gray-500">Track and manage your daily attendance</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          Mark Present Today
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Classes</p>
            <p className="text-2xl font-bold text-gray-900">42</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Present</p>
            <p className="text-2xl font-bold text-gray-900">38</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Absent</p>
            <p className="text-2xl font-bold text-gray-900">2</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Attendance %</p>
            <p className="text-2xl font-bold text-gray-900">90.4%</p>
          </div>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800">Recent History</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[
            { date: 'Today, 9:00 AM', subject: 'Data Structures', status: 'Present', color: 'bg-green-100 text-green-700' },
            { date: 'Yesterday, 10:30 AM', subject: 'Operating Systems', status: 'Present', color: 'bg-green-100 text-green-700' },
            { date: 'Monday, 1:15 PM', subject: 'Computer Networks', status: 'Absent', color: 'bg-red-100 text-red-700' },
          ].map((record, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{record.subject}</p>
                <p className="text-sm text-gray-500">{record.date}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${record.color}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
