// src/components/features/forum/CommunityForum.js
import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { auth, db } from '../../Auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  fetchTopics, 
  createTopic,
  fetchTopic,
  createReply,
  likeTopic,
  likeReply,
  toggleBookmark,
  reportContent,
  getUserBookmarks
} from './api/forumApi';
import './CommunityForum.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function CommunityForum() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  // User states
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [userBookmarks, setUserBookmarks] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTopic, setActiveTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeView, setActiveView] = useState('forum'); // 'forum', 'bookmarks', 'myTopics'
  
  // Form states
  const [newTopicForm, setNewTopicForm] = useState({
    visible: false,
    title: '',
    category: 'general',
    content: ''
  });
  const [replyContent, setReplyContent] = useState('');
  
  // Report modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportItemId, setReportItemId] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);

  // Forum statistics
  const [forumStats, setForumStats] = useState({
    topicsCount: 0,
    postsCount: 0,
    membersCount: 0,
    newestMember: 'User'
  });

  // Get current user info when component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user);
        
        try {
          // Get user profile from Firestore for additional data (gender, etc)
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          // Set username - prefer displayName, fallback to Firestore data or email
          setUserName(
            user.displayName || 
            (userDoc.exists() ? userDoc.data().username : null) || 
            user.email?.split('@')[0] || 
            'User'
          );
          
          // Set avatar - prefer photoURL, fallback to Firestore data or first letter
          const userPhotoURL = user.photoURL;
          const firestoreAvatarUrl = userDoc.exists() ? userDoc.data().avatarUrl : null;
          
          if (userPhotoURL) {
            setUserAvatar(userPhotoURL);
          } else if (firestoreAvatarUrl) {
            setUserAvatar(firestoreAvatarUrl);
          } else {
            const firstLetter = (user.displayName || user.email || 'U').charAt(0).toUpperCase();
            setUserAvatar(firstLetter);
          }
          
          // Load user bookmarks
          try {
            const bookmarks = await getUserBookmarks(user.uid);
            setUserBookmarks(bookmarks);
          } catch (error) {
            console.error('Failed to load bookmarks:', error);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserName(user.displayName || user.email?.split('@')[0] || 'User');
          setUserAvatar(user.displayName?.charAt(0).toUpperCase() || '👤');
        }
      } else {
        setCurrentUser(null);
        setUserBookmarks([]);
        setUserName('');
        setUserAvatar('👤');
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if we're viewing a specific topic (from URL)
  useEffect(() => {
    if (params.topicId) {
      loadTopic(params.topicId);
    }
  }, [params.topicId]);

  // Load topics based on filters
  const loadTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        category: activeCategory === 'all' ? null : activeCategory,
        search: searchQuery.trim() || null,
        sort: sortOrder,
        view: activeView,
        userId: currentUser?.uid
      };
      const data = await fetchTopics(params);
      setTopics(data);
      
      // Update forum statistics
      setForumStats(prev => ({
        ...prev,
        topicsCount: data.length,
        postsCount: data.reduce((total, topic) => total + (topic.replyCount || 0) + 1, 0)
      }));
    } catch (error) {
      console.error('Failed to load topics:', error);
      setError('Failed to load topics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortOrder, activeView, currentUser]);

  useEffect(() => {
    // Don't load topics if we're viewing a specific topic
    if (!params.topicId) {
      loadTopics();
    }
  }, [loadTopics, params.topicId]);

  // Load a specific topic with replies
  const loadTopic = async (topicId) => {
    setLoading(true);
    setError(null);
    try {
      const topic = await fetchTopic(topicId);
      setActiveTopic(topic);
    } catch (error) {
      console.error('Failed to load topic:', error);
      setError('Failed to load topic details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Forum categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'general', name: 'General Health' },
    { id: 'nutrition', name: 'Nutrition & Diet' },
    { id: 'fitness', name: 'Fitness & Exercise' },
    { id: 'mental', name: 'Mental Wellbeing' },
    { id: 'chronic', name: 'Chronic Conditions' },
    { id: 'wellness', name: 'Wellness Tips' },
    { id: 'success', name: 'Success Stories' }
  ];

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Extract hashtags from content
  const extractTags = (content) => {
    return content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || [];
  };

  // Toggle bookmark status for a topic
  const toggleBookmarkHandler = async (topicId, e) => {
    if (e) e.stopPropagation();
    
    if (!currentUser) {
      alert('You must be logged in to bookmark topics');
      return;
    }

    try {
      const { isBookmarked } = await toggleBookmark(topicId);
      
      if (isBookmarked) {
        setUserBookmarks(prev => [...prev, topicId]);
      } else {
        setUserBookmarks(prev => prev.filter(id => id !== topicId));
      }
      
      // If in bookmark view and removing a bookmark, refresh the list
      if (activeView === 'bookmarks' && !isBookmarked) {
        loadTopics();
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  // Check if a topic is bookmarked
  const isBookmarked = (topicId) => {
    return userBookmarks.includes(topicId);
  };

  const handleCreateTopic = async () => {
    if (!newTopicForm.title.trim() || !newTopicForm.content.trim()) {
      alert('Please fill in all fields');
      return;
    }
  
    if (!currentUser) {
      alert('You must be logged in to create a topic');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare topic data with extracted tags
      const topicData = {
        title: newTopicForm.title,
        content: newTopicForm.content,
        category: newTopicForm.category,
        tags: extractTags(newTopicForm.content)
      };
      
      const newTopic = await createTopic(topicData);
      console.log('Topic created successfully:', newTopic);
      
      // Clear form and close it
      setNewTopicForm({
        visible: false,
        title: '',
        category: 'general',
        content: ''
      });
      
      // Refresh topics
      loadTopics();
    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create topic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle submitting a reply
  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !activeTopic || !currentUser) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const replyData = {
        content: replyContent
      };
      
      await createReply(activeTopic._id, replyData);
      
      // Clear reply form
      setReplyContent('');
      
      // Reload topic to show new reply
      await loadTopic(activeTopic._id);
    } catch (error) {
      console.error('Failed to submit reply:', error);
      setError('Failed to submit reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle reporting a topic or reply
  const handleReport = async () => {
    if (!reportReason.trim() || !reportItemId || !reportItemType || !currentUser) {
      alert('Please provide a reason for the report');
      return;
    }
    
    setLoading(true);
    
    try {
      await reportContent(reportItemId, reportItemType, reportReason);
      
      alert('Thank you for your report. Our moderators will review it shortly.');
      
      setShowReportModal(false);
      setReportReason('');
      setReportItemId(null);
      setReportItemType(null);
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Open the report modal for a topic or reply
  const openReportModal = (itemId, type, e) => {
    if (e) e.stopPropagation();
    
    if (!currentUser) {
      alert('You must be logged in to report content');
      return;
    }
    
    setReportItemId(itemId);
    setReportItemType(type);
    setShowReportModal(true);
  };

  // Handle like/unlike topic
  const handleLikeTopic = async (topicId, e) => {
    if (e) e.stopPropagation();
    
    if (!currentUser) {
      alert('You must be logged in to like topics');
      return;
    }
    
    try {
      const result = await likeTopic(topicId);
      
      // Update the topic in state
      if (activeTopic && activeTopic._id === topicId) {
        setActiveTopic(prev => ({
          ...prev,
          likes: result.likes,
          isLiked: result.isLiked
        }));
      }
      
      // Update topic in topics list
      setTopics(prev => prev.map(topic => {
        if (topic._id === topicId) {
          return {
            ...topic,
            likes: result.likes,
            isLiked: result.isLiked
          };
        }
        return topic;
      }));
    } catch (error) {
      console.error('Failed to like topic:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  // Handle like/unlike reply
  const handleLikeReply = async (replyId, e) => {
    if (e) e.stopPropagation();
    
    if (!currentUser || !activeTopic) {
      alert('You must be logged in to like replies');
      return;
    }
    
    try {
      const result = await likeReply(replyId);
      
      // Update the reply in the active topic
      setActiveTopic(prev => ({
        ...prev,
        replies: prev.replies.map(reply => {
          if (reply._id === replyId) {
            return {
              ...reply,
              likes: result.likes,
              isLiked: result.isLiked
            };
          }
          return reply;
        })
      }));
    } catch (error) {
      console.error('Failed to like reply:', error);
      alert('Failed to update like. Please try again.');
    }
  };

  // View a topic and load its details
  const viewTopic = async (topic) => {
    // Navigate to topic URL (for shareable links)
    navigate(`/forum/topic/${topic._id}`);
    
    // Load full topic with replies
    await loadTopic(topic._id);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    loadTopics();
  };

  // Generate avatar display (either an image or text)
  const renderAvatar = (avatarSrc, fallbackText) => {
    if (avatarSrc && avatarSrc.startsWith('http')) {
      return (
        <img 
          src={avatarSrc} 
          alt="User Avatar" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '50%'
          }} 
        />
      );
    } else if (avatarSrc && (avatarSrc.startsWith('/') || avatarSrc === 'man_avatar.jpg' || avatarSrc === 'woman_avatar.jpg')) {
      // Local image path
      return (
        <img 
          src={avatarSrc} 
          alt="User Avatar" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '50%'
          }} 
        />
      );
    } else {
      // Fallback to text
      return fallbackText || '👤';
    }
  };

  return (
    <div className={`community-forum ${darkMode ? 'dark-mode' : ''}`}>
      {/* Error message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <h2>Report Content</h2>
            <p>Please let us know why you're reporting this content:</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Explain the issue (e.g., inappropriate content, spam, harassment)"
              rows={4}
            />
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-button"
                onClick={handleReport}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Forum Header */}
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Connect with others, share experiences, and discuss health topics</p>
      </div>
      
      {/* Forum Actions */}
      <div className="forum-actions">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">Search</button>
        </form>
        
        <button 
          className="new-topic-button"
          onClick={() => {
            if (!currentUser) {
              alert('You must be logged in to create a topic');
              return;
            }
            setNewTopicForm({ ...newTopicForm, visible: true });
          }}
        >
          New Topic
        </button>
      </div>
      
      {/* Main Forum Content */}
      <div className="forum-content">
        {/* Sidebar */}
        <div className="forum-sidebar">
          <div className="view-selector">
            <button 
              className={activeView === 'forum' ? 'active' : ''}
              onClick={() => {
                setActiveView('forum');
                setActiveTopic(null);
                navigate('/forum');
              }}
            >
              All Discussions
            </button>
            <button 
              className={activeView === 'bookmarks' ? 'active' : ''}
              onClick={() => {
                if (!currentUser) {
                  alert('You must be logged in to view bookmarks');
                  return;
                }
                setActiveView('bookmarks');
                setActiveTopic(null);
                navigate('/forum/bookmarks');
              }}
            >
              My Bookmarks {userBookmarks.length > 0 && `(${userBookmarks.length})`}
            </button>
            <button 
              className={activeView === 'myTopics' ? 'active' : ''}
              onClick={() => {
                if (!currentUser) {
                  alert('You must be logged in to view your topics');
                  return;
                }
                setActiveView('myTopics');
                setActiveTopic(null);
                navigate('/forum/my-topics');
              }}
            >
              My Topics
            </button>
          </div>
          
          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-list">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => {
                    setActiveCategory(category.id);
                    setActiveTopic(null);
                    if (category.id === 'all') {
                      navigate('/forum');
                    } else {
                      navigate(`/forum/category/${category.id}`);
                    }
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="forum-stats">
            <h3>Forum Statistics</h3>
            <div className="stat-item">
              <span className="stat-label">Topics:</span>
              <span className="stat-value">{forumStats.topicsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posts:</span>
              <span className="stat-value">{forumStats.postsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Members:</span>
              <span className="stat-value">{forumStats.membersCount || '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Newest Member:</span>
              <span className="stat-value">{forumStats.newestMember || '—'}</span>
            </div>
          </div>
          
          <div className="forum-guidelines">
            <h3>Community Guidelines</h3>
            <ul>
              <li>Be respectful and supportive</li>
              <li>No medical advice or diagnosis</li>
              <li>Protect your privacy</li>
              <li>Report inappropriate content</li>
              <li>Stay on topic</li>
            </ul>
            <a href="/guidelines" className="guidelines-link">Read Full Guidelines</a>
          </div>
        </div>
        
        {/* Main Forum Area */}
        <div className="forum-main">
          {newTopicForm.visible ? (
            <div className="new-topic-form">
              <h2>Create New Topic</h2>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  placeholder="Topic title"
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTopicForm.category}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, category: e.target.value })}
                >
                  {categories.filter(cat => cat.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newTopicForm.content}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, content: e.target.value })}
                  placeholder="Share your thoughts, questions, or experiences... Use #tags for related topics"
                  rows={6}
                />
              </div>
              
              <div className="form-actions">
                <button
                  className="cancel-button"
                  onClick={() => setNewTopicForm({ ...newTopicForm, visible: false })}
                >
                  Cancel
                </button>
                <button
                  className="submit-button"
                  onClick={handleCreateTopic}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </div>
          ) : activeTopic ? (
            <div className="topic-detail">
              <div className="topic-header">
                <button 
                  className="back-button"
                  onClick={() => {
                    setActiveTopic(null);
                    
                    // Navigate back based on the current view
                    if (activeView === 'bookmarks') {
                      navigate('/forum/bookmarks');
                    } else if (activeView === 'myTopics') {
                      navigate('/forum/my-topics');
                    } else if (activeCategory !== 'all') {
                      navigate(`/forum/category/${activeCategory}`);
                    } else {
                      navigate('/forum');
                    }
                  }}
                >
                  ← Back to Topics
                </button>
                
                <div className="topic-actions">
                  <button 
                    className={`bookmark-button ${isBookmarked(activeTopic._id) ? 'active' : ''}`}
                    onClick={(e) => toggleBookmarkHandler(activeTopic._id, e)}
                  >
                    {isBookmarked(activeTopic._id) ? 'Bookmarked ★' : 'Bookmark ☆'}
                  </button>
                  
                  <button 
                    className="report-button"
                    onClick={(e) => openReportModal(activeTopic._id, 'topic', e)}
                  >
                    Report
                  </button>
                </div>
              </div>
              
              <div className="topic-content">
                <div className="topic-title-section">
                  <h2>{activeTopic.title}</h2>
                  <div className="topic-meta">
                    <span className="topic-category">
                      {categories.find(cat => cat.id === activeTopic.category)?.name || 'General'}
                    </span>
                    <span className="topic-date">{formatDate(activeTopic.createdAt)}</span>
                  </div>
                </div>
                
                <div className="post-container">
                  <div className="post-author">
                    <div className="author-avatar">
                      {renderAvatar(activeTopic.author?.avatarUrl, activeTopic.author?.username?.charAt(0) || '👤')}
                    </div>
                    <div className="author-name">{activeTopic.author?.username || 'User'}</div>
                    <div className="author-joined">Joined: {activeTopic.author?.joinDate 
                      ? new Date(activeTopic.author.joinDate).toLocaleDateString() 
                      : 'Unknown'}
                    </div>
                  </div>
                  
                  <div className="post-content">
                    <p>{activeTopic.content}</p>
                    
                    {activeTopic.tags && activeTopic.tags.length > 0 && (
                      <div className="topic-tags">
                        {activeTopic.tags.map(tag => (
                          <span key={tag} className="topic-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="post-footer">
                      <button 
                        className={`like-button ${activeTopic.isLiked ? 'active' : ''}`}
                        onClick={(e) => handleLikeTopic(activeTopic._id, e)}
                      >
                        Like ({activeTopic.likes || 0})
                      </button>
                      <span className="post-views">{activeTopic.views || 0} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="replies-section">
                  <h3>Replies ({activeTopic.replies?.length || 0})</h3>
                  
                  {activeTopic.replies?.length > 0 ? (
                    activeTopic.replies.map(reply => (
                      <div className="reply-container" key={reply._id}>
                        <div className="post-author">
                          <div className="author-avatar">
                            {renderAvatar(reply.author?.avatarUrl, reply.author?.username?.charAt(0) || '👤')}
                          </div>
                          <div className="author-name">{reply.author?.username || 'User'}</div>
                          <div className="author-joined">Joined: {reply.author?.joinDate 
                            ? new Date(reply.author.joinDate).toLocaleDateString() 
                            : 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="post-content">
                          <p>{reply.content}</p>
                          
                          <div className="post-footer">
                            <div className="post-actions">
                              <button 
                                className={`like-button ${reply.isLiked ? 'active' : ''}`}
                                onClick={(e) => handleLikeReply(reply._id, e)}
                              >
                                Like ({reply.likes || 0})
                              </button>
                              <button 
                                className="report-button small"
                                onClick={(e) => openReportModal(reply._id, 'reply', e)}
                              >
                                Report
                              </button>
                            </div>
                            <span className="post-date">{formatDate(reply.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-replies">
                      <p>No replies yet. Be the first to reply!</p>
                    </div>
                  )}
                  
                  {/* Reply Form */}
                  {!activeTopic.isLocked ? (
                    <div className="reply-form">
                      <h4>Post a Reply</h4>
                      {currentUser ? (
                        <>
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Share your thoughts or experiences..."
                            rows={4}
                          />
                          <button 
                            className="submit-button"
                            onClick={handleSubmitReply}
                            disabled={!replyContent.trim() || loading}
                          >
                            {loading ? 'Posting...' : 'Post Reply'}
                          </button>
                        </>
                      ) : (
                        <div className="login-prompt">
                          <p>You must be logged in to reply. <a href="/login">Log in</a> or <a href="/signup">sign up</a> to join the conversation.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="locked-notice">
                      <p>This topic has been locked. New replies are not allowed.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="topics-list">
              <div className="topics-header">
                <h2>
                  {activeView === 'forum' && (activeCategory === 'all' ? 'All Topics' : `${categories.find(cat => cat.id === activeCategory)?.name} Topics`)}
                  {activeView === 'bookmarks' && 'My Bookmarked Topics'}
                  {activeView === 'myTopics' && 'My Topics'}
                </h2>
                
                <div className="sort-options">
                  <label>Sort by:</label>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="mostLiked">Most Liked</option>
                    <option value="mostViewed">Most Viewed</option>
                    <option value="mostReplies">Most Replies</option>
                  </select>
                </div>
              </div>
              
              {topics.length > 0 ? (
                <div className="topics-table">
                  {topics.map(topic => (
                    <div 
                      key={topic._id} 
                      className={`topic-row ${topic.isPinned ? 'pinned' : ''}`}
                      onClick={() => viewTopic(topic)}
                    >
                      <div className="topic-icon">
                        {topic.isPinned && <span className="pinned-icon">📌</span>}
                        {topic.isLocked && <span className="locked-icon">🔒</span>}
                      </div>
                      
                      <div className="topic-info">
                        <h3 className="topic-title">{topic.title}</h3>
                        <div className="topic-meta">
                          <span className="topic-category">
                            {categories.find(cat => cat.id === topic.category)?.name || 'General'}
                          </span>
                          <span className="topic-author">
                            {renderAvatar(topic.author?.avatarUrl, topic.author?.username?.charAt(0) || '👤')} {topic.author?.username || 'User'}
                          </span>
                          <span className="topic-date">{formatDate(topic.createdAt)}</span>
                        </div>
                        
                        {topic.tags?.length > 0 && (
                          <div className="topic-tags-preview">
                            {topic.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="topic-tag small">#{tag}</span>
                            ))}
                            {topic.tags.length > 3 && <span className="more-tags">+{topic.tags.length - 3}</span>}
                          </div>
                        )}
                      </div>
                      
                      <div className="topic-stats">
                        <div className="stat-box replies">
                          <span className="stat-value">{topic.replyCount || 0}</span>
                          <span className="stat-label">Replies</span>
                        </div>
                        <div className="stat-box views">
                          <span className="stat-value">{topic.views || 0}</span>
                          <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-box likes">
                          <span className="stat-value">{topic.likes || 0}</span>
                          <span className="stat-label">Likes</span>
                        </div>
                      </div>
                      
                      <div className="topic-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`bookmark-button-small ${isBookmarked(topic._id) ? 'active' : ''}`}
                          onClick={(e) => toggleBookmarkHandler(topic._id, e)}
                          title={isBookmarked(topic._id) ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          {isBookmarked(topic._id) ? '★' : '☆'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-topics">
                  {activeView === 'forum' ? (
                    <p>No topics found. Try a different category or search term.</p>
                  ) : activeView === 'bookmarks' ? (
                    <p>You haven't bookmarked any topics yet.</p>
                  ) : (
                    <p>You haven't created any topics yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Forum Footer */}
      <div className="forum-footer">
        <p>
          Our community forum is a place for members to connect and share experiences. 
          Remember that information shared here is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}

export default CommunityForum;