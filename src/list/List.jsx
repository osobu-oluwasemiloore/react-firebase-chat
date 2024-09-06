import "./List.css"
import UserInfo from "./userinfo/Userinfo"
import ChatList from "./chatList/chatList"
const List= () => {
    return (
        <div className="list">
        <UserInfo/>
        <ChatList/>
        </div>
    )
}

export default List