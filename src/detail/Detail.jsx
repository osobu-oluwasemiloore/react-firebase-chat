import { arrayRemove, arrayUnion, updateDoc, doc } from "firebase/firestore";
import { useChatStore } from "../lib/chatStore";
import { auth, db } from "../lib/firebase";
import { useUserStore } from "../lib/userStore";
import "./detail.css"

const Detail = () => {
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = 
    useChatStore();
      const { currentUser } = useUserStore();

    const handleBlock = async ()=>{
        if(!user) return;

        const userDocRef = doc(db,"users", currentUser.id);

        try{
            await updateDoc(userDocRef,{
                blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            });
            changeBlock()
        }catch(err){
            console.log(err)
        }
    }

    
const hourOfTheDay = ["morning", "afternoon", "evening"];

const hourGreeting = () => {
  const d = new Date().getHours();
  if (d >= 0 && d < 12) return hourOfTheDay[0]; // Morning: 12 AM to 11:59 AM
  if (d >= 12 && d < 16) return hourOfTheDay[1]; // Afternoon: 12 PM to 3:59 PM
  if (d >= 16 && d <= 23) return hourOfTheDay[2]; // Evening: 4 PM to 11:59 PM
  return "Day"; // Default case
};

    return (
        <div className="detail">
            <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                <h2>{user?.username}</h2>
                <p>{`Hi 🖐 Good ${hourGreeting()} ${user?.username}!`}</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Settings</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & help</span>
                        <img src="./arrowUp.png" alt="" />
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared photos</span>
                        <img src="./arrowDown.png" alt="" />
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                              <img src="./car.png" alt="" />
                              <span>photo_2024_2.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                              <img src="./car.png" alt="" />
                              <span>photo_2024_2.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                              <img src="./car.png" alt="" />
                              <span>photo_2024_2.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon" />
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                              <img src="./car.png" alt="" />
                              <span>photo_2024_2.png</span>
                            </div>
                            <img src="./download.png" alt="" className="icon" />
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Shared Files</span>
                        <img src="./arrowUp.png" alt="" className="icon" />
                    </div>
                </div>
                <button onClick={handleBlock}>{
                 
                 isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked" : "Blocked User"
                    
                    }</button>
                <button className="logout" onClick={()=>auth.signOut()}>Logout</button>
            </div>
        </div>
    )
}

export default Detail;