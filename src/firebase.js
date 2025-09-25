import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBm0Zsi4mmfe6zYi2ZdfWW4aFWebqWhvvU",
  authDomain: "sk-score.firebaseapp.com",
  projectId: "sk-score",
  storageBucket: "sk-score.firebasestorage.app",
  messagingSenderId: "621434679463",
  appId: "1:621434679463:web:706b28a1b57ed4e182eb82",
  measurementId: "G-DZM9MQ4GVN",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
