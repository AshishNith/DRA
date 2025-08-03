import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDbfzHUvmEGiJGqYSo7VXuJtNiAmyWGlxg",
    authDomain: "goran-vault.firebaseapp.com",
    projectId: "goran-vault",
    storageBucket: "goran-vault.firebasestorage.app",
    messagingSenderId: "599186614639",
    appId: "1:599186614639:web:3e8d8c626bcd66cecd209a",
    measurementId: "G-SR9D0XWVR1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


