import axios from 'axios';
import { auth, storage } from '../../../Auth/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://my-wellbeing-new01-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response) {
    if (error.response.status === 401) {
      console.log('User is not authenticated. Redirecting to login...');
    } else if (error.response.status === 404) {
      console.log('Resource not found');
    } else if (error.response.status === 500) {
      console.log('Server error');
    }
  } else if (error.request) {
    console.log('Network error - no response received');
  } else {
    console.log('Error', error.message);
  }
  return Promise.reject(error);
});

export const fetchTopics = async (params) => {
  try {
    const response = await api.get('/topics', { params });
    
    // Handle different response structures
    if (response.data && response.data.topics) {
      return response.data;
    } else if (Array.isArray(response.data)) {
      return { topics: response.data, stats: null };
    } else {
      return { topics: [], stats: null };
    }
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const fetchTopic = async (topicId) => {
  try {
    console.log('API: Fetching topic', topicId);
    const response = await api.get(`/topics/${topicId}`);
    console.log('API: Raw response:', response);
    console.log('API: Response data:', response.data);
    
    // Handle different response structures
    if (response.data && response.data.success && response.data.topic) {
      console.log('API: Using response.data.topic');
      console.log('API: Topic replies:', response.data.topic.replies);
      return { topic: response.data.topic };
    } else if (response.data && response.data._id) {
      console.log('API: Using response.data directly');
      console.log('API: Topic replies:', response.data.replies);
      return { topic: response.data };
    } else {
      console.error('API: Invalid topic data structure:', response.data);
      throw new Error('Invalid topic data received from server');
    }
  } catch (error) {
    console.error('API: Error fetching topic:', error);
    console.error('API: Error response:', error.response?.data);
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

export const createReply = async (topicId, replyData) => {
  try {
    console.log('API: Creating reply for topic:', topicId);
    console.log('API: Reply data:', replyData);
    
    const response = await api.post(`/topics/${topicId}/replies`, replyData);
    
    console.log('API: Reply creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error creating reply:', error);
    console.error('API: Error details:', error.response?.data);
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

export const getUserBookmarks = async () => {
  try {
    const response = await api.get(`/users/bookmarks?idsOnly=true`);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.bookmarks)) {
      return response.data.bookmarks;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return [];
  }
};

export const getUserTopics = async () => {
  try {
    const response = await api.get(`/users/topics`);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.topics)) {
      return response.data.topics;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching user topics:', error);
    return [];
  }
};

export const reportContent = async (itemId, itemType, reason) => {
  try {
    const response = await api.post(`/${itemType}s/${itemId}/report`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error reporting content:', error);
    throw error;
  }
};

export const getForumStats = async () => {
  try {
    const response = await api.get('/stats');
    
    if (response.data && response.data.stats) {
      return response.data.stats;
    } else if (response.data) {
      return response.data;
    } else {
      return {
        topicsCount: 0,
        postsCount: 0,
        membersCount: 0,
        newestMember: null
      };
    }
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

export const uploadFile = async (file, path) => {
  try {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const createReplyWithAttachments = async (topicId, replyData, files) => {
  try {
    console.log('API: Creating reply with attachments for topic:', topicId);
    console.log('API: Files to upload:', files.length);
    
    const attachments = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        console.log('API: Uploading file:', file.name);
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `forum/replies/${topicId}/${fileName}`;
        const fileUrl = await uploadFile(file, filePath);
        
        attachments.push({
          fileName: file.name,
          fileUrl,
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
          fileSize: file.size
        });
      }
    }

    console.log('API: Attachments prepared:', attachments);

    const response = await api.post(`/topics/${topicId}/replies`, {
      ...replyData,
      attachments
    });
    
    console.log('API: Reply with attachments created:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: Error creating reply with attachments:', error);
    console.error('API: Error details:', error.response?.data);
    throw error;
  }
};

export const updateReplyWithAttachments = async (replyId, replyData, files, existingAttachments = []) => {
  try {
    const attachments = [...existingAttachments];
    
    if (files && files.length > 0) {
      for (const file of files) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `forum/replies/${replyId}/${fileName}`;
        const fileUrl = await uploadFile(file, filePath);
        
        attachments.push({
          fileName: file.name,
          fileUrl,
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
          fileSize: file.size
        });
      }
    }

    const response = await api.patch(`/replies/${replyId}`, {
      ...replyData,
      attachments
    });
    return response.data;
  } catch (error) {
    console.error('Error updating reply with attachments:', error);
    throw error;
  }
};