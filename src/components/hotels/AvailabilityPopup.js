import React, { useEffect, useState } from 'react';
import styles from './styles/AvailabilityPopup.module.css';
import { db } from '@/firebaseConfig';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const BookingForm = ({ onSave, onCancel }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleSave = () => {
    if (fromDate && toDate) {
      onSave({ fromDate, toDate });
      setFromDate('');
      setToDate('');
    } else {
      alert('Please select both dates');
    }
  };

  return (
    <div className={styles.bookingForm}>
      <label>
        From:
        <input 
          type="date" 
          value={fromDate} 
          onChange={(e) => setFromDate(e.target.value)} 
        />
      </label>
      <label>
        To:
        <input 
          type="date" 
          value={toDate} 
          onChange={(e) => setToDate(e.target.value)} 
        />
      </label>
      <button onClick={handleSave}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

const AvailabilityPopup = ({ hotelId, onClose }) => {
  const [hotelStatus, setHotelStatus] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [hotelRooms, setHotelRooms] = useState([]);
  const [showApartments, setShowApartments] = useState(false);
  const [showHotelRooms, setShowHotelRooms] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHotelStatus = async () => {
      try {
        const hotelDoc = await getDoc(doc(db, 'tripcey-hotels', hotelId));
        if (hotelDoc.exists()) {
          setHotelStatus(hotelDoc.data().active);
        } else {
          console.error('No such hotel!');
        }
      } catch (error) {
        console.error('Error fetching hotel status: ', error);
      }
    };

    const fetchApartments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tripcey-hotels', hotelId, 'apartments'));
        const fetchedApartments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApartments(fetchedApartments);
      } catch (error) {
        console.error('Error fetching apartments: ', error);
      }
    };

    const fetchHotelRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tripcey-hotels', hotelId, 'hotel-rooms'));
        const fetchedHotelRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHotelRooms(fetchedHotelRooms);
      } catch (error) {
        console.error('Error fetching hotel rooms: ', error);
      }
    };

    if (hotelId) {
      fetchHotelStatus();
      fetchApartments();
      fetchHotelRooms();
    }
  }, [hotelId]);

  const toggleHotelStatus = async () => {
    const newStatus = !hotelStatus;
    setHotelStatus(newStatus);
    await updateDoc(doc(db, 'tripcey-hotels', hotelId), { active: newStatus });
  };

  const toggleApartmentStatus = async (apartmentId, currentStatus) => {
    if (!hotelStatus) return; // Prevent toggling if hotel is inactive
    const newStatus = !currentStatus;
    setApartments(apartments.map(apartment =>
      apartment.id === apartmentId ? { ...apartment, active: newStatus } : apartment
    ));
    await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'apartments', apartmentId), { active: newStatus });
  };

  const toggleHotelRoomStatus = async (roomId, currentStatus) => {
    if (!hotelStatus) return; // Prevent toggling if hotel is inactive
    const newStatus = !currentStatus;
    setHotelRooms(hotelRooms.map(room =>
      room.id === roomId ? { ...room, active: newStatus } : room
    ));
    await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'hotel-rooms', roomId), { active: newStatus });
  };

  const handleAddBookedDays = (item) => {
    setSelectedItem(item);
    setShowBookingForm(true);
  };

  const handleSaveBooking = async (booking) => {
    const { fromDate, toDate } = booking;
    if (selectedItem.type === 'apartment') {
      const updatedApartments = apartments.map(apartment =>
        apartment.id === selectedItem.id
          ? { ...apartment, bookedDays: [...(apartment.bookedDays || []), { fromDate, toDate }] }
          : apartment
      );
      setApartments(updatedApartments);
      await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'apartments', selectedItem.id), { bookedDays: updatedApartments.find(a => a.id === selectedItem.id).bookedDays });
    } else {
      const updatedHotelRooms = hotelRooms.map(room =>
        room.id === selectedItem.id
          ? { ...room, bookedDays: [...(room.bookedDays || []), { fromDate, toDate }] }
          : room
      );
      setHotelRooms(updatedHotelRooms);
      await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'hotel-rooms', selectedItem.id), { bookedDays: updatedHotelRooms.find(r => r.id === selectedItem.id).bookedDays });
    }
    setShowBookingForm(false);
    setSelectedItem(null);
  };

  const handleDeleteBooking = async (item, bookingIndex) => {
    if (item.type === 'apartment') {
      const updatedApartments = apartments.map(apartment =>
        apartment.id === item.id
          ? { ...apartment, bookedDays: apartment.bookedDays.filter((_, index) => index !== bookingIndex) }
          : apartment
      );
      setApartments(updatedApartments);
      await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'apartments', item.id), { bookedDays: updatedApartments.find(a => a.id === item.id).bookedDays });
    } else {
      const updatedHotelRooms = hotelRooms.map(room =>
        room.id === item.id
          ? { ...room, bookedDays: room.bookedDays.filter((_, index) => index !== bookingIndex) }
          : room
      );
      setHotelRooms(updatedHotelRooms);
      await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'hotel-rooms', item.id), { bookedDays: updatedHotelRooms.find(r => r.id === item.id).bookedDays });
    }
  };

  return (
    <div className={styles.availabilityOverlay}>
      <div className={styles.availabilityPopup}>
        <h2>Availability Details</h2>
        <div className={styles.statusToggle}>
          <span>Hotel Status:</span>
          <div 
            className={`${styles.reactToggle} ${hotelStatus ? styles.checked : ''}`} 
            onClick={toggleHotelStatus}
          />
          <span>{hotelStatus ? 'Active' : 'Inactive'}</span>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader} onClick={() => setShowApartments(!showApartments)}>
            <span>Apartments</span>
            <button>Show</button>
          </div>
          {showApartments && (
            <div className={styles.sectionContent}>
              {apartments.map((apartment) => (
                <div key={apartment.id} className={styles.item}>
                  <span>{apartment.apartmentName}</span>
                  <button onClick={() => handleAddBookedDays({ id: apartment.id, type: 'apartment' })}>Already Booked Days</button>
                  <div 
                    className={`${styles.reactToggle} ${apartment.active ? styles.checked : ''} ${!hotelStatus ? styles.disabled : ''}`} 
                    onClick={() => toggleApartmentStatus(apartment.id, apartment.active)}
                  />
                  {apartment.bookedDays && (
                    <ul>
                      {apartment.bookedDays.map((day, index) => (
                        <li key={index}>
                          {day.fromDate} - {day.toDate}
                          <button onClick={() => handleDeleteBooking({ id: apartment.id, type: 'apartment' }, index)}>Delete</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader} onClick={() => setShowHotelRooms(!showHotelRooms)}>
            <span>Hotel Rooms</span>
            <button>Show</button>
          </div>
          {showHotelRooms && (
            <div className={styles.sectionContent}>
              {hotelRooms.map((room) => (
                <div key={room.id} className={styles.item}>
                  <span>{room.roomName}</span>
                  <button onClick={() => handleAddBookedDays({ id: room.id, type: 'room' })}>Already Booked Days</button>
                  <div 
                    className={`${styles.reactToggle} ${room.active ? styles.checked : ''} ${!hotelStatus ? styles.disabled : ''}`} 
                    onClick={() => toggleHotelRoomStatus(room.id, room.active)}
                  />
                  {room.bookedDays && (
                    <ul>
                      {room.bookedDays.map((day, index) => (
                        <li key={index}>
                          {day.fromDate} - {day.toDate}
                          <button onClick={() => handleDeleteBooking({ id: room.id, type: 'room' }, index)}>Delete</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {showBookingForm && (
          <BookingForm 
            onSave={handleSaveBooking} 
            onCancel={() => {
              setShowBookingForm(false);
              setSelectedItem(null);
            }} 
          />
        )}
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AvailabilityPopup;
