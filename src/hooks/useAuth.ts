import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";

// รายชื่ออีเมลที่เป็น Admin (ระบุเพิ่มได้ตรงนี้ครับ)
const ADMIN_EMAILS = ["admin1@rbru.ac.th", "admin2@rbru.ac.th", "admin3@rbru.ac.th", "ladda.c@rbru.ac.th"];

export const useAuth = () => {
  const { setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email?.endsWith("@rbru.ac.th")) {
          // ตรวจสอบสิทธิ์
          let role: 'admin' | 'teacher' | 'student' = 'student';
          
          if (ADMIN_EMAILS.includes(firebaseUser.email)) {
            role = 'admin';
          } else {
            // เช็คในฐานข้อมูลเพิ่มเติมว่าคือ Teacher หรือไม่ (ถ้ามีฐานข้อมูลอาจารย์)
            try {
              const teacherDoc = await getDoc(doc(db, "teachers", firebaseUser.email));
              if (teacherDoc.exists()) {
                role = 'teacher';
              }
            } catch (error) {
              console.error("Error fetching teacher doc:", error);
            }
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || "",
            role: role,
          });
        } else {
          // ถ้าไม่ใช่เมล @rbru.ac.th ให้เตะออกทันที
          console.warn("Invalid domain login attempt:", firebaseUser.email);
          alert("กรุณาใช้บัญชี Google ของ @rbru.ac.th เท่านั้นครับ");
          await signOut(auth);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, logout]);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      logout();
    } catch (error) {
      console.error("SignOut Error:", error);
    }
  };

  return { loginWithGoogle, handleSignOut };
};
