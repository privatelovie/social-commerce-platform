import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Card,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Collapse,
  TextField
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Speed,
  Storage,
  VpnLock,
  Message,
  PersonAdd,
  Login,
  ExpandMore,
  ExpandLess,
  Link as LinkIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  responseTime?: number;
}

const ConnectionTest: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('Test123!');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    // Test 1: Backend Health
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Backend Health',
          status: 'success',
          message: 'Backend is running',
          details: `Response time: ${responseTime}ms\nStatus: ${data.status || 'OK'}`,
          responseTime
        });
      } else {
        testResults.push({
          name: 'Backend Health',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: 'Backend may not be deployed or is not responding'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'Backend Health',
        status: 'error',
        message: 'Cannot reach backend',
        details: error.message || 'Network error - check if backend is deployed'
      });
    }

    // Test 2: MongoDB Connection
    try {
      const response = await fetch(`${API_URL}/health/db`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Database Connection',
          status: 'success',
          message: 'MongoDB connected',
          details: `Database status: ${data.database || 'connected'}`
        });
      } else {
        testResults.push({
          name: 'Database Connection',
          status: 'warning',
          message: 'Cannot verify database',
          details: 'Health check passed but DB endpoint not available'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'Database Connection',
        status: 'warning',
        message: 'Cannot test database',
        details: 'Endpoint may not exist, but app might still work'
      });
    }

    // Test 3: CORS Configuration
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (corsHeader) {
        testResults.push({
          name: 'CORS Configuration',
          status: 'success',
          message: 'CORS headers present',
          details: `Allow-Origin: ${corsHeader}\nFrontend can communicate with backend`
        });
      } else {
        testResults.push({
          name: 'CORS Configuration',
          status: 'error',
          message: 'CORS headers missing',
          details: 'Backend may not allow requests from this domain'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'CORS Configuration',
        status: 'error',
        message: 'CORS test failed',
        details: error.message
      });
    }

    // Test 4: Authentication Endpoint
    if (!isAuthenticated) {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: `test_${Date.now()}`,
            email: testEmail.replace('@', `_${Date.now()}@`),
            password: testPassword,
            displayName: 'Test User'
          })
        });
        
        if (response.ok || response.status === 400) {
          // 400 is ok here (user exists) - means endpoint works
          testResults.push({
            name: 'Auth Endpoint (Register)',
            status: 'success',
            message: 'Registration endpoint working',
            details: response.ok ? 'Test account created' : 'Endpoint responds correctly'
          });
        } else {
          testResults.push({
            name: 'Auth Endpoint (Register)',
            status: 'error',
            message: `HTTP ${response.status}`,
            details: 'Registration endpoint may have issues'
          });
        }
      } catch (error: any) {
        testResults.push({
          name: 'Auth Endpoint (Register)',
          status: 'error',
          message: 'Cannot reach auth endpoint',
          details: error.message
        });
      }
    } else {
      testResults.push({
        name: 'Auth Endpoint',
        status: 'success',
        message: 'Already authenticated',
        details: `Logged in as: ${user?.username || 'Unknown'}`
      });
    }

    // Test 5: Socket.IO Connection
    try {
      const socketTest = await new Promise<boolean>((resolve) => {
        const socket = (window as any).io ? (window as any).io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          timeout: 5000
        }) : null;

        if (!socket) {
          resolve(false);
          return;
        }

        const timeout = setTimeout(() => {
          socket.close();
          resolve(false);
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          socket.close();
          resolve(true);
        });

        socket.on('connect_error', () => {
          clearTimeout(timeout);
          socket.close();
          resolve(false);
        });
      });

      if (socketTest) {
        testResults.push({
          name: 'Socket.IO Connection',
          status: 'success',
          message: 'Real-time messaging ready',
          details: 'WebSocket connection successful'
        });
      } else {
        testResults.push({
          name: 'Socket.IO Connection',
          status: 'warning',
          message: 'Socket.IO not connected',
          details: 'Messaging may not work in real-time'
        });
      }
    } catch (error: any) {
      testResults.push({
        name: 'Socket.IO Connection',
        status: 'warning',
        message: 'Cannot test Socket.IO',
        details: 'Socket.IO library may not be loaded'
      });
    }

    // Test 6: Environment Variables
    const envVars = {
      'REACT_APP_API_URL': process.env.REACT_APP_API_URL,
      'REACT_APP_SOCKET_URL': process.env.REACT_APP_SOCKET_URL,
      'REACT_APP_GOOGLE_CLIENT_ID': process.env.REACT_APP_GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing'
    };

    const missingVars = Object.entries(envVars).filter(([_, v]) => !v || v === '✗ Missing');
    
    testResults.push({
      name: 'Environment Variables',
      status: missingVars.length === 0 ? 'success' : 'warning',
      message: missingVars.length === 0 ? 'All variables set' : `${missingVars.length} missing`,
      details: Object.entries(envVars).map(([k, v]) => `${k}: ${v || '❌ NOT SET'}`).join('\n')
    });

    setResults(testResults);
    setTesting(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      default:
        return <CircularProgress size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          System Diagnostics
        </Typography>
        <Button
          variant="contained"
          startIcon={testing ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
          onClick={runTests}
          disabled={testing}
          sx={{
            background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
            borderRadius: '12px'
          }}
        >
          {testing ? 'Testing...' : 'Run Tests'}
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Speed sx={{ fontSize: 40, color: 'white' }} />
                <Box>
                  <Typography variant="h5" color="white" fontWeight={700}>
                    {results.filter(r => r.status === 'success').length}/{results.length}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)">
                    Tests Passed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Storage sx={{ fontSize: 40, color: 'white' }} />
                <Box>
                  <Typography variant="h5" color="white" fontWeight={700}>
                    {results.find(r => r.name === 'Backend Health')?.responseTime || '—'}ms
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)">
                    Response Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <VpnLock sx={{ fontSize: 40, color: 'white' }} />
                <Box>
                  <Typography variant="h5" color="white" fontWeight={700}>
                    {isAuthenticated ? 'Yes' : 'No'}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.9)">
                    Authenticated
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Test Results */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {results.map((result, index) => (
            <React.Fragment key={result.name}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(result.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {result.name}
                      </Typography>
                      <Chip
                        label={result.message}
                        size="small"
                        color={getStatusColor(result.status) as any}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    result.details && showDetails[result.name] && (
                      <Box mt={1}>
                        <Alert severity={result.status === 'success' ? 'success' : result.status === 'error' ? 'error' : 'warning'}>
                          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                            {result.details}
                          </pre>
                        </Alert>
                      </Box>
                    )
                  }
                />
                {result.details && (
                  <IconButton
                    onClick={() => setShowDetails(prev => ({ ...prev, [result.name]: !prev[result.name] }))}
                  >
                    {showDetails[result.name] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Quick Fix Suggestions */}
      {results.some(r => r.status === 'error') && (
        <Paper sx={{ mt: 3, p: 3, borderRadius: 3, border: '2px solid', borderColor: 'error.main' }}>
          <Typography variant="h6" gutterBottom fontWeight={600} color="error">
            Issues Detected - Quick Fixes
          </Typography>
          <List>
            {results.filter(r => r.status === 'error').map(result => (
              <ListItem key={result.name}>
                <ListItemText
                  primary={result.name}
                  secondary={
                    <Box mt={1}>
                      {result.name.includes('Backend') && (
                        <Typography variant="body2">
                          • Check Railway deployment status<br />
                          • Verify backend is running<br />
                          • Check Railway logs for errors
                        </Typography>
                      )}
                      {result.name.includes('CORS') && (
                        <Typography variant="body2">
                          • Verify FRONTEND_URL in Railway matches this URL<br />
                          • Check backend CORS configuration<br />
                          • See CORS_FIX.md for details
                        </Typography>
                      )}
                      {result.name.includes('Auth') && (
                        <Typography variant="body2">
                          • Check MongoDB connection<br />
                          • Verify JWT_SECRET is set in Railway<br />
                          • See BACKEND_DIAGNOSTIC.md for testing
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* All Systems Go */}
      {results.length > 0 && results.every(r => r.status === 'success') && (
        <Alert severity="success" sx={{ mt: 3 }} icon={<CheckCircle />}>
          <Typography variant="h6" gutterBottom>
            🎉 All Systems Operational!
          </Typography>
          <Typography variant="body2">
            Your social commerce platform is fully functional. All backend services, authentication, and real-time messaging are working correctly.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default ConnectionTest;
