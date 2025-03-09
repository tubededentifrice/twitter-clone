import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api";

const getAllTweets = () => {
  return axios.get(API_URL + "/tweets/");
};

const createTweet = (content, parentId = null) => {
  return axios.post(
    API_URL + "/tweets/", 
    { content, parent_id: parentId },
    { headers: authHeader() }
  );
};

const getUserTweets = (username) => {
  return axios.get(API_URL + `/tweets/user/${username}`);
};

const getTweet = (tweetId) => {
  return axios.get(API_URL + `/tweets/${tweetId}`);
};

const TweetService = {
  getAllTweets,
  createTweet,
  getUserTweets,
  getTweet,
};

export default TweetService;