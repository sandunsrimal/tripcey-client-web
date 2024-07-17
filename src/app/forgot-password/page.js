import ForgotPassword from "@/components/auth/ForgotPassword";
import NavBar from "@/components/NavBar";  // Ensure this path is correct based on your file structure
import Footer from "@/components/Footer";  // Ensure this path is correct based on your file structure

const ForgotPasswordPage = () => {
    return (
      <div>
        <NavBar />
        <ForgotPassword />
        <Footer />
      </div>
    );
  };
  
  export default ForgotPasswordPage;