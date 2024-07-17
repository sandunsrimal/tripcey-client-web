import React, { useState, useEffect } from 'react';
import styles from './styles/ExpandableHotelroomSection.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { storage, db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { set } from 'react-hook-form';


const initialMeal = { mealName: '', mealType: '', price: '', category: [] };

const initialRoom = {
  roomName: '',
  description: '',
  price: '',
  active: true,
  images: [],
  persons: '',
  checkinTime: '',
  checkoutTime: '',
  doubleBeds: '',
  singleBeds: '',
  facilities: [],
  meals: [initialMeal],
};

const facilitiesList = ['parking', 'elevator', 'gym', 'pool', 'sofa', 'towels', 'toilet', 'sink', 'hairdryer', 'kitchen', 'kitchen equipments', 'living area', 'free wifi', 'tv', 'air conditioning', 'heating', 'shower', 'bathtub', 'bidet', 'washing machine', ];
const mealCategoriesList = ['Breakfirst', 'Lunch', 'Dinner'];

const ExpandableHotelRoomsSection = ({ title, hotelId }) => {
  const [hotelRooms, setHotelRooms] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newHotelRoom, setNewHotelRoom] = useState(initialRoom);
  const [editingIndex, setEditingIndex] = useState(null);
  const [images, setImages] = useState([]);
  const [checkinTime, setCheckinTime] = useState('');
  const [checkoutTime, setCheckoutTime] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [mealFormSubmitted, setMealFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchHotelRooms = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'tripcey-hotels', hotelId, 'hotel-rooms'));
        const fetchedHotelRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHotelRooms(fetchedHotelRooms);
      } catch (error) {
        console.error('Error fetching hotel rooms: ', error);
      }
    };
    fetchHotelRooms();
  }, []);
  
  const handleDeleteHotelRoom = async (index) => {
    try {
      const hotelRoomToDelete = hotelRooms[index];
      // Delete images from storage
      for (const image of hotelRoomToDelete.images) {
        const storageRef = ref(storage, image);
        await deleteObject(storageRef);
      }
      // Delete hotel room from Firestore
      await deleteDoc(doc(db, 'tripcey-hotels', hotelId, 'hotel-rooms', hotelRoomToDelete.id));
      // Remove hotel room from state
      setHotelRooms(hotelRooms.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting hotel room: ', error);
    }
  };
  
  const uploadImageToFirebase = async (image) => {
    const storageRef = ref(storage, `hotel-images/${hotelId}/hotel-rooms/${image.name}`);
    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  };
  
  const handleAddHotelRoom = async () => {
    setFormSubmitted(true);
    setMealFormSubmitted(true);
  
    const isFormValid = validateForm();
    
    if (isFormValid) {
      setLoading(true);
      try {
        const imageUrls = await Promise.all(images.map(image => uploadImageToFirebase(image)));
        const hotelRoomData = { ...newHotelRoom, images: imageUrls };
  
        const docRef = await addDoc(collection(db, 'tripcey-hotels', hotelId, 'hotel-rooms'), hotelRoomData);
        setHotelRooms([...hotelRooms, { id: docRef.id, ...hotelRoomData }]);
        setNewHotelRoom({ ...initialRoom, meals: [{ ...initialMeal }] });
        setImages([]);
        setIsExpanded(false);
        setCheckinTime('');
        setCheckoutTime('');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error adding hotel room: ', error);
        // Implement error handling UI feedback here
      }
    } else {
      setLoading(false);
      // Implement UI feedback for missing fields
    }
  };
  
  const validateForm = () => {
    const { roomName, meals, facilities } = newHotelRoom;
    if (meals.length > 0){
      meals.forEach(meal => {
        if (meal.mealName === '' || meal.mealType === '' || meal.price === ''){
          return false;
        }
      });
    }
    return (
      roomName &&
      images.length > 0 &&
      // meals.every(meal => validateMealForm(meal)) &&
      facilities.length > 0 
    );
  };
  
  const validateMealForm = (meal) => {
    return (
      meal.mealName &&
      meal.mealType &&
      meal.price
      // Add additional validations if needed
    );
  };
  
  const handleUpdateHotelRoom = async () => {
    if (newHotelRoom.roomName ) {
      setLoading(true);
      try {
        // Separate new images (File objects) from old images (URLs)
        const newImageFiles = images.filter(image => typeof image !== 'string');
        const oldImageUrls = images.filter(image => typeof image === 'string');
  
        // Upload new images to Firebase
        const newImageUrls = await Promise.all(newImageFiles.map(image => uploadImageToFirebase(image)));
  
        // Combine old and new image URLs
        const allImageUrls = [...oldImageUrls, ...newImageUrls];
  
        // Update hotel room data with combined image URLs
        const hotelRoomData = { ...newHotelRoom, images: allImageUrls };
  
        const hotelRoomToUpdate = hotelRooms[editingIndex];
        await updateDoc(doc(db, 'tripcey-hotels', hotelId, 'hotel-rooms', hotelRoomToUpdate.id), hotelRoomData);
  
        const updatedHotelRooms = [...hotelRooms];
        updatedHotelRooms[editingIndex] = { id: hotelRoomToUpdate.id, ...hotelRoomData };
        setHotelRooms(updatedHotelRooms);
  
        setNewHotelRoom({ ...initialRoom, meals: [{ ...initialMeal }] });
        setImages([]);
        setIsExpanded(false);
        setEditingIndex(null);
        setCheckinTime('');
        setCheckoutTime('');
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error updating hotel room: ', error);
      }
    } else {
      setLoading(false);
      alert('Please fill out all required fields before updating a hotel room.');
    }
  };
  
  const handleEditHotelRoom = (index) => {
    setEditingIndex(index);
    const hotelRoomToEdit = hotelRooms[index];
    setNewHotelRoom(hotelRoomToEdit);
    setImages(hotelRoomToEdit.images);
  
    // Set check-in and check-out times if they are part of the hotel room data
    setCheckinTime(hotelRoomToEdit.checkinTime || '');
    setCheckoutTime(hotelRoomToEdit.checkoutTime || '');
    setIsExpanded(true);
  };
  
  const handleCancelUpdate = () => {
    setNewHotelRoom({ ...initialRoom, meals: [{ ...initialMeal }] });
    setImages([]);
    setIsExpanded(false);
    setEditingIndex(null);
    setCheckinTime('');
    setCheckoutTime('');
  };
  
  const handleAddMeal = () => {
    setMealFormSubmitted(true);
    const lastMeal = newHotelRoom.meals[newHotelRoom.meals.length - 1];
    if (newHotelRoom.meals.length > 0) {
      if (validateMealForm(lastMeal)) {
        setNewHotelRoom(prevState => ({
          ...prevState,
          meals: [...prevState.meals, initialMeal]
        }));
      } else {
        // alert('Please fill out the current meal details before adding another meal.');
      }
    }else{
      setNewHotelRoom(prevState => ({
        ...prevState,
        meals: [...prevState.meals, initialMeal]
      }));
    }
   
    
  };
  


  const handleMealChange = (event, mealIndex) => {
    const { name, value, type, checked } = event.target;
    setNewHotelRoom(prevState => {
      const meals = [...prevState.meals];
      const mealToUpdate = { ...meals[mealIndex] };
  
      // Toggle the checkbox value in the category array
      if (type === 'checkbox') {
        if (checked) {
          mealToUpdate.category = [...mealToUpdate.category, name];
        } else {
          mealToUpdate.category = mealToUpdate.category.filter(cat => cat !== name);
        }
      } else {
        mealToUpdate[name] = value;
      }
  
      // Update the meals array with the updated meal
      meals[mealIndex] = mealToUpdate;
  
      // Reset state for new meal fields if needed
      if (name === 'mealName' && value === '') {
        meals[mealIndex] = initialMeal;
      }
  
      return { ...prevState, meals };
    });
  };
  
  
  const handleDeleteMeal = (mealIndex) => {
    if (newHotelRoom.meals.length > 0) {
      const updatedRooms = newHotelRoom.meals.filter((_, i) => i !== mealIndex);
      setNewHotelRoom(prevState => ({
        ...prevState,
        meals: updatedRooms
      }));
    } else {
      alert('Each hotel room must have at least one meal.');
    }
  };
  
  const handleInputChange = (event, setState) => {
    const { name, value } = event.target;
    setState(prevState => ({ ...prevState, [name]: value }));
  };
  
  const handleFacilitiesChange = (event) => {
    const { name, checked } = event.target;
    setNewHotelRoom(prevState => {
      const facilities = checked ? [...prevState.facilities, name] : prevState.facilities.filter(facility => facility !== name);
      return { ...prevState, facilities };
    });
  };

  
  
  const handleImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setImages(prevImages => [...prevImages, ...selectedImages]);
    setNewHotelRoom(prevState => ({
      ...prevState,
      images: [...prevState.images, ...selectedImages],
    }));
  };
  
  const handleRemoveImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
    setNewHotelRoom((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
  };
  
  const handleCheckinTimeChange = (event) => {
    setCheckinTime(event.target.value);
    newHotelRoom.checkinTime = event.target.value;
  };
  
  const handleCheckoutTimeChange = (event) => {
    setCheckoutTime(event.target.value);
    newHotelRoom.checkoutTime = event.target.value;
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
            <label>Room Title<span className={styles.required}>*</span></label>
            <input
              type="text"
              name="roomName"
              value={newHotelRoom.roomName}
              onChange={(e) => handleInputChange(e, setNewHotelRoom)}
              placeholder="Room Title"
              className={styles.inputField}
              required
            />
          {formSubmitted && !newHotelRoom.roomName && <p className={styles.error}>Room Title is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Room Description<span className={styles.required}>*</span></label>
            <textarea
              name="description"
              value={newHotelRoom.description}
              onChange={(e) => handleInputChange(e, setNewHotelRoom)}
              placeholder="Enter Room description"
              className={styles.textAreaField}
              required
            />
            { formSubmitted && !newHotelRoom.description && <p className={styles.error}>Room Description is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Price<span className={styles.required}>*</span></label>
            <input
              type="number"
              name="price"
              value={newHotelRoom.price}
              onChange={(e) => handleInputChange(e, setNewHotelRoom)}
              placeholder="Price per night (Rs.)"
              className={styles.inputField}
              required
            />
            { formSubmitted && !newHotelRoom.price && <p className={styles.error}>Price is required.</p>}
          </div>
          <div className={styles.formGroup}>
            <label>Persons<span className={styles.required}>*</span></label>
            <input
              type="number"
              name="persons"
              value={newHotelRoom.persons}
              onChange={(e) => handleInputChange(e, setNewHotelRoom)}
              placeholder="Number of Persons"
              className={styles.inputField}
              required
            />
            { formSubmitted && !newHotelRoom.persons && <p className={styles.error}>Number of Bathrooms is required.</p>}
          </div>
          <div className={styles.roombeds}>
              <div className={styles.roomsinglebed}>
                <label>Single Beds<span className={styles.required}>*</span></label>
                <input
                  type="number"
                  name="singleBeds"
                  value={newHotelRoom.singleBeds}
                  onChange={(e) => handleInputChange(e, setNewHotelRoom)}
                  placeholder="Number of Single Beds"
                  className={styles.inputField}
                  required
                />
                {  formSubmitted  && !newHotelRoom.singleBeds && <p className={styles.error}>Number of Single Beds is required.</p>}
              </div>
              <div className={styles.roomdoublebed}>
                <label>Double Beds<span className={styles.required}>*</span></label>
                <input
                  type="number"
                  name="doubleBeds"
                  value={newHotelRoom.doubleBeds}
                  onChange={(e) => handleInputChange(e, setNewHotelRoom)}
                  placeholder="Number of Double Beds"
                  className={styles.inputField}
                  required
                />
                { formSubmitted  && !newHotelRoom.doubleBeds && <p className={styles.error}>Number of Double Beds is required.</p>}
              </div>
            </div>
          <div className={styles.formGroup}>
            <div className={styles.checkincheckout}>
              <div className={styles.checkin}>
                <label>Check In<span className={styles.required}>*</span></label>
                <input 
                  type="time" 
                  id="checkintime" 
                  value={checkinTime} 
                  onChange={handleCheckinTimeChange} 
                  className={styles.checkintimer}
                  required
                />
                { formSubmitted && !checkinTime && <p className={styles.error}>Check In time is required.</p>}
              </div>
              <div className={styles.checkout}>
                <label>Check Out<span className={styles.required}>*</span></label>
                <input
                  type="time"
                  id="checkouttime"
                  value={checkoutTime}
                  onChange={handleCheckoutTimeChange}
                  className={styles.checkouttimer}
                  required
                />
                { formSubmitted && !checkoutTime && <p className={styles.error}>Check Out time is required.</p>}
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
                    checked={newHotelRoom.facilities.includes(facility)}
                    onChange={handleFacilitiesChange}
                  />
                  {facility}
                </label>
              ))}
              
            </div>
            {formSubmitted && newHotelRoom.facilities.length === 0 && <p className={styles.error}>Please select at least one facility.</p>}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Add Meals<span className={styles.required}>*</span></label>
        {newHotelRoom.meals.map((meal, roomIndex) => (
          <div key={roomIndex} className={styles.room}>
            <label>Meal Name<span className={styles.required}>*</span></label>
            <input
              type="text"
              name="mealName"
              value={meal.mealName}
              onChange={(e) => handleMealChange(e, roomIndex)}
              placeholder="Meal Name"
              className={styles.inputField}
              required
            />
            {  mealFormSubmitted  && !meal.mealName && <p className={styles.error}>Meal Name is required.</p>}
            <div className={styles.roombeds}>
              <div className={styles.roomsinglebed}>
                <label>Meal type<span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="mealType"
                  value={meal.mealType}
                  onChange={(e) => handleMealChange(e, roomIndex)}
                  placeholder="ex:- Sri Lankan, Indian, Mexican"
                  className={styles.inputField}
                  required
                />
                {  mealFormSubmitted  && !meal.mealType && <p className={styles.error}>Meal Type is required.</p>}
              </div>
              <div className={styles.roomdoublebed}>
                <label>Price<span className={styles.required}>*</span></label>
                <input
                  type="number"
                  name="price"
                  value={meal.price}
                  onChange={(e) => handleMealChange(e, roomIndex)}
                  placeholder="Price per person (Rs.)"
                  className={styles.inputField}
                  required
                />
                { mealFormSubmitted  && !meal.price && <p className={styles.error}>Number of Double Beds is required.</p>}
              </div>
            </div>
            <div className={styles.roompersons}>
             
              <div className={styles.roomlabel}>
                {mealCategoriesList.map((category, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      name={category}
                      checked={meal.category.includes(category)}
                      onChange={(e) => handleMealChange(e, roomIndex)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.roomfooter}>
              {newHotelRoom.meals.length > 0 && (
                <button type="button" onClick={() => handleDeleteMeal(roomIndex)} className={styles.removeButton}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="button" onClick={handleAddMeal} className={styles.addRoomButton}>
            Add Meal
          </button>
        </div>

      </div>
      <div className={styles.footer}>
        {editingIndex !== null ? (
          <>
            <button
            type="button"
            onClick={handleUpdateHotelRoom}
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
            onClick={handleAddHotelRoom}
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
              'Add Hotel Room'
            )}
          </button>

        )}
      </div>
    </div>
  )}
</div>

      {editingIndex === null && (
      <div className={styles.apartmentList}>
        {hotelRooms.map((apartment, index) => (
          <div key={index} className={styles.apartmentItem}>
            <h4>Hotel Room Details:</h4>
            <table className={styles.apartmentTable}>
              <tbody>
                <tr>
                  <th>Title</th>
                  <td>{apartment.roomName}</td>
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
                  <td>Rs. {apartment.price}</td>
                </tr>
                <tr>
                  <th>Persons</th>
                  <td>{apartment.persons}</td>
                </tr>
                <tr>
                  <th>Check in</th>
                  <td>{apartment.checkinTime}</td>
                </tr>
                <tr>
                  <th>Check out</th>
                  <td>{apartment.checkoutTime}</td>
                </tr>
                <tr>
                  <th>Facilities</th>
                  <td>{apartment.facilities.join(', ')}</td>
                </tr>
              </tbody>
            </table>
            <div className={styles.roomsSection}>
              <h4>Availiable Meals:</h4>
              {apartment.meals.map((room, i) => (
                <div key={i}>
                  <table className={styles.roomTable}>
                    <thead>
                      <tr>
                        <th colSpan="4">Meal {i + 1}</th>
                      </tr>
                      <tr>
                        <th>Meal Name</th>
                        <th>Meal Type</th>
                        <th>Price per person</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{room.mealName}</td>
                        <td>{room.mealType}</td>
                        <td>Rs. {room.price}</td>

                      </tr>
                      <tr>
                        <th>Category</th>
                        <td colSpan="3">
                          {apartment.meals[i].category.join(', ')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
           <div className={styles.footer}>
              <button type="button" onClick={() => handleEditHotelRoom(index)} className={styles.editButton}>
                Edit
              </button>
              <button type="button" onClick={() => handleDeleteHotelRoom(index)} className={styles.deleteButton}>
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

export default ExpandableHotelRoomsSection;
