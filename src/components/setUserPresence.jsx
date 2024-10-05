import { auth, db } from '../lib/firebase'; // Import Firestore and Realtime Database
import { ref, onDisconnect, set, serverTimestamp, onValue, getDatabase } from 'firebase/database'; // Realtime Database functions
import { doc, updateDoc } from 'firebase/firestore'; // Firestore functions

export const setUserPresence = () => {
  const user = auth.currentUser;
  const realtimeDb = getDatabase();

  if (user) {
    const userStatusDatabaseRef = ref(realtimeDb, `/status/${user.uid}`);
    const userDoc = doc(db, 'users', user.uid);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: serverTimestamp(),
    };

    const connectedRef = ref(realtimeDb, '.info/connected');
    
    // Use onValue instead of .on()
    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        return;
      }

      // When the connection is lost, set the user as offline
      onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        // When connected, set the user as online
        set(userStatusDatabaseRef, isOnlineForDatabase);
      });
    });

    // Update Firestore with the user's online status
    updateDoc(userDoc, {
      online: true,
    });

    // On window close or tab close, set the user as offline
    window.addEventListener('beforeunload', () => {
      set(userStatusDatabaseRef, isOfflineForDatabase);
      updateDoc(userDoc, { online: false, lastSeen: new Date() });
    });
  }
};
