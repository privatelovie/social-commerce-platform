import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  Grid2 as Grid,
  IconButton,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Download,
  TrendingUp,
  Favorite,
  Comment,
  Visibility,
  Share,
  ShoppingCart,
  CalendarToday,
  FilterList,
  Star,
  ThumbUp
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface LikedPost {
  id: string;
  content: string;
  image: string;
  author: {
    username: string;
    avatar: string;
  };
  likedAt: Date;
  likes: number;
  comments: number;
}

interface CommentData {
  id: string;
  postId: string;
  content: string;
  postImage: string;
  postAuthor: string;
  commentedAt: Date;
  likes: number;
}

interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const ProfileAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Mock data generation
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = () => {
    setLoading(true);

    // Mock liked posts
    const mockLikedPosts: LikedPost[] = [
      {
        id: '1',
        content: 'Amazing new fashion collection for summer! Check out these stunning pieces 👗✨ #fashion #summer',
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
        author: {
          username: 'fashion_guru',
          avatar: 'https://ui-avatars.com/api/?name=Fashion+Guru&background=E91E63&color=fff&size=100'
        },
        likedAt: new Date(Date.now() - 7200000),
        likes: 2340,
        comments: 156
      },
      {
        id: '2',
        content: 'My morning skincare routine that changed my skin ✨ All products linked! #skincare #beauty',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
        author: {
          username: 'beauty_expert',
          avatar: 'https://ui-avatars.com/api/?name=Beauty+Expert&background=9C27B0&color=fff&size=100'
        },
        likedAt: new Date(Date.now() - 86400000),
        likes: 1890,
        comments: 234
      },
      {
        id: '3',
        content: 'Tech review: Latest smartphone with incredible camera quality 📱 #tech #review',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
        author: {
          username: 'tech_reviewer',
          avatar: 'https://ui-avatars.com/api/?name=Tech+Review&background=2196F3&color=fff&size=100'
        },
        likedAt: new Date(Date.now() - 172800000),
        likes: 3450,
        comments: 567
      }
    ];

    // Mock comments
    const mockComments: CommentData[] = [
      {
        id: 'c1',
        postId: 'p1',
        content: 'Love this! Where can I get one? 😍',
        postImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        postAuthor: 'style_icon',
        commentedAt: new Date(Date.now() - 3600000),
        likes: 12
      },
      {
        id: 'c2',
        postId: 'p2',
        content: 'Great quality! I bought this last month and absolutely love it 💕',
        postImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        postAuthor: 'gadget_lover',
        commentedAt: new Date(Date.now() - 86400000),
        likes: 8
      },
      {
        id: 'c3',
        postId: 'p3',
        content: 'This is exactly what I\\'ve been looking for! Thanks for sharing',
        postImage: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
        postAuthor: 'fashion_finder',
        commentedAt: new Date(Date.now() - 172800000),
        likes: 5
      }
    ];

    // Mock engagement data
    const mockEngagementData: EngagementData[] = [
      { date: 'Mon', likes: 145, comments: 23, views: 2340, shares: 12 },
      { date: 'Tue', likes: 189, comments: 31, views: 2890, shares: 18 },
      { date: 'Wed', likes: 234, comments: 45, views: 3120, shares: 25 },
      { date: 'Thu', likes: 178, comments: 28, views: 2670, shares: 15 },
      { date: 'Fri', likes: 267, comments: 52, views: 3890, shares: 34 },
      { date: 'Sat', likes: 312, comments: 67, views: 4560, shares: 42 },
      { date: 'Sun', likes: 289, comments: 58, views: 4120, shares: 38 }
    ];

    // Mock category data
    const mockCategoryData: CategoryData[] = [
      { name: 'Fashion', value: 45 },
      { name: 'Electronics', value: 25 },
      { name: 'Beauty', value: 15 },
      { name: 'Home', value: 10 },
      { name: 'Other', value: 5 }
    ];

    setLikedPosts(mockLikedPosts);
    setComments(mockComments);
    setEngagementData(mockEngagementData);
    setCategoryData(mockCategoryData);
    setLoading(false);
  };

  const handleExportToExcel = (type: 'all' | 'liked' | 'comments' | 'engagement') => {
    const workbook = XLSX.utils.book_new();

    if (type === 'all' || type === 'liked') {
      // Liked Posts Sheet
      const likedPostsData = likedPosts.map(post => ({
        'Post ID': post.id,
        'Content': post.content,
        'Author': post.author.username,
        'Liked At': new Date(post.likedAt).toLocaleString(),
        'Total Likes': post.likes,
        'Total Comments': post.comments
      }));
      const likedSheet = XLSX.utils.json_to_sheet(likedPostsData);
      XLSX.utils.book_append_sheet(workbook, likedSheet, 'Liked Posts');
    }

    if (type === 'all' || type === 'comments') {
      // Comments Sheet
      const commentsData = comments.map(comment => ({
        'Comment ID': comment.id,
        'Post ID': comment.postId,
        'Comment': comment.content,
        'Post Author': comment.postAuthor,
        'Commented At': new Date(comment.commentedAt).toLocaleString(),
        'Likes': comment.likes
      }));
      const commentsSheet = XLSX.utils.json_to_sheet(commentsData);
      XLSX.utils.book_append_sheet(workbook, commentsSheet, 'My Comments');
    }

    if (type === 'all' || type === 'engagement') {
      // Engagement Sheet
      const engagementSheet = XLSX.utils.json_to_sheet(engagementData);
      XLSX.utils.book_append_sheet(workbook, engagementSheet, 'Engagement Stats');
    }

    // Profile Summary Sheet (always included)
    const profileSummary = [{
      'Username': user?.username || 'N/A',
      'Display Name': user?.displayName || 'N/A',
      'Email': user?.email || 'N/A',
      'Followers': user?.followerCount || 0,
      'Following': user?.followingCount || 0,
      'Posts': user?.postCount || 0,
      'Join Date': user?.joinDate || 'N/A',
      'Total Liked Posts': likedPosts.length,
      'Total Comments': comments.length,
      'Export Date': new Date().toLocaleString()
    }];
    const summarySheet = XLSX.utils.json_to_sheet(profileSummary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Profile Summary');

    // Generate filename
    const filename = `${user?.username || 'profile'}_analytics_${Date.now()}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);
    setExportDialogOpen(false);
  };

  const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Export Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Profile Analytics
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            select
            size="small"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </TextField>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => setExportDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
              borderRadius: '12px'
            }}
          >
            Export Data
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Favorite sx={{ fontSize: 40, color: 'white' }} />
                  <Box>
                    <Typography variant="h4" color="white" fontWeight={700}>
                      {likedPosts.length}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.9)">
                      Liked Posts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Comment sx={{ fontSize: 40, color: 'white' }} />
                  <Box>
                    <Typography variant="h4" color="white" fontWeight={700}>
                      {comments.length}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.9)">
                      Comments Made
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Visibility sx={{ fontSize: 40, color: 'white' }} />
                  <Box>
                    <Typography variant="h4" color="white" fontWeight={700}>
                      {engagementData.reduce((acc, d) => acc + d.views, 0)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.9)">
                      Total Views
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <TrendingUp sx={{ fontSize: 40, color: 'white' }} />
                  <Box>
                    <Typography variant="h4" color="white" fontWeight={700}>
                      {engagementData.reduce((acc, d) => acc + d.likes, 0)}
                    </Typography>
                    <Typography variant="body2" color="rgba(255,255,255,0.9)">
                      Total Likes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Engagement Overview" />
          <Tab label={`Liked Posts (${likedPosts.length})`} />
          <Tab label={`My Comments (${comments.length})`} />
          <Tab label="Category Breakdown" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Engagement Overview */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Engagement Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="likes" stroke="#1976d2" strokeWidth={2} />
                      <Line type="monotone" dataKey="comments" stroke="#2e7d32" strokeWidth={2} />
                      <Line type="monotone" dataKey="shares" stroke="#ed6c02" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Activity Summary
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={engagementData.slice(-3)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Bar dataKey="likes" fill="#1976d2" />
                      <Bar dataKey="comments" fill="#2e7d32" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Liked Posts */}
          {activeTab === 1 && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Posts You've Liked
              </Typography>
              <Grid container spacing={2}>
                {likedPosts.map((post) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Card sx={{ borderRadius: 2 }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={post.image}
                          alt={post.content}
                        />
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Avatar src={post.author.avatar} sx={{ width: 24, height: 24 }} />
                            <Typography variant="caption" fontWeight={600}>
                              {post.author.username}
                            </Typography>
                          </Box>
                          <Typography variant="body2" noWrap>
                            {post.content}
                          </Typography>
                          <Box display="flex" gap={2} mt={1}>
                            <Chip
                              icon={<Favorite sx={{ fontSize: 14 }} />}
                              label={post.likes}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              icon={<Comment sx={{ fontSize: 14 }} />}
                              label={post.comments}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            Liked {new Date(post.likedAt).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* My Comments */}
          {activeTab === 2 && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Your Comment History
              </Typography>
              <List>
                {comments.map((comment) => (
                  <React.Fragment key={comment.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar src={comment.postImage} variant="rounded" sx={{ width: 60, height: 60 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body1" gutterBottom>
                              {comment.content}
                            </Typography>
                            <Chip
                              icon={<ThumbUp sx={{ fontSize: 14 }} />}
                              label={`${comment.likes} likes`}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 1 }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              On post by <strong>@{comment.postAuthor}</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {new Date(comment.commentedAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* Category Breakdown */}
          {activeTab === 3 && (
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Interest Category Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          )}
        </>
      )}

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Analytics Data</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Choose what data to export to Excel:
          </Typography>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExportToExcel('all')}
              fullWidth
            >
              Export All Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<Favorite />}
              onClick={() => handleExportToExcel('liked')}
              fullWidth
            >
              Export Liked Posts Only
            </Button>
            <Button
              variant="outlined"
              startIcon={<Comment />}
              onClick={() => handleExportToExcel('comments')}
              fullWidth
            >
              Export Comments Only
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => handleExportToExcel('engagement')}
              fullWidth
            >
              Export Engagement Stats Only
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileAnalytics;
