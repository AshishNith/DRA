import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    UserCredential
  } from "firebase/auth";
  
  import { auth } from "./firebase";
  
  // Sign up user with email and password
  export const doCreateUserWithEmailAndPass = (email: string, password: string): Promise<UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  // Log in user with email and password
  export const doSignInWithEmailAndPass = (email: string, password: string): Promise<UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  // Sign out current user
  export const doSignOut = (): Promise<void> => {
    return signOut(auth);
  };
  
  // Send password reset email
  export const doPasswordReset = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  };
  
  // Google Sign-In
  const googleProvider = new GoogleAuthProvider();
  export const doSignInWithGoogle = (): Promise<UserCredential> => {
    return signInWithPopup(auth, googleProvider);
  };
  