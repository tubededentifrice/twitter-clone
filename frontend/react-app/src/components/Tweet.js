import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import { HandThumbsUp, HandThumbsDown, HandThumbsUpFill, HandThumbsDownFill } from 'react-bootstrap-icons';
import defaultAvatarImg from '../assets/default-avatar.png';
import TweetService from '../services/tweet.service';

// Helper function to format time elapsed in a human-readable way with correct timezone handling
const formatTimeElapsed = (dateString) => {
  try {
    // Create a date object directly from the ISO string
    const tweetDate = new Date(dateString);
    const now = new Date();
    
    // Calculate time difference in milliseconds
    const diffMs = now - tweetDate;
    
    // Convert to seconds, minutes, hours
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Format based on the time difference
    if (diffSeconds < 60) {
      return diffSeconds <= 5 ? 'just now' : `${diffSeconds} seconds ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      // For older tweets, show the date
      return tweetDate.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "unknown time";
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
  
  // Note: We no longer need to parse the date here as we handle it directly in formatTimeElapsed
  
  // Debug the timestamp received from the server
  useEffect(() => {
    if (localTweet && localTweet.created_at) {
      console.log(`Tweet ID: ${localTweet.id}, Raw timestamp: ${localTweet.created_at}`);
      console.log(`Browser local time: ${new Date().toString()}`);
      console.log(`Formatted time: ${formatTimeElapsed(localTweet.created_at)}`);
    }
  }, [localTweet]);
  
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