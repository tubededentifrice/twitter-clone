import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Image } from 'react-bootstrap';
import { formatDistance, parseISO } from 'date-fns';
import defaultAvatarImg from '../assets/default-avatar.png';

const Tweet = ({ tweet }) => {
  // Use author_username if available (from backend API), fallback to username for compatibility
  const username = tweet.author_username || tweet.username;
  
  // Parse the date with parseISO to ensure proper timezone handling
  const createdDate = parseISO(tweet.created_at);
  
  return (
    <Card className="mb-3 tweet-box">
      <Card.Body>
        <Row>
          <Col xs={2} md={1}>
            <Link to={`/profile/${username}`}>
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
                <Link to={`/profile/${username}`} className="fw-bold text-decoration-none text-dark">
                  {username}
                </Link>
                <span className="text-muted ms-2">
                  {formatDistance(createdDate, new Date(), { addSuffix: true })}
                </span>
              </div>
            </div>
            <div className="mt-2">{tweet.content}</div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Tweet;