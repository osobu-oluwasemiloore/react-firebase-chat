import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Import Firestore Timestamp

const ChatUserStatus = ({ userId }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!userId) return;

    // Firestore reference to the user document
    const userRef = doc(db, 'users', userId);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        console.log("User Data:", userData); // Debugging output to check data

        // Update online status
        setIsOnline(userData.online);

        // Check if last_changed is a Firestore Timestamp and convert it to a Date
        const lastChangedTimestamp = userData.last_changed;
        if (lastChangedTimestamp instanceof Timestamp) {
          setLastSeen(lastChangedTimestamp.toDate());
        } else {
          setLastSeen(null); // Handle invalid last_changed data
        }
      } else {
        console.log('No such document!');
      }
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      {isOnline ? (
        <span style={{ color: 'green' }}>Online</span>
      ) : (
        <span style={{ color: 'gray' }}>
          Last seen: {lastSeen ? lastSeen.toLocaleString() : 'Offline'}
        </span>
      )}
    </div>
  );
};

export default ChatUserStatus;
