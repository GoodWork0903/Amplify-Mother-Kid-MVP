'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import '@/utils/amplify-client';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Apps as AppsIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

type Form = {
  appname: string;
  url: string;
  repoUrl: string;
  environment: string;
  repoTokenArn: string;
  createdAt: string;
  manager: string;
};

export default function AdoptChildAppPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [form, setForm] = useState<Form>({
    appname: '',
    url: '',
    repoUrl: '',
    environment: '',
    repoTokenArn: '',
    createdAt: new Date().toISOString().split('T')[0], // Default to today
    manager: '',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) throw new Error('NEXT_PUBLIC_API_URL is not set');

      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      const jwt = tokens?.accessToken?.toString() ?? tokens?.idToken?.toString();
      if (!jwt) throw new Error('No authenticated session. Please sign in again.');
      const payload = {
        appname: form.appname,
        status: 'ADOPTED',
        repoUrl: form.repoUrl,
        subdomain: form.url,
        env: form.environment ? form.environment.toUpperCase() : '',
        category: "adopted",
        createdBy: form.manager,
        createdate: form.createdAt,
        manager:form.manager,
        repoTokenArn: form.repoTokenArn,
      };

      const response = await fetch(`${apiBase}/child-apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Adopt app success:', result);
      
      // Redirect to dashboard after successful adoption
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Adopt app error:', err);
      setError(err instanceof Error ? err.message : 'Failed to adopt child app');
    } finally {
      setPending(false);
    }
  };

  const handleReset = () => {
    setForm({
      appname: '',
      url: '',
      repoUrl: '',
      environment: '',
      repoTokenArn: '',
      createdAt: new Date().toISOString().split('T')[0],
      manager: '',
    });
    setError(null);
  };

  if (authLoading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Checking authentication...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
          Adopt Child App
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Adopt an existing child application into your management system
        </Typography>
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
              {/* App Name */}
              <TextField
                fullWidth
                label="App Name"
                name="appname"
                value={form.appname}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AppsIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* URL */}
              <TextField
                fullWidth
                label="App URL"
                name="url"
                value={form.url}
                onChange={handleChange}
                required
                placeholder="https://example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Environment */}
              <TextField
                select
                fullWidth
                label="Environment"
                name="environment"
                value={form.environment}
                onChange={handleChange}
                required
              >
                <MenuItem value="">Select environment</MenuItem>
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="staging">Staging</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </TextField>

              {/* Created At */}
              <TextField
                fullWidth
                label="Created Date"
                name="createdAt"
                type="date"
                value={form.createdAt}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Repo URL */}
              <TextField
                fullWidth
                label="Repository URL"
                name="repoUrl"
                value={form.repoUrl}
                onChange={handleChange}
                placeholder="https://github.com/user/repo"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* repoTokenArn */}
              <TextField
                fullWidth
                label="repoTokenArn"
                name="repoTokenArn"
                value={form.repoTokenArn}
                onChange={handleChange}
                placeholder="Brief description of the app"
                multiline
                minRows={3}
                sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
              />

              {/* Manager (Created By) */}
              <TextField
                fullWidth
                label="Manager"
                name="manager"
                value={form.manager}
                onChange={handleChange}
                placeholder="user@example.com"
              />

              {/* Error Display */}
              {error && (
                <Alert severity="error" sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  disabled={pending}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={pending ? <CircularProgress size={20} /> : <AddIcon />}
                  disabled={pending}
                  sx={{ minWidth: 140 }}
                >
                  {pending ? 'Adopting...' : 'Adopt'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
