// components/ViewHotels.js

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import styles from './styles/ViewHotels.module.css';
import ItemCard from './ItemCard';
import ConfirmationPopup from '../ConfirmationPopup';
import AvailabilityPopup from './AvailabilityPopup'; // Import your availability popup component

const ViewHotels = () => {
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelToRemove, setHotelToRemove] = useState(null); // Track hotel to remove
  const [showPopup, setShowPopup] = useState(false); // State for showing confirmation popup
  const [showAvailability, setShowAvailability] = useState(false); // State for showing availability popup
  const [availabilityData, setAvailabilityData] = useState(null); // Availability data for popup

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
      const hotelsCollection = collection(db, 'tripcey-hotels');
      const q = query(hotelsCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      const fetchedHotels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotels(fetchedHotels);
    } catch (error) {
      console.error('Error fetching hotels: ', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (hotelId) => {
    router.push(`/dashboard/hotels/edit?hotelId=${hotelId}`);
  };

  const handleView = (hotelId) => {
    router.push(`/dashboard/hotels/view?hotelId=${hotelId}`);
  };

  const handleRemove = async () => {
    if (hotelToRemove) {
      try {
        await deleteDoc(doc(db, 'tripcey-hotels', hotelToRemove.id));
        setHotels(prevHotels => prevHotels.filter(hotel => hotel.id !== hotelToRemove.id));
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
    const hotel = hotels.find(hotel => hotel.id === hotelId);
    setHotelToRemove(hotel);
    setShowPopup(true); // Show the confirmation popup
  };

  const cancelRemove = () => {
    setHotelToRemove(null); // Clear hotelToRemove
    setShowPopup(false); // Hide the confirmation popup
  };

  const showAvailabilityPopup = (hotelId) => {
    // const hotel = hotels.find(hotel => hotel.id === hotelId);
    setAvailabilityData(hotelId); // Assuming availability is a property in your hotel object
    setShowAvailability(true); // Show the availability popup
  };

  const closeAvailabilityPopup = () => {
    setShowAvailability(false); // Hide the availability popup
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.viewHotels}>
        <div className={styles.header}>
        <h1>Your Hotels</h1>
        <div className={styles.navigation}>
          <p>Dashboard / Hotels</p>
          <p>/</p>
          <h4>View Hotels</h4>
        </div>
      </div>
      <div className={styles.hotelList}>
        {hotels.map(hotel => (
          <div key={hotel.id} className={styles.hotelCard}>
            <ItemCard 
              items={[hotel]} 
              handleEdit={() => handleEdit(hotel.id)} 
              handleAvailability={() => showAvailabilityPopup(hotel.id)} 
              handleRemove={() => confirmRemove(hotel.id)}  
            />
          </div>
        ))}
      </div>

      {showPopup && hotelToRemove && (
        <ConfirmationPopup
          message={`Are you sure you want to remove ${hotelToRemove.hotelName}?`}
          onConfirm={handleRemove}
          onCancel={cancelRemove}
        />
      )}

      {showAvailability && availabilityData && (
        <AvailabilityPopup
          hotelId={availabilityData}
          onClose={closeAvailabilityPopup}
        />
      )}
    </div>
  );
};

export default ViewHotels;
