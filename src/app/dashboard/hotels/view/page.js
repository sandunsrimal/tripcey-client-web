// hotels/upload/page.js

"use client"; // Ensure this page runs as a client component

import withAuth from "@/components/auth/withAuth";
import ViewHotels from "@/components/hotels/ViewHotels";
import Sidebar from "@/components/Sidebar";
import styles from '@/styles/Dashboard.module.css';

const ViewHotelsPage = () => {
  return (
    <div className={styles.dashboardPage}>
      <Sidebar />
      <ViewHotels />
    </div>
  );
};

export default withAuth(ViewHotelsPage);
