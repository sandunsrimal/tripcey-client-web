// components/NavBar.js
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/styles/NavBar.module.css';

const NavBar = () => {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    const handleScrollWithDebounce = () => {
      window.requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', handleScrollWithDebounce);
    return () => window.removeEventListener('scroll', handleScrollWithDebounce);
  }, []);

  return (
    <nav className={`${styles.nav} ${visible ? styles.visible : styles.hidden}`}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/login" className={pathname === '/login' ? styles.active : styles.inactive}>Home</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/about" className={pathname === '/about' ? styles.active : styles.inactive}>About</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/service" className={pathname === '/service' ? styles.active : styles.inactive}>Service</Link>
        </li>
        <li className={styles.navLogo}>
          <Link href="/">TRIPCEY</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/resume" className={pathname === '/resume' ? styles.active : styles.inactive}>Listing</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/project" className={pathname === '/project' ? styles.active : styles.inactive}>Contact</Link>
        </li>
        <li className={styles.navItem}>
          <Link href="/contact" className={pathname === '/contact' ? styles.active : styles.inactive}>Sign in</Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
