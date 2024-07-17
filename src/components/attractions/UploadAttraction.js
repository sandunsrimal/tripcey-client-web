"use client"; // Ensure this runs as a client component

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AttractionForm from './AttractionForm';
import SubmittoReview from '../SubmittoReview';
import ProgressBar from './ProgressBar';
import styles from './styles/UploadAttraction.module.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const UploadAttraction = () => {
  const searchParams = useSearchParams();
  const [hotelId, setHotelId] = useState(searchParams.get('attractionId'));
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(null); 
  const router = useRouter();

  const fetchHotel = useCallback(async () => {
    try {
      const hotelDoc = await getDoc(doc(db, 'tripcey-attractions', hotelId));
      const hotelData = hotelDoc.data();

      if (!hotelData || hotelData.userId !== auth.currentUser.uid) {
        console.error("Unauthorized access to edit this hotel or hotel not found");
        setIsAuthorized(false);
        router.push("/dashboard/attractions/view");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Error fetching hotel: ', error);
      setIsAuthorized(false);
      router.push("/dashboard/attractions/view");
    }
  }, [hotelId, router]);

  useEffect(() => {
    if (hotelId) fetchHotel();
    else setIsAuthorized(true); // handle case when hotelId is not provided
  }, [hotelId, fetchHotel]);

  const handleNext = () => setCurrentStep((prevStep) => prevStep + 1);
  const handlePrevious = () => setCurrentStep((prevStep) => prevStep - 1);
  const handleSetHotelId = (id) => setHotelId(id);

  const submittoReview = async () => {
    try {
      const hotelDocRef = doc(db, 'tripcey-attractions', hotelId);
      await updateDoc(hotelDocRef, {
        status: 'In Review'
      });
      console.log('Review status updated to inReview');
      router.push("/dashboard/attractions/view");
    } catch (error) {
      console.error('Error updating review status: ', error);
    }
  };

  const steps = [
    { id: 1, component: <AttractionForm onNext={handleNext} setHotelId={handleSetHotelId} hotelId={hotelId} /> },
    { id: 2, component: <SubmittoReview onSubmit={submittoReview} onPrevious={handlePrevious} hotelId={hotelId} /> },
  ];

  if (isAuthorized === null) {
    return <p>Loading...</p>; // Loading state
  }

  if (isAuthorized === false) {
    return null; // Unauthorized or invalid hotel ID, render nothing
  }

  return (
    <div className={styles.uploadHotel}>
      <div className={styles.header}>
        <h1>{hotelId ? 'Edit Attraction' : 'Upload Attraction'}</h1>
        <div className={styles.navigation}>
          <p>Dashboard / Attractions</p>
          <p>/</p>
          <h4>{hotelId ? 'Edit Attraction' : 'Upload Attraction'}</h4>
        </div>
      </div>
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      {steps.find((step) => step.id === currentStep)?.component}
    </div>
  );
};

export default UploadAttraction;
