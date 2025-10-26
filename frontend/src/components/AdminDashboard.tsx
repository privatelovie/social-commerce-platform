import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Alert,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as ProductsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp,
  TrendingDown,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface AdminDashboardProps {
  onClose?: () => void;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingReviews: number;
  reportedContent: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  lastActive: string;
  totalOrders: number;
  totalSpent: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 12485,
    activeUsers: 3247,
    totalOrders: 8956,
    totalRevenue: 245680.50,
    totalProducts: 1245,
    pendingReviews: 67,
    reportedContent: 23,
    systemStatus: 'healthy'
  });

  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActionDialog, setUserActionDialog] = useState(false);

  useEffect(() => {
    // Mock data loading
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock users data
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        displayName: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe',
        isVerified: true,
        status: 'active',
        joinDate: '2023-06-15',
        lastActive: '2024-01-15',
        totalOrders: 12,
        totalSpent: 2450.00
      },
      {
        id: '2',
        username: 'jane_smith',
        email: 'jane@example.com',
        displayName: 'Jane Smith',
        avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
        isVerified: false,
        status: 'active',
        joinDate: '2023-08-20',
        lastActive: '2024-01-14',
        totalOrders: 5,
        totalSpent: 890.00
      },
      {
        id: '3',
        username: 'spam_user',
        email: 'spam@example.com',
        displayName: 'Spam User',
        avatar: 'https://ui-avatars.com/api/?name=Spam+User',
        isVerified: false,
        status: 'suspended',
        joinDate: '2024-01-10',
        lastActive: '2024-01-12',
        totalOrders: 0,
        totalSpent: 0
      }
    ];

    // Mock orders data
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-001',
        customer: 'John Doe',
        total: 299.99,
        status: 'delivered',
        date: '2024-01-14',
        items: 3
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-002',
        customer: 'Jane Smith',
        total: 149.99,
        status: 'shipped',
        date: '2024-01-15',
        items: 1
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-003',
        customer: 'Mike Johnson',
        total: 599.99,
        status: 'processing',
        date: '2024-01-15',
        items: 5
      }
    ];

    setUsers(mockUsers);
    setOrders(mockOrders);
  };

  const handleUserAction = (user: User, action: 'suspend' | 'ban' | 'activate') => {
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, status: action === 'activate' ? 'active' : action === 'suspend' ? 'suspended' : 'banned' }
        : u
    ));
    setUserActionDialog(false);
    setSelectedUser(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'delivered': case 'healthy': return 'success';
      case 'suspended': case 'shipped': case 'processing': case 'warning': return 'warning';
      case 'banned': case 'cancelled': case 'error': return 'error';
      default: return 'default';
    }
  };

  const tabs = [
    { label: 'Overview', icon: <DashboardIcon /> },
    { label: 'Users', icon: <PeopleIcon /> },
    { label: 'Orders', icon: <OrdersIcon /> },
    { label: 'Products', icon: <ProductsIcon /> },
    { label: 'Analytics', icon: <AnalyticsIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        🛡️ Admin Dashboard
      </Typography>

      <Tabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            icon={tab.icon}
            label={tab.label}
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
        ))}
      </Tabs>

      {/* Overview Tab */}
      {currentTab === 0 && (
        <Box>
          {/* System Status */}
          <Alert 
            severity={stats.systemStatus === 'healthy' ? 'success' : 'warning'}
            sx={{ mb: 3 }}
          >
            System Status: {stats.systemStatus === 'healthy' ? 'All systems operational' : 'Some services experiencing issues'}
          </Alert>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3} component="div">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalUsers.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Users
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +12% this month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} component="div">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalOrders.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Orders
                      </Typography>
                    </Box>
                    <OrdersIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +8% this month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} component="div">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        ${stats.totalRevenue.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Revenue
                      </Typography>
                    </Box>
                    <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                    <Typography variant="body2" color="error.main">
                      -2% this month
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3} component="div">
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.reportedContent}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reports Pending
                      </Typography>
                    </Box>
                    <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />
                  </Box>
                  <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                    <Typography variant="body2" color="error.main">
                      Requires attention
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Button variant="outlined" startIcon={<PeopleIcon />}>
                Manage Users
              </Button>
              <Button variant="outlined" startIcon={<OrdersIcon />}>
                View Recent Orders
              </Button>
              <Button variant="outlined" startIcon={<WarningIcon />}>
                Review Reports ({stats.reportedContent})
              </Button>
              <Button variant="outlined" startIcon={<ProductsIcon />}>
                Approve Products
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Users Tab */}
      {currentTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              User Management
            </Typography>
            <Button variant="contained" startIcon={<PeopleIcon />}>
              Export Users
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Join Date</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={user.avatar} />
                        <Box>
                          <Typography fontWeight="medium">
                            {user.displayName}
                            {user.isVerified && (
                              <CheckCircleIcon 
                                sx={{ fontSize: 16, color: 'primary.main', ml: 0.5 }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.status} 
                        color={getStatusColor(user.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell>{user.totalOrders}</TableCell>
                    <TableCell>${user.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserActionDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <BlockIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Orders Tab */}
      {currentTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Order Management
            </Typography>
            <Button variant="contained" startIcon={<OrdersIcon />}>
              Export Orders
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell fontWeight="medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Other tabs would be implemented similarly */}
      {currentTab > 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {tabs[currentTab].label} section coming soon...
          </Typography>
        </Paper>
      )}

      {/* User Action Dialog */}
      <Dialog open={userActionDialog} onClose={() => setUserActionDialog(false)}>
        <DialogTitle>Manage User: {selectedUser?.displayName}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Current Status: <Chip label={selectedUser?.status} size="small" />
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              What action would you like to take?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserActionDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => selectedUser && handleUserAction(selectedUser, 'activate')}
            color="success"
          >
            Activate
          </Button>
          <Button 
            onClick={() => selectedUser && handleUserAction(selectedUser, 'suspend')}
            color="warning"
          >
            Suspend
          </Button>
          <Button 
            onClick={() => selectedUser && handleUserAction(selectedUser, 'ban')}
            color="error"
          >
            Ban
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;