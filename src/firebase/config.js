import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBUdTS82uwMve8frgYEmBgaNi2HlKhbjSA",
  authDomain: "your-daily-app-cce9e.firebaseapp.com",
  projectId: "your-daily-app-cce9e",
  storageBucket: "your-daily-app-cce9e.firebasestorage.app",
  messagingSenderId: "698209031873",
  appId: "1:698209031873:web:2c8049fbfeb9fe44a06640"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);