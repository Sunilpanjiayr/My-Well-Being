// src/components/features/forum/CommunityForum.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import './CommunityForum.css';

function CommunityForum() {
  const { darkMode } = useTheme();
  const { currentUser } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTopic, setActiveTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicForm, setNewTopicForm] = useState({
    visible: false,
    title: '',
    category: 'general',
    content: ''
  });
  const [replyContent, setReplyContent] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [userBookmarks, setUserBookmarks] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportItemId, setReportItemId] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);
  const [activeView, setActiveView] = useState('forum'); // 'forum', 'bookmarks', 'myTopics'

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

  // Sample topics data
  const sampleTopics = [
    {
      id: 1,
      title: 'Tips for staying hydrated throughout the day',
      category: 'general',
      author: {
        id: 101,
        name: 'HealthEnthusiast',
        avatar: '👩‍⚕️',
        joinDate: '2023-01-15'
      },
      content: 'I struggle to drink enough water daily. What are your best tips for staying hydrated? I have tried setting reminders but often ignore them when I am busy. Any creative solutions?',
      date: '2023-06-10T10:30:00Z',
      replies: [
        {
          id: 101,
          author: {
            id: 102,
            name: 'WaterChampion',
            avatar: '💧',
            joinDate: '2022-11-03'
          },
          content: 'I keep a large water bottle at my desk and mark time goals on it with a permanent marker. For example, 8am - 1/4 full, 10am - 1/2 full, etc. It is a visual reminder that really works for me!',
          date: '2023-06-10T11:15:00Z',
          likes: 15
        },
        {
          id: 102,
          author: {
            id: 103,
            name: 'FitnessFanatic',
            avatar: '🏋️',
            joinDate: '2022-08-22'
          },
          content: 'I use an app called "WaterMinder" that sends me notifications and tracks my intake. It gamifies the experience which I find motivating. Also, I add fruit slices to make the water more appealing.',
          date: '2023-06-10T13:45:00Z',
          likes: 8
        }
      ],
      views: 89,
      likes: 12,
      isPinned: true,
      isLocked: false,
      tags: ['hydration', 'daily habits', 'water']
    },
    {
      id: 2,
      title: 'How to establish a consistent meditation practice?',
      category: 'mental',
      author: {
        id: 105,
        name: 'MindfulSeeker',
        avatar: '🧘',
        joinDate: '2022-09-18'
      },
      content: 'I have been trying to establish a regular meditation practice for months, but I can not seem to stick with it. I start strong for a few days and then life gets busy and I skip a day, which turns into weeks. How do you maintain consistency with meditation?',
      date: '2023-06-05T08:15:00Z',
      replies: [
        {
          id: 201,
          author: {
            id: 108,
            name: 'ZenMaster',
            avatar: '☯️',
            joinDate: '2021-12-10'
          },
          content: 'Start small - even just 2 minutes a day is better than nothing. I began with a tiny commitment that was impossible to fail at, then gradually increased the time. Also, try to meditate at the same time each day, ideally attaching it to an existing habit (like after brushing your teeth).',
          date: '2023-06-05T09:30:00Z',
          likes: 23
        }
      ],
      views: 132,
      likes: 18,
      isPinned: false,
      isLocked: false,
      tags: ['meditation', 'mental health', 'habits', 'mindfulness']
    },
    {
      id: 3,
      title: 'Success with intermittent fasting',
      category: 'success',
      author: {
        id: 110,
        name: 'HealthJourney',
        avatar: '🥗',
        joinDate: '2022-10-05'
      },
      content: 'I wanted to share my experience with intermittent fasting (16:8 method) over the past 3 months. I have lost 15 pounds, have more energy throughout the day, and my blood pressure has improved significantly according to my last check-up. Happy to answer any questions about my journey!',
      date: '2023-05-28T15:45:00Z',
      replies: [
        {
          id: 301,
          author: {
            id: 115,
            name: 'NutritionNerd',
            avatar: '🍎',
            joinDate: '2022-07-30'
          },
          content: 'That iss fantastic progress! What was the hardest part of adjusting to the fasting window? And did you make any other dietary changes alongside IF?',
          date: '2023-05-28T16:20:00Z',
          likes: 7
        },
        {
          id: 302,
          author: {
            id: 110,
            name: 'HealthJourney',
            avatar: '🥗',
            joinDate: '2022-10-05'
          },
          content: 'The first week was definitely the hardest - I was used to eating right after waking up. I started by pushing breakfast back by an hour each day until I reached my 16:8 window. I also cut back on processed foods and added more vegetables to my meals, which I think contributed significantly to the results.',
          date: '2023-05-28T17:45:00Z',
          likes: 12
        }
      ],
      views: 245,
      likes: 37,
      isPinned: false,
      isLocked: false,
      tags: ['intermittent fasting', 'weight loss', 'success story']
    },
    {
      id: 4,
      title: 'Best home workout equipment for small spaces?',
      category: 'fitness',
      author: {
        id: 120,
        name: 'ApartmentFitness',
        avatar: '🏠',
        joinDate: '2023-01-08'
      },
      content: 'I live in a small apartment and want to create a home gym setup without taking up too much space. What equipment would you recommend that is versatile, compact, and effective for full-body workouts?',
      date: '2023-06-08T14:10:00Z',
      replies: [
        {
          id: 401,
          author: {
            id: 121,
            name: 'FitnessCoach',
            avatar: '💪',
            joinDate: '2021-11-15'
          },
          content: 'Resistance bands are my top recommendation for small spaces! They are incredibly versatile, can provide progressive resistance, and fold up to practically nothing. Pair those with adjustable dumbbells (the kind where you can change the weight plates), a doorway pull-up bar, and a foldable yoga mat. With just these items, you can do hundreds of different exercises targeting every muscle group.',
          date: '2023-06-08T15:30:00Z',
          likes: 19
        }
      ],
      views: 178,
      likes: 15,
      isPinned: false,
      isLocked: false,
      tags: ['home gym', 'fitness equipment', 'small space', 'workouts']
    },
    {
      id: 5,
      title: 'Managing anxiety with nutrition',
      category: 'nutrition',
      author: {
        id: 130,
        name: 'CalmSeeker',
        avatar: '🌿',
        joinDate: '2022-12-20'
      },
      content: 'I have been experiencing increased anxiety lately, and I have read that certain foods can either help or worsen anxiety symptoms. Has anyone noticed specific dietary changes that helped with their anxiety levels? Looking for personal experiences rather than just general advice.',
      date: '2023-06-01T11:20:00Z',
      replies: [
        {
          id: 501,
          author: {
            id: 131,
            name: 'NutritionalHealing',
            avatar: '🥦',
            joinDate: '2022-05-18'
          },
          content: 'I noticed a significant improvement when I reduced caffeine and sugar intake. I used to drink 4-5 cups of coffee daily and had terrible anxiety. Now I limit myself to one cup in the morning and have replaced other caffeine with herbal teas like chamomile and lavender. Also, increasing omega-3 rich foods like fatty fish, walnuts, and flaxseeds seemed to help stabilize my mood over time.',
          date: '2023-06-01T12:15:00Z',
          likes: 22
        }
      ],
      views: 203,
      likes: 28,
      isPinned: false,
      isLocked: false,
      tags: ['anxiety', 'nutrition', 'mental health', 'diet']
    }
  ];

  // Load topics and user data on component mount
  useEffect(() => {
    // In a real app, this would be an API call to fetch topics
    setTopics(sampleTopics);
    
    // Load bookmarks from localStorage
    const savedBookmarks = JSON.parse(localStorage.getItem('forumBookmarks')) || [];
    setUserBookmarks(savedBookmarks);
  }, []);

  // Save bookmarks when they change
  useEffect(() => {
    localStorage.setItem('forumBookmarks', JSON.stringify(userBookmarks));
  }, [userBookmarks]);

  // Filter topics based on category and search query
  const getFilteredTopics = () => {
    const filteredByCategory = activeCategory === 'all' 
      ? topics 
      : topics.filter(topic => topic.category === activeCategory);
    
    if (!searchQuery.trim()) return filteredByCategory;
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    return filteredByCategory.filter(topic => 
      topic.title.toLowerCase().includes(lowerCaseQuery) ||
      topic.content.toLowerCase().includes(lowerCaseQuery) ||
      topic.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  };

  // Get topics for the current view
  const getViewTopics = () => {
    const filtered = getFilteredTopics();
    
    if (activeView === 'bookmarks') {
      return filtered.filter(topic => userBookmarks.includes(topic.id));
    }
    
    if (activeView === 'myTopics') {
      // In a real app, this would filter by currentUser.id
      return filtered.filter(topic => topic.author.name === 'HealthEnthusiast');
    }
    
    return filtered;
  };

  // Sort topics based on selected order
  const getSortedTopics = () => {
    const topicsToSort = [...getViewTopics()];
    
    // Always show pinned topics first
    const pinnedTopics = topicsToSort.filter(topic => topic.isPinned);
    const unpinnedTopics = topicsToSort.filter(topic => !topic.isPinned);
    
    // Sort unpinned topics based on sort order
    switch (sortOrder) {
      case 'newest':
        unpinnedTopics.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        unpinnedTopics.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'mostLiked':
        unpinnedTopics.sort((a, b) => b.likes - a.likes);
        break;
      case 'mostViewed':
        unpinnedTopics.sort((a, b) => b.views - a.views);
        break;
      case 'mostReplies':
        unpinnedTopics.sort((a, b) => b.replies.length - a.replies.length);
        break;
      default:
        break;
    }
    
    return [...pinnedTopics, ...unpinnedTopics];
  };

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

  // Toggle bookmark status for a topic
  const toggleBookmark = (topicId) => {
    setUserBookmarks(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  // Check if a topic is bookmarked
  const isBookmarked = (topicId) => {
    return userBookmarks.includes(topicId);
  };

  // Handle creating a new topic
  const handleCreateTopic = () => {
    if (!newTopicForm.title.trim() || !newTopicForm.content.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    const newTopic = {
      id: topics.length + 1,
      title: newTopicForm.title,
      category: newTopicForm.category,
      author: {
        id: 101, // In a real app, this would be currentUser.id
        name: 'HealthEnthusiast', // In a real app, this would be currentUser.name
        avatar: '👩‍⚕️', // In a real app, this would be currentUser.avatar
        joinDate: '2023-01-15' // In a real app, this would be currentUser.joinDate
      },
      content: newTopicForm.content,
      date: new Date().toISOString(),
      replies: [],
      views: 0,
      likes: 0,
      isPinned: false,
      isLocked: false,
      tags: newTopicForm.content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []
    };
    
    setTopics(prev => [newTopic, ...prev]);
    setNewTopicForm({
      visible: false,
      title: '',
      category: 'general',
      content: ''
    });
    
    // In a real app, you would make an API call to create the topic
  };

  // Handle submitting a reply
  const handleSubmitReply = () => {
    if (!replyContent.trim() || !activeTopic) return;
    
    const newReply = {
      id: activeTopic.replies.length + 1,
      author: {
        id: 101, // In a real app, this would be currentUser.id
        name: 'HealthEnthusiast', // In a real app, this would be currentUser.name
        avatar: '👩‍⚕️', // In a real app, this would be currentUser.avatar
        joinDate: '2023-01-15' // In a real app, this would be currentUser.joinDate
      },
      content: replyContent,
      date: new Date().toISOString(),
      likes: 0
    };
    
    setTopics(prev => prev.map(topic => {
      if (topic.id === activeTopic.id) {
        return {
          ...topic,
          replies: [...topic.replies, newReply]
        };
      }
      return topic;
    }));
    
    setReplyContent('');
    
    // In a real app, you would make an API call to submit the reply
  };

  // Handle reporting a topic or reply
  const handleReport = () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for the report');
      return;
    }
    
    // In a real app, you would make an API call to submit the report
    alert(`Thank you for your report. Our moderators will review it shortly.`);
    
    setShowReportModal(false);
    setReportReason('');
    setReportItemId(null);
    setReportItemType(null);
  };

  // Open the report modal for a topic or reply
  const openReportModal = (itemId, type) => {
    setReportItemId(itemId);
    setReportItemType(type);
    setShowReportModal(true);
  };

  // Handle like/unlike topic or reply
  const toggleLike = (itemId, type) => {
    if (type === 'topic') {
      setTopics(prev => prev.map(topic => {
        if (topic.id === itemId) {
          // In a real app, you would check if the user has already liked it
          // Here we're just toggling for simplicity
          return { ...topic, likes: topic.likes + 1 };
        }
        return topic;
      }));
    } else if (type === 'reply' && activeTopic) {
      setTopics(prev => prev.map(topic => {
        if (topic.id === activeTopic.id) {
          return {
            ...topic,
            replies: topic.replies.map(reply => {
              if (reply.id === itemId) {
                return { ...reply, likes: reply.likes + 1 };
              }
              return reply;
            })
          };
        }
        return topic;
      }));
    }
    
    // In a real app, you would make an API call to like/unlike
  };

  // View a topic and increment view count
  const viewTopic = (topic) => {
    // Increment view count
    setTopics(prev => prev.map(t => {
      if (t.id === topic.id) {
        return { ...t, views: t.views + 1 };
      }
      return t;
    }));
    
    setActiveTopic(topic);
    
    // In a real app, you would make an API call to increment the view count
  };

  return (
    <div className={`community-forum ${darkMode ? 'dark-mode' : ''}`}>
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
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">Search</button>
        </div>
        
        <button 
          className="new-topic-button"
          onClick={() => setNewTopicForm({ ...newTopicForm, visible: true })}
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
              onClick={() => setActiveView('forum')}
            >
              All Discussions
            </button>
            <button 
              className={activeView === 'bookmarks' ? 'active' : ''}
              onClick={() => setActiveView('bookmarks')}
            >
              My Bookmarks
            </button>
            <button 
              className={activeView === 'myTopics' ? 'active' : ''}
              onClick={() => setActiveView('myTopics')}
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
                  onClick={() => setActiveCategory(category.id)}
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
              <span className="stat-value">{topics.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Posts:</span>
              <span className="stat-value">
                {topics.reduce((total, topic) => total + topic.replies.length + 1, 0)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Members:</span>
              <span className="stat-value">152</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Newest Member:</span>
              <span className="stat-value">WellnessWarrior</span>
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
            <a href="#" className="guidelines-link">Read Full Guidelines</a>
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
                >
                  Create Topic
                </button>
              </div>
            </div>
          ) : activeTopic ? (
            <div className="topic-detail">
              <div className="topic-header">
                <button 
                  className="back-button"
                  onClick={() => setActiveTopic(null)}
                >
                  ← Back to Topics
                </button>
                
                <div className="topic-actions">
                  <button 
                    className={`bookmark-button ${isBookmarked(activeTopic.id) ? 'active' : ''}`}
                    onClick={() => toggleBookmark(activeTopic.id)}
                  >
                    {isBookmarked(activeTopic.id) ? 'Bookmarked ★' : 'Bookmark ☆'}
                  </button>
                  
                  <button 
                    className="report-button"
                    onClick={() => openReportModal(activeTopic.id, 'topic')}
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
                      {categories.find(cat => cat.id === activeTopic.category)?.name}
                    </span>
                    <span className="topic-date">{formatDate(activeTopic.date)}</span>
                  </div>
                </div>
                
                <div className="post-container">
                  <div className="post-author">
                    <div className="author-avatar">{activeTopic.author.avatar}</div>
                    <div className="author-name">{activeTopic.author.name}</div>
                    <div className="author-joined">Joined: {new Date(activeTopic.author.joinDate).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="post-content">
                    <p>{activeTopic.content}</p>
                    
                    {activeTopic.tags.length > 0 && (
                      <div className="topic-tags">
                        {activeTopic.tags.map(tag => (
                          <span key={tag} className="topic-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="post-footer">
                      <button 
                        className="like-button"
                        onClick={() => toggleLike(activeTopic.id, 'topic')}
                      >
                        Like ({activeTopic.likes})
                      </button>
                      <span className="post-views">{activeTopic.views} views</span>
                    </div>
                  </div>
                </div>
                
                <div className="replies-section">
                  <h3>Replies ({activeTopic.replies.length})</h3>
                  
                  {activeTopic.replies.map(reply => (
                    <div className="reply-container" key={reply.id}>
                      <div className="post-author">
                        <div className="author-avatar">{reply.author.avatar}</div>
                        <div className="author-name">{reply.author.name}</div>
                        <div className="author-joined">Joined: {new Date(reply.author.joinDate).toLocaleDateString()}</div>
                      </div>
                      
                      <div className="post-content">
                        <p>{reply.content}</p>
                        
                        <div className="post-footer">
                          <div className="post-actions">
                            <button 
                              className="like-button"
                              onClick={() => toggleLike(reply.id, 'reply')}
                            >
                              Like ({reply.likes})
                            </button>
                            <button 
                              className="report-button small"
                              onClick={() => openReportModal(reply.id, 'reply')}
                            >
                              Report
                            </button>
                          </div>
                          <span className="post-date">{formatDate(reply.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Reply Form */}
                  {!activeTopic.isLocked && (
                    <div className="reply-form">
                      <h4>Post a Reply</h4>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Share your thoughts or experiences..."
                        rows={4}
                      />
                      <button 
                        className="submit-button"
                        onClick={handleSubmitReply}
                        disabled={!replyContent.trim()}
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                  
                  {activeTopic.isLocked && (
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
              
              {getSortedTopics().length > 0 ? (
                <div className="topics-table">
                  {getSortedTopics().map(topic => (
                    <div 
                      key={topic.id} 
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
                            {categories.find(cat => cat.id === topic.category)?.name}
                          </span>
                          <span className="topic-author">
                            {topic.author.avatar} {topic.author.name}
                          </span>
                          <span className="topic-date">{formatDate(topic.date)}</span>
                        </div>
                        
                        {topic.tags.length > 0 && (
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
                          <span className="stat-value">{topic.replies.length}</span>
                          <span className="stat-label">Replies</span>
                        </div>
                        <div className="stat-box views">
                          <span className="stat-value">{topic.views}</span>
                          <span className="stat-label">Views</span>
                        </div>
                        <div className="stat-box likes">
                          <span className="stat-value">{topic.likes}</span>
                          <span className="stat-label">Likes</span>
                        </div>
                      </div>
                      
                      <div className="topic-actions" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={`bookmark-button-small ${isBookmarked(topic.id) ? 'active' : ''}`}
                          onClick={() => toggleBookmark(topic.id)}
                          title={isBookmarked(topic.id) ? 'Remove Bookmark' : 'Add Bookmark'}
                        >
                          {isBookmarked(topic.id) ? '★' : '☆'}
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