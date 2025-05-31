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
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../Auth/firebase';

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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (topicId) {
      console.log('Loading topic:', topicId); // Debug log
      loadTopic();
    }
  }, [topicId]);

  const getAuthorProfile = async (authorId) => {
    let userDoc = await getDoc(doc(db, 'users', authorId));
    if (!userDoc.exists()) {
      userDoc = await getDoc(doc(db, 'doctors', authorId));
    }
    return userDoc.exists() ? userDoc.data() : null;
  };

  const loadTopic = async () => {
    try {
      setLoading(true);
      const result = await fetchTopic(topicId);
      if (result && result.topic) {
        let authorProfile = null;
        if (result.topic.authorId) {
          authorProfile = await getAuthorProfile(result.topic.authorId);
        }
        result.topic.author = authorProfile;
        // Add authorName, authorSpecialty, avatarUrl for convenience
        result.topic.authorName = authorProfile?.username || authorProfile?.name || 'User';
        result.topic.authorSpecialty = authorProfile?.specialty || null;
        result.topic.authorAvatarUrl = authorProfile?.avatarUrl || '';
        // For replies, fetch author profile for each reply
        if (Array.isArray(result.topic.replies)) {
          result.topic.replies = await Promise.all(result.topic.replies.map(async (reply) => {
            let replyAuthorProfile = null;
            if (reply.authorId) {
              replyAuthorProfile = await getAuthorProfile(reply.authorId);
            }
            return {
              ...reply,
              authorName: replyAuthorProfile?.username || replyAuthorProfile?.name || 'User',
              authorSpecialty: replyAuthorProfile?.specialty || null,
              authorAvatarUrl: replyAuthorProfile?.avatarUrl || '',
            };
          }));
        }
        setTopic(result.topic);
      } else {
        setTopic(null);
        alert('Failed to load topic - invalid data structure');
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
      await likeTopic(topicId);
      setTopic(prev => {
        if (!prev) return prev;
        const likes = Array.isArray(prev.likes) ? prev.likes : [];
        const alreadyLiked = likes.includes(currentUser.uid);
        const newLikes = alreadyLiked ? likes.filter(uid => uid !== currentUser.uid) : [...likes, currentUser.uid];
        return {
          ...prev,
          likes: newLikes,
          isLiked: !alreadyLiked
        };
      });
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
      await likeReply(replyId);
      setTopic(prev => {
        if (!prev) return prev;
        const replies = prev.replies.map(reply => {
          if (reply.id === replyId) {
            const likes = Array.isArray(reply.likes) ? reply.likes : [];
            const alreadyLiked = likes.includes(currentUser.uid);
            const newLikes = alreadyLiked ? likes.filter(uid => uid !== currentUser.uid) : [...likes, currentUser.uid];
            return {
              ...reply,
              likes: newLikes,
              isLiked: !alreadyLiked
            };
          }
          return reply;
        });
        return { ...prev, replies };
      });
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
      console.log('Submitting reply:', { topicId, content: replyContent, parentReplyId: replyingTo }); // Debug log
      
      const replyData = {
        content: replyContent.trim(),
        parentReplyId: replyingTo
      };

      let result;
      if (replyFiles.length > 0) {
        console.log('Creating reply with attachments'); // Debug log
        result = await createReplyWithAttachments(topicId, replyData, replyFiles);
      } else {
        console.log('Creating reply without attachments'); // Debug log
        result = await createReply(topicId, replyData);
      }

      console.log('Reply creation result:', result); // Debug log

      // Clear form
      setReplyContent('');
      setReplyFiles([]);
      setReplyingTo(null);
      
      // Reload topic to show new reply
      console.log('Reloading topic after reply submission'); // Debug log
      await loadTopic();
      
      alert('Reply posted successfully!'); // Success feedback
    } catch (error) {
      console.error('Error submitting reply:', error);
      console.error('Error details:', error.response?.data || error.message); // More detailed error
      alert('Failed to submit reply: ' + (error.response?.data?.message || error.message));
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
      console.log('Submitting report:', { itemId: reportItemId, itemType: reportItemType, reason: reportReason }); // Debug log
      await reportContent(reportItemId, reportItemType, reportReason);
      setShowReportModal(false);
      setReportReason('');
      setReportItemId(null);
      setReportItemType(null);
      alert('Content reported successfully');
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

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown';
    let date;
    if (typeof dateValue === 'object' && dateValue.seconds) {
      // Firestore Timestamp
      date = new Date(dateValue.seconds * 1000);
    } else if (typeof dateValue === 'string') {
      // Try to parse as ISO or readable string
      const parsed = Date.parse(dateValue);
      if (!isNaN(parsed)) {
        date = new Date(parsed);
      } else {
        // Try to parse custom format (e.g., "31 May 2025 at 03:13:50 UTC+5:30")
        // Remove "at" and "UTC" for parsing
        const cleaned = dateValue.replace('at', '').replace('UTC', '');
        date = new Date(cleaned);
        if (isNaN(date.getTime())) return dateValue; // fallback: show as is
      }
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
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
  };

  const renderReplies = (replies, parentId = null, depth = 0) => {
    if (!Array.isArray(replies)) {
      console.log('Replies is not an array:', replies); // Debug log
      return null;
    }

    console.log('Rendering replies:', replies.length, 'total replies'); // Debug log

    return replies
      .filter(reply => reply.parentReplyId === parentId)
      .map(reply => {
        console.log('Rendering reply:', reply);
        console.log('authorName found (reply):', !!reply.authorName, 'Value:', reply.authorName);
        console.log('authorSpecialty found (reply):', !!reply.authorSpecialty, 'Value:', reply.authorSpecialty);
        console.log('createdAt found (reply):', !!reply.createdAt, 'Value:', reply.createdAt);
        return (
          <div key={reply.id} className={`reply-item depth-${depth}`}>
            <div className="reply-author">
              <div className="author-avatar">
                {reply.authorAvatarUrl
                  ? <img src={reply.authorAvatarUrl} alt={reply.authorName} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  : (reply.authorName?.charAt(0) || '👤')}
              </div>
              <div className="author-info">
                <div className="author-name">
                  {reply.authorSpecialty
                    ? <>Dr. {reply.authorName} <span className="author-specialty">• {reply.authorSpecialty}</span></>
                    : <>{reply.authorName}</>}
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
                  onClick={() => handleLikeReply(reply.id)}
                  className={`action-btn like-btn ${reply.isLiked ? 'active' : ''}`}
                >
                   Like ({reply.likes?.length || 0})
                </button>
                
                <button 
                  onClick={() => setReplyingTo(reply.id)}
                  className="action-btn reply-btn"
                >
                  💬 Reply
                </button>
                
                <button 
                  onClick={() => handleReport(reply.id, 'reply')}
                  className="action-btn report-btn"
                >
                  🚨 Report
                </button>
              </div>
            </div>

            {/* Nested replies */}
            <div className="nested-replies">
              {renderReplies(replies, reply.id, depth + 1)}
            </div>
          </div>
        );
      });
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
  console.log('authorName found (topic):', !!topic.authorName, 'Value:', topic.authorName);
  console.log('authorSpecialty found (topic):', !!topic.authorSpecialty, 'Value:', topic.authorSpecialty);
  console.log('createdAt found (topic):', !!topic.createdAt, 'Value:', topic.createdAt);
  console.log('Rendering topic replies:', topic.replies);

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
            {topic.authorSpecialty
              ? <>by Dr. {topic.authorName} <span className="author-specialty">• {topic.authorSpecialty}</span></>
              : <>by {topic.authorName}</>}
          </span>
          <span className="date">{formatDate(topic.createdAt)}</span>
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
            {topic.authorAvatarUrl
              ? <img src={topic.authorAvatarUrl} alt={topic.authorName} style={{ width: 60, height: 60, borderRadius: '50%' }} />
              : (topic.authorName?.charAt(0) || '👤')}
          </div>
          <div className="author-info">
            <div className="author-name">
              {topic.authorSpecialty
                ? <>Dr. {topic.authorName} <span className="author-specialty">• {topic.authorSpecialty}</span></>
                : <>{topic.authorName}</>}
            </div>
            <div className="join-date">
              Joined: {topic.author?.createdAt
                ? formatDate(topic.author.createdAt)
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
          >
            👍 Like ({topic.likes?.length || 0})
          </button>
          
          <button 
            onClick={() => setReplyingTo(null)}
            className="action-btn reply-btn"
          >
            💬 Reply
          </button>
          
          <button 
            onClick={() => handleReport(topic.id, 'topic')}
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