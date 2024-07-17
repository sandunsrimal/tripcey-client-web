// // components/Footer.js
// import styles from '@/styles/Footer.module.css';

// const Footer = () => {
//   return (
//     <div className={styles.footerWrapper}>
//       <footer className={styles.footer}>
//         <div className={styles.topSection}>
//           <h2>Lets Connect there</h2>
//           <button className={styles.hireButton}>Hire me ↗</button>
//         </div>
//         <div className={styles.infoSection}>
//           <div className={styles.column}>
//             <img src="/path-to-your-logo.png" alt="Logo" className={styles.logo} />
//             <p>
//               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed congue interdum ligula a dignissim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lobortis orci elementum egestas lobortis.
//             </p>
//             <div className={styles.socialIcons}>
//               <a href="#"><img src="/path-to-facebook-icon.png" alt="Facebook" /></a>
//               <a href="#"><img src="/path-to-youtube-icon.png" alt="YouTube" /></a>
//               <a href="#"><img src="/path-to-whatsapp-icon.png" alt="WhatsApp" /></a>
//               <a href="#"><img src="/path-to-twitter-icon.png" alt="Twitter" /></a>
//             </div>
//           </div>
//           <div className={styles.column}>
//             <h3 className={styles.columnTitle}>Navigation</h3>
//             <p>Home</p>
//             <p>About Us</p>
//             <p>Service</p>
//             <p>Resume</p>
//             <p>Project</p>
//           </div>
//           <div className={styles.column}>
//             <h3 className={styles.columnTitle}>Contact</h3>
//             <p>+91 7738443636</p>
//             <p>Jaycrea36@gmail.com</p>
//             <p>Portfolio-jcrea.com</p>
//           </div>
//           <div className={styles.column}>
//             <h3 className={styles.columnTitle}>Get the latest information</h3>
//             <form className={styles.form}>
//               <input type="email" placeholder="Email Address" className={styles.emailInput} />
//               <button className={styles.submitButton}>→</button>
//             </form>
//           </div>
//         </div>
        // <div className={styles.copyright}>
        //   <p>Copyright© 2023 Jayesh. All Rights Reserved.</p>
        //   <p>User Terms & Conditions | Privacy Policy</p>
        // </div>
//       </footer>
//     </div>
//   );
// };

// export default Footer;


// components/Footer.js
import styles from '@/styles/Footer.module.css';
// import facebookIcon from '@/public/path-to-facebook-icon.png';
// import instagramIcon from '@/public/path-to-instagram-icon.png';
// import twitterIcon from '@/public/path-to-twitter-icon.png';
import logoIcon from '@/public/tripcey-icon-white.png';
import Image from 'next/image';

const Footer = () => {
  return (
    <div className={styles.footerWrapper}>
      <footer className={styles.footer}>
        <div className={styles.footerSections}>
        <div className={styles.contactSection}>
          <p>Phone 1300 303 343</p>
          <p>hello@tripcey.com</p>
          <div className={styles.socialIcons}>
            {/* <a href="#"><Image src={facebookIcon} alt="Facebook" width={24} height={24} /></a>
            <a href="#"><Image src={instagramIcon} alt="Instagram" width={24} height={24} /></a>
            <a href="#"><Image src={twitterIcon} alt="Twitter" width={24} height={24} /></a> */}
          </div>
        </div>
        <div className={styles.logoSection}>
          <Image src={logoIcon} alt="Logo" className={styles.logo} width={100} height={100} />
          <p>TRIPCEY</p>
        </div>
        <div className={styles.subscriptionSection}>
          <p>Explore the world from your inbox</p>
          <p>Let us inspire your next getaway with new destinations and special deals.</p>
          <form className={styles.form}>
            <input type="email" placeholder="email address" className={styles.emailInput} />
            <button className={styles.submitButton}>Subscribe</button>
          </form>
        </div>
       
        </div>
        <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          <p>Copyright© 2024 TripCey. All Rights Reserved.</p>
        </div>
        <div className={styles.termsconditons}>
          <p>User Terms & Conditions | Privacy Policy</p>
        </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;

