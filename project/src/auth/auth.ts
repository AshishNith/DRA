import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  fetchSignInMethodsForEmail,
  UserCredential,
} from "firebase/auth";

import { auth } from "./firebase";

// Sign up user with email and password
export const doCreateUserWithEmailAndPass = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Log in user with email and password
export const doSignInWithEmailAndPass = (
  email: string,
  password: string
): Promise<UserCredential> => {
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

// Google Sign-In with account linking logic
const googleProvider = new GoogleAuthProvider();

export const doSignInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Try signing in with Google
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    // If the email is already used with a different provider (like password)
    if (error.code === "auth/account-exists-with-different-credential") {
      const pendingCred = GoogleAuthProvider.credentialFromError(error);
      const email = error.customData?.email;

      if (!email) throw error;
      if (!pendingCred) throw new Error("Unable to retrieve credentials for account linking.");

      const methods = await fetchSignInMethodsForEmail(auth, email);

      if (methods.includes("password")) {
        // Prompt for password to sign in with existing email/password account
        const password = prompt(
          `An account already exists with this email (${email}). Please enter your password to link it with Google.`
        );

        if (!password) throw new Error("Password is required to link accounts.");

        // Sign in with email/password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Link the Google credentials to the existing account
        await linkWithCredential(userCredential.user, pendingCred);

        return userCredential;
      } else {
        throw new Error("This email is already used with a different sign-in method.");
      }
    } else {
      throw error;
    }
  }
};
