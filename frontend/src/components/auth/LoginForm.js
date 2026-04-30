'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/actions';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await loginUser(email, password);

        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            router.push(result.user.role === 'student' ? '/dashboard' : '/instructor/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center">🔐 Login</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    ❌ {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="text-center text-sm text-gray-600">
                Don't have account?{' '}
                <a href="/register" className="text-blue-600 hover:underline font-semibold">
                    Register here
                </a>
            </p>
        </form>
    );
}
