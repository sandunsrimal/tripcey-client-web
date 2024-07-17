// components/Dashboard.js

"use client"; // Ensure this runs as a client component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import defaultProfilePic from "@/public/default-profile.png";
import styles from '@/styles/Dashboard.module.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {user && (
        <div className={styles.userInfo}>
          <div className={styles.userDetails}>
            <Image
              src={user.photoURL || defaultProfilePic}
              alt="Profile"
              width={50}
              height={50}
              className={styles.profileImage}
            />
            <div className={styles.userText}>
              <p>{user.displayName || "User"}</p>
              <p>{user.email}</p>
            </div>
          </div>
        </div>
      )}
      <button className={styles.signOutButton} onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
