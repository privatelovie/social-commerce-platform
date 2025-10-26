import React, { useState, useEffect, useRef } from 'react';
import {
  Fab,
  Paper,
  Box,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Slide,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  ShoppingCart,
  Explore,
  Person,
  TrendingUp,
  Search,
  LocationOn,
  Star,
  AttachMoney,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: Suggestion[];
  quickActions?: QuickAction[];
}

interface Suggestion {
  id: string;
  text: string;
  action: () => void;
  icon?: React.ReactElement;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  action: () => void;
}

interface AIGuideProps {
  onNavigate: (path: string) => void;
  onSearch: (query: string) => void;
  onProductRecommend: (category: string) => void;
}

const AIGuide: React.FC<AIGuideProps> = ({ onNavigate, onSearch, onProductRecommend }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessage: Message = {
    id: '1',
    type: 'ai',
    content: "Hi! I'm your AI shopping assistant. I can help you navigate the platform, find products, or discover trending items. What would you like to do today?",
    timestamp: new Date(),
    quickActions: [
      {
        id: '1',
        title: 'Find Products',
        description: 'Search for specific items',
        icon: <Search />,
        action: () => handleQuickAction('search')
      },
      {
        id: '2',
        title: 'Trending Now',
        description: 'See what\'s popular',
        icon: <TrendingUp />,
        action: () => handleQuickAction('trending')
      },
      {
        id: '3',
        title: 'My Profile',
        description: 'View your account',
        icon: <Person />,
        action: () => handleQuickAction('profile')
      },
      {
        id: '4',
        title: 'Shopping Cart',
        description: 'Check your cart',
        icon: <ShoppingCart />,
        action: () => handleQuickAction('cart')
      }
    ]
  };

  useEffect(() => {
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickAction = (action: string) => {
    let response = '';
    let suggestions: Suggestion[] = [];

    switch (action) {
      case 'search':
        response = "What type of product are you looking for? I can help you find the best deals!";
        suggestions = [
          {
            id: '1',
            text: 'Fashion & Clothing',
            action: () => onProductRecommend('fashion'),
            icon: <Star />
          },
          {
            id: '2',
            text: 'Electronics & Tech',
            action: () => onProductRecommend('electronics'),
            icon: <Star />
          },
          {
            id: '3',
            text: 'Sports & Fitness',
            action: () => onProductRecommend('sports'),
            icon: <Star />
          }
        ];
        break;
      case 'trending':
        response = "Here are the hottest trends right now! Click to explore:";
        onNavigate('/trending');
        break;
      case 'profile':
        response = "Taking you to your profile where you can see your posts, analytics, and settings.";
        onNavigate('/profile');
        break;
      case 'cart':
        response = "Opening your shopping cart. You can review items, apply coupons, and checkout.";
        // Trigger cart opening
        break;
      default:
        response = "I'm here to help! What would you like to do?";
    }

    addMessage('user', `Help me with ${action}`);
    setTimeout(() => addAIMessage(response, suggestions), 1000);
  };

  const processUserInput = async (input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    setIsTyping(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    let suggestions: Suggestion[] = [];

    // Product search patterns
    if (lowercaseInput.includes('find') || lowercaseInput.includes('search') || lowercaseInput.includes('looking for')) {
      response = "I'll help you find what you're looking for! Here are some popular categories:";
      suggestions = [
        { id: '1', text: 'Fashion & Style', action: () => onProductRecommend('fashion') },
        { id: '2', text: 'Electronics', action: () => onProductRecommend('electronics') },
        { id: '3', text: 'Home & Garden', action: () => onProductRecommend('home') },
        { id: '4', text: 'Sports & Fitness', action: () => onProductRecommend('sports') }
      ];
    }
    // Navigation patterns
    else if (lowercaseInput.includes('profile') || lowercaseInput.includes('account')) {
      response = "Taking you to your profile! There you can view your posts, analytics, followers, and edit your information.";
      onNavigate('/profile');
    }
    else if (lowercaseInput.includes('cart') || lowercaseInput.includes('shopping')) {
      response = "Let me show you your shopping cart. You can review items, apply discounts, and proceed to checkout.";
      // Trigger cart modal
    }
    else if (lowercaseInput.includes('trending') || lowercaseInput.includes('popular')) {
      response = "Here's what's trending right now! I'm taking you to the trending section.";
      onNavigate('/trending');
    }
    else if (lowercaseInput.includes('explore') || lowercaseInput.includes('discover')) {
      response = "Let's explore! I'm taking you to the discovery page where you can find new products and creators.";
      onNavigate('/explore');
    }
    // Price and deals
    else if (lowercaseInput.includes('deal') || lowercaseInput.includes('discount') || lowercaseInput.includes('cheap')) {
      response = "Looking for great deals? Here are some ways to save money:";
      suggestions = [
        { id: '1', text: 'Flash Sales', action: () => onSearch('sale'), icon: <AttachMoney /> },
        { id: '2', text: 'Clearance Items', action: () => onSearch('clearance'), icon: <AttachMoney /> },
        { id: '3', text: 'Bundle Offers', action: () => onSearch('bundle'), icon: <AttachMoney /> }
      ];
    }
    // General help
    else {
      const keywords = extractKeywords(input);
      if (keywords.length > 0) {
        response = `I found these keywords in your message: ${keywords.join(', ')}. Let me search for related products!`;
        onSearch(keywords.join(' '));
      } else {
        response = "I'm here to help! Try asking me to find products, navigate to different sections, or show you trending items.";
        suggestions = [
          { id: '1', text: 'Show me trending products', action: () => handleQuickAction('trending') },
          { id: '2', text: 'Help me find something', action: () => handleQuickAction('search') },
          { id: '3', text: 'Go to my profile', action: () => handleQuickAction('profile') }
        ];
      }
    }

    setIsTyping(false);
    addAIMessage(response, suggestions);
  };

  const extractKeywords = (text: string): string[] => {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'over', 'after', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'find', 'show', 'get', 'help', 'want', 'need', 'looking', 'search'];
    
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 3);
  };

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAIMessage = (content: string, suggestions: Suggestion[] = []) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date(),
      suggestions
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addMessage('user', inputText);
    processUserInput(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* AI Guide FAB - Positioned above mobile nav on small screens */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: { xs: 80, md: 24 },
          right: { xs: 16, md: 24 },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
          width: { xs: 52, md: 56 },
          height: { xs: 52, md: 56 },
          '&:hover': {
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
          },
          transition: 'all 0.2s ease',
          zIndex: 999,
        }}
        onClick={() => setIsOpen(true)}
      >
        <AIIcon />
      </Fab>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            style={{
              position: 'fixed',
              bottom: window.innerWidth < 768 ? 140 : 100,
              right: window.innerWidth < 768 ? 16 : 24,
              zIndex: 1001,
              width: window.innerWidth < 768 ? 'calc(100vw - 32px)' : 360,
              maxWidth: 'calc(100vw - 32px)',
            }}
          >
            <Paper
              elevation={8}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 32, height: 32 }}>
                    <AIIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      AI Shopping Assistant
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {isTyping ? 'Typing...' : 'Online'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{ color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  height: 400,
                  overflowY: 'auto',
                  p: 1,
                  '&::-webkit-scrollbar': { width: 6 },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: 3,
                  },
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Card
                      sx={{
                        maxWidth: '80%',
                        bgcolor: message.type === 'user' 
                          ? 'primary.main' 
                          : 'background.paper',
                        color: message.type === 'user' ? 'white' : 'text.primary',
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        
                        {/* Quick Actions */}
                        {message.quickActions && (
                          <Box sx={{ mt: 2 }}>
                            <List dense>
                              {message.quickActions.map((action) => (
                                <ListItem key={action.id} disablePadding>
                                  <ListItemButton onClick={action.action} sx={{ borderRadius: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      {action.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={action.title}
                                      secondary={action.description}
                                    />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && (
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {message.suggestions.map((suggestion) => (
                              <Chip
                                key={suggestion.id}
                                label={suggestion.text}
                                onClick={suggestion.action}
                                icon={suggestion.icon}
                                size="small"
                                clickable
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                ))}
                
                {isTyping && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Card sx={{ bgcolor: 'background.paper' }}>
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          AI is typing...
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input */}
              <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Ask me anything..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIGuide;