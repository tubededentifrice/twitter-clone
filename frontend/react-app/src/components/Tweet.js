import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import { formatDistance, parseISO, formatISO, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { HandThumbsUp, HandThumbsDown, HandThumbsUpFill, HandThumbsDownFill } from 'react-bootstrap-icons';
import defaultAvatarImg from '../assets/default-avatar.png';
import TweetService from '../services/tweet.service';

// Helper function to format time elapsed in a human-readable way with correct timezone handling
const formatTimeElapsed = (dateString) => {
  const date = parseISO(dateString);
  const now = new Date();
  
  const secondsAgo = differenceInSeconds(now, date);
  const minutesAgo = differenceInMinutes(now, date);
  const hoursAgo = differenceInHours(now, date);
  const daysAgo = differenceInDays(now, date);
  
  if (secondsAgo < 60) {
    return secondsAgo <= 10 ? 'just now' : `${secondsAgo} seconds ago`;
  } else if (minutesAgo < 60) {
    return `${minutesAgo} ${minutesAgo === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  } else if (daysAgo < 30) {
    return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  } else {
    // For older tweets, show the date in format: Feb 20, 2025
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const Tweet = ({ tweet, isDetailView = false }) => {
  const navigate = useNavigate();
  const [localTweet, setLocalTweet] = useState(tweet);
  
  // Update local state when tweet prop changes
  useEffect(() => {
    setLocalTweet(tweet);
  }, [tweet]);
  
  // Use author_username if available (from backend API), fallback to username for compatibility
  const username = localTweet.author_username || localTweet.username;
  
  // Parse the date for potential use in components that need the actual date object
  const createdDate = parseISO(localTweet.created_at);
  
  // Handle like/dislike clicks
  const handleReaction = async (type, e) => {
    e.stopPropagation(); // Prevent tweet click
    
    try {
      await TweetService.reactToTweet(localTweet.id, type);
      
      // Update local state based on the current reaction
      const currentReaction = localTweet.user_reaction;
      
      if (currentReaction === type) {
        // User clicked the same reaction - remove it
        setLocalTweet(prev => ({
          ...prev,
          user_reaction: null,
          likes_count: type === 'like' ? prev.likes_count - 1 : prev.likes_count,
          dislikes_count: type === 'dislike' ? prev.dislikes_count - 1 : prev.dislikes_count
        }));
      } else if (!currentReaction) {
        // User had no reaction - add the new one
        setLocalTweet(prev => ({
          ...prev,
          user_reaction: type,
          likes_count: type === 'like' ? prev.likes_count + 1 : prev.likes_count,
          dislikes_count: type === 'dislike' ? prev.dislikes_count + 1 : prev.dislikes_count
        }));
      } else {
        // User is changing reaction
        setLocalTweet(prev => ({
          ...prev,
          user_reaction: type,
          likes_count: currentReaction === 'like' 
            ? prev.likes_count - 1 
            : (type === 'like' ? prev.likes_count + 1 : prev.likes_count),
          dislikes_count: currentReaction === 'dislike' 
            ? prev.dislikes_count - 1 
            : (type === 'dislike' ? prev.dislikes_count + 1 : prev.dislikes_count)
        }));
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      // If not logged in, navigate to login
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };
  
  // Function to handle tweet click
  const handleTweetClick = (e) => {
    // Don't navigate if clicking on a link or if we're already in detail view
    if (e.target.tagName === 'A' || isDetailView || e.target.closest('.reaction-buttons')) {
      return;
    }
    
    navigate(`/tweet/${localTweet.id}`);
  };
  
  // Function to render tweet content with clickable @mentions
  const renderTweetContent = (content) => {
    if (!content) return '';
    
    // Regular expression to match @username mentions
    const mentionRegex = /@(\w+)/g;
    
    // Split the content by @mentions
    const parts = content.split(mentionRegex);
    
    if (parts.length === 1) {
      return content; // No mentions found
    }
    
    // Build the result with linked @mentions
    const result = [];
    let i = 0;
    
    // Process each part - odd indices are usernames, even indices are text between mentions
    parts.forEach((part, index) => {
      if (index % 2 === 0) {
        // Regular text
        if (part) result.push(<span key={`text-${i++}`}>{part}</span>);
      } else {
        // Username - create a link
        result.push(
          <Link 
            key={`mention-${i++}`} 
            to={`/profile/${part}`}
            className="text-primary fw-bold text-decoration-none"
            onClick={(e) => e.stopPropagation()} // Prevent tweet click when clicking username
          >
            @{part}
          </Link>
        );
      }
    });
    
    return result;
  };
  
  return (
    <Card 
      className={`mb-3 tweet-box ${!isDetailView ? 'tweet-clickable' : ''}`} 
      onClick={handleTweetClick}
      style={!isDetailView ? { cursor: 'pointer' } : {}}
    >
      <Card.Body>
        <Row>
          <Col xs={2} md={1}>
            <Link to={`/profile/${username}`} onClick={(e) => e.stopPropagation()}>
              <Image 
                src={tweet.profile_image || defaultAvatarImg} 
                className="avatar" 
                alt={`${username}'s avatar`} 
              />
            </Link>
          </Col>
          <Col xs={10} md={11}>
            <div className="d-flex justify-content-between">
              <div>
                <Link 
                  to={`/profile/${username}`} 
                  className="fw-bold text-decoration-none text-dark"
                  onClick={(e) => e.stopPropagation()}
                >
                  {username}
                </Link>
                <span className="text-muted ms-2">
                  {formatTimeElapsed(localTweet.created_at)}
                </span>
              </div>
            </div>
            <div className="mt-2">{renderTweetContent(localTweet.content)}</div>
            <div className="mt-2 d-flex align-items-center">
              {localTweet.replies_count > 0 && !isDetailView && (
                <Badge bg="secondary" pill className="me-3">
                  {localTweet.replies_count} {localTweet.replies_count === 1 ? 'reply' : 'replies'}
                </Badge>
              )}
              
              <div className="ms-auto reaction-buttons d-flex align-items-center">
                <Button 
                  variant="link" 
                  className="text-success p-0 d-flex align-items-center me-3"
                  onClick={(e) => handleReaction('like', e)}
                >
                  {localTweet.user_reaction === 'like' ? (
                    <HandThumbsUpFill size={16} className="me-1" />
                  ) : (
                    <HandThumbsUp size={16} className="me-1" />
                  )}
                  <span>{localTweet.likes_count || 0}</span>
                </Button>
                
                <Button 
                  variant="link" 
                  className="text-danger p-0 d-flex align-items-center"
                  onClick={(e) => handleReaction('dislike', e)}
                >
                  {localTweet.user_reaction === 'dislike' ? (
                    <HandThumbsDownFill size={16} className="me-1" />
                  ) : (
                    <HandThumbsDown size={16} className="me-1" />
                  )}
                  <span>{localTweet.dislikes_count || 0}</span>
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Tweet;