import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Function to get the current user ID
export const getUserId = () => {
  return new Promise((resolve, reject) => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user.uid);
      } else {
        reject('No user is signed in');
      }
    });
  });
};
