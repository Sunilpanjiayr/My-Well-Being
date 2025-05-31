import { db, storage, auth } from '../../../Auth/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  getCountFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- FORMAT DATE ---
const formatDate = (dateValue) => {
  if (!dateValue) return 'Unknown';
  let date;
  if (typeof dateValue === 'object' && dateValue.seconds) {
    date = new Date(dateValue.seconds * 1000);
  } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
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

// --- TOPICS ---
export const fetchTopics = async ({ category, sort, search, view, pageSize = 20, lastDoc = null } = {}) => {
  try {
    let constraints = [];
    if (category) constraints.push(where('category', '==', category));
    if (search) constraints.push(where('keywords', 'array-contains', search.toLowerCase()));
    if (sort === 'newest') constraints.push(orderBy('createdAt', 'desc'));
    else if (sort === 'popular') constraints.push(orderBy('replyCount', 'desc'));
    else constraints.push(orderBy('createdAt', 'desc'));
    if (lastDoc) constraints.push(startAfter(lastDoc));
    constraints.push(limit(pageSize));
    const q = query(collection(db, 'topics'), ...constraints);
    const snapshot = await getDocs(q);
    const topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { topics };
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};

export const fetchTopic = async (topicId) => {
  try {
    const topicRef = doc(db, 'topics', topicId);
    const topicSnap = await getDoc(topicRef);
    if (!topicSnap.exists()) throw new Error('Topic not found');
    const topicData = { id: topicSnap.id, ...topicSnap.data() };

    // Fetch author profile (users or doctors)
    let authorProfile = null;
    if (topicData.authorId) {
      let userDoc = await getDoc(doc(db, 'users', topicData.authorId));
      if (!userDoc.exists()) {
        userDoc = await getDoc(doc(db, 'doctors', topicData.authorId));
      }
      if (userDoc.exists()) {
        authorProfile = userDoc.data();
      }
    }
    topicData.author = authorProfile;

    // Fetch replies
    const repliesRef = collection(db, 'replies');
    const repliesQuery = query(repliesRef, where('topicId', '==', topicId), orderBy('createdAt', 'asc'));
    const repliesSnap = await getDocs(repliesQuery);
    const replies = repliesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { topic: { ...topicData, replies } };
  } catch (error) {
    console.error('Error fetching topic:', error);
    throw error;
  }
};

export const createTopic = async (topicData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    // Fetch specialty if available (optional, adjust as needed)
    let authorSpecialty = null;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().specialty) {
      authorSpecialty = userDoc.data().specialty;
    }
    const docRef = await addDoc(collection(db, 'topics'), {
      ...topicData,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      authorSpecialty,
      createdAt: serverTimestamp(),
      likes: [],
      replyCount: 0,
      bookmarks: [],
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

export const updateTopic = async (topicId, topicData) => {
  try {
    await updateDoc(doc(db, 'topics', topicId), topicData);
    return { success: true };
  } catch (error) {
    console.error('Error updating topic:', error);
    throw error;
  }
};

export const deleteTopic = async (topicId) => {
  try {
    await deleteDoc(doc(db, 'topics', topicId));
    // Delete all replies for this topic
    const repliesQuery = query(collection(db, 'replies'), where('topicId', '==', topicId));
    const repliesSnap = await getDocs(repliesQuery);
    const batch = db.batch();
    repliesSnap.forEach(replyDoc => batch.delete(replyDoc.ref));
    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error deleting topic:', error);
    throw error;
  }
};

// --- REPLIES ---
export const createReply = async (topicId, replyData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    // Fetch specialty if available (optional, adjust as needed)
    let authorSpecialty = null;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().specialty) {
      authorSpecialty = userDoc.data().specialty;
    }
    const docRef = await addDoc(collection(db, 'replies'), {
      ...replyData,
      topicId,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      authorSpecialty,
      createdAt: serverTimestamp(),
      likes: [],
      attachments: replyData.attachments || [],
    });
    // Increment reply count on topic
    await updateDoc(doc(db, 'topics', topicId), { replyCount: increment(1) });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
};

export const likeReply = async (replyId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const replyRef = doc(db, 'replies', replyId);
    const replySnap = await getDoc(replyRef);
    const likes = replySnap.data().likes || [];
    const alreadyLiked = likes.includes(user.uid);
    await updateDoc(replyRef, {
      likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    return { isLiked: !alreadyLiked };
  } catch (error) {
    console.error('Error liking reply:', error);
    throw error;
  }
};

export const updateReplyWithAttachments = async (replyId, replyData, files, existingAttachments = []) => {
  try {
    const attachments = [...existingAttachments];
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
    await updateDoc(doc(db, 'replies', replyId), {
      ...replyData,
      attachments
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating reply with attachments:', error);
    throw error;
  }
};

// --- LIKES & BOOKMARKS ---
export const likeTopic = async (topicId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const topicRef = doc(db, 'topics', topicId);
    const topicSnap = await getDoc(topicRef);
    const likes = topicSnap.data().likes || [];
    const alreadyLiked = likes.includes(user.uid);
    await updateDoc(topicRef, {
      likes: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
    });
    return { isLiked: !alreadyLiked };
  } catch (error) {
    console.error('Error liking topic:', error);
    throw error;
  }
};

export const toggleBookmark = async (topicId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');

  // Try users collection first
  let userRef = doc(db, 'users', user.uid);
  let userSnap = await getDoc(userRef);

  // If not found, try doctors collection
  if (!userSnap.exists()) {
    userRef = doc(db, 'doctors', user.uid);
    userSnap = await getDoc(userRef);
  }

  if (!userSnap.exists()) {
    throw new Error('User profile not found');
  }

  const data = userSnap.data();
  let bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
  let isBookmarked;

  if (bookmarks.includes(topicId)) {
    bookmarks = bookmarks.filter(id => id !== topicId);
    isBookmarked = false;
  } else {
    bookmarks.push(topicId);
    isBookmarked = true;
  }

  await updateDoc(userRef, { bookmarks });
  return { isBookmarked, bookmarks };
};

export const getUserBookmarks = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  let userRef = doc(db, 'users', user.uid);
  let userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    userRef = doc(db, 'doctors', user.uid);
    userSnap = await getDoc(userRef);
  }
  if (!userSnap.exists()) return [];
  const data = userSnap.data();
  return Array.isArray(data.bookmarks) ? data.bookmarks : [];
};

// --- USER TOPICS ---
export const getUserTopics = async () => {
  const user = auth.currentUser;
  if (!user) return [];
  const q = query(collection(db, 'topics'), where('authorId', '==', user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// --- REPORTS ---
export const reportContent = async (itemId, itemType, reason) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    await addDoc(collection(db, 'reports'), {
      itemId,
      itemType,
      reason,
      reportedBy: user.uid,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error reporting content:', error);
    throw error;
  }
};

// --- FORUM STATS ---
export const getForumStats = async () => {
  try {
    const topicsCount = (await getCountFromServer(collection(db, 'topics'))).data().count;
    const postsCount = (await getCountFromServer(collection(db, 'replies'))).data().count;
    const membersCount = (await getCountFromServer(collection(db, 'users'))).data().count;
    // Get newest member
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(1));
    const usersSnap = await getDocs(usersQuery);
    const newestMember = usersSnap.docs.length > 0 ? usersSnap.docs[0].data().username : null;
    return { topicsCount, postsCount, membersCount, newestMember };
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

// --- FILE UPLOADS ---
export const uploadFile = async (file, path) => {
  try {
    const fileRef = ref(storage, path);
    const snapshot = await uploadBytes(fileRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// --- REPLIES WITH ATTACHMENTS ---
export const createReplyWithAttachments = async (topicId, replyData, files) => {
  try {
    const attachments = [];
    for (const file of files) {
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
    return await createReply(topicId, { ...replyData, attachments });
  } catch (error) {
    console.error('Error creating reply with attachments:', error);
    throw error;
  }
};