import React, { useState, useEffect } from 'react';

interface AlumniEvent {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

export function AlumniEvents() {
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const canCreate = user?.roles?.includes('ALUMNI') || user?.roles?.includes('TPO');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/v1/alumni/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Event created successfully!');
        setFormData({ title: '', description: '', date: '', location: '' });
        fetchEvents();
      } else {
        alert('Failed to create event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading Events...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alumni Events</h1>
        <p className="text-gray-500 mt-2">Upcoming networking events and webinars.</p>
      </div>

      {canCreate && (
        <div className="p-6 mb-8 bg-blue-50 border rounded shadow-sm">
          <h2 className="text-xl font-bold mb-4">Post a New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location (or Link)</label>
                <input 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
                  rows={3}
                  required
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Create Event
            </button>
          </form>
        </div>
      )}

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 && <p className="text-gray-500">No upcoming events.</p>}
        {events.map(event => (
          <div key={event.id} className="p-6 border rounded shadow-sm bg-white">
            <h3 className="font-bold text-lg text-blue-900">{event.title}</h3>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
              <p><strong>Location:</strong> {event.location}</p>
            </div>
            <p className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
