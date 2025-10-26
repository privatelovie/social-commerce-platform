import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Badge,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Fab,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  ShoppingBag as ShoppingBagIcon,
  Close as CloseIcon,
  Archive as ArchiveIcon,
  VolumeOff as MuteIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Reply as ReplyIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  VideoCall as VideoCallIcon,
  Image as ImageIcon,
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NewChatDialog from '../components/NewChatDialog';
import messagingService, { 
  Conversation, 
  Message, 
  User as MessagingUser,
  SendMessageData,
  CreateConversationData 
} from '../services/messagingService';

interface MessagingPageProps {}

const MessagingPage: React.FC<MessagingPageProps> = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user: currentUser } = useAuth();
  const { state: cartState } = useCart();

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time state
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // UI state
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessageMenu, setSelectedMessageMenu] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    setupRealtimeListeners();

    return () => {
      cleanupRealtimeListeners();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup real-time listeners
  const setupRealtimeListeners = () => {
    messagingService.on('messageReceived', handleNewMessage);
    messagingService.on('messageUpdated', handleMessageUpdated);
    messagingService.on('messageDeleted', handleMessageDeleted);
    messagingService.on('conversationUpdated', handleConversationUpdated);
    messagingService.on('typingStart', handleTypingStart);
    messagingService.on('typingStop', handleTypingStop);
    messagingService.on('userPresence', handleUserPresence);
    messagingService.on('messageRead', handleMessageRead);
  };

  const cleanupRealtimeListeners = () => {
    messagingService.off('messageReceived', handleNewMessage);
    messagingService.off('messageUpdated', handleMessageUpdated);
    messagingService.off('messageDeleted', handleMessageDeleted);
    messagingService.off('conversationUpdated', handleConversationUpdated);
    messagingService.off('typingStart', handleTypingStart);
    messagingService.off('typingStop', handleTypingStop);
    messagingService.off('userPresence', handleUserPresence);
    messagingService.off('messageRead', handleMessageRead);
  };

  // Real-time event handlers
  const handleNewMessage = (message: Message) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => [...prev, message]);
      // Mark as read if conversation is active
      messagingService.markAsRead(message.conversationId, message.id);
    }
    
    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv.id === message.conversationId 
          ? { ...conv, lastMessage: message, unreadCount: conv.unreadCount + 1 }
          : conv
      )
    );
  };

  const handleMessageUpdated = (message: Message) => {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages(prev => 
        prev.map(msg => msg.id === message.id ? message : msg)
      );
    }
  };

  const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    }
  };

  const handleConversationUpdated = (conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => conv.id === conversation.id ? conversation : conv)
    );
    
    if (selectedConversation && selectedConversation.id === conversation.id) {
      setSelectedConversation(conversation);
    }
  };

  const handleTypingStart = (data: { userId: string; conversationId: string; username: string }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id && data.userId !== currentUser?.id) {
      setTypingUsers(prev => new Set(prev).add(data.userId));
    }
  };

  const handleTypingStop = (data: { userId: string; conversationId: string }) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(data.userId);
      return newSet;
    });
  };

  const handleUserPresence = (data: { userId: string; isOnline: boolean }) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (data.isOnline) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });
  };

  const handleMessageRead = (data: { messageId: string; userId: string; conversationId: string }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations();
      
      if (response.success && response.conversations) {
        setConversations(response.conversations);
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load conversation messages
  const loadConversation = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      setMessages([]);
      
      if (isMobile) {
        setShowMobileChat(true);
      }

      // Join conversation room for real-time updates
      messagingService.joinConversation(conversation.id);

      const response = await messagingService.getConversation(conversation.id);
      
      if (response.success && response.messages) {
        setMessages(response.messages.reverse()); // Reverse to show oldest first
        
        // Mark conversation as read
        await messagingService.markAsRead(conversation.id);
        
        // Update unread count in conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversation.id 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    const messageData: SendMessageData = {
      content: messageInput.trim(),
      type: 'text',
      replyToId: replyingTo?.id,
    };

    try {
      setSendingMessage(true);
      setMessageInput('');
      setReplyingTo(null);

      // Stop typing indicator
      messagingService.stopTyping(selectedConversation.id);

      const response = await messagingService.sendMessage(selectedConversation.id, messageData);
      
      if (response.success && response.message) {
        // Message will be added via real-time event
      } else {
        setError(response.error || 'Failed to send message');
        setMessageInput(messageData.content); // Restore message on error
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setMessageInput(messageData.content);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle typing
  const handleInputChange = (value: string) => {
    setMessageInput(value);

    if (selectedConversation && currentUser) {
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Start typing
      if (value.length > 0) {
        messagingService.startTyping(selectedConversation.id);
        
        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          messagingService.stopTyping(selectedConversation.id);
        }, 3000);
      } else {
        messagingService.stopTyping(selectedConversation.id);
      }
    }
  };

  // Share cart
  const shareCart = async () => {
    if (!selectedConversation || cartState.items.length === 0) return;

    try {
      const response = await messagingService.shareCart(
        selectedConversation.id,
        `Check out my cart! ${cartState.items.length} items for $${cartState.totalPrice.toFixed(2)}`
      );

      if (!response.success) {
        setError(response.error || 'Failed to share cart');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to share cart');
    }
  };

  // Utility functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.groupName || 'Group Chat';
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.displayName || 'Unknown User';
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return conversation.groupAvatar || '';
    }
    
    const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
    return otherParticipant?.avatar || '';
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'product':
        const product = message.metadata?.product;
        if (!product) return <Typography>{message.content}</Typography>;
        
        return (
          <Card sx={{ maxWidth: 300, mb: 1 }}>
            <CardMedia
              component="img"
              height="120"
              image={product.image}
              alt={product.name}
            />
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.brand}
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                ${product.price}
              </Typography>
            </CardContent>
          </Card>
        );

      case 'cart':
        const cart = message.metadata?.cart;
        if (!cart) return <Typography>{message.content}</Typography>;
        
        return (
          <Card sx={{ maxWidth: 300, mb: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingBagIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight="bold">
                  Shopping Cart
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {cart.items.length} items
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                Total: ${cart.total}
              </Typography>
            </CardContent>
          </Card>
        );

      case 'image':
        return (
          <Box sx={{ maxWidth: 250 }}>
            <img
              src={message.metadata?.imageUrl || ''}
              alt="Shared image"
              style={{ width: '100%', borderRadius: 8 }}
            />
            {message.content && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {message.content}
              </Typography>
            )}
          </Box>
        );

      default:
        return <Typography>{message.content}</Typography>;
    }
  };

  // Render conversations list
  const renderConversationsList = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">
          Messages
        </Typography>
        <TextField
          placeholder="Search conversations..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : conversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowNewChatDialog(true)}
              sx={{ mt: 2 }}
            >
              Start New Chat
            </Button>
          </Box>
        ) : (
          <List>
            {conversations
              .filter(conv => 
                searchQuery === '' || 
                getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((conversation) => {
                const isSelected = selectedConversation?.id === conversation.id;
                const otherParticipant = conversation.participants.find(p => p.id !== currentUser?.id);
                
                return (
                  <ListItem
                    key={conversation.id}
                    button
                    selected={isSelected}
                    onClick={() => loadConversation(conversation)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.lighter',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="success"
                        invisible={!otherParticipant || !isUserOnline(otherParticipant.id)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar
                          src={getConversationAvatar(conversation)}
                          alt={getConversationName(conversation)}
                        >
                          {conversation.type === 'group' ? <GroupIcon /> : <PersonIcon />}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="subtitle2"
                            fontWeight={conversation.unreadCount > 0 ? 'bold' : 'normal'}
                          >
                            {getConversationName(conversation)}
                          </Typography>
                          {conversation.lastMessage && (
                            <Typography variant="caption" color="text.secondary">
                              {formatMessageTime(conversation.lastMessage.createdAt)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal',
                            }}
                          >
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </Typography>
                          {conversation.unreadCount > 0 && (
                            <Chip
                              size="small"
                              label={conversation.unreadCount}
                              color="primary"
                              sx={{ minWidth: 20, height: 20, fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
          </List>
        )}
      </Box>

      {/* New Chat FAB */}
      <Fab
        color="primary"
        size="medium"
        onClick={() => setShowNewChatDialog(true)}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );

  // Render chat view
  const renderChatView = () => {
    if (!selectedConversation) {
      return (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Select a conversation to start chatting
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewChatDialog(true)}
          >
            Start New Chat
          </Button>
        </Box>
      );
    }

    const otherParticipant = selectedConversation.participants.find(p => p.id !== currentUser?.id);

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                onClick={() => setShowMobileChat(false)}
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Avatar
              src={getConversationAvatar(selectedConversation)}
              sx={{ mr: 2 }}
            >
              {selectedConversation.type === 'group' ? <GroupIcon /> : <PersonIcon />}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {getConversationName(selectedConversation)}
              </Typography>
              {otherParticipant && (
                <Typography variant="caption" color="text.secondary">
                  {isUserOnline(otherParticipant.id) ? 'Online' : 'Offline'}
                </Typography>
              )}
              {typingUsers.size > 0 && (
                <Typography variant="caption" color="primary">
                  Typing...
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box>
            <IconButton>
              <PhoneIcon />
            </IconButton>
            <IconButton>
              <VideoCallIcon />
            </IconButton>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.senderId === currentUser?.id;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                      mb: 1,
                      alignItems: 'flex-end',
                    }}
                  >
                    {!isOwnMessage && showAvatar && (
                      <Avatar
                        src={selectedConversation.participants.find(p => p.id === message.senderId)?.avatar}
                        sx={{ width: 32, height: 32, mr: 1 }}
                      />
                    )}
                    {!isOwnMessage && !showAvatar && <Box sx={{ width: 40 }} />}
                    
                    <Paper
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                        color: isOwnMessage ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        position: 'relative',
                      }}
                    >
                      {message.replyTo && (
                        <Box
                          sx={{
                            borderLeft: 3,
                            borderColor: 'divider',
                            pl: 1,
                            mb: 1,
                            opacity: 0.7,
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">
                            {message.replyTo.sender.displayName}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {message.replyTo.content}
                          </Typography>
                        </Box>
                      )}
                      
                      {renderMessageContent(message)}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {formatMessageTime(message.createdAt)}
                        </Typography>
                        {isOwnMessage && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {message.isEdited && (
                              <Typography variant="caption" sx={{ opacity: 0.5, mr: 0.5 }}>
                                edited
                              </Typography>
                            )}
                            {message.isRead ? (
                              <CheckCircleIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                            ) : (
                              <CheckIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                            )}
                          </Box>
                        )}
                      </Box>
                    </Paper>
                    
                    <IconButton
                      size="small"
                      onClick={(e) => setSelectedMessageMenu(message.id)}
                      sx={{ ml: 0.5, opacity: 0.5 }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </Box>

        {/* Reply indicator */}
        {replyingTo && (
          <Box
            sx={{
              p: 1,
              bgcolor: 'grey.100',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReplyIcon sx={{ mr: 1, fontSize: 16 }} />
              <Typography variant="caption">
                Replying to: {replyingTo.content}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setReplyingTo(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <IconButton size="small">
            <AttachFileIcon />
          </IconButton>
          <IconButton size="small">
            <ImageIcon />
          </IconButton>
          <TextField
            ref={messageInputRef}
            placeholder="Type a message..."
            fullWidth
            size="small"
            value={messageInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            multiline
            maxRows={4}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small">
                    <EmojiIcon />
                  </IconButton>
                  {cartState.items.length > 0 && (
                    <Tooltip title="Share Cart">
                      <IconButton size="small" onClick={shareCart}>
                        <ShoppingBagIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            color="primary"
            disabled={!messageInput.trim() || sendingMessage}
            onClick={sendMessage}
          >
            {sendingMessage ? (
              <CircularProgress size={24} />
            ) : (
              <SendIcon />
            )}
          </IconButton>
        </Box>
      </Box>
    );
  };

  // Main render
  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Paper sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
        {/* Desktop layout */}
        {!isMobile && (
          <>
            {/* Conversations sidebar */}
            <Box sx={{ width: 350, borderRight: '1px solid', borderColor: 'divider' }}>
              {renderConversationsList()}
            </Box>
            
            {/* Chat area */}
            <Box sx={{ flex: 1 }}>
              {renderChatView()}
            </Box>
          </>
        )}

        {/* Mobile layout */}
        {isMobile && (
          <>
            {/* Conversations list */}
            {!showMobileChat && renderConversationsList()}
            
            {/* Chat view drawer */}
            <Drawer
              anchor="right"
              open={showMobileChat}
              onClose={() => setShowMobileChat(false)}
              variant="temporary"
              PaperProps={{
                sx: { width: '100vw', height: '100vh' }
              }}
            >
              {renderChatView()}
            </Drawer>
          </>
        )}
      </Paper>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onConversationCreated={(conversationId) => {
          // Find the conversation and select it
          const conversation = conversations.find(c => c.id === conversationId);
          if (conversation) {
            loadConversation(conversation);
          }
          setShowNewChatDialog(false);
        }}
      />

      {/* Context menus */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {}}>
          <MuteIcon sx={{ mr: 1 }} />
          {selectedConversation?.isMuted ? 'Unmute' : 'Mute'}
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ArchiveIcon sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={() => {}} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default MessagingPage;