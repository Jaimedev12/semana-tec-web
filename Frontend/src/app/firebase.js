import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfClCsEkZKJLyrzTG5cpJlkulkxdpO0mQ",
  authDomain: "semana-tec-web.firebaseapp.com",
  projectId: "semana-tec-web",
  storageBucket: "semana-tec-web.appspot.com",
  messagingSenderId: "381554472293",
  appId: "1:381554472293:web:a51271cf35bf749512dd8c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Functions
const auth = getAuth(app);
const functions = getFunctions(app);

export { app, auth, functions };