import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../Auth/firebase';
import { 
  fetchTopic, 
  createReply, 
  likeTopic, 
  likeReply, 
  reportContent,
  createReplyWithAttachments 
} from './api/forumApi';
import './TopicDetail.css';

function TopicDetailView() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyFiles, setReplyFiles] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportItemId, setReportItemId] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);

  // Placeholder topics data
  const placeholderTopicsData = {
    '1': {
      _id: '1',
      title: 'Best Morning Routine for Better Health',
      content: 'I\'ve been working on optimizing my morning routine and wanted to share what\'s been working for me. Starting with 10 minutes of meditation, followed by a glass of water with lemon, and then 20 minutes of light exercise has completely transformed my energy levels throughout the day.\n\nThe key is consistency - I\'ve been doing this for 3 months now and the difference is incredible. My sleep quality has improved, I feel more focused during the day, and my overall mood is much better.\n\nWhat does your morning routine look like? I\'d love to hear what works for others!',
      category: 'wellness',
      author: { 
        username: 'HealthyLiving2024', 
        joinDate: '2024-01-15T00:00:00Z',
        avatar: 'H'
      },
      createdAt: '2024-05-25T08:00:00Z',
      tags: ['morningroutine', 'wellness', 'meditation'],
      likes: 24,
      views: 156,
      isPinned: true,
      isLocked: false,
      isLiked: false,
      replies: [
        {
          _id: 'r1',
          content: 'This is so inspiring! I\'ve been struggling to establish a consistent morning routine. Going to try the meditation first approach - I usually jump straight into checking emails which sets a stressful tone for the day.',
          author: { username: 'MorningStruggler', joinDate: '2024-03-20T00:00:00Z' },
          createdAt: '2024-05-25T10:30:00Z',
          likes: 8,
          isLiked: false,
          parentReplyId: null,
          attachments: []
        },
        {
          _id: 'r2',
          content: 'The lemon water tip is gold! I\'ve been doing this for years. It really helps with hydration and digestion. Have you tried adding a pinch of sea salt? It helps with electrolyte balance.',
          author: { username: 'WellnessCoach Sarah', joinDate: '2023-09-10T00:00:00Z' },
          createdAt: '2024-05-25T12:15:00Z',
          likes: 12,
          isLiked: true,
          parentReplyId: null,
          attachments: []
        },
        {
          _id: 'r3',
          content: 'Thanks for the tip! I hadn\'t thought about adding sea salt. Will definitely try that tomorrow morning.',
          author: { username: 'HealthyLiving2024', joinDate: '2024-01-15T00:00:00Z' },
          createdAt: '2024-05-25T14:20:00Z',
          likes: 3,
          isLiked: false,
          parentReplyId: 'r2',
          attachments: []
        },
        {
          _id: 'r4',
          content: 'What type of light exercise do you do? I\'m thinking of adding some movement to my morning but not sure where to start.',
          author: { username: 'FitnessNewbie', joinDate: '2024-04-12T00:00:00Z' },
          createdAt: '2024-05-26T08:45:00Z',
          likes: 5,
          isLiked: false,
          parentReplyId: null,
          attachments: []
        },
        {
          _id: 'r5',
          content: 'I usually do a mix of yoga stretches and bodyweight exercises - nothing too intense! Maybe 10 minutes of stretching followed by 10 minutes of light cardio like jumping jacks or mountain climbers. The goal is to wake up the body, not exhaust it.',
          author: { username: 'HealthyLiving2024', joinDate: '2024-01-15T00:00:00Z' },
          createdAt: '2024-05-26T09:30:00Z',
          likes: 7,
          isLiked: false,
          parentReplyId: 'r4',
          attachments: []
        }
      ]
    },
    '2': {
      _id: '2',
      title: 'Struggling with Sleep - Need Advice',
      content: 'I\'ve been having trouble falling asleep for the past few weeks. I\'ve tried reducing screen time before bed and creating a relaxing environment, but nothing seems to work.\n\nMy mind just races when I hit the pillow. I keep thinking about work, tomorrow\'s tasks, or random things. It\'s so frustrating because I know I need the sleep, but I can\'t seem to turn off my brain.\n\nHas anyone else experienced this? What helped you get back to a normal sleep pattern?',
      category: 'sleep',
      author: { 
        username: 'Sunil7', 
        joinDate: '2025-04-10T00:00:00Z' 
      },
      createdAt: '2025-05-05T22:30:00Z',
      tags: ['sleep', 'insomnia', 'help'],
      likes: 15,
      views: 89,
      isPinned: false,
      isLocked: false,
      isLiked: true,
      replies: [
        {
          _id: 'r6',
          content: 'I totally understand this! Racing thoughts kept me awake for months. What really helped me was keeping a notebook by my bed to write down anything that came to mind. Once it\'s on paper, my brain seems to let go of it.',
          author: { username: 'Avi007', joinDate: '2025-02-05T00:00:00Z' },
          createdAt: '2025-05-27T23:15:00Z',
          likes: 18,
          isLiked: true,
          parentReplyId: null,
          attachments: []
        },
        {
          _id: 'r7',
          content: 'Have you tried progressive muscle relaxation? There are some great guided audio sessions on YouTube. Start with your toes and work your way up, tensing and releasing each muscle group.',
          author: { username: 'RelaxationExpert', joinDate: '2023-11-28T00:00:00Z' },
          createdAt: '2024-05-28T07:20:00Z',
          likes: 11,
          isLiked: false,
          parentReplyId: null,
          attachments: []
        }
      ]
    },
    '3': {
      _id: '3',
      title: 'Mediterranean Diet Success Story',
      content: 'After 6 months on the Mediterranean diet, I\'ve lost 25 pounds and my energy levels are through the roof! My doctor says my cholesterol levels have improved significantly too.\n\nHere\'s what I learned along the way:\n\n1. Meal prep is essential - I spend Sunday afternoons preparing vegetables and proteins for the week\n2. Olive oil really is liquid gold - don\'t skimp on quality\n3. Fish twice a week made a huge difference in how I felt\n4. The hardest part was giving up processed snacks, but fresh fruits and nuts are so much more satisfying\n\nThe best part? I never felt like I was \"dieting\" - the food is delicious and I never felt deprived. This feels sustainable for life!',
      category: 'success',
      author: { 
        username: 'MediterraneanMike', 
        joinDate: '2023-11-20T00:00:00Z' 
      },
      createdAt: '2024-05-26T14:15:00Z',
      tags: ['mediterraneandiet', 'success', 'nutrition', 'weightloss'],
      likes: 45,
      views: 234,
      isPinned: false,
      isLocked: false,
      isLiked: false,
      replies: [
        {
          _id: 'r8',
          content: 'Congratulations! This is so motivating. Can you share some of your go-to meal prep recipes? I\'m just starting out and could use some inspiration.',
          author: { username: 'NewToMedDiet', joinDate: '2024-05-15T00:00:00Z' },
          createdAt: '2024-05-26T16:30:00Z',
          likes: 12,
          isLiked: false,
          parentReplyId: null,
          attachments: []
        },
        {
          _id: 'r9',
          content: 'Amazing results! How long did it take before you started seeing changes in your energy levels?',
          author: { username: 'EnergySeeker', joinDate: '2024-01-08T00:00:00Z' },
          createdAt: '2024-05-26T18:45:00Z',
          likes: 8,
          isLiked: false,
          parentReplyId: null,
          attachments: []
        }
      ]
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (topicId) {
      console.log('Loading topic:', topicId);
      loadTopic();
    }
  }, [topicId]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      console.log('Fetching topic data...');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const topicData = placeholderTopicsData[topicId];
      
      if (topicData) {
        // Increment view count
        topicData.views += 1;
        setTopic(topicData);
        console.log('Topic data loaded:', topicData);
      } else {
        console.error('Topic not found:', topicId);
        alert('Topic not found');
        navigate('/forum');
      }
    } catch (error) {
      console.error('Error loading topic:', error);
      alert('Failed to load topic: ' + error.message);
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!currentUser) {
      alert('Please log in to like topics');
      return;
    }

    try {
      console.log('Liking topic:', topicId);
      
      const newIsLiked = !topic.isLiked;
      const newLikes = newIsLiked ? topic.likes + 1 : topic.likes - 1;
      
      setTopic(prev => ({
        ...prev,
        likes: newLikes,
        isLiked: newIsLiked
      }));
      
      console.log('Topic liked successfully');
    } catch (error) {
      console.error('Error liking topic:', error);
      alert('Failed to like topic: ' + error.message);
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!currentUser) {
      alert('Please log in to like replies');
      return;
    }

    try {
      console.log('Liking reply:', replyId);
      
      setTopic(prev => ({
        ...prev,
        replies: prev.replies.map(reply => {
          if (reply._id === replyId) {
            const newIsLiked = !reply.isLiked;
            const newLikes = newIsLiked ? reply.likes + 1 : reply.likes - 1;
            return { ...reply, likes: newLikes, isLiked: newIsLiked };
          }
          return reply;
        })
      }));
      
      console.log('Reply liked successfully');
    } catch (error) {
      console.error('Error liking reply:', error);
      alert('Failed to like reply: ' + error.message);
    }
  };

  const handleSubmitReply = async () => {
    if (!currentUser) {
      alert('Please log in to reply');
      return;
    }

    if (!replyContent.trim()) {
      alert('Please enter a reply');
      return;
    }

    try {
      console.log('Submitting reply:', { topicId, content: replyContent, parentReplyId: replyingTo });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReply = {
        _id: 'r' + Date.now(),
        content: replyContent.trim(),
        author: { 
          username: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          joinDate: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        parentReplyId: replyingTo,
        attachments: replyFiles.map(file => ({
          fileName: file.name,
          fileType: file.type.startsWith('image/') ? 'image' : 'pdf',
          fileUrl: URL.createObjectURL(file) // This is just for demo - in real app this would be uploaded
        }))
      };

      // Add reply to topic
      setTopic(prev => ({
        ...prev,
        replies: [...prev.replies, newReply]
      }));

      // Clear form
      setReplyContent('');
      setReplyFiles([]);
      setReplyingTo(null);
      
      console.log('Reply created successfully');
      alert('Reply posted successfully!');
      
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply: ' + error.message);
    }
  };

  const handleReport = async (itemId, itemType) => {
    if (!currentUser) {
      alert('Please log in to report content');
      return;
    }

    setReportItemId(itemId);
    setReportItemType(itemType);
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }

    try {
      console.log('Submitting report:', { itemId: reportItemId, itemType: reportItemType, reason: reportReason });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setShowReportModal(false);
      setReportReason('');
      setReportItemId(null);
      setReportItemType(null);
      alert('Content reported successfully. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting content:', error);
      alert('Failed to report content: ' + error.message);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length !== files.length) {
      alert('Only images and PDF files are allowed');
    }
    
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const sizeValidFiles = validFiles.filter(file => file.size <= MAX_FILE_SIZE);
    
    if (sizeValidFiles.length !== validFiles.length) {
      alert('Files must be less than 2MB in size');
    }
    
    setReplyFiles(sizeValidFiles);
  };

  const removeFile = (index) => {
    setReplyFiles(files => files.filter((_, i) => i !== index));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const renderReplies = (replies, parentId = null, depth = 0) => {
    if (!Array.isArray(replies)) {
      console.log('Replies is not an array:', replies);
      return null;
    }

    console.log('Rendering replies:', replies.length, 'total replies');

    return replies
      .filter(reply => reply.parentReplyId === parentId)
      .map(reply => (
        <div key={reply._id} className={`reply-item depth-${Math.min(depth, 3)}`}>
          <div className="reply-author">
            <div className="author-avatar">
              {reply.author?.username?.charAt(0) || '👤'}
            </div>
            <div className="author-info">
              <div className="author-name">{reply.author?.username || 'User'}</div>
              <div className="reply-date">{formatDate(reply.createdAt)}</div>
            </div>
          </div>

          <div className="reply-content">
            <p>{reply.content}</p>
            
            {/* Attachments */}
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="reply-attachments">
                {reply.attachments.map((attachment, index) => (
                  <div key={index} className="attachment">
                    {attachment.fileType === 'image' ? (
                      <img 
                        src={attachment.fileUrl} 
                        alt={attachment.fileName} 
                        className="attachment-image" 
                      />
                    ) : (
                      <a 
                        href={attachment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="attachment-pdf"
                      >
                        📄 {attachment.fileName}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="reply-actions">
              <button 
                onClick={() => handleLikeReply(reply._id)}
                className={`action-btn like-btn ${reply.isLiked ? 'active' : ''}`}
              >
                👍 Like ({reply.likes || 0})
              </button>
              
              <button 
                onClick={() => setReplyingTo(reply._id)}
                className="action-btn reply-btn"
              >
                💬 Reply
              </button>
              
              <button 
                onClick={() => handleReport(reply._id, 'reply')}
                className="action-btn report-btn"
              >
                🚨 Report
              </button>
            </div>
          </div>

          {/* Nested replies */}
          {depth < 3 && (
            <div className="nested-replies">
              {renderReplies(replies, reply._id, depth + 1)}
            </div>
          )}
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="topic-detail-container">
        <div className="loading">Loading topic...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail-container">
        <div className="error">Topic not found</div>
      </div>
    );
  }

  console.log('Rendering topic:', topic);
  console.log('Topic replies:', topic.replies);

  return (
    <div className="topic-detail-container">
      {/* Back Button */}
      <button onClick={() => navigate('/forum')} className="back-btn">
        ← Back to Forum
      </button>

      {/* Topic Header */}
      <div className="topic-header">
        <h1>{topic.title}</h1>
        <div className="topic-meta">
          <span className="category">{topic.category}</span>
          <span className="author">by {topic.author?.username || 'User'}</span>
          <span className="date">{formatDate(topic.createdAt)}</span>
          <span className="views">{topic.views || 0} views</span>
        </div>
        
        {topic.tags && topic.tags.length > 0 && (
          <div className="topic-tags">
            {topic.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Topic Content */}
      <div className="topic-content">
        <div className="topic-author">
          <div className="author-avatar large">
            {topic.author?.username?.charAt(0) || '👤'}
          </div>
          <div className="author-info">
            <div className="author-name">{topic.author?.username || 'User'}</div>
            <div className="join-date">
              Joined: {topic.author?.joinDate 
                ? new Date(topic.author.joinDate).toLocaleDateString() 
                : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="topic-text">
          {topic.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Topic Actions */}
        <div className="topic-actions">
          <button 
            onClick={handleLikeTopic}
            className={`action-btn like-btn ${topic.isLiked ? 'active' : ''}`}
          >
            👍 Like ({topic.likes || 0})
          </button>
          
          <button 
            onClick={() => setReplyingTo(null)}
            className="action-btn reply-btn"
          >
            💬 Reply
          </button>
          
          <button 
            onClick={() => handleReport(topic._id, 'topic')}
            className="action-btn report-btn"
          >
            🚨 Report
          </button>
        </div>
      </div>

      {/* Replies Section */}
      <div className="replies-section">
        <h3>Replies ({topic.replies?.length || 0})</h3>
        
        {topic.replies && topic.replies.length > 0 ? (
          <div className="replies-list">
            {renderReplies(topic.replies)}
          </div>
        ) : (
          <div className="no-replies">
            No replies yet. Be the first to reply!
          </div>
        )}
      </div>

      {/* Reply Form */}
      {currentUser && !topic.isLocked && (
        <div className="reply-form">
          <h4>{replyingTo ? 'Reply to Comment' : 'Post a Reply'}</h4>
          
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
          />

          {/* File Upload */}
          <div className="file-upload">
            <label htmlFor="file-input" className="file-label">
              📎 Attach files
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {replyFiles.length > 0 && (
              <div className="selected-files">
                {replyFiles.map((file, index) => (
                  <span key={index} className="file-tag">
                    {file.name}
                    <button onClick={() => removeFile(index)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            {replyingTo && (
              <button 
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                  setReplyFiles([]);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
            <button onClick={handleSubmitReply} className="submit-btn">
              Post Reply
            </button>
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="login-prompt">
          <p>Please <a href="/login">log in</a> to reply to this topic.</p>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="report-modal">
            <h3>Report Content</h3>
            <p>Why are you reporting this content?</p>
            
            <select 
              value={reportReason} 
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              <option value="spam">Spam or advertising</option>
              <option value="offensive">Offensive or inappropriate</option>
              <option value="harmful">Harmful or dangerous</option>
              <option value="misinformation">Misinformation</option>
              <option value="other">Other reason</option>
            </select>

            <div className="modal-actions">
              <button 
                onClick={() => setShowReportModal(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={submitReport} className="submit-btn">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicDetailView;