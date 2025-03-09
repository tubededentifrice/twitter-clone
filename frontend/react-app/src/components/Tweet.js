import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Image, Badge } from 'react-bootstrap';
import { formatDistance, parseISO } from 'date-fns';
import defaultAvatarImg from '../assets/default-avatar.png';

const Tweet = ({ tweet, isDetailView = false }) => {
  const navigate = useNavigate();
  
  // Use author_username if available (from backend API), fallback to username for compatibility
  const username = tweet.author_username || tweet.username;
  
  // Parse the date with parseISO to ensure proper timezone handling
  const createdDate = parseISO(tweet.created_at);
  
  // Function to handle tweet click
  const handleTweetClick = (e) => {
    // Don't navigate if clicking on a link or if we're already in detail view
    if (e.target.tagName === 'A' || isDetailView) {
      return;
    }
    
    navigate(`/tweet/${tweet.id}`);
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
                  {formatDistance(createdDate, new Date(), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="mt-2">{renderTweetContent(tweet.content)}</div>
            {tweet.replies_count > 0 && !isDetailView && (
              <div className="mt-2">
                <Badge bg="secondary" pill>
                  {tweet.replies_count} {tweet.replies_count === 1 ? 'reply' : 'replies'}
                </Badge>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Tweet;