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
    console.log('📋 API: Fetching topics with params:', params);
    const response = await api.get('/topics', { params });
    
    console.log('📋 API: Topics response:', response.data);
    
    // Handle different response structures
    if (response.data && response.data.topics) {
      return response.data;
    } else if (Array.isArray(response.data)) {
      return { topics: response.data, stats: null };
    } else {
      return { topics: [], stats: null };
    }
  } catch (error) {
    console.error('❌ API: Error fetching topics:', error);
    throw error;
  }
};

export const fetchTopic = async (topicId) => {
  try {
    console.log('📖 API: Fetching topic:', topicId);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.get(`/topics/${topicId}`);
    console.log('📖 API: Topic response:', response.data);
    
    // Backend returns topic directly (not wrapped in success object)
    if (response.data && (response.data.id || response.data._id)) {
      console.log('✅ API: Topic fetched successfully');
      return { topic: response.data };
    } else {
      console.error('❌ API: Invalid topic data structure:', response.data);
      throw new Error('Invalid topic data received from server');
    }
  } catch (error) {
    console.error('❌ API: Error fetching topic:', error);
    throw error;
  }
};

export const createTopic = async (topicData) => {
  try {
    console.log('📝 API: Creating topic:', topicData);
    const response = await api.post('/topics', topicData);
    console.log('📝 API: Topic creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (topicId, topicData) => {
  try {
    console.log('📝 API: Updating topic:', topicId);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.patch(`/topics/${topicId}`, topicData);
    console.log('📝 API: Topic update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (topicId) => {
  try {
    console.log('🗑️ API: Deleting topic:', topicId);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.delete(`/topics/${topicId}`);
    console.log('🗑️ API: Topic deletion response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error deleting topic:', error);
    throw error;
  }
};

export const likeTopic = async (topicId) => {
  try {
    console.log('👍 API: Liking topic:', topicId);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.post(`/topics/${topicId}/like`);
    console.log('👍 API: Topic like response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error liking topic:', error);
    throw error;
  }
};

export const toggleBookmark = async (topicId) => {
  try {
    console.log('🔖 API: Toggling bookmark for topic:', topicId);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.post(`/topics/${topicId}/bookmark`);
    console.log('🔖 API: Bookmark toggle response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error toggling bookmark:', error);
    throw error;
  }
};

export const createReply = async (topicId, replyData) => {
  try {
    console.log('📝 API: Creating reply for topic:', topicId);
    console.log('📝 API: Reply data:', replyData);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const response = await api.post(`/topics/${topicId}/replies`, replyData);
    
    console.log('📝 API: Reply creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error creating reply:', error);
    console.error('❌ API: Error details:', error.response?.data);
    throw error;
  }
};

export const likeReply = async (replyId, additionalData = {}) => {
  try {
    console.log('👍 API: Liking reply:', replyId);
    
    if (!replyId || replyId === 'undefined') {
      throw new Error('Invalid reply ID');
    }
    
    // Backend expects topicId in the request body for replies
    const requestData = {
      ...additionalData
    };
    
    const response = await api.post(`/replies/${replyId}/like`, requestData);
    console.log('👍 API: Reply like response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error liking reply:', error);
    throw error;
  }
};

export const getUserBookmarks = async () => {
  try {
    console.log('📚 API: Fetching user bookmarks...');
    const response = await api.get(`/users/bookmarks?idsOnly=true`);
    
    console.log('📚 API: Bookmarks response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.bookmarks)) {
      return response.data.bookmarks;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ API: Error fetching user bookmarks:', error);
    return [];
  }
};

export const getUserTopics = async () => {
  try {
    console.log('📝 API: Fetching user topics...');
    const response = await api.get(`/users/topics`);
    
    console.log('📝 API: User topics response:', response.data);
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.topics)) {
      return response.data.topics;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ API: Error fetching user topics:', error);
    return [];
  }
};

export const reportContent = async (itemId, itemType, reason) => {
  try {
    console.log('🚨 API: Reporting content:', { itemId, itemType, reason });
    
    if (!itemId || itemId === 'undefined') {
      throw new Error('Invalid item ID');
    }
    
    if (!itemType || !reason) {
      throw new Error('Missing item type or reason');
    }
    
    const response = await api.post(`/${itemType}s/${itemId}/report`, { reason });
    console.log('🚨 API: Report response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error reporting content:', error);
    throw error;
  }
};

export const getForumStats = async () => {
  try {
    console.log('📊 API: Fetching forum stats...');
    const response = await api.get('/stats');
    
    console.log('📊 API: Stats response:', response.data);
    
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
    console.error('❌ API: Error fetching forum statistics:', error);
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
    console.log('📎 API: Uploading file:', file.name, 'to path:', path);
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('📎 API: File uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ API: Error uploading file:', error);
    throw error;
  }
};

export const createReplyWithAttachments = async (topicId, replyData, files) => {
  try {
    console.log('📎 API: Creating reply with attachments for topic:', topicId);
    console.log('📎 API: Files to upload:', files.length);
    
    if (!topicId || topicId === 'undefined') {
      throw new Error('Invalid topic ID');
    }
    
    const attachments = [];
    
    if (files && files.length > 0) {
      for (const file of files) {
        console.log('📎 API: Uploading file:', file.name);
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

    console.log('📎 API: Attachments prepared:', attachments);

    const response = await api.post(`/topics/${topicId}/replies`, {
      ...replyData,
      attachments
    });
    
    console.log('📎 API: Reply with attachments created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error creating reply with attachments:', error);
    console.error('❌ API: Error details:', error.response?.data);
    throw error;
  }
};

export const updateReplyWithAttachments = async (replyId, replyData, files, existingAttachments = []) => {
  try {
    console.log('📎 API: Updating reply with attachments:', replyId);
    
    if (!replyId || replyId === 'undefined') {
      throw new Error('Invalid reply ID');
    }
    
    const attachments = [...existingAttachments];
    
    if (files && files.length > 0) {
      for (const file of files) {
        console.log('📎 API: Uploading new file:', file.name);
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
    
    console.log('📎 API: Reply updated with attachments:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Error updating reply with attachments:', error);
    throw error;
  }
};