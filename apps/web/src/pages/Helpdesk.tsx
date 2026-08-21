import React, { useEffect, useState } from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, FileText, Send, Building } from 'lucide-react';

export const Helpdesk = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.roles?.some((r: string) => ['COLLEGE_ADMIN', 'ADMIN', 'MAINTENANCE'].includes(r))) {
      setRole('ADMIN');
    } else {
      setRole('USER');
    }
    fetchComplaints(user.roles || []);
  }, []);

  const fetchComplaints = async (roles: string[]) => {
    try {
      const isAdmin = roles.some((r: string) => ['COLLEGE_ADMIN', 'ADMIN', 'MAINTENANCE'].includes(r));
      const url = isAdmin 
        ? 'http://localhost:3000/api/v1/complaints' 
        : 'http://localhost:3000/api/v1/complaints/me';
        
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 5) return alert('Title must be at least 5 characters');
    if (description.length < 10) return alert('Description must be at least 10 characters');

    try {
      const res = await fetch('http://localhost:3000/api/v1/complaints', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, description, location })
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setDescription('');
        setLocation('');
        alert('Complaint submitted successfully');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        fetchComplaints(user.roles || []);
      } else {
        alert(`Error: ${data.error || data.message}`);
      }
    } catch (err) {
      alert('Failed to submit complaint');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        fetchComplaints(user.roles || []);
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="p-6">Loading Helpdesk...</div>;

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'OPEN': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle size={14}/> OPEN</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={14}/> IN PROGRESS</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={14}/> RESOLVED</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={14}/> REJECTED</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campus Helpdesk</h1>
        <p className="text-gray-500 mt-1">
          {role === 'ADMIN' ? 'Manage and resolve campus maintenance requests.' : 'Report facility issues and track their resolution.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form (Only for non-admins, though technically admins could complain too. Let's show it for users) */}
        {role === 'USER' && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-blue-600"/> New Ticket
              </h2>
              <form onSubmit={submitComplaint} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
                  <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Broken AC" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Room 304, CSE Block" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={4} placeholder="Detailed description of the issue..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Send size={16} /> Submit Ticket
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Column / Main Area: Tickets List */}
        <div className={`${role === 'USER' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building size={18} className="text-gray-500"/> {role === 'ADMIN' ? 'All Active Tickets' : 'My Tickets'}
          </h2>

          {complaints.length === 0 && (
            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
              <p className="text-gray-500">No complaints found.</p>
            </div>
          )}

          <div className="space-y-4">
            {complaints.map(ticket => (
              <div key={ticket.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{ticket.title}</h3>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="text-sm text-gray-600">{ticket.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-1 rounded"><Building size={12}/> {ticket.location || 'Campus General'}</span>
                    <span>Reported: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {role === 'ADMIN' && ticket.author && (
                      <span className="font-medium text-blue-600">By: {ticket.author.email}</span>
                    )}
                  </div>
                </div>

                {/* Admin Actions */}
                {role === 'ADMIN' && (
                  <div className="flex-shrink-0 flex flex-col gap-2 min-w-[140px]">
                    <label className="text-xs font-bold text-gray-500 uppercase">Update Status</label>
                    <select 
                      value={ticket.status} 
                      onChange={(e) => updateStatus(ticket.id, e.target.value)}
                      className="w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
