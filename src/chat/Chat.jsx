import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";
import { format } from "timeago.js";
import { BsFillPinAngleFill } from "react-icons/bs";



const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    if (chat?.messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
      setChat(chatData);

      
      if (chatData?.typing?.[user.id]) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unSub();
    };
  }, [chatId, user.id]);

  
  const handleTyping = () => {
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    
    updateDoc(doc(db, "chats", chatId), {
      [`typing.${currentUser.id}`]: true,
    });

    
    typingTimeout.current = setTimeout(() => {
      updateDoc(doc(db, "chats", chatId), {
        [`typing.${currentUser.id}`]: false,
      });
    }, 3000);
  };

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          reactions: [],
          pinned: false, 
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      
      await updateDoc(doc(db, "chats", chatId), {
        [`typing.${currentUser.id}`]: false,
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex > -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });
    } catch (err) {
      console.log("Error sending message:", err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  
  const handleReaction = async (messageId, emoji) => {
    const messageRef = doc(db, "chats", chatId);
    const messageSnapshot = await getDoc(messageRef);
    const chatData = messageSnapshot.data();

    const updatedMessages = chatData.messages.map((msg) => {
      if (msg.createdAt?.toMillis() === messageId) {
        const existingReactionIndex = msg.reactions.findIndex(
          (r) => r.userId === currentUser.id
        );
        if (existingReactionIndex > -1) {
          
          msg.reactions[existingReactionIndex].emoji = emoji;
        } else {
          
          msg.reactions.push({ userId: currentUser.id, emoji });
        }
      }
      return msg;
    });

    await updateDoc(messageRef, { messages: updatedMessages });
  };

  const handlePin = async (messageId) => {
    const messageRef = doc(db, "chats", chatId);
    const messageSnapshot = await getDoc(messageRef);
    const chatData = messageSnapshot.data();
    
    const updatedMessages = chatData.messages.map((msg) => {
      if (msg.createdAt?.toMillis() === messageId) {
        msg.pinned = !msg.pinned;
      }
      return msg;
    });

    await updateDoc(messageRef, { messages: updatedMessages });
  };

  const hourOfTheDay = ["morning", "afternoon", "evening"];

  const hourGreeting = () => {
    const d = new Date().getHours();
    if (d >= 0 && d < 12) return hourOfTheDay[0];
    if (d >= 12 && d < 16) return hourOfTheDay[1];
    if (d >= 16 && d <= 23) return hourOfTheDay[2];
    return "Day";
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{`Hi 🖐 Good ${hourGreeting()} ${user?.username}!`}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.length > 0 ? (
          chat.messages.map((message) => (
            <div
              className={message.senderId === currentUser?.id ? "message own" : "message"}
              key={message?.createdAt?.toMillis() || Math.random()}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                <span>
                  {message.createdAt ? format(message.createdAt.toDate()) : "Time unknown"}
                </span>
              </div>

              <div className="pin-icon" onClick={() => handlePin(message.createdAt.toMillis())}>
                <BsFillPinAngleFill color={message.pinned? "#fff": "#808b96"} />
              </div>

              <div className="reactions">
                {message.reactions?.map((reaction) => (
                  <span key={reaction.userId}>{reaction.emoji}</span>
                ))}
              </div>
              <div className="reaction-buttons">
                <button onClick={() => handleReaction(message.createdAt.toMillis(), "❤️")}>
                  ❤️
                </button>
                <button onClick={() => handleReaction(message.createdAt.toMillis(), "👍")}>
                  👍
                </button>
                <button onClick={() => handleReaction(message.createdAt.toMillis(), "😂")}>
                  😂
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        {isTyping && (
          <div className="typing-indicator">
            {user?.username} is typing...
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          onInput={handleTyping}
          placeholder="Type a message..."
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          {open && <EmojiPicker onEmojiClick={handleEmoji} />}
        </div>
        <div className="icons">
          <input type="file" id="file" onChange={handleImg} style={{ display: "none" }} />
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
          <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
          <button
            className="sendButton"
            onClick={handleSend}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
