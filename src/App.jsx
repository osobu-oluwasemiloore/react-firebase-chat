import { useEffect, useState } from "react";  // Make sure useState is imported
import Chat from "./chat/Chat";
import Detail from "./detail/Detail";
import List from "./list/List";
import Login from "./detail/login/Login";
import Notification from "./notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import { Mobile } from "./components/mobile/Mobile";
import "./responsive.css";



const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);  // Declare state to detect mobile devices

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  useEffect(() => {
    const checkIfMobile = () => {
      if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        setIsMobile(true);  // Set state to true if user is on a mobile device
      }
    };

    checkIfMobile();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading....</div>;
  }

  if (isMobile) {
    return (
      <Mobile />
    );
  }
  

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
