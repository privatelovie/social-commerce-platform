import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera,
  Close as CloseIcon,
  Save as SaveIcon,
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  LocationOn,
  Work,
  School,
  Cake,
  Link as LinkIcon,
  Twitter,
  Instagram,
  Facebook,
  LinkedIn,
  YouTube,
  GitHub,
  Delete,
  Upload,
  Crop
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

interface ProfileEditorProps {
  onClose?: () => void;
  onSave?: (profileData: any) => void;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

interface UserProfile {
  displayName: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  dateOfBirth: string;
  occupation: string;
  education: string;
  avatar: string;
  coverPhoto: string;
  socialLinks: SocialLink[];
  interests: string[];
  isPrivate: boolean;
  showEmail: boolean;
  showLocation: boolean;
  allowMessages: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ onClose, onSave }) => {
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setToastOpen] = useState(false);
  const [imageUploadDialog, setImageUploadDialog] = useState<'avatar' | 'cover' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newInterest, setNewInterest] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    dateOfBirth: user?.dateOfBirth || '',
    occupation: user?.occupation || '',
    education: user?.education || '',
    avatar: user?.avatar || '',
    coverPhoto: user?.coverPhoto || '',
    socialLinks: user?.socialLinks || [],
    interests: user?.interests || [],
    isPrivate: user?.isPrivate || false,
    showEmail: user?.showEmail || false,
    showLocation: user?.showLocation || true,
    allowMessages: user?.allowMessages || true,
    emailNotifications: user?.emailNotifications || true,
    pushNotifications: user?.pushNotifications || true,
    theme: user?.theme || 'light',
    language: user?.language || 'en'
  });

  const handleInputChange = (field: keyof UserProfile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index: number, url: string) => {
    const updatedLinks = [...profile.socialLinks];
    updatedLinks[index] = { ...updatedLinks[index], url };
    setProfile(prev => ({ ...prev, socialLinks: updatedLinks }));
  };

  const addSocialLink = (platform: string, icon: React.ReactNode) => {
    const newLink: SocialLink = { platform, url: '', icon };
    setProfile(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }));
  };

  const removeSocialLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addInterest = (interest: string) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile(prev => ({ ...prev, interests: [...prev.interests, interest] }));
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleImageUpload = useCallback((type: 'avatar' | 'cover') => {
    setImageUploadDialog(type);
    fileInputRef.current?.click();
  }, []);

  const simulateImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          // In a real app, this would upload to a cloud service and return the URL
          const mockUrl = URL.createObjectURL(file);
          resolve(mockUrl);
        }
      }, 100);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !imageUploadDialog) return;

    try {
      setLoading(true);
      const imageUrl = await simulateImageUpload(file);
      
      if (imageUploadDialog === 'avatar') {
        setProfile(prev => ({ ...prev, avatar: imageUrl }));
      } else {
        setProfile(prev => ({ ...prev, coverPhoto: imageUrl }));
      }
      
      setImageUploadDialog(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (updateProfile) {
        await updateProfile(profile);
      }
      
      if (onSave) {
        onSave(profile);
      }
      
      setToastOpen(true);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfoTab = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Basic Information
      </Typography>
      
      {/* Profile Photos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Profile Photos
          </Typography>
          
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            {/* Avatar */}
            <Box sx={{ flex: '1 1 50%', textAlign: 'center' }}>
              <Box position="relative" display="inline-block" mb={2}>
                <Avatar
                  src={profile.avatar}
                  sx={{ width: 120, height: 120, mx: 'auto' }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: -5,
                    right: -5,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                  onClick={() => handleImageUpload('avatar')}
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Profile Picture
              </Typography>
            </Box>
            
            {/* Cover Photo */}
            <Box sx={{ flex: '1 1 50%', textAlign: 'center' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: profile.coverPhoto ? `url(${profile.coverPhoto})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  mb: 2
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    bgcolor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                  }}
                  onClick={() => handleImageUpload('cover')}
                >
                  <PhotoCamera />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Cover Photo
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Basic Details */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Display Name"
            value={profile.displayName}
            onChange={handleInputChange('displayName')}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Username"
            value={profile.username}
            onChange={handleInputChange('username')}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Typography color="text.secondary">@</Typography>
            }}
          />
        </Box>
        
        <Box sx={{ flex: '1 1 100%' }}>
          <TextField
            fullWidth
            label="Bio"
            value={profile.bio}
            onChange={handleInputChange('bio')}
            multiline
            rows={4}
            placeholder="Tell us about yourself..."
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Location"
            value={profile.location}
            onChange={handleInputChange('location')}
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Website"
            value={profile.website}
            onChange={handleInputChange('website')}
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Date of Birth"
            type="date"
            value={profile.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <Cake sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <TextField
            fullWidth
            label="Occupation"
            value={profile.occupation}
            onChange={handleInputChange('occupation')}
            InputProps={{
              startAdornment: <Work sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ mb: 2 }}
          />
        </Box>
      </Box>
    </Box>
  );

  const renderSocialLinksTab = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Social Links
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={3}>
        {/* Existing Social Links */}
        {profile.socialLinks.map((link, index) => (
          <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  {link.icon}
                  <Typography variant="h6" fontWeight={600}>
                    {link.platform}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeSocialLink(index)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  label={`${link.platform} URL`}
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                  placeholder={`https://${link.platform.toLowerCase()}.com/username`}
                />
              </CardContent>
            </Card>
          </Box>
        ))}
        
        {/* Add New Social Links */}
        <Box sx={{ flex: '1 1 100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add Social Platform</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {[
              { name: 'Twitter', icon: <Twitter /> },
              { name: 'Instagram', icon: <Instagram /> },
              { name: 'Facebook', icon: <Facebook /> },
              { name: 'LinkedIn', icon: <LinkedIn /> },
              { name: 'YouTube', icon: <YouTube /> },
              { name: 'GitHub', icon: <GitHub /> }
            ].filter(platform => !profile.socialLinks.some(link => link.platform === platform.name))
             .map((platform) => (
              <Button
                key={platform.name}
                variant="outlined"
                startIcon={platform.icon}
                onClick={() => addSocialLink(platform.name, platform.icon)}
                sx={{ mb: 1 }}
              >
                {platform.name}
              </Button>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );


  const renderInterestsTab = () => {
    const suggestedInterests = [
      'Technology', 'Fashion', 'Travel', 'Food', 'Fitness', 'Photography',
      'Gaming', 'Music', 'Art', 'Books', 'Movies', 'Sports', 'Nature',
      'Business', 'Education', 'Health', 'Science', 'Politics'
    ].filter(interest => !profile.interests.includes(interest));

    return (
      <Box>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
          Interests & Hobbies
        </Typography>
        
        {/* Current Interests */}
        <Box mb={3}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
            Your Interests
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {profile.interests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onDelete={() => removeInterest(interest)}
                color="primary"
                variant="filled"
              />
            ))}
            {profile.interests.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No interests added yet. Add some interests to help others discover you!
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Add New Interest */}
        <Box mb={3}>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
            Add Interest
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="Enter an interest..."
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addInterest(newInterest);
                  setNewInterest('');
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addInterest(newInterest);
                setNewInterest('');
              }}
              disabled={!newInterest.trim()}
            >
              Add
            </Button>
          </Box>
        </Box>
        
        {/* Suggested Interests */}
        <Box>
          <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
            Suggested Interests
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {suggestedInterests.map((interest) => (
              <Chip
                key={interest}
                label={interest}
                onClick={() => addInterest(interest)}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderPrivacyTab = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Privacy Settings
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <Security />
          </ListItemIcon>
          <ListItemText
            primary="Private Account"
            secondary="When your account is private, only people you approve can see your posts and profile information"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={profile.isPrivate}
              onChange={handleInputChange('isPrivate')}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText
            primary="Show Email"
            secondary="Allow others to see your email address on your profile"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={profile.showEmail}
              onChange={handleInputChange('showEmail')}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <LocationOn />
          </ListItemIcon>
          <ListItemText
            primary="Show Location"
            secondary="Display your location on your profile"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={profile.showLocation}
              onChange={handleInputChange('showLocation')}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
        
        <Divider />
        
        <ListItem>
          <ListItemIcon>
            <Notifications />
          </ListItemIcon>
          <ListItemText
            primary="Allow Direct Messages"
            secondary="Let people send you direct messages"
          />
          <ListItemSecondaryAction>
            <Switch
              checked={profile.allowMessages}
              onChange={handleInputChange('allowMessages')}
              color="primary"
            />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Box>
  );

  const renderPreferencesTab = () => (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
        Preferences
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <FormControl fullWidth>
            <InputLabel>Theme</InputLabel>
            <Select
              value={profile.theme}
              onChange={handleInputChange('theme')}
              startAdornment={<Palette sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 45%' } }}>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={profile.language}
              onChange={handleInputChange('language')}
              startAdornment={<Language sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
              <MenuItem value="it">Italiano</MenuItem>
              <MenuItem value="pt">Português</MenuItem>
              <MenuItem value="zh">中文</MenuItem>
              <MenuItem value="ja">日本語</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ flex: '1 1 100%' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Notifications
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={profile.emailNotifications}
                onChange={handleInputChange('emailNotifications')}
                color="primary"
              />
            }
            label="Email Notifications"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={profile.pushNotifications}
                onChange={handleInputChange('pushNotifications')}
                color="primary"
              />
            }
            label="Push Notifications"
            sx={{ display: 'block' }}
          />
        </Box>
      </Box>
    </Box>
  );

  const tabs = [
    { label: 'Basic Info', icon: <Person />, content: renderBasicInfoTab() },
    { label: 'Social Links', icon: <LinkIcon />, content: renderSocialLinksTab() },
    { label: 'Interests', icon: <Palette />, content: renderInterestsTab() },
    { label: 'Privacy', icon: <Security />, content: renderPrivacyTab() },
    { label: 'Preferences', icon: <Notifications />, content: renderPreferencesTab() }
  ];

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Edit Profile
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)'
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            
            {onClose && (
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none'
              }
            }}
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
        </Box>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Paper sx={{ p: 3 }}>
              {tabs[currentTab].content}
            </Paper>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Upload Progress Dialog */}
      <Dialog open={!!imageUploadDialog && loading}>
        <DialogContent>
          <Box textAlign="center" py={2}>
            <Typography variant="h6" mb={2}>
              Uploading {imageUploadDialog === 'avatar' ? 'Profile Picture' : 'Cover Photo'}
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {uploadProgress}% complete
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfileEditor;