import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Button,
  Card,
  CardContent,
  Avatar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  Accessibility,
  Shield,
  Lock,
  Public,
  People,
  Block,
  Report,
  DeleteForever,
  Download,
  Upload,
  Backup,
  History,
  Payment,
  ShoppingCart,
  Store,
  Star,
  Verified,
  ExpandMore,
  Edit,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Help,
  Info,
  Warning,
  CheckCircle,
  Error,
  Close,
  ArrowBack
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';

interface SettingsProps {
  onClose?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const { addNotification } = useSocial();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({
    // Account Settings
    username: user?.username || '',
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    
    // Privacy Settings
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
    showFollowers: true,
    showFollowing: true,
    allowTagging: true,
    allowDirectMessages: true,
    whoCanMessage: 'everyone' as 'everyone' | 'friends' | 'nobody',
    showOnlineStatus: true,
    showLastSeen: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    commentNotifications: true,
    likeNotifications: true,
    followNotifications: true,
    messageNotifications: true,
    marketingEmails: false,
    productUpdates: true,
    weeklyDigest: true,
    
    // Content Preferences
    contentLanguage: 'en',
    hideNSFW: true,
    showAIInsights: true,
    personalizedAds: true,
    trackingAllowed: false,
    
    // Accessibility
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    colorBlindSupport: false,
    screenReaderSupport: false,
    
    // Commerce Settings
    defaultCurrency: 'USD',
    savedPaymentMethods: true,
    orderNotifications: true,
    wishlistPublic: true,
    reviewsPublic: true,
    
    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
    blockUnknownDevices: false
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const tabs = [
    { label: 'Account', icon: <Person /> },
    { label: 'Privacy', icon: <Security /> },
    { label: 'Notifications', icon: <Notifications /> },
    { label: 'Content', icon: <Palette /> },
    { label: 'Accessibility', icon: <Accessibility /> },
    { label: 'Commerce', icon: <ShoppingCart /> },
    { label: 'Security', icon: <Shield /> },
    { label: 'Data', icon: <Backup /> }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        username: settings.username,
        displayName: settings.displayName,
        bio: settings.bio,
        location: settings.location,
        website: settings.website
      });
      
      addNotification({
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });
      
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    try {
      // Simulate password change
      addNotification({
        type: 'system',
        title: 'Password Changed',
        message: 'Your password has been successfully updated.'
      });
      
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      const userData = {
        profile: user,
        settings: settings,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.username}_data_export.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      setShowExportDialog(false);
      
      addNotification({
        type: 'system',
        title: 'Data Exported',
        message: 'Your data has been exported successfully.'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderAccountSettings = () => (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar src={user?.avatar} sx={{ width: 80, height: 80 }} />
            <Box flex={1}>
              {editingProfile ? (
                <Stack spacing={2}>
                  <TextField
                    label="Display Name"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Username"
                    value={settings.username}
                    onChange={(e) => handleSettingChange('username', e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{ startAdornment: '@' }}
                  />
                </Stack>
              ) : (
                <>
                  <Typography variant="h6">{user?.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    @{user?.username}
                  </Typography>
                  {user?.isVerified && (
                    <Chip icon={<Verified />} label="Verified" size="small" color="primary" />
                  )}
                </>
              )}
            </Box>
            <Stack spacing={1}>
              {editingProfile ? (
                <>
                  <Button startIcon={<Save />} onClick={handleSaveProfile} variant="contained" size="small">
                    Save
                  </Button>
                  <Button startIcon={<Cancel />} onClick={() => setEditingProfile(false)} size="small">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button startIcon={<Edit />} onClick={() => setEditingProfile(true)} variant="outlined" size="small">
                  Edit
                </Button>
              )}
            </Stack>
          </Box>
          
          {editingProfile && (
            <Stack spacing={2}>
              <TextField
                label="Bio"
                value={settings.bio}
                onChange={(e) => handleSettingChange('bio', e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Tell us about yourself..."
              />
              <TextField
                label="Location"
                value={settings.location}
                onChange={(e) => handleSettingChange('location', e.target.value)}
                fullWidth
                placeholder="Where are you based?"
              />
              <TextField
                label="Website"
                value={settings.website}
                onChange={(e) => handleSettingChange('website', e.target.value)}
                fullWidth
                placeholder="https://yourwebsite.com"
              />
            </Stack>
          )}
        </CardContent>
      </Card>

      <List>
        <ListItem>
          <ListItemIcon><Lock /></ListItemIcon>
          <ListItemText primary="Change Password" secondary="Update your password" />
          <Button onClick={() => setPasswordDialogOpen(true)}>Change</Button>
        </ListItem>
        <ListItem>
          <ListItemIcon><Language /></ListItemIcon>
          <ListItemText primary="Language" secondary="Choose your preferred language" />
          <FormControl size="small">
            <Select
              value={settings.contentLanguage}
              onChange={(e) => handleSettingChange('contentLanguage', e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
            </Select>
          </FormControl>
        </ListItem>
      </List>
    </Box>
  );

  const renderPrivacySettings = () => (
    <List>
      <ListItem>
        <ListItemIcon><Public /></ListItemIcon>
        <ListItemText 
          primary="Profile Visibility" 
          secondary="Who can see your profile"
        />
        <FormControl size="small">
          <Select
            value={settings.profileVisibility}
            onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="friends">Friends Only</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>
        </FormControl>
      </ListItem>
      
      <ListItem>
        <ListItemIcon><People /></ListItemIcon>
        <ListItemText primary="Show Followers" secondary="Display follower count" />
        <Switch
          checked={settings.showFollowers}
          onChange={(e) => handleSettingChange('showFollowers', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemIcon><People /></ListItemIcon>
        <ListItemText primary="Show Following" secondary="Display following count" />
        <Switch
          checked={settings.showFollowing}
          onChange={(e) => handleSettingChange('showFollowing', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Direct Messages" secondary="Who can send you messages" />
        <FormControl size="small">
          <Select
            value={settings.whoCanMessage}
            onChange={(e) => handleSettingChange('whoCanMessage', e.target.value)}
          >
            <MenuItem value="everyone">Everyone</MenuItem>
            <MenuItem value="friends">Friends Only</MenuItem>
            <MenuItem value="nobody">Nobody</MenuItem>
          </Select>
        </FormControl>
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Online Status" secondary="Show when you're online" />
        <Switch
          checked={settings.showOnlineStatus}
          onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Last Seen" secondary="Show when you were last active" />
        <Switch
          checked={settings.showLastSeen}
          onChange={(e) => handleSettingChange('showLastSeen', e.target.checked)}
        />
      </ListItem>
    </List>
  );

  const renderNotificationSettings = () => (
    <List>
      <ListItem>
        <ListItemIcon><Notifications /></ListItemIcon>
        <ListItemText primary="Push Notifications" secondary="Receive notifications on your device" />
        <Switch
          checked={settings.pushNotifications}
          onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Email Notifications" secondary="Receive notifications via email" />
        <Switch
          checked={settings.emailNotifications}
          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
        />
      </ListItem>
      
      <Divider />
      
      <ListItem>
        <ListItemText primary="Likes" secondary="When someone likes your posts" />
        <Switch
          checked={settings.likeNotifications}
          onChange={(e) => handleSettingChange('likeNotifications', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Comments" secondary="When someone comments on your posts" />
        <Switch
          checked={settings.commentNotifications}
          onChange={(e) => handleSettingChange('commentNotifications', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="New Followers" secondary="When someone follows you" />
        <Switch
          checked={settings.followNotifications}
          onChange={(e) => handleSettingChange('followNotifications', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Messages" secondary="When you receive a direct message" />
        <Switch
          checked={settings.messageNotifications}
          onChange={(e) => handleSettingChange('messageNotifications', e.target.checked)}
        />
      </ListItem>
      
      <Divider />
      
      <ListItem>
        <ListItemText primary="Marketing Emails" secondary="Promotional content and offers" />
        <Switch
          checked={settings.marketingEmails}
          onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Weekly Digest" secondary="Summary of your activity" />
        <Switch
          checked={settings.weeklyDigest}
          onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
        />
      </ListItem>
    </List>
  );

  const renderAccessibilitySettings = () => (
    <List>
      <ListItem>
        <ListItemIcon><Accessibility /></ListItemIcon>
        <ListItemText primary="Reduce Motion" secondary="Minimize animations and transitions" />
        <Switch
          checked={settings.reducedMotion}
          onChange={(e) => handleSettingChange('reducedMotion', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="High Contrast" secondary="Increase text and background contrast" />
        <Switch
          checked={settings.highContrast}
          onChange={(e) => handleSettingChange('highContrast', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Font Size" secondary="Adjust text size for better readability" />
        <FormControl size="small">
          <Select
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', e.target.value)}
          >
            <MenuItem value="small">Small</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="large">Large</MenuItem>
          </Select>
        </FormControl>
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Color Blind Support" secondary="Enhanced colors for color vision deficiency" />
        <Switch
          checked={settings.colorBlindSupport}
          onChange={(e) => handleSettingChange('colorBlindSupport', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Screen Reader Support" secondary="Optimize for screen readers" />
        <Switch
          checked={settings.screenReaderSupport}
          onChange={(e) => handleSettingChange('screenReaderSupport', e.target.checked)}
        />
      </ListItem>
    </List>
  );

  const renderDataSettings = () => (
    <List>
      <ListItem>
        <ListItemIcon><Download /></ListItemIcon>
        <ListItemText 
          primary="Export Data" 
          secondary="Download your account data"
        />
        <Button onClick={() => setShowExportDialog(true)}>Export</Button>
      </ListItem>
      
      <ListItem>
        <ListItemIcon><DeleteForever /></ListItemIcon>
        <ListItemText 
          primary="Delete Account" 
          secondary="Permanently delete your account"
        />
        <Button 
          color="error"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete
        </Button>
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Data Tracking" secondary="Allow data collection for analytics" />
        <Switch
          checked={settings.trackingAllowed}
          onChange={(e) => handleSettingChange('trackingAllowed', e.target.checked)}
        />
      </ListItem>
      
      <ListItem>
        <ListItemText primary="Personalized Ads" secondary="Show ads based on your interests" />
        <Switch
          checked={settings.personalizedAds}
          onChange={(e) => handleSettingChange('personalizedAds', e.target.checked)}
        />
      </ListItem>
    </List>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 0: return renderAccountSettings();
      case 1: return renderPrivacySettings();
      case 2: return renderNotificationSettings();
      case 3: return (
        <Alert severity="info" sx={{ m: 2 }}>
          Content preferences will be available in the next update.
        </Alert>
      );
      case 4: return renderAccessibilitySettings();
      case 5: return (
        <Alert severity="info" sx={{ m: 2 }}>
          Commerce settings will be available in the next update.
        </Alert>
      );
      case 6: return (
        <Alert severity="info" sx={{ m: 2 }}>
          Advanced security settings will be available in the next update.
        </Alert>
      );
      case 7: return renderDataSettings();
      default: return renderAccountSettings();
    }
  };

  return (
    <Box>
      <Paper sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Header */}
        <Box 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <SettingsIcon />
            <Typography variant="h5" fontWeight={600}>
              Settings
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        {/* Content */}
        <Box sx={{ minHeight: 400 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Paper>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)}>
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography>
            This will download all your account data including profile information, 
            posts, and settings in JSON format.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExportData} variant="contained">
            Export Data
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This will remove all your 
            posts, followers, and account data permanently.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;