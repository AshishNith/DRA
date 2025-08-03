import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  import { onAuthStateChanged, signOut, User } from "firebase/auth";
  import { auth } from "./firebase";
  
  // Updated interface with `user`, `isLoading`, `isAdmin`, and `setUser`
  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    setUser: (user: User | null) => void;
    signOut: () => Promise<void>;
  }
  
  const AuthContext = createContext<AuthContextType | null>(null);
  
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        
        // Check if user is admin based on email or custom claims
        if (user?.email) {
          // You can customize this logic based on your admin identification method
          const adminEmails = ['admin@company.com', 'admin@draipl.com','23bme025@nith.ac.in'];
          setIsAdmin(adminEmails.includes(user.email));
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    return (
        <AuthContext.Provider value={{ user, isLoading, isAdmin, setUser, signOut: () => signOut(auth) }}>

        {children}
      </AuthContext.Provider>
    );
  };
  
  export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  };
