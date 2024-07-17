import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faCog, faHotel, faUtensils, faPeopleGroup, faTaxi, faPeoplePulling, faChevronDown, faChevronUp, faBars, faMountain } from '@fortawesome/free-solid-svg-icons';
import styles from '@/styles/Sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [dropdown, setDropdown] = useState({
    attractions: false,
    hotels: false,
    restaurants: false,
    excursions: false,
    taxis: false,
    localGuides: false,
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const updateDropdowns = () => {
      setDropdown({
        attractions: ['/dashboard/attractions/view', '/dashboard/attractions/upload'].includes(pathname),
        hotels: ['/dashboard/hotels/view', '/dashboard/hotels/upload'].includes(pathname),
        restaurants: ['/dashboard/restaurants/view', '/dashboard/restaurants/upload'].includes(pathname),
        excursions: ['/dashboard/excursions/view', '/dashboard/excursions/upload'].includes(pathname),
        taxis: ['/dashboard/taxis/view', '/dashboard/taxis/upload'].includes(pathname),
        localGuides: ['/dashboard/local-guides/view', '/dashboard/local-guides/upload'].includes(pathname),
      });
    };
    updateDropdowns();
  }, [pathname]);

  const toggleDropdown = (key) => {
    setDropdown((prev) => {
      const newState = { ...prev, [key]: !prev[key] };
      return newState;
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    Object.keys(dropdown).forEach((key) => {
      const ref = dropdownRefs.current[key];
      if (dropdown[key]) {
        ref.style.maxHeight = `${ref.scrollHeight}px`;
      } else {
        ref.style.maxHeight = '0';
      }
    });
  }, [dropdown]);

  return (
    <div className={`${styles.sidebar} ${isMenuOpen ? styles.show : ''}`}>
      <div className={styles.sidebarLogo}>TRIPCEY</div>
      <div className={styles.hamburger} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>
      <ul className={styles.sidebarMenu}>
        <li className={styles.menuItem}>
          <Link href="/dashboard" passHref legacyBehavior>
            <a className={pathname === '/dashboard' ? styles.active : styles.menuLink}>
              <FontAwesomeIcon icon={faChartPie} /> Dashboard
            </a>
          </Link>
        </li>

        {/* Attraction Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('attractions')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faMountain} /> Attractions
            <FontAwesomeIcon icon={dropdown.attractions ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.attractions ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.attractions = el)}
            id="attractions-dropdown"
          >
            <li>
              <Link href="/dashboard/attractions/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/attractions/view' ? styles.activeli : styles.menuLink}>View Attraction</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/attractions/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/attractions/upload' ? styles.activeli : styles.menuLink}>Upload Attraction</a>
              </Link>
            </li>
          </ul>
        </li>

        {/* Hotels Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('hotels')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faHotel} /> Hotels
            <FontAwesomeIcon icon={dropdown.hotels ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.hotels ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.hotels = el)}
            id="hotels-dropdown"
          >
            <li>
              <Link href="/dashboard/hotels/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/hotels/view' ? styles.activeli : styles.menuLink}>View Hotels</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/hotels/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/hotels/upload' ? styles.activeli : styles.menuLink}>Upload Hotels</a>
              </Link>
            </li>
          </ul>
        </li>

        {/* Restaurants Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('restaurants')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faUtensils} /> Restaurants
            <FontAwesomeIcon icon={dropdown.restaurants ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.restaurants ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.restaurants = el)}
            id="restaurants-dropdown"
          >
            <li>
              <Link href="/dashboard/restaurants/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/restaurants/view' ? styles.activeli : styles.menuLink}>View Restaurants</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/restaurants/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/restaurants/upload' ? styles.activeli : styles.menuLink}>Upload Restaurants</a>
              </Link>
            </li>
          </ul>
        </li>

        {/* Excursions Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('excursions')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faPeopleGroup} /> Excursions
            <FontAwesomeIcon icon={dropdown.excursions ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.excursions ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.excursions = el)}
            id="excursions-dropdown"
          >
            <li>
              <Link href="/dashboard/excursions/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/excursions/view' ? styles.activeli : styles.menuLink}>View Excursions</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/excursions/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/excursions/upload' ? styles.activeli : styles.menuLink}>Upload Excursions</a>
              </Link>
            </li>
          </ul>
        </li>

        {/* Taxis Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('taxis')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faTaxi} /> Taxis
            <FontAwesomeIcon icon={dropdown.taxis ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.taxis ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.taxis = el)}
            id="taxis-dropdown"
          >
            <li>
              <Link href="/dashboard/taxis/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/taxis/view' ? styles.activeli : styles.menuLink}>View Taxis</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/taxis/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/taxis/upload' ? styles.activeli : styles.menuLink}>Upload Taxis</a>
              </Link>
            </li>
          </ul>
        </li>

        {/* Local Guides Dropdown */}
        <li className={styles.menuItem}>
          <div onClick={() => toggleDropdown('localGuides')} className={styles.menuLink}>
            <FontAwesomeIcon icon={faPeoplePulling} /> Local Guides
            <FontAwesomeIcon icon={dropdown.localGuides ? faChevronUp : faChevronDown} className={styles.dropdownIcon} />
          </div>
          <ul
            className={`${styles.dropdownMenu} ${dropdown.localGuides ? 'show' : ''}`}
            ref={(el) => (dropdownRefs.current.localGuides = el)}
            id="localGuides-dropdown"
          >
            <li>
              <Link href="/dashboard/local-guides/view" passHref legacyBehavior>
                <a className={pathname === '/dashboard/local-guides/view' ? styles.activeli : styles.menuLink}>View Local Guides</a>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/local-guides/upload" passHref legacyBehavior>
                <a className={pathname === '/dashboard/local-guides/upload' ? styles.activeli : styles.menuLink}>Upload Local Guides</a>
              </Link>
            </li>
          </ul>
        </li>

        <li className={styles.menuItem}>
          <Link href="/settings" passHref legacyBehavior>
            <a className={pathname === '/settings' ? styles.active : styles.menuLink}>
              <FontAwesomeIcon icon={faCog} /> Settings
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
