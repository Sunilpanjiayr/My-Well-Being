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
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyFiles, setReplyFiles] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportItemId, setReportItemId] = useState(null);
  const [reportItemType, setReportItemType] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (topicId && topicId !== 'undefined') {
      console.log('🔗 Loading topic:', topicId);
      loadTopic();
    } else {
      console.error('❌ Invalid topic ID:', topicId);
      navigate('/forum');
    }
  }, [topicId, navigate]);

  const loadTopic = async () => {
    try {
      setLoading(true);
      console.log('📖 Fetching topic data for ID:', topicId);
      
      const result = await fetchTopic(topicId);
      console.log('📖 Topic fetch result:', result);
      
      if (result && result.topic) {
        console.log('✅ Topic loaded successfully');
        console.log('📊 Topic data:', {
          id: result.topic.id || result.topic._id,
          title: result.topic.title,
          repliesCount: result.topic.replies?.length || 0
        });
        setTopic(result.topic);
      } else {
        console.error('❌ Invalid topic data structure:', result);
        alert('Failed to load topic - invalid data structure');
        navigate('/forum');
      }
    } catch (error) {
      console.error('❌ Error loading topic:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        alert('Topic not found');
      } else if (error.response?.status === 401) {
        alert('Please log in to view this topic');
      } else {
        alert('Failed to load topic: ' + (error.response?.data?.message || error.message));
      }
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

    if (!topicId || topicId === 'undefined') {
      console.error('❌ Invalid topic ID for like:', topicId);
      return;
    }

    try {
      console.log('👍 Liking topic:', topicId);
      const result = await likeTopic(topicId);
      console.log('👍 Like result:', result);
      
      if (result && result.success) {
        setTopic(prev => ({
          ...prev,
          likes: result.likes,
          isLiked: result.isLiked
        }));
        console.log('✅ Topic like updated');
      }
    } catch (error) {
      console.error('❌ Error liking topic:', error);
      alert('Failed to like topic: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!currentUser) {
      alert('Please log in to like replies');
      return;
    }

    if (!replyId || replyId === 'undefined') {
      console.error('❌ Invalid reply ID for like:', replyId);
      return;
    }

    try {
      console.log('👍 Liking reply:', replyId);
      
      // For replies, we need to pass the topicId and replyId to the backend
      const result = await likeReply(replyId, { topicId });
      console.log('👍 Reply like result:', result);
      
      if (result && result.success) {
        setTopic(prev => ({
          ...prev,
          replies: prev.replies.map(reply => 
            (reply.id || reply._id) === replyId 
              ? { ...reply, likes: result.likes, isLiked: result.isLiked }
              : reply
          )
        }));
        console.log('✅ Reply like updated');
      }
    } catch (error) {
      console.error('❌ Error liking reply:', error);
      alert('Failed to like reply: ' + (error.response?.data?.message || error.message));
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

    if (!topicId || topicId === 'undefined') {
      console.error('❌ Invalid topic ID for reply:', topicId);
      alert('Invalid topic ID');
      return;
    }

    try {
      setReplyLoading(true);
      console.log('💬 Submitting reply:', { 
        topicId, 
        content: replyContent.substring(0, 50) + '...', 
        parentReplyId: replyingTo,
        filesCount: replyFiles.length 
      });
      
      const replyData = {
        content: replyContent.trim(),
        parentReplyId: replyingTo || null
      };

      let result;
      if (replyFiles.length > 0) {
        console.log('💬 Creating reply with attachments');
        result = await createReplyWithAttachments(topicId, replyData, replyFiles);
      } else {
        console.log('💬 Creating reply without attachments');
        result = await createReply(topicId, replyData);
      }

      console.log('💬 Reply creation result:', result);

      if (result && result.success) {
        console.log('✅ Reply created successfully');
        
        // Clear form
        setReplyContent('');
        setReplyFiles([]);
        setReplyingTo(null);
        
        // Reload topic to show new reply
        console.log('🔄 Reloading topic to show new reply');
        await loadTopic();
        
        alert('Reply posted successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('❌ Error submitting reply:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      alert('Failed to submit reply: ' + (error.response?.data?.message || error.message));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleReport = async (itemId, itemType) => {
    if (!currentUser) {
      alert('Please log in to report content');
      return;
    }

    if (!itemId || itemId === 'undefined') {
      console.error('❌ Invalid item ID for report:', itemId);
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
      console.log('🚨 Submitting report:', { 
        itemId: reportItemId, 
        itemType: reportItemType, 
        reason: reportReason 
      });
      
      const result = await reportContent(reportItemId, reportItemType, reportReason);
      console.log('🚨 Report result:', result);
      
      if (result && result.success) {
        setShowReportModal(false);
        setReportReason('');
        setReportItemId(null);
        setReportItemType(null);
        alert('Content reported successfully');
      }
    } catch (error) {
      console.error('❌ Error reporting content:', error);
      alert('Failed to report content: ' + (error.response?.data?.message || error.message));
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
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Unknown';
      }
      
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const renderReplies = (replies, parentId = null, depth = 0) => {
    if (!Array.isArray(replies)) {
      console.log('⚠️ Replies is not an array:', replies);
      return null;
    }

    console.log(`📝 Rendering replies at depth ${depth}:`, replies.length, 'total replies');

    return replies
      .filter(reply => {
        // Handle both null and undefined parentReplyId
        const replyParentId = reply.parentReplyId === null ? null : reply.parentReplyId;
        return replyParentId === parentId;
      })
      .map(reply => {
        const replyId = reply.id || reply._id;
        
        if (!replyId) {
          console.error('❌ Reply missing ID:', reply);
          return null;
        }

        return (
          <div key={replyId} className={`reply-item depth-${depth}`}>
            <div className="reply-author">
              <div className="author-avatar">
                {reply.author?.avatarUrl ? (
                  <img src={reply.author.avatarUrl} alt={reply.author.username} />
                ) : (
                  reply.author?.username?.charAt(0) || '👤'
                )}
              </div>
              <div className="author-info">
                <div className="author-name">
                  {reply.author?.specialty
                    ? <>Dr. {reply.author.username} <span className="author-specialty">• {reply.author.specialty}</span></>
                    : <>{reply.author?.username || 'User'}</>
                  }
                </div>
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
                  onClick={() => handleLikeReply(replyId)}
                  className={`action-btn like-btn ${reply.isLiked ? 'active' : ''}`}
                  disabled={!currentUser}
                >
                  👍 Like ({reply.likes || 0})
                </button>
                
                <button 
                  onClick={() => {
                    setReplyingTo(replyId);
                    // Scroll to reply form
                    const replyForm = document.querySelector('.reply-form');
                    if (replyForm) {
                      replyForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="action-btn reply-btn"
                  disabled={!currentUser}
                >
                  💬 Reply
                </button>
                
                <button 
                  onClick={() => handleReport(replyId, 'reply')}
                  className="action-btn report-btn"
                  disabled={!currentUser}
                >
                  🚨 Report
                </button>
              </div>
            </div>

            {/* Nested replies */}
            {depth < 3 && ( // Limit nesting depth to prevent UI issues
              <div className="nested-replies">
                {renderReplies(replies, replyId, depth + 1)}
              </div>
            )}
          </div>
        );
      })
      .filter(Boolean); // Remove null entries
  };

  if (loading) {
    return (
      <div className="topic-detail-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading topic...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="topic-detail-container">
        <div className="error">
          <h2>Topic not found</h2>
          <p>The topic you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/forum')} className="back-btn">
            ← Back to Forum
          </button>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering topic:', topic.title);
  console.log('📝 Topic replies:', topic.replies?.length || 0);

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
          <span className="author">
            {topic.author?.specialty
              ? <>by Dr. {topic.author.username} <span className="author-specialty">• {topic.author.specialty}</span></>
              : <>by {topic.author?.username || 'User'}</>
            }
          </span>
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
            {topic.author?.avatarUrl ? (
              <img src={topic.author.avatarUrl} alt={topic.author.username} />
            ) : (
              topic.author?.username?.charAt(0) || '👤'
            )}
          </div>
          <div className="author-info">
            <div className="author-name">
              {topic.author?.specialty
                ? <>Dr. {topic.author.username} <span className="author-specialty">• {topic.author.specialty}</span></>
                : <>{topic.author?.username || 'User'}</>
              }
            </div>
            <div className="join-date">
              Joined: {topic.author?.joinDate 
                ? formatDate(topic.author.joinDate)
                : 'Unknown'}
            </div>
          </div>
        </div>

        <div className="topic-text">
          <p>{topic.content}</p>
        </div>

        {/* Topic Actions */}
        <div className="topic-actions">
          <button 
            onClick={handleLikeTopic}
            className={`action-btn like-btn ${topic.isLiked ? 'active' : ''}`}
            disabled={!currentUser}
          >
            👍 Like ({topic.likes || 0})
          </button>
          
          <button 
            onClick={() => {
              setReplyingTo(null);
              // Scroll to reply form
              const replyForm = document.querySelector('.reply-form');
              if (replyForm) {
                replyForm.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="action-btn reply-btn"
            disabled={!currentUser}
          >
            💬 Reply
          </button>
          
          <button 
            onClick={() => handleReport(topic.id || topic._id, 'topic')}
            className="action-btn report-btn"
            disabled={!currentUser}
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
          <h4>
            {replyingTo ? (
              <>
                Reply to Comment
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="cancel-reply-to"
                  style={{ marginLeft: '10px', fontSize: '12px' }}
                >
                  (Cancel)
                </button>
              </>
            ) : 'Post a Reply'}
          </h4>
          
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            rows={4}
            disabled={replyLoading}
          />

          {/* File Upload */}
          <div className="file-upload">
            <label htmlFor="file-input" className="file-label">
              📎 Attach files (images or PDFs, max 2MB each)
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={replyLoading}
            />
            
            {replyFiles.length > 0 && (
              <div className="selected-files">
                {replyFiles.map((file, index) => (
                  <span key={index} className="file-tag">
                    {file.name}
                    <button 
                      onClick={() => removeFile(index)}
                      disabled={replyLoading}
                    >
                      ×
                    </button>
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
                disabled={replyLoading}
              >
                Cancel Reply
              </button>
            )}
            <button 
              onClick={handleSubmitReply} 
              className="submit-btn"
              disabled={!replyContent.trim() || replyLoading}
            >
              {replyLoading ? 'Posting...' : 'Post Reply'}
            </button>
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="login-prompt">
          <p>Please <a href="/login">log in</a> to reply to this topic.</p>
        </div>
      )}

      {topic.isLocked && (
        <div className="locked-notice">
          <p>🔒 This topic has been locked and no longer accepts new replies.</p>
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
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportItemId(null);
                  setReportItemType(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={submitReport} 
                className="submit-btn"
                disabled={!reportReason.trim()}
              >
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