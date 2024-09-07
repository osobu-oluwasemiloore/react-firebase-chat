import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar({
        file,
        url: URL.createObjectURL(file),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toLowerCase();
    const email = formData.get("email")?.toLowerCase();
    const password = formData.get("password");

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = avatar.file ? await upload(avatar.file) : "";

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chat: [],
      });

      toast.success("Account created! You can log in now!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingLogin(true);


    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");


    try{
        await signInWithEmailAndPassword(auth,email,password);
    }catch(err){
        console.log(err);
        toast.error(err.message);
    }

    finally{
      setLoadingLogin(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" required />
          <input type="password" placeholder="Password" name="password" required />
          <button type="submit" disabled={loadingLogin}>{loadingLogin ? "Loading" :"Sign In"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="Avatar Preview" />
            Upload an image
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
          <input type="text" placeholder="Username" name="username" required />
          <input type="email" placeholder="Email" name="email" required />
          <input type="password" placeholder="Password" name="password" required />
          <button type="submit" disabled={loading}>{loading ? "Loading" :"Sign Up"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
