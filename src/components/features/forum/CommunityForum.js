import React, { useState, useEffect } from 'react';
import './CommunityForum.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import { auth, db } from '../../Auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  fetchTopics, 
  createTopic,
  toggleBookmark,
  getUserBookmarks,
  getForumStats
} from './api/forumApi';


function CommunityForum() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('👤');
  const [userBookmarks, setUserBookmarks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [activeView, setActiveView] = useState('forum'); // 'forum', 'bookmarks', 'myTopics'
  
  const [newTopicForm, setNewTopicForm] = useState({
    visible: false,
    title: '',
    category: 'general',
    content: ''
  });

  const [forumStats, setForumStats] = useState({
    topicsCount: 0,
    postsCount: 0,
    membersCount: 0,
    newestMember: null
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('🔐 Auth state changed:', user ? user.uid : 'No user');
      
      if (user) {
        setCurrentUser(user);
        
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          setUserName(
            user.displayName || 
            (userDoc.exists() ? userDoc.data().username : null) || 
            user.email?.split('@')[0] || 
            'User'
          );
          
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
            console.log('📚 Loading user bookmarks...');
            const bookmarks = await getUserBookmarks();
            console.log('📚 Bookmarks loaded:', bookmarks);
            setUserBookmarks(Array.isArray(bookmarks) ? bookmarks : []);
          } catch (error) {
            console.error('❌ Error loading bookmarks:', error);
            setUserBookmarks([]);
          }
        } catch (error) {
          console.error('❌ Error loading user data:', error);
        }
      } else {
        setCurrentUser(null);
        setUserName('');
        setUserAvatar('👤');
        setUserBookmarks([]);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    console.log('🔄 Loading topics due to filter change...');
    loadTopics();
    loadForumStats();
  }, [activeCategory, sortOrder, activeView]);
  
  const loadTopics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching topics with params:', {
        category: activeCategory !== 'all' ? activeCategory : undefined,
        sort: sortOrder,
        search: searchQuery || undefined,
        view: activeView !== 'forum' ? activeView : undefined
      });
      
      const queryParams = {
        category: activeCategory !== 'all' ? activeCategory : undefined,
        sort: sortOrder,
        search: searchQuery || undefined,
        view: activeView !== 'forum' ? activeView : undefined
      };
      
      const result = await fetchTopics(queryParams);
      console.log('📋 Topics fetch result:', result);
      
      // Handle the response structure from backend
      if (result && Array.isArray(result.topics)) {
        console.log('✅ Using result.topics array');
        setTopics(result.topics);
      } else if (Array.isArray(result)) {
        console.log('✅ Using result as topics array');
        setTopics(result);
      } else {
        console.log('⚠️ No topics found in result');
        setTopics([]);
      }
      
      console.log(`✅ Loaded ${topics.length} topics`);
    } catch (error) {
      console.error('❌ Error loading topics:', error);
      setError('Failed to load topics. Please try again.');
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const loadForumStats = async () => {
    try {
      console.log('📊 Loading forum stats...');
      const stats = await getForumStats();
      console.log('📊 Forum stats loaded:', stats);
      setForumStats(stats || {
        topicsCount: 0,
        postsCount: 0,
        membersCount: 0,
        newestMember: null
      });
    } catch (error) {
      console.error('❌ Error loading forum stats:', error);
    }
  };
  
  const categories = [
    { id: 'general', name: 'General Discussion', icon: '💬' },
    { id: 'nutrition', name: 'Nutrition & Diet', icon: '🥗' },
    { id: 'fitness', name: 'Fitness & Exercise', icon: '🏋️' },
    { id: 'mental', name: 'Mental Health', icon: '🧠' },
    { id: 'sleep', name: 'Sleep Health', icon: '😴' },
    { id: 'medical', name: 'Medical Conditions', icon: '🏥' },
    { id: 'wellness', name: 'Wellness Tips', icon: '🧘' },
    { id: 'success', name: 'Success Stories', icon: '🎉' },
    { id: 'questions', name: 'Questions & Help', icon: '❓' }
  ];
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Unknown';
      }
      
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      
      if (diffDay > 30) {
        return date.toLocaleDateString();
      } else if (diffDay > 0) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
      } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
      } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };
  
  const extractTags = (content) => {
    const tags = content.match(/#(\w+)/g) || [];
    return tags.map(tag => tag.substring(1));
  };
  
  const toggleBookmarkHandler = async (topicId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!currentUser) {
      alert('You must be logged in to bookmark topics');
      return;
    }
    
    if (!topicId || topicId === 'undefined') {
      console.error('Invalid topic ID for bookmark:', topicId);
      return;
    }
    
    try {
      console.log('🔖 Toggling bookmark for topic:', topicId);
      const result = await toggleBookmark(topicId);
      console.log('🔖 Bookmark result:', result);
      
      if (result && result.success) {
        if (result.isBookmarked) {
          setUserBookmarks(prev => [...prev, topicId]);
          console.log('✅ Bookmark added');
        } else {
          setUserBookmarks(prev => prev.filter(id => id !== topicId));
          console.log('✅ Bookmark removed');
        }
        
        // Reload topics if in bookmarks view and bookmark was removed
        if (activeView === 'bookmarks' && !result.isBookmarked) {
          loadTopics();
        }
      }
    } catch (error) {
      console.error('❌ Failed to toggle bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };
  
  const isBookmarked = (topicId) => {
    return Array.isArray(userBookmarks) && userBookmarks.includes(topicId);
  };
  
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to create topics');
      return;
    }
    
    const { title, category, content } = newTopicForm;
    
    if (!title.trim() || !content.trim()) {
      alert('Please provide both a title and content for your topic');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Creating new topic...');
      const tags = extractTags(content);
      
      const topicData = {
        title: title.trim(),
        content: content.trim(),
        category,
        tags
      };
      
      console.log('📝 Topic data:', topicData);
      const result = await createTopic(topicData);
      console.log('📝 Topic creation result:', result);
      
      if (result && result.success && result.topic) {
        console.log('✅ Topic created successfully, navigating to topic page...');
        
        // Reset form
        setNewTopicForm({
          visible: false,
          title: '',
          category: 'general',
          content: ''
        });
        
        // Navigate to the new topic
        const topicId = result.topic.id || result.topic._id;
        navigate(`/forum/topic/${topicId}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Failed to create topic:', error);
      setError('Failed to create topic. Please try again.');
      alert('Failed to create topic: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Navigate to topic detail page
  const viewTopic = (topic) => {
    const topicId = topic.id || topic._id;
    if (!topicId) {
      console.error('No topic ID found:', topic);
      return;
    }
    console.log('🔗 Navigating to topic:', topicId);
    navigate(`/forum/topic/${topicId}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('🔍 Searching for:', searchQuery);
    loadTopics();
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
      
      {/* Forum Header */}
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Connect with others, share experiences, and find support on your wellness journey.</p>
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
          onClick={() => setNewTopicForm(prev => ({ ...prev, visible: !prev.visible }))}
          disabled={!currentUser}
          title={!currentUser ? 'Please log in to create topics' : 'Create a new topic'}
        >
          {newTopicForm.visible ? 'Cancel' : 'New Topic'}
        </button>
      </div>
      
      {/* Main Forum Content */}
      <div className="forum-content">
        {/* Sidebar */}
        <div className="forum-sidebar">
          {/* View Selector */}
          <div className="view-selector">
            <button 
              className={activeView === 'forum' ? 'active' : ''}
              onClick={() => {
                setActiveView('forum');
                navigate('/forum');
              }}
            >
              🏠 Forum Home
            </button>
            <button 
              className={activeView === 'bookmarks' ? 'active' : ''}
              onClick={() => {
                if (!currentUser) {
                  alert('Please log in to view bookmarks');
                  return;
                }
                setActiveView('bookmarks');
                navigate('/forum/bookmarks');
              }}
              disabled={!currentUser}
            >
              ⭐ My Bookmarks
            </button>
            <button 
              className={activeView === 'myTopics' ? 'active' : ''}
              onClick={() => {
                if (!currentUser) {
                  alert('Please log in to view your topics');
                  return;
                }
                setActiveView('myTopics');
                navigate('/forum/my-topics');
              }}
              disabled={!currentUser}
            >
              📝 My Topics
            </button>
          </div>
          
          {/* Categories */}
          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-list">
              <button 
                className={activeCategory === 'all' ? 'active' : ''}
                onClick={() => setActiveCategory('all')}
              >
                🔍 All Categories
              </button>
              
              {categories.map(category => (
                <button 
                  key={category.id}
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Forum Stats */}
          <div className="forum-stats">
            <h3>Forum Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Topics</span>
              <span className="stat-value">{forumStats.topicsCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{forumStats.postsCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Members</span>
              <span className="stat-value">{forumStats.membersCount || 0}</span>
            </div>
            {forumStats.newestMember && (
              <div className="stat-item">
                <span className="stat-label">Newest Member</span>
                <span className="stat-value">{forumStats.newestMember.username || 'User'}</span>
              </div>
            )}
          </div>
          
          {/* Forum Guidelines */}
          <div className="forum-guidelines">
            <h3>Guidelines</h3>
            <ul>
              <li>Be respectful and kind</li>
              <li>No spam or self-promotion</li>
              <li>Stay on topic</li>
              <li>Respect privacy</li>
            </ul>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="forum-main">
          {/* New Topic Form */}
          {newTopicForm.visible && (
            <div className="new-topic-form">
              <h2>Create a New Topic</h2>
              <form onSubmit={handleCreateTopic}>
                <div className="form-group">
                  <label htmlFor="topic-title">Title</label>
                  <input 
                    id="topic-title"
                    type="text"
                    value={newTopicForm.title}
                    onChange={(e) => setNewTopicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="What's your topic about?"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="topic-category">Category</label>
                  <select 
                    id="topic-category"
                    value={newTopicForm.category}
                    onChange={(e) => setNewTopicForm(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="topic-content">Content</label>
                  <textarea 
                    id="topic-content"
                    value={newTopicForm.content}
                    onChange={(e) => setNewTopicForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your thoughts, questions, or experiences..."
                    rows={6}
                    required
                  />
                  <p className="form-hint">
                    Use #hashtags to add tags to your topic (e.g., #nutrition #tips)
                  </p>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="cancel-button"
                    onClick={() => setNewTopicForm(prev => ({ ...prev, visible: false }))}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={loading || !newTopicForm.title.trim() || !newTopicForm.content.trim()}
                  >
                    {loading ? 'Creating...' : 'Create Topic'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Topics List */}
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
                    key={topic.id || topic._id}
                    className={`topic-row ${topic.isPinned ? 'pinned' : ''}`}
                    onClick={() => viewTopic(topic)}
                    style={{ cursor: 'pointer' }}
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
                          {topic.author?.specialty
                            ? <>by Dr. {topic.author.username} <span className="author-specialty">• {topic.author.specialty}</span></>
                            : <>by {topic.author?.username || 'User'}</>
                          }
                        </span>
                        <span className="topic-date">{formatDate(topic.createdAt)}</span>
                      </div>
                      
                      {topic.tags && topic.tags.length > 0 && (
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
                      {currentUser && (
                        <button 
                          className={`bookmark-button-small ${isBookmarked(topic.id || topic._id) ? 'active' : ''}`}
                          onClick={(e) => toggleBookmarkHandler(topic.id || topic._id, e)}
                          title={isBookmarked(topic.id || topic._id) ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          {isBookmarked(topic.id || topic._id) ? '★' : '☆'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-topics">
                {activeView === 'forum' ? (
                  <p>No topics found. {searchQuery ? 'Try a different search term.' : 'Be the first to start a discussion!'}</p>
                ) : activeView === 'bookmarks' ? (
                  <p>You haven't bookmarked any topics yet. Start exploring and bookmark topics you find interesting!</p>
                ) : (
                  <p>You haven't created any topics yet. Click "New Topic" to start your first discussion!</p>
                )}
              </div>
            )}
          </div>
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