"use client"; // Ensure this runs as a client component

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HotelForm from './HotelForm';
import RoomsAndFacilitiesForm from './RoomsAndFacilitiesForm';
import PaymentForm from '../PaymentForm';
import SubmittoReview from '../SubmittoReview';
import ProgressBar from './ProgressBar';
import styles from './styles/UploadHotel.module.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';

const UploadHotel = () => {
  const searchParams = useSearchParams();
  const [hotelId, setHotelId] = useState(searchParams.get('hotelId'));
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [pricing, setPricing] = useState({ monthly: 7, annually: 36 }); // default pricing
  const [transactionDetails, setTransactionDetails] = useState({});
  const [updateRequired, setUpdateRequired] = useState(false); // New state to trigger updates
  const router = useRouter();

  const fetchHotel = useCallback(async () => {
    try {
      const hotelDoc = await getDoc(doc(db, 'tripcey-hotels', hotelId));
      const hotelData = hotelDoc.data();

      if (!hotelData || hotelData.userId !== auth.currentUser.uid) {
        console.error("Unauthorized access to edit this hotel or hotel not found");
        setIsAuthorized(false);
        router.push("/dashboard/hotels/view");
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      console.error('Error fetching hotel: ', error);
      setIsAuthorized(false);
      router.push("/dashboard/hotels/view");
    }
  }, [hotelId, router]);

  const handleUpdateTransactionDetails = (details) => {
    setTransactionDetails(details);
    setUpdateRequired(true); // Trigger update when details change
  };

  const updateTransactionDetailsInFirestore = async () => {
    if (!hotelId || !transactionDetails) return;
    try {
      const hotelRef = doc(db, 'tripcey-hotels', hotelId);
      await updateDoc(hotelRef, {
        paymentDetails: transactionDetails,
        step: 3,
        payment_status: 'Pending',
      });
      console.log('Transaction details updated successfully');
      setUpdateRequired(false); // Reset update required state
    } catch (error) {
      console.error('Error updating transaction details: ', error);
    }
  };

  useEffect(() => {
    if (updateRequired) {
      updateTransactionDetailsInFirestore();
    }
  }, [updateRequired]); // Trigger update when updateRequired is true

  const afterPayment = async () => {
    // update details to firestore
    console.log('Transaction details:', transactionDetails);
    handleNext();
  };

  useEffect(() => {
    if (hotelId) fetchHotel();
    else setIsAuthorized(true); // handle case when hotelId is not provided
  }, [hotelId, fetchHotel]);

  const submittoReview = async () => {
    try {
      const hotelDocRef = doc(db, 'tripcey-hotels', hotelId);
      await updateDoc(hotelDocRef, {
        status: 'In Review'
      });
      console.log('Review status updated to inReview');
      router.push("/dashboard/hotels/view");
    } catch (error) {
      console.error('Error updating review status: ', error);
    }
  };

  const handleNext = () => setCurrentStep((prevStep) => prevStep + 1);
  const handlePrevious = () => setCurrentStep((prevStep) => prevStep - 1);
  const handleSetHotelId = (id) => setHotelId(id);

  const steps = [
    { id: 1, component: <HotelForm onNext={handleNext} setHotelId={handleSetHotelId} hotelId={hotelId} /> },
    { id: 2, component: <RoomsAndFacilitiesForm onNext={handleNext} onPrevious={handlePrevious} hotelId={hotelId} /> },
    { id: 3, component: <PaymentForm onNext={afterPayment} onPrevious={handlePrevious} hotelId={hotelId} collection={'tripcey-hotels'} pricing={pricing} updateTransactionDetails={handleUpdateTransactionDetails} /> },
    { id: 4, component: <SubmittoReview onSubmit={submittoReview} onPrevious={handlePrevious} hotelId={hotelId} /> },
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
        <h1>{hotelId ? 'Edit Hotel' : 'Upload Hotel'}</h1>
        <div className={styles.navigation}>
          <p>Dashboard / Hotels</p>
          <p>/</p>
          <h4>{hotelId ? 'Edit Hotel' : 'Upload Hotel'}</h4>
        </div>
      </div>
      <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
      {steps.find((step) => step.id === currentStep)?.component}
    </div>
  );
};

export default UploadHotel;
