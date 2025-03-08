import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Image } from 'react-bootstrap';
import { formatDistance } from 'date-fns';

const Tweet = ({ tweet }) => {
  const defaultAvatar = "https://via.placeholder.com/50";
  
  return (
    <Card className="mb-3 tweet-box">
      <Card.Body>
        <Row>
          <Col xs={2} md={1}>
            <Link to={`/profile/${tweet.username}`}>
              <Image 
                src={tweet.profile_image || defaultAvatar} 
                className="avatar" 
                alt={`${tweet.username}'s avatar`} 
              />
            </Link>
          </Col>
          <Col xs={10} md={11}>
            <div className="d-flex justify-content-between">
              <div>
                <Link to={`/profile/${tweet.username}`} className="fw-bold text-decoration-none text-dark">
                  {tweet.username}
                </Link>
                <span className="text-muted ms-2">
                  {formatDistance(new Date(tweet.created_at), new Date(), { addSuffix: true })}
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