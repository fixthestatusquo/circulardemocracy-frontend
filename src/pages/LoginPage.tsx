import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthApiError } from '@supabase/supabase-js'; // Import AuthApiError
import { PageLayout } from '@/components/PageLayout'; // Import PageLayout

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();

  // Basic redirection if user is already logged in
  if (user) {
    // In a real application, you'd use a router like react-router-dom
    // navigate('/'); 
    return <p>Redirecting...</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      // Handle successful login, e.g., redirect to dashboard
      console.log('Logged in successfully!', data);
    } catch (err: unknown) { // Use unknown for initial error type
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout centerContent={true}>
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
