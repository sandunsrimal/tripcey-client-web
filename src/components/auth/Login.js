"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "@/firebaseConfig";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles/Login.module.css";
import facebookIcon from "@/public/facebook-logo.png";
import googleIcon from "@/public/google-logo.png";
import TripCeyIcon from "@/public/tripcey-icon.png";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState({
    email: false,
    google: false,
    facebook: false,
  });
  const router = useRouter();

  const validateEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return false;
    }
    if (!validateEmailFormat(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading((prevState) => ({ ...prevState, email: true }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      setError("Invalid email or password.");
      console.error("Error logging in:", error);
    } finally {
      setLoading((prevState) => ({ ...prevState, email: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading((prevState) => ({ ...prevState, google: true }));
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      setError("Error signing in with Google.");
      console.error("Error signing in with Google: ", error);
    } finally {
      setLoading((prevState) => ({ ...prevState, google: false }));
    }
  };

  const handleFacebookSignIn = async () => {
    const provider = new FacebookAuthProvider();
    setLoading((prevState) => ({ ...prevState, facebook: true }));
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard");
    } catch (error) {
      setError("Error signing in with Facebook.");
      console.error("Error signing in with Facebook: ", error);
    } finally {
      setLoading((prevState) => ({ ...prevState, facebook: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.infoSection}>
      <Image
                src={TripCeyIcon}
                alt="TripCey logo"
                // className={styles.socialLogo}
                width={400}
                height={400}
              />
        <h1>TRIPCEY | Discover Sri Lanka.</h1>
        <p>Explore Sri Lanka's top tourist attractions alongside convenient information on hotels, dining, and more essential travel details.</p>
      </div>
      <div className={styles.loginSection}>
        <h2 className={styles.title}>Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={styles.input}
        />
        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.togglePasswordButton}
          >
            <FontAwesomeIcon icon={showPassword ? faLockOpen : faLock} />
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <a href="/forgot-password" className={styles.forgotPassword}>
          Forgot password?
        </a>
        <button
          onClick={handleLogin}
          className={`${styles.loginButton} ${styles.buttonWrapper}`}
          disabled={loading.email}
        >
          {loading.email ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Login"
          )}
        </button>
        <p className={styles.signupLink}>
          Don't have an account? <a href="/signup">Signup</a>
        </p>
        <div className={styles.orDivider}>OR</div>
        <button
          onClick={handleGoogleSignIn}
          className={`${styles.socialButton} ${styles.googleButton} ${styles.buttonWrapper}`}
          disabled={loading.google}
        >
          {loading.google ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              <Image
                src={googleIcon}
                alt="Google logo"
                className={styles.socialLogo}
                width={30}
                height={30}
              />
              Continue with Google
            </>
          )}
        </button>
        <button
          onClick={handleFacebookSignIn}
          className={`${styles.socialButton} ${styles.facebookButton} ${styles.buttonWrapper}`}
          disabled={loading.facebook}
        >
          {loading.facebook ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              <Image
                src={facebookIcon}
                alt="Facebook logo"
                className={styles.socialLogo}
                width={30}
                height={30}
              />
              Continue with Facebook
            </>
          )}
        </button>
      </div>
    </div>
  );
}
