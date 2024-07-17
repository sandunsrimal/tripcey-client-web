import React, { useState, useEffect } from 'react';
import styles from '../styles/PaymentForm.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faUniversity, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const PaymentForm = ({ onNext, onPrevious, hotelId, collection, pricing, updateTransactionDetails }) => {
  const [selectedPlan, setSelectedPlan] = useState('annually');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [transactionID, setTransactionID] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [subscriptionExpiryDate, setSubscriptionExpiryDate] = useState(null);
  const [isCardPaymentAvailable, setIsCardPaymentAvailable] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Credit card state
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    const fetchHotelData = async () => {
      if (hotelId) {
        try {
          const hotelDocRef = doc(db, collection, hotelId);
          const hotelDocSnap = await getDoc(hotelDocRef);
          
          if (hotelDocSnap.exists()) {
            const hotelData = hotelDocSnap.data();
            const paymentDetails = hotelData.paymentDetails || {};
            setPaymentStatus(hotelData.payment_status || 'Pending');

            // Set initial state based on fetched data
            setSelectedPlan(paymentDetails.selected_plan || 'annually');
            setPaymentMethod(paymentDetails.paymentMethod || 'bank');
            setTransactionID(paymentDetails.transactionID || '');
            setSubscriptionExpiryDate(paymentDetails.expiryDate ? new Date(paymentDetails.expiryDate) : null);

            if (paymentDetails.uploadedFileURL) {
              setUploadedFile(paymentDetails.uploadedFileURL);
            }

          }
          setIsFormDisabled(true);
        } catch (error) {
          console.error('Error fetching hotel data:', error);
        } finally {
          setInitialDataLoaded(true);
        }
      } else {
        setInitialDataLoaded(true);
      }
    };

    fetchHotelData();
  }, [hotelId, collection]);

  const handleActivateForm = () => {
    setIsFormDisabled(false);
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'Pending':
        return { text: 'Your payment is pending approval.', color: 'orange' };
      case 'Approved':
        return { text: 'Your payment has been approved.', color: 'green' };
      case 'Rejected':
        return { text: 'Your payment has been rejected.', color: 'red' };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  const handleUploadedFileChange = (event) => {
    setUploadedFile(event.target.files[0]);
  };

  const calculateTotal = (plan) => {
    if (plan === 'monthly') {
      return pricing.monthly;
    } else {
      return pricing.annually;
    }
  };

  const handleApplyCoupon = () => {
    // Logic to apply coupon code
    console.log("Coupon code applied:", couponCode);
  };

  const validateFields = () => {
    const newErrors = {};

    if (paymentMethod === 'bank') {
      if (!transactionID) {
        newErrors.transactionID = 'Transaction ID is required.';
      }
      if (!uploadedFile) {
        newErrors.uploadedFile = 'Transaction receipt is required.';
      }
    } else if (paymentMethod === 'card' && isCardPaymentAvailable) {
      if (!cardHolder) {
        newErrors.cardHolder = 'Card holder name is required.';
      }
      if (!cardNumber) {
        newErrors.cardNumber = 'Card number is required.';
      }
      if (!expiryDate) {
        newErrors.expiryDate = 'Expiry date is required.';
      }
      if (!cvv) {
        newErrors.cvv = 'CVV is required.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getExpiryDate = (selectedPlan) => {
    const now = new Date();
    if (selectedPlan === 'monthly') {
      now.setMonth(now.getMonth() + 1); // Adds 1 month to the current date
    } else {
      now.setFullYear(now.getFullYear() + 1); // Adds 1 year to the current date
    }
    return now;
  };

  const handleProceed = async () => {
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    const total = calculateTotal(selectedPlan) + 2.00; // Add tax

    let uploadedFileURL = typeof uploadedFile === 'string' ? uploadedFile : '';
    const expiryDate = getExpiryDate(selectedPlan);
    setSubscriptionExpiryDate(expiryDate);

    try {
      if (uploadedFile && typeof uploadedFile !== 'string') {
        // Only upload if it's a new file
        try {
          const storage = getStorage();
          const storageRef = ref(storage, `hotel-receipts/${uploadedFile.name}`);
          await uploadBytes(storageRef, uploadedFile);
          uploadedFileURL = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Error uploading file:', error);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setLoading(false);
      return;
    } finally {
      const transactionDetails = {
        transactionID,
        uploadedFileURL,
        selected_plan: selectedPlan,
        paymentMethod,
        total_amount: total,
        expiryDate,
    
      };

      updateTransactionDetails(transactionDetails);
      setLoading(false);
      onNext();
    }
  };


  return (
    <div className={styles.paymentFormContainer}>

     {statusMessage && (
        <div 
          className={styles.statusMessage} 
          style={{ backgroundColor: statusMessage.color, color: 'white', padding: '10px', marginBottom: '20px' }}
        >
          {statusMessage.text}
        </div>
      )}

          <div className={`${styles.paymentFormGroup} ${isFormDisabled ? styles.disabled : ''}`}>
     
      <div className={styles.paymentFormGroup}>
        <div className={styles.headerSection}>
          <div className={styles.header}>
            <h1>Flexible Plans</h1>
            <p>Consectetur dolor labore labore laborum ipsum pariatur culpa dolor duis dolore nulla. Labore aute sunt mollit sunt commodo l</p>
          </div>
          <div className={styles.plans}>
            <div
              className={`${styles.plan} ${selectedPlan === 'monthly' ? styles.selected : ''}`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <h2>Monthly</h2>
              <p className={styles.price}>${pricing.monthly.toFixed(2)} <span>/month</span></p>
              <button className={styles.selectButton}>{selectedPlan === 'monthly' ? 'Selected' : 'Select'}</button>
            </div>
            <div
              className={`${styles.plan} ${selectedPlan === 'annually' ? styles.selected : ''}`}
              onClick={() => setSelectedPlan('annually')}
            >
              <h2>Annually</h2>
              <p className={styles.price}>${(pricing.annually / 12).toFixed(2)} <span>/month</span></p>
              <button className={styles.selectButton}>{selectedPlan === 'annually' ? 'Selected' : 'Select'}</button>
            </div>
          </div>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Sub Total:</span>
              <span>${calculateTotal(selectedPlan).toFixed(2)}</span>
            </div>
            <div className={styles.couponSection}>
              <label htmlFor="couponCode">Apply Coupon:</label>
              <div className={styles.couponInputContainer}>
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className={styles.couponInput}
                />
                <button className={styles.applyCouponButton} onClick={handleApplyCoupon}>
                  Apply
                </button>
              </div>
            </div>
            <div className={styles.summaryItem}>
              <span>Tax:</span>
              <span>+ $2.00</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.totalLabel}>Total:</span>
              <span className={styles.totalValue}>${(calculateTotal(selectedPlan) + 2).toFixed(2)}</span>
            </div>
          </div>
        
        </div>
        <div className={styles.paymentMethodSection}>
          <h2 className={styles.sectionTitle}>Payment method</h2>
          <div className={styles.paymentMethods}>
            <div
              className={`${styles.paymentMethod} ${paymentMethod === 'bank' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('bank')}
            >
              <FontAwesomeIcon icon={faUniversity} className={styles.icon} />
              <label>Bank Transfer</label>
            </div>
            <div
              className={`${styles.paymentMethod} ${paymentMethod === 'card' ? styles.selected : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <FontAwesomeIcon icon={faCreditCard} className={styles.icon} />
              <label>Credit Card</label>
            </div>
          </div>

          {paymentMethod === 'bank' ? (
            <div className={styles.transactionSection}>
              <label htmlFor="transactionID">Transaction ID <span className={styles.required}>*</span></label>
              <input
                type="text"
                id="transactionID"
                value={transactionID}
                onChange={(e) => setTransactionID(e.target.value)}
                placeholder="Enter Transaction ID"
              />
              {errors.transactionID && <p className={styles.error}>{errors.transactionID}</p>}
              <div className={styles.formGroup}>
                <label className={styles.label}>Transaction receipt <span className={styles.required}>*</span></label>
                <input type="file" id="uploadFile" onChange={handleUploadedFileChange} className={styles.fileInput} />
                <div className={styles.imageUploadWrapper}>
                  {!uploadedFile && (
                    <div className={styles.imageUploadPlaceholder}>
                      <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadIcon} />
                      <div>Upload File</div>
                      <div className={styles.uploadtxt}>Supported format: PNG, JPG</div>
                      <div>(max-size: 1MB)</div>
                    </div>
                  )}
                  {uploadedFile && (
                    <div className={styles.imagePreviewWrapper}>
                      <img
                        src={typeof uploadedFile === 'string' ? uploadedFile : URL.createObjectURL(uploadedFile)}
                        alt="Uploaded"
                        className={styles.uploadedFilePreview}
                      />
                    </div>
                  )}
                  {errors.uploadedFile && <p className={styles.error}>{errors.uploadedFile}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.paymentContainer}>
              {!isCardPaymentAvailable && (
                <div className={styles.error}>
                  Credit card payment is currently unavailable. Please choose another payment method.
                </div>
              )}
              <div className={`${styles.creditCardForm} ${!isCardPaymentAvailable ? styles.disabledForm : ''}`}>
                <div className={`${styles.formGroup} ${styles.cardHolderGroup}`}>
                  <label htmlFor="cardHolder">Card Holder's Name <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="cardHolder"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="John Doe"
                    disabled={!isCardPaymentAvailable}
                  />
                  {errors.cardHolder && <p className={styles.error}>{errors.cardHolder}</p>}
                </div>
                <div className={`${styles.formGroup} ${styles.cardNumberGroup}`}>
                  <label htmlFor="cardNumber">Card Number <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    disabled={!isCardPaymentAvailable}
                  />
                  {errors.cardNumber && <p className={styles.error}>{errors.cardNumber}</p>}
                </div>
                <div className={styles.expiryDateCvvGroup}>
                  <div className={`${styles.formGroup} ${styles.expiryDateGroup}`}>
                    <label htmlFor="expiryDate">Expiry Date <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      disabled={!isCardPaymentAvailable}
                    />
                    {errors.expiryDate && <p className={styles.error}>{errors.expiryDate}</p>}
                  </div>
                  <div className={`${styles.formGroup} ${styles.cvvGroup}`}>
                    <label htmlFor="cvv">CVV <span className={styles.required}>*</span></label>
                    <input
                      type="text"
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      disabled={!isCardPaymentAvailable}
                    />
                    {errors.cvv && <p className={styles.error}>{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

        
        </div>
      </div>

    </div>
    <div className={styles.buttonGroup}>
    <button onClick={onPrevious} className={styles.backButton}>
          Previous
        </button>

          <button
            type="button"
            className={`${styles.proceedButton} ${loading ? styles.loading : ''}`}
            disabled={loading || (paymentMethod === 'card' && !isCardPaymentAvailable)}
            onClick={handleProceed}
          >
            {loading ? (
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              'Proceed with payment'
            )}
          </button>
        </div>
      {hotelId && (
          <button 
            className={styles.nextButton} 
            onClick={onNext}
          >
            Next
          </button>
        )}
    </div>
  );
};

export default PaymentForm;
