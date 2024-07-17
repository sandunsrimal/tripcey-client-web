
import Login from "@/components/auth/Login";
import NavBar from "@/components/NavBar";  // Ensure this path is correct based on your file structure
import Footer from "@/components/Footer";  // Ensure this path is correct based on your file structure

const LoginPage = () => {
  return (
    <div>
      <NavBar />
      <Login />
      <Footer />
    </div>
  );
};

export default LoginPage;
