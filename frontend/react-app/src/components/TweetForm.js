import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import TweetService from '../services/tweet.service';

const TweetForm = ({ onTweetAdded }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setMessage("Tweet cannot be empty!");
      setError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setError(false);

    TweetService.createTweet(content)
      .then(
        (response) => {
          setLoading(false);
          setContent("");
          setMessage("Tweet posted successfully!");
          if (onTweetAdded) {
            onTweetAdded(response.data);
          }
        },
        (error) => {
          setLoading(false);
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.detail) ||
            error.message ||
            error.toString();
          setMessage(resMessage);
          setError(true);
        }
      );
  };

  return (
    <div className="mb-4 p-3 bg-white rounded shadow-sm">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
          />
        </Form.Group>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">{content.length}/280</small>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading || !content.trim()}
          >
            {loading ? "Posting..." : "Tweet"}
          </Button>
        </div>
        {message && (
          <Alert variant={error ? "danger" : "success"} className="mt-3">
            {message}
          </Alert>
        )}
      </Form>
    </div>
  );
};

export default TweetForm;