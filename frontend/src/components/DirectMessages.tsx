import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Fab,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Block,
  Report,
  Delete,
  Reply,
  Forward,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  ThumbUp,
  ThumbDown,
  Close,
  Search,
  Add,
  Check,
  CheckCircle,
  Error,
  AccessTime
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: Date;
  isVerified: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'cart' | 'product';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  reactions: { [userId: string]: string };
  replyTo?: string;
  metadata?: any;
}

interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  isApproved: boolean;
  isPending: boolean;
  isBlocked: boolean;
}

interface DirectMessagesProps {
  currentUser: User;
  onShareCart?: (chatId: string) => void;
  onProductShare?: (productId: string, chatId: string) => void;
}

const DirectMessages: React.FC<DirectMessagesProps> = ({ 
  currentUser, 
  onShareCart, 
  onProductShare 
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareType, setShareType] = useState<'cart' | 'product'>('cart');
  const [shareData, setShareData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data initialization
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '2',
        username: 'sarah_style',
        displayName: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        isOnline: true,
        isVerified: true
      },
      {
        id: '3',
        username: 'tech_mike',
        displayName: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000),
        isVerified: false
      },
      {
        id: '4',
        username: 'fashion_nova',
        displayName: 'Nova Fashion',
        avatar: 'https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
        lastSeen: new Date(Date.now() - 7200000),
        isVerified: true
      }
    ];

    const mockChats: Chat[] = [
      {
        id: '1',
        participants: [currentUser, mockUsers[0]],
        messages: [
          {
            id: '1',
            senderId: '2',
            content: 'Hey! I love your recent fashion post 😍',
            type: 'text',
            timestamp: new Date(Date.now() - 3600000),
            status: 'read',
            reactions: {}
          },
          {
            id: '2',
            senderId: currentUser.id,
            content: 'Thank you so much! Which piece caught your eye?',
            type: 'text',
            timestamp: new Date(Date.now() - 3500000),
            status: 'read',
            reactions: { '2': '❤️' }
          },
          {
            id: '3',
            senderId: '2',
            content: 'That Nike jacket looks amazing! Is it still available?',
            type: 'text',
            timestamp: new Date(Date.now() - 1800000),
            status: 'delivered',
            reactions: {}
          }
        ],
        unreadCount: 0,
        isApproved: true,
        isPending: false,
        isBlocked: false
      },
      {
        id: '2',
        participants: [currentUser, mockUsers[1]],
        messages: [
          {
            id: '4',
            senderId: '3',
            content: 'Hi! I saw your tech review video. Could you recommend something for my setup?',
            type: 'text',
            timestamp: new Date(Date.now() - 7200000),
            status: 'sent',
            reactions: {}
          }
        ],
        unreadCount: 1,
        isApproved: false,
        isPending: true,
        isBlocked: false
      }
    ];

    setChats(mockChats);
    // Auto-select first approved chat
    const firstApproved = mockChats.find(c => c.isApproved);
    if (firstApproved) setSelectedChat(firstApproved);
  }, [currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      status: 'sent',
      reactions: {},
      replyTo: replyingTo?.id
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, messages: [...chat.messages, message] }
        : chat
    ));

    setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, message] } : null);
    setNewMessage('');
    setReplyingTo(null);
  };

  const handleApproveChat = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, isApproved: true, isPending: false }
        : chat
    ));
  };

  const handleBlockUser = (chatId: string) => {
    setChats(prev => prev.map(chat =>
      chat.id === chatId
        ? { ...chat, isBlocked: true, isPending: false }
        : chat
    ));
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    if (!selectedChat) return;

    const updatedMessages = selectedChat.messages.map(msg =>
      msg.id === messageId
        ? {
            ...msg,
            reactions: {
              ...msg.reactions,
              [currentUser.id]: msg.reactions[currentUser.id] === emoji ? '' : emoji
            }
          }
        : msg
    );

    setSelectedChat({ ...selectedChat, messages: updatedMessages });
    setChats(prev => prev.map(chat =>
      chat.id === selectedChat.id
        ? { ...chat, messages: updatedMessages }
        : chat
    ));
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
    setMessageMenuAnchor(null);
  };

  const handleForwardMessage = (message: Message) => {
    // Implementation for forwarding
    console.log('Forward message:', message);
    setMessageMenuAnchor(null);
  };

  const openShareDialog = (type: 'cart' | 'product', data?: any) => {
    setShareType(type);
    setShareData(data);
    setShareDialogOpen(true);
  };

  const handleShareCart = () => {
    if (!selectedChat) return;
    
    const cartMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: 'Shared my shopping cart with you! 🛒',
      type: 'cart',
      timestamp: new Date(),
      status: 'sent',
      reactions: {},
      metadata: shareData
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, messages: [...chat.messages, cartMessage] }
        : chat
    ));

    setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, cartMessage] } : null);

    if (onShareCart) {
      onShareCart(selectedChat.id);
    }
    
    setShareDialogOpen(false);
  };

  const handleShareProduct = () => {
    if (!selectedChat || !shareData) return;
    
    const productMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: `Check out this product! 🔥`,
      type: 'product',
      timestamp: new Date(),
      status: 'sent',
      reactions: {},
      metadata: shareData
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, messages: [...chat.messages, productMessage] }
        : chat
    ));

    setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, productMessage] } : null);

    if (onProductShare) {
      onProductShare(shareData.id, selectedChat.id);
    }
    
    setShareDialogOpen(false);
  };

  const getOtherUser = (chat: Chat): User => {
    return chat.participants.find(p => p.id !== currentUser.id) || chat.participants[0];
  };

  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
  };

  const formatLastSeen = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) return 'last seen recently';
    if (diffHours < 24) return `last seen ${Math.floor(diffHours)} hours ago`;
    return `last seen ${format(date, 'MMM d')}`;
  };

  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    return otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const approvedChats = filteredChats.filter(c => c.isApproved && !c.isBlocked);
  const pendingChats = filteredChats.filter(c => c.isPending && !c.isBlocked);

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Chat List */}
      <Paper
        elevation={0}
        sx={{
          width: 360,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Messages
          </Typography>
          <TextField
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Pending Requests Alert */}
        {pendingChats.length > 0 && (
          <Box sx={{ p: 2, bgcolor: 'warning.light', borderBottom: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="text"
              onClick={() => setShowPendingRequests(!showPendingRequests)}
              sx={{ justifyContent: 'space-between' }}
            >
              <Typography variant="body2">
                {pendingChats.length} message request{pendingChats.length > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" color="primary">
                {showPendingRequests ? 'Hide' : 'View'}
              </Typography>
            </Button>
          </Box>
        )}

        {/* Chat List */}
        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {/* Pending Requests */}
          {showPendingRequests && pendingChats.map(chat => {
            const otherUser = getOtherUser(chat);
            return (
              <ListItem
                key={chat.id}
                sx={{
                  cursor: 'pointer',
                  bgcolor: 'warning.light',
                  '&:hover': { bgcolor: 'warning.main' }
                }}
                onClick={() => setSelectedChat(chat)}
              >
                <ListItemAvatar>
                  <Badge
                    variant="dot"
                    color={otherUser.isOnline ? 'success' : 'default'}
                    invisible={!otherUser.isOnline}
                  >
                    <Avatar src={otherUser.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {otherUser.displayName}
                      </Typography>
                      {otherUser.isVerified && (
                        <Chip size="small" label="✓" sx={{ height: 16, fontSize: '10px' }} />
                      )}
                    </Box>
                  }
                  secondary="Message request"
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleApproveChat(chat.id)}>
                      <Check fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleBlockUser(chat.id)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}

          {/* Approved Chats */}
          {approvedChats.map(chat => {
            const otherUser = getOtherUser(chat);
            const lastMessage = chat.messages[chat.messages.length - 1];
            
            return (
              <ListItem
                key={chat.id}
                sx={{
                  cursor: 'pointer',
                  bgcolor: selectedChat?.id === chat.id ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
                onClick={() => setSelectedChat(chat)}
              >
                <ListItemAvatar>
                  <Badge
                    variant="dot"
                    color={otherUser.isOnline ? 'success' : 'default'}
                    invisible={!otherUser.isOnline}
                  >
                    <Avatar src={otherUser.avatar} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {otherUser.displayName}
                        </Typography>
                        {otherUser.isVerified && (
                          <Chip size="small" label="✓" sx={{ height: 16, fontSize: '10px' }} />
                        )}
                      </Box>
                      {lastMessage && (
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(lastMessage.timestamp)}
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
                          maxWidth: 200
                        }}
                      >
                        {lastMessage?.content || 'No messages yet'}
                      </Typography>
                      {chat.unreadCount > 0 && (
                        <Badge badgeContent={chat.unreadCount} color="primary" />
                      )}
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {/* Chat Area */}
      {selectedChat ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Chat Header */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge
                variant="dot"
                color={getOtherUser(selectedChat).isOnline ? 'success' : 'default'}
                invisible={!getOtherUser(selectedChat).isOnline}
              >
                <Avatar src={getOtherUser(selectedChat).avatar} />
              </Badge>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getOtherUser(selectedChat).displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getOtherUser(selectedChat).isOnline 
                    ? 'Active now' 
                    : getOtherUser(selectedChat).lastSeen 
                      ? formatLastSeen(getOtherUser(selectedChat).lastSeen!)
                      : 'Offline'
                  }
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Share Cart">
                <IconButton onClick={() => openShareDialog('cart')}>
                  <ShoppingCart />
                </IconButton>
              </Tooltip>
              <IconButton>
                <MoreVert />
              </IconButton>
            </Box>
          </Paper>

          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {selectedChat.messages.map((message) => {
              const isOwn = message.senderId === currentUser.id;
              const sender = selectedChat.participants.find(p => p.id === message.senderId);
              const repliedMessage = message.replyTo 
                ? selectedChat.messages.find(m => m.id === message.replyTo)
                : null;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      mb: 2,
                      alignItems: 'flex-end',
                      gap: 1
                    }}
                  >
                    {!isOwn && (
                      <Avatar src={sender?.avatar} sx={{ width: 32, height: 32 }} />
                    )}
                    
                    <Box sx={{ maxWidth: '70%' }}>
                      {repliedMessage && (
                        <Paper
                          sx={{
                            p: 1,
                            mb: 0.5,
                            bgcolor: 'action.hover',
                            borderRadius: '16px 16px 4px 16px'
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Replying to: {repliedMessage.content}
                          </Typography>
                        </Paper>
                      )}
                      
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor: isOwn ? 'primary.main' : 'background.paper',
                          color: isOwn ? 'primary.contrastText' : 'text.primary',
                          borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          setSelectedMessage(message);
                          setMessageMenuAnchor(e.currentTarget);
                        }}
                      >
                        <Typography variant="body2">
                          {message.content}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.7 }}
                          >
                            {formatTime(message.timestamp)}
                          </Typography>
                          
                          {isOwn && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {message.status === 'sent' && <AccessTime fontSize="small" sx={{ fontSize: 12, opacity: 0.7 }} />}
                              {message.status === 'delivered' && <Check fontSize="small" sx={{ fontSize: 12, opacity: 0.7 }} />}
                              {message.status === 'read' && <CheckCircle fontSize="small" sx={{ fontSize: 12, opacity: 0.7 }} />}
                            </Box>
                          )}
                        </Box>
                        
                        {/* Reactions */}
                        {Object.entries(message.reactions).length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                            {Object.entries(message.reactions).map(([userId, emoji]) => (
                              emoji && (
                                <Chip
                                  key={userId}
                                  label={emoji}
                                  size="small"
                                  sx={{ height: 20, fontSize: '12px' }}
                                />
                              )
                            ))}
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Reply Banner */}
          {replyingTo && (
            <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Replying to:
                  </Typography>
                  <Typography variant="body2">
                    {replyingTo.content}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setReplyingTo(null)}>
                  <Close />
                </IconButton>
              </Box>
            </Paper>
          )}

          {/* Message Input */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1
            }}
          >
            <IconButton size="small">
              <AttachFile />
            </IconButton>
            <TextField
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              multiline
              maxRows={4}
              fullWidth
              variant="outlined"
              size="small"
            />
            <IconButton size="small">
              <EmojiEmotions />
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send />
            </IconButton>
          </Paper>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Select a conversation
          </Typography>
          <Typography variant="body2">
            Choose from your existing conversations or start a new one
          </Typography>
        </Box>
      )}

      {/* Message Context Menu */}
      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={() => setMessageMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleReactToMessage(selectedMessage?.id || '', '❤️')}>
          <Favorite sx={{ mr: 2, color: 'error.main' }} />
          React with ❤️
        </MenuItem>
        <MenuItem onClick={() => handleReactToMessage(selectedMessage?.id || '', '👍')}>
          <ThumbUp sx={{ mr: 2, color: 'primary.main' }} />
          React with 👍
        </MenuItem>
        <MenuItem onClick={() => selectedMessage && handleReplyToMessage(selectedMessage)}>
          <Reply sx={{ mr: 2 }} />
          Reply
        </MenuItem>
        <MenuItem onClick={() => selectedMessage && handleForwardMessage(selectedMessage)}>
          <Forward sx={{ mr: 2 }} />
          Forward
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setMessageMenuAnchor(null)}>
          <Report sx={{ mr: 2, color: 'error.main' }} />
          Report
        </MenuItem>
      </Menu>

      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {shareType === 'cart' ? 'Share Shopping Cart' : 'Share Product'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {shareType === 'cart' ? (
              <Box>
                <ShoppingCart sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Share your cart with {getOtherUser(selectedChat!).displayName}?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  They'll see all the items in your cart and can add them to their own.
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Share Product
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send this product recommendation to {getOtherUser(selectedChat!).displayName}?
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={shareType === 'cart' ? handleShareCart : handleShareProduct}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectMessages;
