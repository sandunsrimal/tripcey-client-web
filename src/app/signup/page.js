// src/app/signup.js
import SignUp from '@/components/auth/SignUp';
import NavBar from "@/components/NavBar";  // Ensure this path is correct based on your file structure
import Footer from "@/components/Footer";  // Ensure this path is correct based on your file structure

const SignUpPage = () => {
  return (
    <div>
      <NavBar />
      <SignUp />
      <Footer />
    </div>
  );
};

export default SignUpPage;
