import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

function mapUser(fbUser, role = "user", profile = {}) {
  if (!fbUser) return null;
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? "",
    displayName: fbUser.displayName ?? "",
    role: role ?? "user",
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (!fbUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        const snap = await getDoc(doc(db, "users", fbUser.uid));
        const data = snap.exists() ? snap.data() : null;

        const role = data?.role ?? "user";
        setUser(mapUser(fbUser, role, data ?? {}));
      } catch  {
        // ако Firestore не може да се чете поради rules/мрежа - поне да влезе като user
        setUser(mapUser(fbUser, "user", {}));
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async ({ firstName, lastName, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const displayName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    console.log("REGISTER UID:", cred.user.uid);
    console.log("WRITING TO FIRESTORE users/", cred.user.uid);

    await setDoc(doc(db, "users", cred.user.uid), {
      firstName,
      lastName,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
