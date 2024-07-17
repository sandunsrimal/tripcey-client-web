import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for client-side navigation
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthenticated(true);
        } else {
          router.push("/login");
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }, [router]);

    if (loading) {
      return <p>Loading...</p>;
    }

    if (!authenticated) {
      return null; // Do not render component if not authenticated
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
