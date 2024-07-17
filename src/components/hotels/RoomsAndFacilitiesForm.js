import React, { useState } from 'react';
import styles from './styles/RoomsAndFacilitiesForm.module.css';
import ExpandableApartmentsSection from './Apartment';
import ExpandableHotelRoomsSection from './HotelRoom';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig';

const RoomsAndFacilities = ({ onNext, onPrevious,  hotelId }) => {

    const handleSaveAndContinue = async () => {
        try {
          const hotelDocRef = doc(db, "tripcey-hotels", hotelId);
          await updateDoc(hotelDocRef, {
            step: 2
          });
          onNext(); // Proceed to the next step
        } catch (error) {
          console.error("Error updating document: ", error);
        }
      };
    
  return (
    <div className={styles.container}>
      <ExpandableApartmentsSection title="Apartments" hotelId={hotelId} />
      <ExpandableHotelRoomsSection title="Hotel Rooms" hotelId={hotelId} />
      <div className={styles.footer}>
        <button onClick={onPrevious} className={styles.mainButton}>
          Previous
        </button>
        <button onClick={handleSaveAndContinue}  className={styles.mainButton}>
          Save and Continue
        </button>
      </div>
      <div className={styles.next}>
      {hotelId && (
          <button 
            className={styles.nextButton} 
            onClick={onNext}
          >
            Next
          </button>
        )}
        </div>
    </div>
  );
};

export default RoomsAndFacilities;
