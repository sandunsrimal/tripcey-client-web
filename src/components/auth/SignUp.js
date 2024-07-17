"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth, db } from "@/firebaseConfig";
import { collection, doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import styles from "./styles/SignUp.module.css"; // Import the CSS module
import googleIcon from "@/public/google-logo.png";
import facebookIcon from "@/public/facebook-logo.png";
import TripCeyIcon from "@/public/tripcey-icon.png";

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('https://firebasestorage.googleapis.com/v0/b/traveler-admin.appspot.com/o/man.png?alt=media&token=108172f6-aa87-48fc-aca8-a66391a4f15e');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    email: false,
    google: false,
    facebook: false,
  });
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for toggling confirm password visibility
  const router = useRouter();

  const validateEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!firstName || !lastName || !phoneNumber || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return false;
    }
    if (!validateEmailFormat(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading((prevState) => ({ ...prevState, email: true }));
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(collection(db, "tripcey-users"), user.uid), {
        firstName,
        lastName,
        email,
        phoneNumber,
        userId: user.uid,
        userDpUrl: profilePicUrl,
        joiningDate: new Date().toISOString(),
        bookmarkedPlaces: [],
        tourPlan: []
      });

      router.push('/dashboard');
    } catch (error) {
      setError("Error signing up. Please try again.");
      console.error('Error signing up: ', error);
    } finally {
      setLoading((prevState) => ({ ...prevState, email: false }));
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading((prevState) => ({ ...prevState, google: true }));
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(collection(db, "tripcey-users"), user.uid), {
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ").slice(1).join(" "),
        email: user.email,
        phoneNumber: '',
        userId: user.uid,
        userDpUrl: user.photoURL,
        joiningDate: new Date().toISOString(),
        bookmarkedPlaces: [],
        tourPlan: []
      });

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
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(collection(db, "tripcey-users"), user.uid), {
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ").slice(1).join(" "),
        email: user.email,
        phoneNumber: '',
        userId: user.uid,
        userDpUrl: user.photoURL,
        joiningDate: new Date().toISOString(),
        bookmarkedPlaces: [],
        tourPlan: []
      });

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
          width={400}
          height={400}
        />
        <h1>TRIPCEY | Discover Sri Lanka.</h1>
        <p>Explore Sri Lanka's top tourist attractions alongside convenient information on hotels, dining, and more essential travel details.</p>
      </div>
      <div className={styles.signupSection}>
        <h2 className={styles.title}>Signup</h2>
        <div className={styles.nameWrapper}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First Name"
          className={styles.input}
        />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          className={styles.input}
        />
        </div>
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone Number"
          className={styles.input}
        />
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
            placeholder="Create password"
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
        <div className={styles.passwordWrapper}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className={styles.togglePasswordButton}
          >
            <FontAwesomeIcon icon={showConfirmPassword ? faLockOpen : faLock} />
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button
          onClick={handleSignUp}
          className={`${styles.signupButton} ${styles.buttonWrapper}`}
          disabled={loading.email}
        >
          {loading.email ? (
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            "Signup"
          )}
        </button>
        <p className={styles.loginLink}>
          Already have an account? <a href="/login">Login</a>
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
};

export default SignUp;
