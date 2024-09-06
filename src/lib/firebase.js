import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-93ac4.firebaseapp.com",
  projectId: "reactchat-93ac4",
  storageBucket: "reactchat-93ac4.appspot.com",
  messagingSenderId: "403327550160",
  appId: "1:403327550160:web:f87db59f2918f3dc7f54d5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()