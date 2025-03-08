import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "/api";

const getAllTweets = () => {
  return axios.get(API_URL + "/tweets/");
};

const createTweet = (content) => {
  return axios.post(
    API_URL + "/tweets/", 
    { content },
    { headers: authHeader() }
  );
};

const getUserTweets = (username) => {
  return axios.get(API_URL + `/tweets/user/${username}`);
};

const TweetService = {
  getAllTweets,
  createTweet,
  getUserTweets,
};

export default TweetService;