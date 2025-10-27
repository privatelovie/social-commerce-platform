import React from 'react';
import { Chip } from '@mui/material';
import { Tag } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface HashtagLinkProps {
  tag: string;
  onClick?: (tag: string) => void;
  variant?: 'text' | 'chip';
  size?: 'small' | 'medium';
}

const HashtagLink: React.FC<HashtagLinkProps> = ({ 
  tag, 
  onClick, 
  variant = 'text',
  size = 'medium' 
}) => {
  const navigate = useNavigate();
  const cleanTag = tag.startsWith('#') ? tag.slice(1) : tag;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(cleanTag);
    } else {
      navigate(`/explore?hashtag=${encodeURIComponent(cleanTag)}`);
    }
  };

  if (variant === 'chip') {
    return (
      <Chip
        icon={<Tag />}
        label={`#${cleanTag}`}
        size={size}
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'primary.light',
            color: 'white'
          }
        }}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      style={{
        color: '#1976d2',
        cursor: 'pointer',
        fontWeight: 500,
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.textDecoration = 'underline';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.textDecoration = 'none';
      }}
    >
      #{cleanTag}
    </span>
  );
};

// Utility to parse text and make hashtags clickable
export const parseHashtags = (text: string, onHashtagClick?: (tag: string) => void) => {
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return <HashtagLink key={index} tag={part} onClick={onHashtagClick} />;
    }
    return <span key={index}>{part}</span>;
  });
};

export default HashtagLink;
