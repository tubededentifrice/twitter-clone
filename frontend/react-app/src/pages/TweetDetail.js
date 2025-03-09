import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import Tweet from '../components/Tweet';
import TweetForm from '../components/TweetForm';
import TweetService from '../services/tweet.service';

const TweetDetail = ({ currentUser }) => {
  const { id } = useParams();
  const [tweet, setTweet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchTweet();
  }, [id]);
  
  const fetchTweet = async () => {
    try {
      setLoading(true);
      const response = await TweetService.getTweet(id);
      setTweet(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching tweet:", err);
      setError("Failed to load tweet. It may have been deleted or is unavailable.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleReplySubmit = async (content) => {
    try {
      await TweetService.createTweet(content, id);
      // Refresh the tweet to get the new reply
      fetchTweet();
    } catch (err) {
      console.error("Error submitting reply:", err);
      setError("Failed to submit reply. Please try again.");
    }
  };
  
  // Recursive component for rendering replies
  const RepliesList = ({ replies }) => {
    if (!replies || replies.length === 0) return null;
    
    return (
      <div className="replies-list ms-4 mt-3">
        {replies.map(reply => (
          <div key={reply.id} className="reply-wrapper">
            <Tweet tweet={reply} isDetailView={true} />
            <RepliesList replies={reply.replies} />
          </div>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-outline-primary">Back to Home</Link>
      </Container>
    );
  }
  
  if (!tweet) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Tweet not found.</Alert>
        <Link to="/" className="btn btn-outline-primary">Back to Home</Link>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="mb-3">
            <Link to="/" className="text-decoration-none">&larr; Back to Home</Link>
          </div>
          
          {/* Original Tweet */}
          <Tweet tweet={tweet} isDetailView={true} />
          
          {/* Replies Section */}
          {tweet.replies && tweet.replies.length > 0 && (
            <div className="replies-section mt-4">
              <h5 className="mb-3">Replies</h5>
              <RepliesList replies={tweet.replies} />
            </div>
          )}
          
          {/* Reply Form */}
          {currentUser && (
            <div className="reply-form-section mt-4">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Post a Reply</h5>
                  <TweetForm 
                    onSubmit={handleReplySubmit} 
                    placeholder={`Reply to @${tweet.author_username}...`}
                    buttonText="Reply"
                    parentId={tweet.id}
                  />
                </Card.Body>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TweetDetail;