import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2 } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  // Pre-filled with our seed data for easy testing!
  const [email, setEmail] = useState('student@campus.os');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed');
      }

      // Save to localStorage so the App can use it
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to the protected dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center mb-4 shadow-md">
            <GraduationCap className="text-white" size={32} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            HAYAGRIVA VIDYA KENDRAM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your portal
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="student@campus.os"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="text-center text-xs text-gray-500 mb-3">Quick Login (Demo)</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => { setEmail('student@hvk.edu'); setPassword('password123'); }}
              className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              Student
            </button>
            <button 
              onClick={() => { setEmail('faculty@hvk.edu'); setPassword('password123'); }}
              className="px-3 py-1.5 text-xs font-medium rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
            >
              Faculty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
