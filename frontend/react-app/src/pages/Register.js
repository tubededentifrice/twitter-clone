import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import AuthService from '../services/auth.service';

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successful, setSuccessful] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (password !== confirmedPassword) {
      setMessage("Passwords do not match");
      return false;
    }
    
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return false;
    }
    
    return true;
  };

  const handleRegister = (e) => {
    e.preventDefault();

    setMessage("");
    setSuccessful(false);
    setLoading(true);

    if (validateForm()) {
      AuthService.register(username, email, password)
        .then(
          (response) => {
            setMessage(response.data.message || "Registration successful! You can now log in.");
            setSuccessful(true);
            setLoading(false);
            setTimeout(() => navigate("/login"), 2000);
          },
          (error) => {
            const resMessage =
              (error.response &&
                error.response.data &&
                error.response.data.detail) ||
              error.message ||
              error.toString();
            setMessage(resMessage);
            setSuccessful(false);
            setLoading(false);
          }
        );
    } else {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Register</h2>
              </div>

              {message && (
                <Alert variant={successful ? "success" : "danger"}>
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm password"
                    value={confirmedPassword}
                    onChange={(e) => setConfirmedPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Register"}
                  </Button>
                </div>
              </Form>

              <div className="mt-3 text-center">
                <p>
                  Already have an account? <Link to="/login">Login here</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;