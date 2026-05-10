import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Camera, User, Lock, ChevronRight } from 'lucide-react';

const demoAccounts = [
  { label: 'User', username: 'user', password: 'user123', color: 'from-teal-500 to-cyan-500', desc: 'Peserta Event' },
  { label: 'Fotografer', username: 'photographer', password: 'photo123', color: 'from-purple-500 to-pink-500', desc: 'Fotografer Pro' },
  { label: 'Admin', username: 'admin', password: 'admin123', color: 'from-blue-500 to-indigo-500', desc: 'Administrator' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Username atau password salah');
    }
  };

  const fillDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-purple-50 p-4 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-teal-200 rounded-full opacity-20 -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 translate-x-1/3 translate-y-1/3 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-200 rounded-full opacity-10 blur-2xl" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 shadow-lg mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            SnapFind
          </h1>
          <p className="text-gray-500 text-sm mt-1">Platform Fotografi Event berbasis AI</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Selamat Datang</h2>
            <p className="text-sm text-gray-500 mt-1">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username"
                  className="pl-10 h-11 border-gray-200 focus:border-teal-400 focus:ring-teal-400 rounded-xl"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Masukkan password"
                  className="pl-10 h-11 border-gray-200 focus:border-teal-400 focus:ring-teal-400 rounded-xl"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                <AlertDescription className="text-red-600 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  Masuk
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">DEMO AKUN</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo Accounts */}
          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.username}
                type="button"
                onClick={() => fillDemo(acc.username, acc.password)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${acc.color} flex items-center justify-center flex-shrink-0`}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-gray-700">{acc.label}</p>
                  <p className="text-xs text-gray-400">{acc.desc} · {acc.username} / {acc.password}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          SnapFind © 2025 · Kelompok 4 · Universitas Siliwangi
        </p>
      </div>
    </div>
  );
}