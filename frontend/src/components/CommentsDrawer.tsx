import React, { useState, useEffect, useRef } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Divider,
  Stack,
  Chip,
  Menu,
  MenuItem,
  Alert,
  LinearProgress,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Close,
  Send,
  MoreVert,
  Reply,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
  Flag,
  Edit,
  Delete,
  Verified,
  Star,
  EmojiEmotions,
  AttachFile,
  GifBox
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Comment interface
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
    tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
  };
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies: Comment[];
  isEdited: boolean;
  isPinned: boolean;
  parentId?: string;
  mentions?: string[];
  attachments?: {
    type: 'image' | 'gif' | 'link';
    url: string;
    preview?: string;
  }[];
}

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: any;
  currentUser: any;
  comments: Comment[];
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onLikeComment: (commentId: string) => void;
  onDislikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onReportComment: (commentId: string) => void;
  loading?: boolean;
}

const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  postId,
  postAuthor,
  currentUser,
  comments,
  onAddComment,
  onLikeComment,
  onDislikeComment,
  onDeleteComment,
  onEditComment,
  onReportComment,
  loading = false
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const textFieldRef = useRef<HTMLInputElement>(null);

  // Focus on text field when replying
  useEffect(() => {
    if (replyTo && textFieldRef.current) {
      textFieldRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await onAddComment(postId, newComment, replyTo || undefined);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      onEditComment(commentId, editContent);
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmitComment();
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'diamond': return '#b9f2ff';
      default: return undefined;
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <motion.div
      key={comment.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          ml: isReply ? 4 : 0,
          mb: 2,
          p: 2,
          borderRadius: '12px',
          background: isReply ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.01)',
          border: isReply ? '1px solid rgba(0,0,0,0.05)' : 'none',
          position: 'relative'
        }}
      >
        {comment.isPinned && (
          <Chip
            icon={<Star sx={{ fontSize: '12px !important' }} />}
            label="Pinned"
            size="small"
            color="warning"
            sx={{ position: 'absolute', top: 8, right: 8, fontSize: '10px' }}
          />
        )}

        <Box display="flex" alignItems="flex-start" gap={1.5}>
          <Avatar
            src={comment.user.avatar}
            sx={{
              width: isReply ? 32 : 40,
              height: isReply ? 32 : 40,
              border: comment.user.tier ? `2px solid ${getTierColor(comment.user.tier)}` : undefined
            }}
          />

          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant={isReply ? "body2" : "subtitle2"} fontWeight={600}>
                {comment.user.name}
              </Typography>

              {comment.user.verified && (
                <Verified sx={{ fontSize: '14px', color: '#1976d2' }} />
              )}

              {comment.user.tier && (
                <Chip
                  label={comment.user.tier.toUpperCase()}
                  size="small"
                  sx={{
                    fontSize: '8px',
                    height: '16px',
                    background: getTierColor(comment.user.tier),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}

              <Typography variant="caption" color="text.secondary">
                @{comment.user.username} • {comment.timestamp}
              </Typography>

              {comment.isEdited && (
                <Chip
                  label="edited"
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '8px', height: '16px' }}
                />
              )}
            </Box>

            {editingComment === comment.id ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleEditComment(comment.id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {comment.content}
              </Typography>
            )}

            {/* Comment attachments */}
            {comment.attachments && comment.attachments.map((attachment, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt="Comment attachment"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </Box>
            ))}

            {/* Comment actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                size="small"
                startIcon={<ThumbUp sx={{ fontSize: '14px' }} />}
                onClick={() => onLikeComment(comment.id)}
                sx={{ fontSize: '11px', minWidth: 'auto', p: 0.5 }}
              >
                {comment.likes}
              </Button>

              <Button
                size="small"
                startIcon={<ThumbDown sx={{ fontSize: '14px' }} />}
                onClick={() => onDislikeComment(comment.id)}
                sx={{ fontSize: '11px', minWidth: 'auto', p: 0.5 }}
              >
                {comment.dislikes}
              </Button>

              <Button
                size="small"
                startIcon={<Reply sx={{ fontSize: '14px' }} />}
                onClick={() => {
                  setReplyTo(comment.id);
                  setNewComment(`@${comment.user.username} `);
                }}
                sx={{ fontSize: '11px', minWidth: 'auto', p: 0.5 }}
              >
                Reply
              </Button>

              <IconButton
                size="small"
                onClick={(e) => {
                  setMenuAnchor(e.currentTarget);
                  setSelectedComment(comment.id);
                }}
                sx={{ ml: 'auto', p: 0.5 }}
              >
                <MoreVert sx={{ fontSize: '16px' }} />
              </IconButton>
            </Stack>

            {/* Replies */}
            <AnimatePresence>
              {comment.replies && comment.replies.length > 0 && (
                <Box mt={2}>
                  {comment.replies.map(reply => renderComment(reply, true))}
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100vw', sm: '400px', md: '500px' },
            borderRadius: { xs: 0, sm: '16px 0 0 16px' }
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight={600}>
                Comments ({comments.length})
              </Typography>
              <IconButton onClick={onClose} sx={{ color: 'white' }}>
                <Close />
              </IconButton>
            </Box>
          </Box>

          {/* Comments List */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2
            }}
          >
            {loading && <LinearProgress sx={{ mb: 2 }} />}

            {comments.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: '12px' }}>
                No comments yet. Be the first to comment!
              </Alert>
            ) : (
              <AnimatePresence>
                {comments.map(comment => renderComment(comment))}
              </AnimatePresence>
            )}
          </Box>

          {/* Reply indicator */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(102, 126, 234, 0.1)' }}>
                  <Typography variant="caption" color="primary">
                    Replying to {comments.find(c => c.id === replyTo)?.user.name}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setReplyTo(null);
                        setNewComment('');
                      }}
                      sx={{ ml: 1, p: 0.25 }}
                    >
                      <Close sx={{ fontSize: '14px' }} />
                    </IconButton>
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comment Input */}
          <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <Avatar
                src={currentUser?.avatar}
                sx={{ width: 32, height: 32, mb: 1 }}
              />
              <TextField
                ref={textFieldRef}
                fullWidth
                multiline
                maxRows={3}
                placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px'
                  }
                }}
              />
              <Tooltip title="Send comment">
                <span>
                  <IconButton
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      mb: 0.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b5b95 100%)'
                      },
                      '&.Mui-disabled': {
                        background: '#ccc',
                        color: '#999'
                      }
                    }}
                  >
                    {submitting ? (
                      <LinearProgress
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%'
                        }}
                      />
                    ) : (
                      <Send sx={{ fontSize: '18px' }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Press Enter to send, Shift + Enter for new line
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Comment Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null);
          setSelectedComment(null);
        }}
      >
        {selectedComment && (
          <>
            {comments.find(c => c.id === selectedComment)?.userId === currentUser?.id && (
              <>
                <MenuItem
                  onClick={() => {
                    const comment = comments.find(c => c.id === selectedComment);
                    if (comment) {
                      setEditingComment(selectedComment);
                      setEditContent(comment.content);
                    }
                    setMenuAnchor(null);
                  }}
                >
                  <Edit sx={{ mr: 1, fontSize: '16px' }} />
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    if (selectedComment) {
                      onDeleteComment(selectedComment);
                    }
                    setMenuAnchor(null);
                  }}
                >
                  <Delete sx={{ mr: 1, fontSize: '16px' }} />
                  Delete
                </MenuItem>
                <Divider />
              </>
            )}
            <MenuItem
              onClick={() => {
                if (selectedComment) {
                  onReportComment(selectedComment);
                }
                setMenuAnchor(null);
              }}
            >
              <Flag sx={{ mr: 1, fontSize: '16px' }} />
              Report
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default CommentsDrawer;