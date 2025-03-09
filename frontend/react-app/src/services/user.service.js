import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api";

const getUserProfile = (username) => {
  // Include auth header for all profile requests to ensure authenticated state
  const headers = authHeader();
  console.log("Auth headers for profile request:", headers);
  return axios.get(API_URL + `/profile/${username}`, { headers });
};

const updateProfile = (bio) => {
  return axios.put(
    API_URL + "/profile/me", 
    { bio },
    { headers: authHeader() }
  );
};

const followUser = (username) => {
  return axios.post(
    API_URL + `/profile/follow/${username}`,
    {},
    { headers: authHeader() }
  );
};

const unfollowUser = (username) => {
  return axios.post(
    API_URL + `/profile/unfollow/${username}`,
    {},
    { headers: authHeader() }
  );
};

const getFollowers = (username) => {
  return axios.get(API_URL + `/profile/${username}/followers`);
};

const getFollowing = (username) => {
  return axios.get(API_URL + `/profile/${username}/following`);
};

const uploadProfilePicture = (formData) => {
  return axios.post(
    API_URL + "/profile/picture",
    formData,
    {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

const UserService = {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  uploadProfilePicture,
};

export default UserService;