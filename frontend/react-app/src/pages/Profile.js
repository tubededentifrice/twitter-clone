import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, 
  Image, Tabs, Tab, Form, Modal, Alert 
} from 'react-bootstrap';
import Tweet from '../components/Tweet';
import UserService from '../services/user.service';
import TweetService from '../services/tweet.service';
import defaultAvatarImg from '../assets/default-avatar.png';

const Profile = ({ currentUser }) => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const isOwnProfile = currentUser && currentUser.username === username;
  
  const fetchProfileData = React.useCallback(() => {
    setLoading(true);
    setError(null);

    // Fetch profile data
    UserService.getUserProfile(username)
      .then(
        (response) => {
          setProfile(response.data);
          setBio(response.data.bio || "");
          setIsFollowing(response.data.is_followed || false);
          
          // Fetch user's tweets
          TweetService.getUserTweets(username)
            .then(
              (tweetResponse) => {
                setTweets(tweetResponse.data);
              },
              (error) => handleFetchError(error)
            );
          
          // Fetch followers
          UserService.getFollowers(username)
            .then(
              (followerResponse) => {
                setFollowers(followerResponse.data);
              },
              (error) => handleFetchError(error)
            );
          
          // Fetch following
          UserService.getFollowing(username)
            .then(
              (followingResponse) => {
                setFollowing(followingResponse.data);
                setLoading(false);
              },
              (error) => handleFetchError(error)
            );
        },
        (error) => {
          handleFetchError(error);
          setLoading(false);
        }
      );
  }, [username]);
  
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFetchError = (error) => {
    const resMessage =
      (error.response &&
        error.response.data &&
        error.response.data.detail) ||
      error.message ||
      error.toString();
    setError(resMessage);
  };

  const handleFollow = () => {
    if (isFollowing) {
      UserService.unfollowUser(username)
        .then(
          () => {
            setIsFollowing(false);
            setFollowers(followers.filter(f => f.username !== currentUser.username));
          },
          (error) => handleFetchError(error)
        );
    } else {
      UserService.followUser(username)
        .then(
          () => {
            setIsFollowing(true);
            if (currentUser) {
              setFollowers([...followers, { 
                username: currentUser.username,
                profile_image: currentUser.profile_image
              }]);
            }
          },
          (error) => handleFetchError(error)
        );
    }
  };

  const handleUpdateBio = () => {
    UserService.updateProfile(bio)
      .then(
        () => {
          setEditBio(false);
          setProfile({...profile, bio: bio});
          setSuccessMessage("Profile updated successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
        (error) => handleFetchError(error)
      );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    UserService.uploadProfilePicture(formData)
      .then(
        (response) => {
          setShowImageModal(false);
          setProfile({...profile, profile_image: response.data.profile_image});
          setSuccessMessage("Profile picture updated successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
        (error) => handleFetchError(error)
      );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-4">
        Error: {error}
      </Alert>
    );
  }

  return (
    <Container fluid>
      {profile && (
        <>
          <Card className="mb-4 profile-header">
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <Image 
                    src={profile.profile_image || defaultAvatarImg} 
                    className="avatar-lg mb-3" 
                    alt={`${username}'s avatar`} 
                  />
                  {isOwnProfile && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="mb-3"
                      onClick={() => setShowImageModal(true)}
                    >
                      Change Photo
                    </Button>
                  )}
                </Col>
                <Col md={9}>
                  <h3>{username}</h3>
                  
                  {editBio ? (
                    <div className="mb-3">
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={160}
                      />
                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">{bio.length}/160</small>
                        <div>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => {
                              setBio(profile.bio || "");
                              setEditBio(false);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={handleUpdateBio}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mb-3">
                      {profile.bio || (isOwnProfile ? "No bio yet. Add one to tell people about yourself!" : "No bio yet.")}
                      {isOwnProfile && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="ps-2"
                          onClick={() => setEditBio(true)}
                        >
                          Edit
                        </Button>
                      )}
                    </p>
                  )}
                  
                  <div className="d-flex mb-3">
                    <div className="me-3">
                      <strong>{tweets.length}</strong> Tweets
                    </div>
                    <div className="me-3">
                      <strong>{followers.length}</strong> Followers
                    </div>
                    <div>
                      <strong>{following.length}</strong> Following
                    </div>
                  </div>
                  
                  {currentUser && !isOwnProfile && (
                    <Button 
                      variant={isFollowing ? "outline-primary" : "primary"}
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
            </Alert>
          )}
          
          <Tabs defaultActiveKey="tweets" className="mb-4">
            <Tab eventKey="tweets" title="Tweets">
              {tweets.length > 0 ? (
                tweets.map((tweet) => (
                  <Tweet 
                    key={tweet.id} 
                    tweet={{
                      ...tweet,
                      profile_image: profile.profile_image,
                      username: profile.username || username
                    }} 
                  />
                ))
              ) : (
                <Alert variant="info">
                  {isOwnProfile 
                    ? "You haven't tweeted yet. Share your thoughts with the world!" 
                    : `${username} hasn't tweeted yet.`}
                </Alert>
              )}
            </Tab>
            <Tab eventKey="followers" title="Followers">
              <Card>
                <Card.Body>
                  {followers.length > 0 ? (
                    <Row>
                      {followers.map((follower) => (
                        <Col md={6} key={follower.username} className="mb-3">
                          <div className="d-flex align-items-center">
                            <Image 
                              src={follower.profile_image || defaultAvatarImg} 
                              className="avatar me-3" 
                              alt={`${follower.username}'s avatar`} 
                            />
                            <div>
                              <Link to={`/profile/${follower.username}`} className="text-decoration-none">
                                <h6 className="mb-0">{follower.username}</h6>
                              </Link>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      {isOwnProfile 
                        ? "You don't have any followers yet." 
                        : `${username} doesn't have any followers yet.`}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            <Tab eventKey="following" title="Following">
              <Card>
                <Card.Body>
                  {following.length > 0 ? (
                    <Row>
                      {following.map((follow) => (
                        <Col md={6} key={follow.username} className="mb-3">
                          <div className="d-flex align-items-center">
                            <Image 
                              src={follow.profile_image || defaultAvatarImg} 
                              className="avatar me-3" 
                              alt={`${follow.username}'s avatar`} 
                            />
                            <div>
                              <Link to={`/profile/${follow.username}`} className="text-decoration-none">
                                <h6 className="mb-0">{follow.username}</h6>
                              </Link>
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <Alert variant="info">
                      {isOwnProfile 
                        ? "You're not following anyone yet." 
                        : `${username} isn't following anyone yet.`}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
          
          <Modal show={showImageModal} onHide={() => setShowImageModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Profile Picture</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Choose an image</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Form.Group>
              
              {preview && (
                <div className="text-center mt-3">
                  <p>Preview:</p>
                  <Image 
                    src={preview} 
                    alt="Preview" 
                    className="img-fluid mb-3" 
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowImageModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleUploadImage}
                disabled={!selectedFile}
              >
                Upload
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Profile;