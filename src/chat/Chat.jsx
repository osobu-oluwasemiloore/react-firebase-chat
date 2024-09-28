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
import { io } from "socket.io-client";
import { DailingAudio } from "../components/DailingAudio/DailingAudio";
import IncomingCall from "../components/IncomingCall";

const Chat = () => {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [videoStream, setVideoStream] = useState(null);
  const [callReceived, setCallReceived] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [makeCall, setMakeCall] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);

  const typingTimeout = useRef(null);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Add this function to return greeting based on time of day
  const hourGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

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

  const acceptCall = () => {
    setIncomingCall(false);
    setIsCalling(true);
    // Logic to connect the call can be added here
  };

  const declineCall = () => {
    setIncomingCall(false);
    // Logic to notify caller that the call was declined can be added here
  };



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

  const handleCallAudio = async () => {
    setMakeCall(!makeCall);
  };
  const handleCall = async () => {
    setIsCalling(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setVideoStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleEndCall = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop());
      setIsCameraOn(false);
      setIsCalling(false);
    }
  };

  const handleToggleMute = () => {
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const handleToggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = isSpeakerOn;
      setIsSpeakerOn(!isSpeakerOn);
    }
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
          <img src="./phone.png" alt="" onClick={handleCallAudio} />
          <img src="./video.png" alt="" onClick={handleCall} />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.length > 0 ? (
          chat.messages.map((message) => (
            <div
              className={
                message.senderId === currentUser?.id ? "message own" : "message"
              }
              key={message?.createdAt?.toMillis() || Math.random()}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}
                <p>{message.text}</p>
                <span>
                  {message.createdAt
                    ? format(message.createdAt.toDate())
                    : "Time unknown"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
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
          <input
            type="file"
            id="file"
            onChange={handleImg}
            style={{ display: "none" }}
          />
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

      {/* Audio call */}
      {makeCall && (
        <DailingAudio
          name="Kayode"
          visible={makeCall}
          onEnd={() => setMakeCall(false)}
        />
      )}

      {/* Incoming call handling */}
      {incomingCall && (
        <IncomingCall
          username={user.username}
          acceptCall={acceptCall}
          declineCall={declineCall}
        />
      )}

      {/* Video Call Interface */}
      {isCalling && (
        <div className="video-call-container">
          <video ref={videoRef} autoPlay className="local-video" />
          {callReceived && (
            <video ref={remoteVideoRef} autoPlay className="remote-video" />
          )}
          <div className="video-call-controls">
            <button className="end-call-btn" onClick={handleEndCall}>
              End Call
            </button>
            <button className="mute-btn" onClick={handleToggleMute}>
              {isMuted ? "Unmute" : "Mute"}
            </button>
            <button className="speaker-btn" onClick={handleToggleSpeaker}>
              {isSpeakerOn ? "Speaker Off" : "Speaker On"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
