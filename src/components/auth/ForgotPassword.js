"use client";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Image from "next/image";
import styles from "./styles/ForgotPassword.module.css"; // Import the CSS module
import TripCeyIcon from "@/public/tripcey-icon.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    if (!validateEmailFormat(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setError("Error sending password reset email.");
      console.error("Error sending password reset email: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoSection}>
        <Image
          src={TripCeyIcon}
          alt="TripCey logo"
          width={400}
          height={400}
        />
        <h1>TRIPCEY | Discover Sri Lanka.</h1>
        <p>Explore Sri Lanka's top tourist attractions alongside convenient information on hotels, dining, and more essential travel details.</p>
      </div>
      <div className={styles.resetSection}>
        <h2 className={styles.title}>Forgot Password</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
        <button
          onClick={handleForgotPassword}
          className={`${styles.resetButton} ${styles.buttonWrapper}`}
          disabled={loading}
        >
          {loading ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Reset Password"
          )}
        </button>
        <p className={styles.loginLink}>
          Remember your password? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
