import ChatList from "./ChatList/ChatList"
import "./List.css"
import UserInfo from "./userinfo/Userinfo"
const List= () => {
    return (
        <div className="list">
        <UserInfo/>
        <ChatList/>
        </div>
    )
}

export default List