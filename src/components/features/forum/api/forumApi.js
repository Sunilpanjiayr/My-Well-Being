// src/components/features/forum/api/forumApi.js
import axios from 'axios';
import { auth } from '../../../Auth/firebase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Function to get the current user's token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }
  return null;
};

// Update the request interceptor to use the token function
api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Handle common errors
api.interceptors.response.use(response => {
  return response;
}, error => {
  // Handle specific error codes
  if (error.response) {
    if (error.response.status === 401) {
      // Unauthorized - might need to redirect to login
      console.log('User is not authenticated. Redirecting to login...');
    } else if (error.response.status === 404) {
      console.log('Resource not found');
    } else if (error.response.status === 500) {
      console.log('Server error');
    }
  } else if (error.request) {
    // Network error
    console.log('Network error - no response received');
  } else {
    console.log('Error', error.message);
  }
  return Promise.reject(error);
});

// Topics API
export const fetchTopics = async (params) => {
  try {
    const response = await api.get('/topics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const fetchTopic = async (topicId) => {
  try {
    const response = await api.get(`/topics/${topicId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
};

export const createTopic = async (topicData) => {
  try {
    const response = await api.post('/topics', topicData);
    return response.data;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (topicId, topicData) => {
  try {
    const response = await api.patch(`/topics/${topicId}`, topicData);
    return response.data;
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (topicId) => {
  try {
    const response = await api.delete(`/topics/${topicId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};

export const likeTopic = async (topicId) => {
  try {
    const response = await api.post(`/topics/${topicId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking topic:', error);
    throw error;
  }
};

export const toggleBookmark = async (topicId) => {
  try {
    const response = await api.post(`/topics/${topicId}/bookmark`);
    return response.data;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error;
  }
};

// Replies API
export const createReply = async (topicId, replyData) => {
  try {
    const response = await api.post(`/topics/${topicId}/replies`, replyData);
    return response.data;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export const likeReply = async (replyId) => {
  try {
    const response = await api.post(`/replies/${replyId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking reply:', error);
    throw error;
  }
};

// User API
export const getUserBookmarks = async () => {
  try {
    const response = await api.get(`/users/bookmarks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return [];
  }
};

export const getUserTopics = async () => {
  try {
    const response = await api.get(`/users/topics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user topics:', error);
    return [];
  }
};

// Reporting
export const reportContent = async (itemId, itemType, reason) => {
  try {
    const response = await api.post(`/${itemType}s/${itemId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting content:', error);
    throw error;
  }
};

// Forum Statistics
export const getForumStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching forum statistics:', error);
    return {
      topicsCount: 0,
      postsCount: 0,
      membersCount: 0,
      newestMember: null
    };
  }
};