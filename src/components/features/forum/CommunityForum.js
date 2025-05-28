import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { auth, db } from '../../Auth/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  fetchTopics, 
  createTopic,
  toggleBookmark,
  getUserBookmarks
} from './api/forumApi';
import './CommunityForum.css';
import { useNavigate } from 'react-router-dom';

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
    topicsCount: 156,
    postsCount: 892,
    membersCount: 1247,
    newestMember: 'HealthyLiving2024'
  });

  // Placeholder data for topics
  const placeholderTopics = [
    {
      _id: '1',
      title: 'Best Morning Routine for Better Health',
      content: 'I\'ve been working on optimizing my morning routine and wanted to share what\'s been working for me. Starting with 10 minutes of meditation, followed by a glass of water with lemon, and then 20 minutes of light exercise has completely transformed my energy levels throughout the day. What does your morning routine look like? #morningroutine #wellness',
      category: 'wellness',
      author: { username: 'Avi001', joinDate: '2025-04-15' },
      createdAt: '2024-05-25T08:00:00Z',
      tags: ['morningroutine', 'wellness', 'meditation'],
      likes: 24,
      views: 156,
      replyCount: 8,
      isPinned: true,
      isLocked: false,
      isLiked: false
    },
    {
      _id: '2',
      title: 'Struggling with Sleep - Need Advice',
      content: 'I\'ve been having trouble falling asleep for the past few weeks. I\'ve tried reducing screen time before bed and creating a relaxing environment, but nothing seems to work. Has anyone else experienced this? What helped you? #sleep #insomnia #help',
      category: 'sleep',
      author: { username: 'Sunil7', joinDate: '2025-04-10' },
      createdAt: '2025-05-05T22:30:00Z',
      tags: ['sleep', 'insomnia', 'help'],
      likes: 15,
      views: 89,
      replyCount: 12,
      isPinned: false,
      isLocked: false,
      isLiked: true
    },
    {
      _id: '3',
      title: 'Mediterranean Diet Success Story',
      content: 'After 6 months on the Mediterranean diet, I\'ve lost 25 pounds and my energy levels are through the roof! My doctor says my cholesterol levels have improved significantly. Here\'s what I learned along the way... #mediterraneandiet #success #nutrition',
      category: 'success',
      author: { username: 'Gaurav007', joinDate: '2025-05-20' },
      createdAt: '2025-05-02T14:15:00Z',
      tags: ['mediterraneandiet', 'success', 'nutrition', 'weightloss'],
      likes: 45,
      views: 234,
      replyCount: 18,
      isPinned: false,
      isLocked: false,
      isLiked: false
    },
    {
      _id: '4',
      title: 'Home Workout Equipment Recommendations',
      content: 'Looking to set up a home gym on a budget. What are the essential pieces of equipment you\'d recommend for someone just starting out? I have about $500 to spend and limited space. #homegym #fitness #equipment',
      category: 'fitness',
      author: { username: 'Litul97', joinDate: '2025-04-05' },
      createdAt: '2025-05-25T16:45:00Z',
      tags: ['homegym', 'fitness', 'equipment', 'budget'],
      likes: 18,
      views: 145,
      replyCount: 22,
      isPinned: false,
      isLocked: false,
      isLiked: false
    },
    {
      _id: '5',
      title: 'Dealing with Anxiety - Coping Strategies',
      content: 'I wanted to share some coping strategies that have helped me manage my anxiety. Deep breathing exercises, journaling, and regular walks in nature have made a huge difference. Remember, it\'s okay to seek professional help when needed. #anxiety #mentalhealth #coping',
      category: 'mental',
      author: { username: 'MindfulWarrior', joinDate: '2025-05-28' },
      createdAt: '2024-05-24T11:20:00Z',
      tags: ['anxiety', 'mentalhealth', 'coping', 'selfcare'],
      likes: 67,
      views: 298,
      replyCount: 31,
      isPinned: false,
      isLocked: false,
      isLiked: true
    },
    {
      _id: '6',
      title: 'Healthy Meal Prep Ideas for Busy Professionals',
      content: 'As someone who works 50+ hours a week, meal prep has been a game-changer for maintaining a healthy diet. Here are my top 10 make-ahead meals that are nutritious, delicious, and easy to prepare. #mealprep #nutrition #busylifestyle',
      category: 'nutrition',
      author: { username: 'PrepPro', joinDate: '2024-01-08' },
      createdAt: '2024-05-23T19:00:00Z',
      tags: ['mealprep', 'nutrition', 'busylifestyle', 'healthy'],
      likes: 38,
      views: 187,
      replyCount: 14,
      isPinned: false,
      isLocked: false,
      isLiked: false
    }
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
          
          // Set placeholder bookmarks
          setUserBookmarks(['2', '5']);
        } catch (error) {
          console.error('Error loading user data:', error);
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
    loadTopics();
  }, [activeCategory, sortOrder, activeView]);
  
  const loadTopics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredTopics = [...placeholderTopics];
      
      // Filter by category
      if (activeCategory !== 'all') {
        filteredTopics = filteredTopics.filter(topic => topic.category === activeCategory);
      }
      
      // Filter by view
      if (activeView === 'bookmarks') {
        filteredTopics = filteredTopics.filter(topic => userBookmarks.includes(topic._id));
      } else if (activeView === 'myTopics') {
        filteredTopics = filteredTopics.filter(topic => topic.author.username === userName);
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        filteredTopics = filteredTopics.filter(topic => 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // Sort topics
      filteredTopics.sort((a, b) => {
        switch (sortOrder) {
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          case 'mostLiked':
            return b.likes - a.likes;
          case 'mostViewed':
            return b.views - a.views;
          case 'mostReplies':
            return b.replyCount - a.replyCount;
          case 'newest':
          default:
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
      });
      
      setTopics(filteredTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
      setError('Failed to load topics. Please try again.');
      setTopics([]);
    } finally {
      setLoading(false);
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
    
    const date = new Date(dateString);
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
    
    try {
      const isCurrentlyBookmarked = userBookmarks.includes(topicId);
      
      if (isCurrentlyBookmarked) {
        setUserBookmarks(prev => prev.filter(id => id !== topicId));
      } else {
        setUserBookmarks(prev => [...prev, topicId]);
      }
      
      if (activeView === 'bookmarks' && isCurrentlyBookmarked) {
        loadTopics();
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
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
      // Simulate topic creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tags = extractTags(content);
      
      const newTopic = {
        _id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        author: { username: userName || 'User', joinDate: new Date().toISOString() },
        createdAt: new Date().toISOString(),
        likes: 0,
        views: 1,
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        isLiked: false
      };
      
      // Add to placeholder topics
      placeholderTopics.unshift(newTopic);
      
      setNewTopicForm({
        visible: false,
        title: '',
        category: 'general',
        content: ''
      });
      
      // Navigate to the new topic
      navigate(`/forum/topic/${newTopic._id}`);
      
    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to topic detail page
  const viewTopic = (topic) => {
    navigate(`/forum/topic/${topic._id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
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
              }}
            >
              🏠 Forum Home
            </button>
            <button 
              className={activeView === 'bookmarks' ? 'active' : ''}
              onClick={() => {
                setActiveView('bookmarks');
              }}
            >
              ⭐ My Bookmarks
            </button>
            <button 
              className={activeView === 'myTopics' ? 'active' : ''}
              onClick={() => {
                setActiveView('myTopics');
              }}
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
              <span className="stat-value">{forumStats.topicsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posts</span>
              <span className="stat-value">{forumStats.postsCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Members</span>
              <span className="stat-value">{forumStats.membersCount}</span>
            </div>
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
                    key={topic._id} 
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
                          by {topic.author?.username || 'User'}
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