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
  const [activeView, setActiveView] = useState('forum');
  
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
      content: 'I\'ve been working on optimizing my morning routine and wanted to share what\'s been working for me. Starting with 10 minutes of meditation, followed by a glass of water with lemon, and then 20 minutes of light exercise has completely transformed my energy levels throughout the day.',
      category: 'wellness',
      author: { username: 'Avi001', joinDate: '2025-04-15', avatar: 'A' },
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
      content: 'I\'ve been having trouble falling asleep for the past few weeks. I\'ve tried reducing screen time before bed and creating a relaxing environment, but nothing seems to work.',
      category: 'sleep',
      author: { username: 'Sunil7', joinDate: '2025-04-10', avatar: 'S' },
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
      content: 'After 6 months on the Mediterranean diet, I\'ve lost 25 pounds and my energy levels are through the roof! My doctor says my cholesterol levels have improved significantly.',
      category: 'success',
      author: { username: 'Gaurav007', joinDate: '2025-05-20', avatar: 'G' },
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
      content: 'Looking to set up a home gym on a budget. What are the essential pieces of equipment you\'d recommend for someone just starting out?',
      category: 'fitness',
      author: { username: 'Litul97', joinDate: '2025-04-05', avatar: 'L' },
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
      content: 'I wanted to share some coping strategies that have helped me manage my anxiety. Deep breathing exercises, journaling, and regular walks in nature have made a huge difference.',
      category: 'mental',
      author: { username: 'MindfulWarrior', joinDate: '2025-05-28', avatar: 'M' },
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
      content: 'As someone who works 50+ hours a week, meal prep has been a game-changer for maintaining a healthy diet. Here are my top 10 make-ahead meals.',
      category: 'nutrition',
      author: { username: 'PrepPro', joinDate: '2024-01-08', avatar: 'P' },
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredTopics = [...placeholderTopics];
      
      if (activeCategory !== 'all') {
        filteredTopics = filteredTopics.filter(topic => topic.category === activeCategory);
      }
      
      if (activeView === 'bookmarks') {
        filteredTopics = filteredTopics.filter(topic => userBookmarks.includes(topic._id));
      } else if (activeView === 'myTopics') {
        filteredTopics = filteredTopics.filter(topic => topic.author.username === userName);
      }
      
      if (searchQuery.trim()) {
        filteredTopics = filteredTopics.filter(topic => 
          topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
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
    { id: 'general', name: 'General Discussion', icon: '💬', color: '#6B7280' },
    { id: 'nutrition', name: 'Nutrition & Diet', icon: '🥗', color: '#10B981' },
    { id: 'fitness', name: 'Fitness & Exercise', icon: '🏋️', color: '#F59E0B' },
    { id: 'mental', name: 'Mental Health', icon: '🧠', color: '#8B5CF6' },
    { id: 'sleep', name: 'Sleep Health', icon: '😴', color: '#3B82F6' },
    { id: 'medical', name: 'Medical Conditions', icon: '🏥', color: '#EF4444' },
    { id: 'wellness', name: 'Wellness Tips', icon: '🧘', color: '#06B6D4' },
    { id: 'success', name: 'Success Stories', icon: '🎉', color: '#84CC16' },
    { id: 'questions', name: 'Questions & Help', icon: '❓', color: '#F97316' }
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
      return `${diffDay}d ago`;
    } else if (diffHour > 0) {
      return `${diffHour}h ago`;
    } else if (diffMin > 0) {
      return `${diffMin}m ago`;
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tags = extractTags(content);
      
      const newTopic = {
        _id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        category,
        tags,
        author: { username: userName || 'User', joinDate: new Date().toISOString(), avatar: (userName || 'U').charAt(0) },
        createdAt: new Date().toISOString(),
        likes: 0,
        views: 1,
        replyCount: 0,
        isPinned: false,
        isLocked: false,
        isLiked: false
      };
      
      placeholderTopics.unshift(newTopic);
      
      setNewTopicForm({
        visible: false,
        title: '',
        category: 'general',
        content: ''
      });
      
      navigate(`/forum/topic/${newTopic._id}`);
      
    } catch (error) {
      console.error('Failed to create topic:', error);
      setError('Failed to create topic. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewTopic = (topic) => {
    navigate(`/forum/topic/${topic._id}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTopics();
  };

  return (
    <div className={`community-forum ${darkMode ? 'dark-mode' : ''}`}>
      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="forum-container">
        {/* Modern Header */}
        <div className="forum-hero">
          <div className="hero-content">
            <h1 className="hero-title">Community Forum</h1>
            <p className="hero-subtitle">Connect, share experiences, and support each other on your wellness journey</p>
            <div className="hero-stats">
              <div className="stat-badge">
                <span className="stat-number">{forumStats.topicsCount}</span>
                <span className="stat-label">Topics</span>
              </div>
              <div className="stat-badge">
                <span className="stat-number">{forumStats.postsCount}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-badge">
                <span className="stat-number">{forumStats.membersCount}</span>
                <span className="stat-label">Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="forum-toolbar">
          <div className="search-container">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-group">
                <span className="search-icon">🔍</span>
                <input 
                  type="text"
                  className="search-input"
                  placeholder="Search topics, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>
          
          <button 
            className="new-topic-btn"
            onClick={() => setNewTopicForm(prev => ({ ...prev, visible: !prev.visible }))}
          >
            <span className="btn-icon">+</span>
            {newTopicForm.visible ? 'Cancel' : 'New Topic'}
          </button>
        </div>

        <div className="forum-layout">
          {/* Modern Sidebar */}
          <div className="forum-sidebar">
            {/* View Navigation */}
            <div className="nav-section">
              <h3 className="nav-title">Navigation</h3>
              <div className="nav-buttons">
                <button 
                  className={`nav-btn ${activeView === 'forum' ? 'active' : ''}`}
                  onClick={() => setActiveView('forum')}
                >
                  <span className="nav-icon">🏠</span>
                  <span>Forum Home</span>
                </button>
                <button 
                  className={`nav-btn ${activeView === 'bookmarks' ? 'active' : ''}`}
                  onClick={() => setActiveView('bookmarks')}
                >
                  <span className="nav-icon">⭐</span>
                  <span>My Bookmarks</span>
                </button>
                <button 
                  className={`nav-btn ${activeView === 'myTopics' ? 'active' : ''}`}
                  onClick={() => setActiveView('myTopics')}
                >
                  <span className="nav-icon">📝</span>
                  <span>My Topics</span>
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="nav-section">
              <h3 className="nav-title">Categories</h3>
              <div className="category-grid">
                <button 
                  className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  <span className="category-icon">📋</span>
                  <span>All Categories</span>
                </button>
                
                {categories.map(category => (
                  <button 
                    key={category.id}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                    style={activeCategory === category.id ? { borderColor: category.color, backgroundColor: `${category.color}10` } : {}}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guidelines Card */}
            <div className="guidelines-card">
              <h4 className="card-title">Community Guidelines</h4>
              <ul className="guidelines-list">
                <li>Be respectful and kind</li>
                <li>Stay on topic</li>
                <li>No spam or harassment</li>
                <li>Respect privacy</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="forum-main">
            {/* New Topic Form */}
            {newTopicForm.visible && (
              <div className="new-topic-modal">
                <div className="modal-header">
                  <h2>Create New Topic</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setNewTopicForm(prev => ({ ...prev, visible: false }))}
                  >×</button>
                </div>
                <form onSubmit={handleCreateTopic} className="topic-form">
                  <div className="form-field">
                    <label className="field-label">Title</label>
                    <input 
                      type="text"
                      className="field-input"
                      value={newTopicForm.title}
                      onChange={(e) => setNewTopicForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What's your topic about?"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">Category</label>
                    <select 
                      className="field-select"
                      value={newTopicForm.category}
                      onChange={(e) => setNewTopicForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-field">
                    <label className="field-label">Content</label>
                    <textarea 
                      className="field-textarea"
                      value={newTopicForm.content}
                      onChange={(e) => setNewTopicForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Share your thoughts, questions, or experiences..."
                      rows={6}
                      required
                    />
                    <p className="field-hint">
                      💡 Use #hashtags to add tags (e.g., #nutrition #tips)
                    </p>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button"
                      className="btn-secondary"
                      onClick={() => setNewTopicForm(prev => ({ ...prev, visible: false }))}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={loading || !newTopicForm.title.trim() || !newTopicForm.content.trim()}
                    >
                      {loading ? 'Creating...' : 'Create Topic'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Topics Header */}
            <div className="topics-header">
              <div className="header-info">
                <h2 className="topics-title">
                  {activeView === 'forum' && (activeCategory === 'all' ? 'All Topics' : `${categories.find(cat => cat.id === activeCategory)?.name} Topics`)}
                  {activeView === 'bookmarks' && 'My Bookmarked Topics'}
                  {activeView === 'myTopics' && 'My Topics'}
                </h2>
                <span className="topics-count">{topics.length} topics</span>
              </div>
              
              <div className="sort-dropdown">
                <select 
                  className="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostViewed">Most Viewed</option>
                  <option value="mostReplies">Most Replies</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading topics...</p>
              </div>
            )}

            {/* Topics List */}
            {!loading && (
              <div className="topics-container">
                {topics.length > 0 ? (
                  <div className="topics-grid">
                    {topics.map(topic => (
                      <div 
                        key={topic._id} 
                        className={`topic-card ${topic.isPinned ? 'pinned' : ''}`}
                        onClick={() => viewTopic(topic)}
                      >
                        {topic.isPinned && <div className="pin-badge">📌 Pinned</div>}
                        
                        <div className="topic-header">
                          <div className="topic-category-badge" 
                               style={{ backgroundColor: categories.find(cat => cat.id === topic.category)?.color + '20', 
                                       color: categories.find(cat => cat.id === topic.category)?.color }}>
                            {categories.find(cat => cat.id === topic.category)?.icon} 
                            {categories.find(cat => cat.id === topic.category)?.name}
                          </div>
                          <button 
                            className={`bookmark-btn ${isBookmarked(topic._id) ? 'active' : ''}`}
                            onClick={(e) => toggleBookmarkHandler(topic._id, e)}
                            title={isBookmarked(topic._id) ? 'Remove Bookmark' : 'Add Bookmark'}
                          >
                            {isBookmarked(topic._id) ? '★' : '☆'}
                          </button>
                        </div>

                        <h3 className="topic-title">{topic.title}</h3>
                        <p className="topic-excerpt">{topic.content}</p>

                        {topic.tags && topic.tags.length > 0 && (
                          <div className="topic-tags">
                            {topic.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="tag">#{tag}</span>
                            ))}
                            {topic.tags.length > 3 && <span className="tag-more">+{topic.tags.length - 3}</span>}
                          </div>
                        )}

                        <div className="topic-footer">
                          <div className="author-info">
                            <div className="author-avatar">{topic.author?.avatar || topic.author?.username?.charAt(0) || 'U'}</div>
                            <div className="author-details">
                              <span className="author-name">{topic.author?.username || 'User'}</span>
                              <span className="post-time">{formatDate(topic.createdAt)}</span>
                            </div>
                          </div>

                          <div className="topic-metrics">
                            <div className="metric">
                              <span className="metric-icon">💬</span>
                              <span>{topic.replyCount}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-icon">👁️</span>
                              <span>{topic.views}</span>
                            </div>
                            <div className="metric">
                              <span className="metric-icon">👍</span>
                              <span>{topic.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      {activeView === 'forum' ? '💬' : activeView === 'bookmarks' ? '⭐' : '📝'}
                    </div>
                    <h3 className="empty-title">
                      {activeView === 'forum' ? 'No topics found' : 
                       activeView === 'bookmarks' ? 'No bookmarks yet' : 'No topics created'}
                    </h3>
                    <p className="empty-description">
                      {activeView === 'forum' ? 
                        (searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a discussion!') :
                       activeView === 'bookmarks' ? 
                        'Start exploring and bookmark interesting topics' :
                        'Create your first topic to get started'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityForum;