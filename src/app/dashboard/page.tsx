"use client";
export const dynamic = "force-dynamic";
import "@/utils/amplify-client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";
import { useAuth } from '@/contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Avatar,
  // LinearProgress,
  Alert,
  // Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Tooltip,
  Fab,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Apps as AppsIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  OpenInNew as OpenIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  type ChildApp = {
    id?: string;
    appname?: string;
    subdomain?: string;
    manager?: string;
    status?: string;
    createdAt?: string | number | Date;
    url?: string;
    stats?: {
      total: number;
      active_30d: number;
      login_today: number;
    };
  };

  const [rows, setRows] = useState<ChildApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const loadData = useCallback(async (isRefresh = false) => {
      if (!API_BASE) {
          setError("Set NEXT_PUBLIC_API_URL in your env file.");
          setLoading(false);
        return;
      }

      try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
          setLoading(true);
      }
          setError("");

        const { tokens } = await fetchAuthSession({ forceRefresh: true });
        const jwt = tokens?.accessToken?.toString() ?? tokens?.idToken?.toString() ?? "";

        if (!jwt) throw new Error("No authenticated session. Please sign in again.");

        const res = await fetch(`${API_BASE}/child-apps`, {
          method: "GET",
          headers: { Authorization: `Bearer ${jwt}` },
          cache: "no-store",
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: ChildApp[] = Array.isArray(data) ? data : data.items || data.Items || [];

        // Fetch stats for each child app
        const withStats = await Promise.all(list.map(async (app) => {
          try {
            const statsRes = await fetch(`${API_BASE}/childstats/${app.id}`, {
              headers: { Authorization: `Bearer ${jwt}` },
            });

            const statsJson = await statsRes.json();

            // Some APIs return nested JSON inside `body`
            const stats = typeof statsJson.body === "string"
              ? JSON.parse(statsJson.body)
              : statsJson;

            return { ...app, stats };
          } catch (err) {
            console.warn(`Failed to load stats for ${app.id}`, err);
            return { ...app, stats: { total: -1, active_30d: -1, login_today: -1 } };
          }
        }));

      setRows(withStats);
      } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Don't load data if not authenticated
    if (!isAuthenticated && !authLoading) {
      router.push('/login');
      return;
    }

    if (authLoading) return;

    loadData();
  }, [isAuthenticated, authLoading, router, loadData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.appname, r.subdomain, r.manager, r.status]
        .map((v) => (v ?? "").toString().toLowerCase())
        .some((txt) => txt.includes(q))
    );
  }, [rows, query]);

  const total = filtered.length;
  const start = page * pageSize;
  const end = start + pageSize;
  const pageRows = filtered.slice(start, end);

  // Calculate statistics
  const totalApps = rows.length;
  const activeApps = rows.filter(app => app.status === 'READY').length;
  const totalUsers = rows.reduce((sum, app) => sum + (app.stats?.total || 0), 0);
  const activeUsers = rows.reduce((sum, app) => sum + (app.stats?.active_30d || 0), 0);


  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Dashboard
          </Typography>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Data">
              <IconButton 
                onClick={() => loadData(true)} 
                disabled={refreshing}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
            onClick={() => router.push("/child/create")}
              sx={{ borderRadius: 2 }}
            >
              Create App
            </Button>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search apps by name, domain, or status..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="white" gutterBottom variant="h6">
                  Total Apps
                </Typography>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {totalApps}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <AppsIcon sx={{ fontSize: 30, color: 'white' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="white" gutterBottom variant="h6">
                  Active Apps
                </Typography>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {activeApps}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <TrendingUpIcon sx={{ fontSize: 30, color: 'white' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="white" gutterBottom variant="h6">
                  Total Users
                </Typography>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {totalUsers.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <PeopleIcon sx={{ fontSize: 30, color: 'white' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="white" gutterBottom variant="h6">
                  Active Users
                </Typography>
                <Typography variant="h4" color="white" fontWeight="bold">
                  {activeUsers.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                <ScheduleIcon sx={{ fontSize: 30, color: 'white' }} />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Apps Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              Child Applications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {total} application{total !== 1 ? 's' : ''} found
            </Typography>
          </Box>

        {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading applications...
              </Typography>
            </Box>
        ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">App Name</TableCell>
                      <TableCell align="center">Domain</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Created</TableCell>
                      <TableCell align="center">Users</TableCell>
                      <TableCell align="center">Active (30d)</TableCell>
                      <TableCell align="center">Today</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageRows.map((app, index) => (
                      <TableRow key={app.id || index} hover>
                        <TableCell align="center">
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                              <AppsIcon fontSize="small" />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {app.appname || 'Unnamed App'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {app.subdomain || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={app.status || 'REQUESTED'}
                            color={
                              app.status === 'READY' ? 'success' :
                              app.status === 'REQUESTED' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(app.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {showStat(app.stats?.total)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {showStat(app.stats?.active_30d)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            {showStat(app.stats?.login_today)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box display="flex" gap={1}>
                            {app.status === 'READY' && app.url && (
                              <Tooltip title="Open App">
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(app.url, '_blank')}
                                  color="primary"
                                >
                                  <OpenIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/users/${app.id}`)}
                                color="primary"
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={pageSize}
                onRowsPerPageChange={(e) => {
                  setPageSize(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => router.push("/child/create")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

function formatDate(v: string | number | Date | undefined): string {
  if (!v) return "-";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return String(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

function showStat(value: number | undefined) {
  if (value === undefined) return "…";
  if (value === -1) return "×";
  return value;
}
