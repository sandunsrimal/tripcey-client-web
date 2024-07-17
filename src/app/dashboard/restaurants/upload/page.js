// hotels/upload/page.js

"use client"; // Ensure this page runs as a client component

import withAuth from "@/components/auth/withAuth";
import UploadHotel from "@/components/hotels/UploadHotel";
import Sidebar from "@/components/Sidebar";
import styles from '@/styles/Dashboard.module.css';

const DashboardPage = () => {
  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <UploadHotel />
    </div>
  );
};

export default withAuth(DashboardPage);
