import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (dbError || !data) {
      setError('Invalid username or password');
    } else {
      onLogin();
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '100px auto' }}>
      <Card>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-primary-dark)' }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <Input 
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{error}</p>}
          <Button fullWidth type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
