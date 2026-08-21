import React, { useState } from 'react';
import { Send, Users, AlertTriangle, MessageSquare } from 'lucide-react';

export const NotificationsManage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('SYSTEM');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 3) return alert('Title must be at least 3 characters');
    if (message.length < 5) return alert('Message must be at least 5 characters');

    setSending(true);
    try {
      const res = await fetch('http://localhost:3000/api/v1/notifications/broadcast', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title, message, type, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message); // e.g. "Broadcasted to 50 users."
        setTitle('');
        setMessage('');
      } else {
        alert(`Failed: ${data.error || data.message}`);
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Notifications</h1>
        <p className="text-gray-500 mt-1">Send system-wide alerts and messages to campus groups.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleBroadcast} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select value={targetRole} onChange={e=>setTargetRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                <option value="ALL">Entire Campus (Everyone)</option>
                <option value="STUDENT">All Students</option>
                <option value="FACULTY">All Faculty</option>
                <option value="PARENT">All Parents</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50">
                <option value="SYSTEM">System Announcement</option>
                <option value="ALERT">Critical Alert</option>
                <option value="MESSAGE">General Message</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="e.g. Campus Closed Tomorrow" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notification Body</label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} required rows={4} placeholder="Detailed message..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send size={18} /> {sending ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-sm">
        <Users size={20} className="shrink-0" />
        <p><strong>Note:</strong> Broadcasting sends an individual notification instance to every user in the selected group. They will instantly see a red unread badge in their Topbar.</p>
      </div>
    </div>
  );
};
