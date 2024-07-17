import React, { useState, useEffect } from 'react';
import styles from './styles/ExpandableApartmentsSection.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { storage, db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { set } from 'react-hook-form';


const initialRoom = { roomName: '', singleBeds: '', doubleBeds: '', persons: '', roomfacilities: [] };

const initialApartment = {
  apartmentName: '',
  description: '',
  price: '',
  images: [],
  bathrooms: '',
  active: true,
  checkintime: '',
  checkouttime: '',
  facilities: [],
  rooms: [initialRoom],
};

const facilitiesList = ['parking', 'elevator', 'gym', 'pool', 'sofa', 'towels', 'toilet', 'sink', 'hairdryer', 'kitchen', 'kitchen equipments', 'living area', 'free wifi', 'tv', 'air conditioning', 'heating', 'shower', 'bathtub', 'bidet', 'washing machine', ];
const roomFacilitiesList = ['private bathroom', 'air conditioning', 'heating'];

const ExpandableApartmentsSection = ({ title, hotelId }) => {
  const [apartments, setApartments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newApartment, setNewApartment] = useState(initialApartment);
  const [editingIndex, setEditingIndex] = useState(null);
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [checkintime, setcheckinTime] = useState('');
  const [checkouttime, setcheckoutTime] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [roomformSubmitted, setroomFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tripcey-hotels', hotelId, 'apartments'));
        const fetchedApartments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setApartments(fetchedApartments);
      } catch (error) {
        console.error('Error fetching apartments: ', error);
      }
    };
    fetchApartments();
  }, []);

  const handleDeleteApartment = async (index) => {
    try {
      const apartmentToDelete = apartments[index];
      // Delete images from storage
      for (const image of apartmentToDelete.images) {
        const storageRef = ref(storage, image);
        await deleteObject(storageRef);
      }
      // Delete apartment from Firestore
      await deleteDoc(doc(db, 'tripcey-hotels', hotelId, 'apartments', apartmentToDelete.id));
      // Remove apartment from state
      setApartments(apartments.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting apartment: ', error);
    }
  };




  const uploadImageToFirebase = async (image) => {
    const storageRef = ref(storage, `hotel-images/${hotelId}/apartments/${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };
  

  const handleAddApartment = async () => {
    setFormSubmitted(true);
    setroomFormSubmitted(true);

    const isFormValid = validateForm();
    
    if (isFormValid) {
      setLoading(true);
      try {
        const imageUrls = await Promise.all(images.map(image => uploadImageToFirebase(image)));
        const apartmentData = { ...newApartment, images: imageUrls };
  
        const docRef = await addDoc(collection(db, 'tripcey-hotels', hotelId, 'apartments'), apartmentData);
        setApartments([...apartments, { id: docRef.id, ...apartmentData }]);
        setNewApartment({ ...initialApartment, rooms: [{ ...initialRoom }] });
        setImages([]);
        setIsExpanded(false);
        setcheckinTime('');
        setcheckoutTime('');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error adding apartment: ', error);
        // Implement error handling UI feedback here
      }
    } else {
      setLoading(false);
      // Implement UI feedback for missing fields
    }
  };
  
  const validateForm = () => {
    const { apartmentName, rooms, facilities } = newApartment;
    return (
      apartmentName &&
      rooms.length > 0 &&
      rooms.every(room => room.roomName) &&
      images.length > 0 &&
      facilities.length > 0 
    );
  };

  const validateRoomForm = (room) => {
    return (
      room.roomName &&
      room.singleBeds &&
      room.doubleBeds &&
      room.persons
      // Add additional validations if needed
    );
  };
  
  
  const handleUpdateApartment = async () => {
    if (newApartment.apartmentName && newApartment.rooms.length > 0 && newApartment.rooms[0].roomName) {
      setLoading(true);
      try {
        // Separate new images (File objects) from old images (URLs)
        const newImageFiles = images.filter(image => typeof image !== 'string');
        const oldImageUrls = images.filter(image => typeof image === 'string');
  
        // Upload new images to Firebase
        const newImageUrls = await Promise.all(newImageFiles.map(image => uploadImageToFirebase(image)));
  
        // Combine old and new image URLs
        const allImageUrls = [...oldImageUrls, ...newImageUrls];
  
        // Update apartment data with combined image URLs
        const apartmentData = { ...newApartment, images: allImageUrls };
  
        const apartmentToUpdate = apartments[editingIndex];
        await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'apartments', apartmentToUpdate.id), apartmentData);
  
        const updatedApartments = [...apartments];
        updatedApartments[editingIndex] = { id: apartmentToUpdate.id, ...apartmentData };
        setApartments(updatedApartments);
  
        setNewApartment({ ...initialApartment, rooms: [{ ...initialRoom }] });
        setImages([]);
        setIsExpanded(false);
        setEditingIndex(null);
        setcheckinTime('');
        setcheckoutTime('');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error updating apartment: ', error);
      }
    } else {
      setLoading(false);
      alert('Please fill out all required fields before updating an apartment.');
    }
  };
  


  const handleImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...selectedImages]);
    setNewApartment(prevState => ({
      ...prevState,
      images: [...prevState.images, ...selectedImages],
    }));
  };
  
  

  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setNewApartment((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
  };
  

  
  
  

  const handleEditApartment = (index) => {
    setEditingIndex(index);
    const apartmentToEdit = apartments[index];
    setNewApartment(apartmentToEdit);
    setImages(apartmentToEdit.images);
  
    // Set check-in and check-out times if they are part of the apartment data
    setcheckinTime(apartmentToEdit.checkintime || '');
    setcheckoutTime(apartmentToEdit.checkouttime || '');
    setIsExpanded(true);
  };
  
  const handleCancelUpdate = () => {
    setNewApartment({ ...initialApartment, rooms: [{ ...initialRoom }] });
    setImages([]);
    setIsExpanded(false);
    setEditingIndex(null);
    setcheckinTime('');
    setcheckoutTime('');
  };
  

  const handleAddRoom = () => {
    setroomFormSubmitted(true);
    const lastRoom = newApartment.rooms[newApartment.rooms.length - 1];
    if (validateRoomForm(lastRoom)) {
      setNewApartment(prevState => ({
        ...prevState,
        rooms: [...prevState.rooms, initialRoom]
      }));
    } else {
      // alert('Please fill out the current room details before adding another room.');
    }
  };
  


  const handleRoomChange = (event, roomIndex) => {
    const { name, value, type, checked } = event.target;
    setNewApartment(prevState => {
      const rooms = [...prevState.rooms];
      const roomToUpdate = { ...rooms[roomIndex] };
  
      // Toggle checkbox value or update other fields
      if (type === 'checkbox') {
        roomToUpdate.roomfacilities = checked
          ? [...roomToUpdate.roomfacilities, name]
          : roomToUpdate.roomfacilities.filter(fac => fac !== name);
      } else {
        roomToUpdate[name] = value;
      }
  
      // Update rooms array with modified room
      rooms[roomIndex] = roomToUpdate;
  
      // Reset room fields if roomName is cleared
      if (name === 'roomName' && value === '') {
        rooms[roomIndex] = { ...initialRoom }; // Reset room fields
      }
  
      return { ...prevState, rooms };
    });
  };
  
  
  

  const handleDeleteRoom = (roomIndex) => {
    if (newApartment.rooms.length > 1) {
      const updatedRooms = newApartment.rooms.filter((_, i) => i !== roomIndex);
      setNewApartment(prevState => ({
        ...prevState,
        rooms: updatedRooms
      }));
    } else {
      alert('Each apartment must have at least one room.');
    }
  };

  const handleInputChange = (event, setState) => {
    const { name, value } = event.target;
    setState(prevState => ({ ...prevState, [name]: value }));
  };


  const handleFacilitiesChange = (event) => {
    const { name, checked } = event.target;
    setNewApartment(prevState => {
      const facilities = checked ? [...prevState.facilities, name] : prevState.facilities.filter(facility => facility !== name);
      return { ...prevState, facilities };
    });
  };



  const handlecheckinTimeChange = (event) => {
    setcheckinTime(event.target.value);
    newApartment.checkintime = event.target.value;
  };
  
  const handlecheckoutTimeChange = (event) => {
    setcheckoutTime(event.target.value);
    newApartment.checkouttime = event.target.value;
  };


  return (
    <div className={styles.container}>
 <div className={styles.section}>
  <div className={styles.header}>
    <h3>{title}</h3>
    <button onClick={() => setIsExpanded(!isExpanded)} className={styles.addButton}>
      {isExpanded ? 'Close' : 'Add'}
    </button>
  </div>
  {isExpanded && (
    <div className={styles.content}>
      <div className={styles.sidegroup}>
        <div className={styles.leftside}>
          <div className={styles.formGroup}>
            <label>Apartment Title<span className={styles.required}>*</span></label>
            <input
              type="text"
              name="apartmentName"
              value={newApartment.apartmentName}
              onChange={(e) => handleInputChange(e, setNewApartment)}
              placeholder="Apartment Title"
              className={styles.inputField}
              required
            />
          {formSubmitted && !newApartment.apartmentName && <p className={styles.error}>Apartment Title is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Apartment Description<span className={styles.required}>*</span></label>
            <textarea
              name="description"
              value={newApartment.description}
              onChange={(e) => handleInputChange(e, setNewApartment)}
              placeholder="Enter apartment description"
              className={styles.textAreaField}
              required
            />
            { formSubmitted && !newApartment.description && <p className={styles.error}>Apartment Description is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Price<span className={styles.required}>*</span></label>
            <input
              type="number"
              name="price"
              value={newApartment.price}
              onChange={(e) => handleInputChange(e, setNewApartment)}
              placeholder="Price (Rs.)"
              className={styles.inputField}
              required
            />
            { formSubmitted && !newApartment.price && <p className={styles.error}>Price is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Bathrooms<span className={styles.required}>*</span></label>
            <input
              type="number"
              name="bathrooms"
              value={newApartment.bathrooms}
              onChange={(e) => handleInputChange(e, setNewApartment)}
              placeholder="Number of Bathrooms"
              className={styles.inputField}
              required
            />
            { formSubmitted && !newApartment.bathrooms && <p className={styles.error}>Number of Bathrooms is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <div className={styles.checkincheckout}>
              <div className={styles.checkin}>
                <label>Check In<span className={styles.required}>*</span></label>
                <input 
                  type="time" 
                  id="checkintime" 
                  value={checkintime} 
                  onChange={handlecheckinTimeChange} 
                  className={styles.checkintimer}
                  required
                />
                { formSubmitted && !checkintime && <p className={styles.error}>Check In time is required.</p>}
              </div>
              <div className={styles.checkout}>
                <label>Check Out<span className={styles.required}>*</span></label>
                <input
                  type="time"
                  id="checkouttime"
                  value={checkouttime}
                  onChange={handlecheckoutTimeChange}
                  className={styles.checkouttimer}
                  required
                />
                { formSubmitted && !checkouttime && <p className={styles.error}>Check Out time is required.</p>}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightside}>
          <div className={styles.formGroup}>
            <label>Images<span className={styles.required}>*</span></label>
            <div className={styles.imageUploadWrapper}>
              <input type="file" multiple onChange={handleImagesChange} className={styles.fileInput} required />
              {!images.length && (
                <div className={styles.imageUploadPlaceholder}>
                  <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadIcon} />
                  <div>Upload images</div>
                  <div className={styles.uploadtxt}>Supported format: PNG, JPG</div>
                  <div>(max-size: 1MB)</div>
                </div>
              )}
              {images.length > 0 && (
                <div className={styles.imagePreviewContainer}>
                  {images.map((image, index) => (
                    <div key={index} className={styles.imagePreviewWrapper}>
                      <img
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Image ${index}`}
                        className={styles.imagePreview}
                      />
                      <button type="button" className={styles.clearButton} onClick={() => handleRemoveImage(index)}>✖</button>
                    </div>
                  ))}
                </div>
              )}
              {formSubmitted && images.length === 0 && <p className={styles.error}>Please upload at least one image.</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Facilities<span className={styles.required}>*</span></label>
            <div className={styles.facilities}>
              {facilitiesList.map((facility, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    name={facility}
                    checked={newApartment.facilities.includes(facility)}
                    onChange={handleFacilitiesChange}
                  />
                  {facility}
                </label>
              ))}
              
            </div>
            {formSubmitted && newApartment.facilities.length === 0 && <p className={styles.error}>Please select at least one facility.</p>}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Add Rooms<span className={styles.required}>*</span></label>
        {newApartment.rooms.map((room, roomIndex) => (
          <div key={roomIndex} className={styles.room}>
            <label>Room Title<span className={styles.required}>*</span></label>
            <input
              type="text"
              name="roomName"
              value={room.roomName}
              onChange={(e) => handleRoomChange(e, roomIndex)}
              placeholder="Room Title"
              className={styles.inputField}
              required
            />
            {  roomformSubmitted  && !room.roomName && <p className={styles.error}>Room Title is required.</p>}
            <div className={styles.roombeds}>
              <div className={styles.roomsinglebed}>
                <label>Single Beds<span className={styles.required}>*</span></label>
                <input
                  type="number"
                  name="singleBeds"
                  value={room.singleBeds}
                  onChange={(e) => handleRoomChange(e, roomIndex)}
                  placeholder="Number of Single Beds"
                  className={styles.inputField}
                  required
                />
                {  roomformSubmitted  && !room.singleBeds && <p className={styles.error}>Number of Single Beds is required.</p>}
              </div>
              <div className={styles.roomdoublebed}>
                <label>Double Beds<span className={styles.required}>*</span></label>
                <input
                  type="number"
                  name="doubleBeds"
                  value={room.doubleBeds}
                  onChange={(e) => handleRoomChange(e, roomIndex)}
                  placeholder="Number of Double Beds"
                  className={styles.inputField}
                  required
                />
                { roomformSubmitted  && !room.doubleBeds && <p className={styles.error}>Number of Double Beds is required.</p>}
              </div>
            </div>
            <label>Persons<span className={styles.required}>*</span></label>
            <div className={styles.roompersons}>
              <div className={styles.roompersonlabel}>
                <input
                  type="number"
                  name="persons"
                  value={room.persons}
                  onChange={(e) => handleRoomChange(e, roomIndex)}
                  placeholder="Number of Persons"
                  className={styles.inputField}
                  required
                />
                {  roomformSubmitted && !room.persons && <p className={styles.error}>Number of Persons is required.</p>}
              </div>
              <div className={styles.roomlabel}>
                {roomFacilitiesList.map((facility, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      name={facility}
                      checked={room.roomfacilities.includes(facility)}
                      onChange={(e) => handleRoomChange(e, roomIndex)}
                    />
                    {facility}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.roomfooter}>
              {newApartment.rooms.length > 1 && (
                <button type="button" onClick={() => handleDeleteRoom(roomIndex)} className={styles.removeButton}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={handleAddRoom} className={styles.addRoomButton}>
            Add Room
          </button>
        </div>

      </div>
      <div className={styles.footer}>
        {editingIndex !== null ? (
          <>
            <button
            type="button"
            onClick={handleUpdateApartment}
            className={styles.addMainButton}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              'Update Apartment'
            )}
          </button>
            <button type="button" onClick={handleCancelUpdate} className={styles.cancelButton}>
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleAddApartment}
            className={styles.addMainButton}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              'Add Apartment'
            )}
          </button>

        )}
      </div>
    </div>
  )}
</div>

      {editingIndex === null && (
      <div className={styles.apartmentList}>
        {apartments.map((apartment, index) => (
          <div key={index} className={styles.apartmentItem}>
            <h4>Apartment Details:</h4>
            <table className={styles.apartmentTable}>
              <tbody>
                <tr>
                  <th>Title</th>
                  <td>{apartment.apartmentName}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{apartment.description}</td>
                </tr>
                <tr>
                  <th>Images</th>
                  <td>
                  <div className={styles.imageGallery}>
                {apartment.images.map((imageUrl, idx) => (
                  <img key={idx} src={imageUrl} alt={`Apartment ${index} Image ${idx}`} className={styles.apartmentImage} />
                ))}
              </div>
                  </td>
                </tr>
                <tr>
                  <th>Price</th>
                  <td>{apartment.price}</td>
                </tr>
                <tr>
                  <th>Bathrooms</th>
                  <td>{apartment.bathrooms}</td>
                </tr>
                <tr>
                  <th>Check in</th>
                  <td>{apartment.checkintime}</td>
                </tr>
                <tr>
                  <th>Check out</th>
                  <td>{apartment.checkouttime}</td>
                </tr>
                <tr>
                  <th>Facilities</th>
                  <td>{apartment.facilities.join(', ')}</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.roomsSection}>
              <h4>Room Details:</h4>
              {apartment.rooms.map((room, i) => (
                <div key={i}>
                  <table className={styles.roomTable}>
                    <thead>
                      <tr>
                        <th colSpan="4">Room {i + 1}</th>
                      </tr>
                      <tr>
                        <th>Room Title</th>
                        <th>Single Beds</th>
                        <th>Double Beds</th>
                        <th>Persons</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{room.roomName}</td>
                        <td>{room.singleBeds}</td>
                        <td>{room.doubleBeds}</td>
                        <td>{room.persons}</td>
                      </tr>
                      <tr>
                        <th>Facilities</th>
                        <td colSpan="3">
                          {apartment.rooms[i].roomfacilities.join(', ')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
           <div className={styles.footer}>
              <button type="button" onClick={() => handleEditApartment(index)} className={styles.editButton}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteApartment(index)} className={styles.deleteButton}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
    </div>
  );
};

export default ExpandableApartmentsSection;
