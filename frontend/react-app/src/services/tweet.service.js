import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api";

const getAllTweets = () => {
  return axios.get(API_URL + "/tweets/", { headers: authHeader() });
};

const createTweet = (content, parentId = null) => {
  return axios.post(
    API_URL + "/tweets/", 
    { content, parent_id: parentId },
    { headers: authHeader() }
  );
};

const getUserTweets = (username) => {
  return axios.get(API_URL + `/tweets/user/${username}`, { headers: authHeader() });
};

const getTweet = (tweetId) => {
  return axios.get(API_URL + `/tweets/${tweetId}`, { headers: authHeader() });
};

const reactToTweet = (tweetId, reactionType) => {
  return axios.post(
    API_URL + `/tweets/${tweetId}/reaction`,
    { reaction_type: reactionType },
    { headers: authHeader() }
  );
};

const TweetService = {
  getAllTweets,
  createTweet,
  getUserTweets,
  getTweet,
  reactToTweet,
};

export default TweetService;