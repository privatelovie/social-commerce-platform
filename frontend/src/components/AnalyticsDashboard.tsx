import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  Favorite,
  ShoppingCart,
  Visibility,
  AttachMoney,
  Share,
  Star,
  Info,
  GetApp,
  Refresh
} from '@mui/icons-material';
import { motion } from 'framer-motion';
// Chart.js imports removed for simplicity

interface AnalyticsMetric {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactElement;
  color: string;
  format: 'number' | 'currency' | 'percentage';
}

interface RevenueData {
  date: string;
  sales: number;
  orders: number;
  visitors: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface AudienceInsight {
  demographic: string;
  percentage: number;
  growth: number;
  color: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<AudienceInsight[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock metrics data
    const mockMetrics: AnalyticsMetric[] = [
      {
        id: '1',
        title: 'Total Revenue',
        value: 25680.50,
        change: 12.5,
        changeType: 'increase',
        icon: <AttachMoney />,
        color: '#4caf50',
        format: 'currency'
      },
      {
        id: '2',
        title: 'Orders',
        value: 156,
        change: 8.3,
        changeType: 'increase',
        icon: <ShoppingCart />,
        color: '#2196f3',
        format: 'number'
      },
      {
        id: '3',
        title: 'Followers',
        value: 12500,
        change: 15.7,
        changeType: 'increase',
        icon: <People />,
        color: '#ff9800',
        format: 'number'
      },
      {
        id: '4',
        title: 'Engagement Rate',
        value: 6.8,
        change: -2.1,
        changeType: 'decrease',
        icon: <Favorite />,
        color: '#e91e63',
        format: 'percentage'
      },
      {
        id: '5',
        title: 'Profile Views',
        value: 8420,
        change: 23.4,
        changeType: 'increase',
        icon: <Visibility />,
        color: '#9c27b0',
        format: 'number'
      },
      {
        id: '6',
        title: 'Conversion Rate',
        value: 3.2,
        change: 0.8,
        changeType: 'increase',
        icon: <TrendingUp />,
        color: '#00bcd4',
        format: 'percentage'
      }
    ];

    // Mock revenue data
    const mockRevenueData: RevenueData[] = [
      { date: '2024-01-01', sales: 1250, orders: 15, visitors: 320 },
      { date: '2024-01-02', sales: 1680, orders: 22, visitors: 450 },
      { date: '2024-01-03', sales: 2100, orders: 28, visitors: 520 },
      { date: '2024-01-04', sales: 1890, orders: 24, visitors: 480 },
      { date: '2024-01-05', sales: 2350, orders: 31, visitors: 610 },
      { date: '2024-01-06', sales: 2800, orders: 36, visitors: 720 },
      { date: '2024-01-07', sales: 3200, orders: 42, visitors: 850 }
    ];

    // Mock product performance
    const mockTopProducts: ProductPerformance[] = [
      {
        id: '1',
        name: 'Nike Air Max 270',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
        sales: 45,
        revenue: 5850,
        views: 1250,
        conversionRate: 3.6
      },
      {
        id: '2',
        name: 'iPhone 15 Pro',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&h=100&fit=crop',
        sales: 28,
        revenue: 27720,
        views: 2100,
        conversionRate: 1.3
      },
      {
        id: '3',
        name: 'Sony WH-1000XM5',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        sales: 38,
        revenue: 11780,
        views: 980,
        conversionRate: 3.9
      }
    ];

    // Mock audience insights
    const mockAudienceInsights: AudienceInsight[] = [
      { demographic: '18-24', percentage: 28, growth: 5.2, color: '#4caf50' },
      { demographic: '25-34', percentage: 42, growth: 8.7, color: '#2196f3' },
      { demographic: '35-44', percentage: 18, growth: -1.3, color: '#ff9800' },
      { demographic: '45+', percentage: 12, growth: 2.1, color: '#9c27b0' }
    ];

    setMetrics(mockMetrics);
    setRevenueData(mockRevenueData);
    setTopProducts(mockTopProducts);
    setAudienceInsights(mockAudienceInsights);
    setLoading(false);
  };

  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  // Chart configurations
  const revenueChartData = {
    labels: revenueData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Sales',
        data: revenueData.map(d => d.sales),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Orders',
        data: revenueData.map(d => d.orders * 100),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const audienceChartData = {
    labels: audienceInsights.map(a => a.demographic),
    datasets: [
      {
        data: audienceInsights.map(a => a.percentage),
        backgroundColor: audienceInsights.map(a => a.color),
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const exportData = () => {
    // Mock export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="24h">Last 24 hours</MenuItem>
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 3 months</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadAnalyticsData} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={exportData}
          >
            Export
          </Button>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Key Metrics Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3, mb: 4 }}>
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Avatar sx={{ bgcolor: metric.color, width: 48, height: 48 }}>
                    {metric.icon}
                  </Avatar>
                  <Chip
                    icon={metric.changeType === 'increase' ? <TrendingUp /> : <TrendingDown />}
                    label={`${Math.abs(metric.change)}%`}
                    color={metric.changeType === 'increase' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="h4" fontWeight="bold" color={metric.color}>
                  {formatValue(metric.value, metric.format)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.title}
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Revenue Chart */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Revenue & Orders Trend
              </Typography>
              <Tooltip title="Sales revenue and order volume over time">
                <IconButton size="small">
                  <Info />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                📈 Revenue Chart Placeholder
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Audience Insights */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Audience Demographics
            </Typography>
            <Box sx={{ 
              height: 200, 
              mb: 2,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                🍩 Audience Chart Placeholder
              </Typography>
            </Box>
            <List dense>
              {audienceInsights.map((insight) => (
                <ListItem key={insight.demographic} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        backgroundColor: insight.color,
                        borderRadius: 1
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${insight.demographic} (${insight.percentage}%)`}
                    secondary={
                      <Chip
                        size="small"
                        label={`${insight.growth > 0 ? '+' : ''}${insight.growth}%`}
                        color={insight.growth > 0 ? 'success' : 'error'}
                        variant="outlined"
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>

      {/* Top Performing Products */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Top Performing Products
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
            {topProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      src={product.image}
                      sx={{ width: 60, height: 60 }}
                      variant="rounded"
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.sales} sales • {formatValue(product.revenue, 'currency')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Views: {product.views.toLocaleString()}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(product.conversionRate / 5) * 100}
                        sx={{ mt: 1, height: 4, borderRadius: 2 }}
                      />
                    </Box>
                    <Chip
                      label={`${product.conversionRate}% CR`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard;