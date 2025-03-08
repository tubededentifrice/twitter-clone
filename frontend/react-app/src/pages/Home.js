import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import Tweet from '../components/Tweet';
import TweetForm from '../components/TweetForm';
import TweetService from '../services/tweet.service';

const Home = ({ currentUser }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTweets = () => {
    setLoading(true);
    TweetService.getAllTweets()
      .then(
        (response) => {
          setTweets(response.data);
          setLoading(false);
        },
        (error) => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.detail) ||
            error.message ||
            error.toString();
          setError(resMessage);
          setLoading(false);
        }
      );
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleTweetAdded = (newTweet) => {
    setTweets([newTweet, ...tweets]);
  };

  return (
    <Container>
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="mb-4 border-0">
            <Card.Body>
              <h4 className="mb-3">Home</h4>
              {currentUser && <TweetForm onTweetAdded={handleTweetAdded} />}
            </Card.Body>
          </Card>

          {error && (
            <Alert variant="danger">
              Error: {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            tweets.length > 0 ? (
              tweets.map((tweet) => (
                <Tweet key={tweet.id} tweet={tweet} />
              ))
            ) : (
              <Alert variant="info">
                No tweets yet! Be the first to post something.
              </Alert>
            )
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Home;