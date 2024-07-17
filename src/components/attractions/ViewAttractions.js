import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import styles from './styles/ViewAttractions.module.css';
import ItemCard from './ItemCard';
import ConfirmationPopup from '../ConfirmationPopup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const ViewAttractions = () => {
  const router = useRouter();
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelToRemove, setHotelToRemove] = useState(null); // Track hotel to remove
  const [showPopup, setShowPopup] = useState(false); // State for showing confirmation popup
  const [showAvailability, setShowAvailability] = useState(false); // State for showing availability popup
  const [FeaturedData, setFeaturedData] = useState(null); // Availability data for popup
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [itemsToShow, setItemsToShow] = useState(12); // State for items to show

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserHotels(user.uid);
      } else {
        console.error("No current user found");
        router.push("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const fetchUserHotels = async (userId) => {
    setLoading(true);
    try {
      const hotelsCollection = collection(db, 'tripcey-attractions');
      const q = query(hotelsCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const fetchedHotels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAttractions(fetchedHotels);
    } catch (error) {
      console.error('Error fetching hotels: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotelId) => {
    router.push(`/dashboard/attractions/edit?attractionId=${hotelId}`);
  };

  const handleRemove = async () => {
    if (hotelToRemove) {
      try {
        await deleteDoc(doc(db, 'tripcey-attractions', hotelToRemove.id));
        setAttractions(prevAttractions => prevAttractions.filter(attraction => attraction.id !== hotelToRemove.id));
        console.log("Hotel removed successfully");
      } catch (error) {
        console.error('Error removing hotel: ', error);
      } finally {
        setHotelToRemove(null); // Clear hotelToRemove after removal
        setShowPopup(false); // Hide the confirmation popup after removal
      }
    }
  };

  const confirmRemove = (hotelId) => {
    const attraction = attractions.find(hotel => hotel.id === hotelId);
    setHotelToRemove(attraction);
    setShowPopup(true); // Show the confirmation popup
  };

  const cancelRemove = () => {
    setHotelToRemove(null); // Clear hotelToRemove
    setShowPopup(false); // Hide the confirmation popup
  };

  const showFeaturedPopup = (hotelId) => {
    // const hotel = hotels.find(hotel => hotel.id === hotelId);
    setFeaturedData(hotelId); // Assuming availability is a property in your hotel object
    setShowAvailability(true); // Show the availability popup
  };

  const closeAvailabilityPopup = () => {
    setShowAvailability(false); // Hide the availability popup
  };

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredAttractions = attractions
    .filter(attraction => attraction.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, itemsToShow);

  const handleSeeMore = () => {
    setItemsToShow(prev => prev + 10);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.viewHotels}>
      <div className={styles.header}>
        <h1>Attraction</h1>
        <div className={styles.navigation}>
          <p>Dashboard / Attractions</p>
          <p>/</p>
          <h4>View Attraction</h4>
        </div>
      </div>
      <div className={styles.searchBar}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search attractions..."
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <button className={styles.button}>Search</button>
      </div>
      <div className={styles.hotelList}>
        {filteredAttractions.map(hotel => (
          <div key={hotel.id} className={styles.hotelCard}>
            <ItemCard 
              items={[hotel]} 
              handleEdit={() => handleEdit(hotel.id)} 
              handleFeatured={() => showFeaturedPopup(hotel.id)} 
              handleRemove={() => confirmRemove(hotel.id)}  
            />
          </div>
        ))}
      </div>
      {itemsToShow < attractions.length && (
        <div className={styles.seeMoreContainer}>
          <button onClick={handleSeeMore} className={styles.seeMoreButton}>See all attraction</button>
        </div>
      )}
      {/* {showAvailability && FeaturedData && (
        <AvailabilityPopup
          hotelId={FeaturedData}
          onClose={closeAvailabilityPopup}
        />
      )} */}
    </div>
  );
};

export default ViewAttractions;
