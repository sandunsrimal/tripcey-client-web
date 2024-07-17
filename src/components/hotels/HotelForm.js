import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { collection, addDoc, doc, setDoc, getDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import { db, storage } from '@/firebaseConfig';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import styles from './styles/HotelForm.module.css';
import dynamic from 'next/dynamic';
import { getUserId } from '@/utils/getUserId'; // Import the getUserId function
import { Timestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import TagsInput from '../TagsInput'; // Import TagsInput component

const districts = ["Colombo", "Galle", "Kandy", "Jaffna", "Gampaha"]; // Add all districts

const MapContainer = dynamic(() => import('react-leaflet').then(module => module.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(module => module.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(module => module.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(module => module.useMapEvents), { ssr: false });

const MapPicker = ({ onSelectLocation }) => {
  const [position, setPosition] = useState([6.9271, 79.8612]); // Default position (Colombo, Sri Lanka)
  const [L, setL] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      const leaflet = await import('leaflet');
      setL(leaflet);
    })();
  }, []);

  if (!L) return null;

  const customMarker = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onSelectLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
      },
    });

    const handleDragEnd = (e) => {
      const newPos = e.target.getLatLng();
      setPosition([newPos.lat, newPos.lng]);
      onSelectLocation({ lat: newPos.lat, lon: newPos.lng });
    };

    return position === null ? null : (
      <Marker
        position={position}
        icon={customMarker}
        draggable={true}
        eventHandlers={{
          dragend: handleDragEnd,
        }}
      ></Marker>
    );
  };

  const handleInputChange = async (value) => {
    setSearchAddress(value);
    if (value.length > 2) {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&viewbox=79.652,9.831,81.879,5.848&bounded=1`);
      setSuggestions(response.data);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (lat, lon, display_name) => {
    setPosition([lat, lon]);
    onSelectLocation({ lat, lon });
    setSearchAddress(display_name);
    setSuggestions([]);
  };

  return (
    <div>
      <label className={styles.mapLabel}>Select Location</label>
      <input
        value={searchAddress}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search Places ..."
        className={styles.input}
      />
      {suggestions.length > 0 && searchAddress && (
        <div className={styles.autocompleteDropdownContainer}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.place_id}
              className={styles.suggestionItem}
              onClick={() => handleSelect(suggestion.lat, suggestion.lon, suggestion.display_name)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
      <MapContainer key={position.toString()} center={position} zoom={13} className={styles.mapContainer}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};


const HotelForm = ({ onNext, setHotelId, hotelId }) => {
  const { register, handleSubmit, control, setError, clearErrors, formState: { errors }, setValue } = useForm();
  const [primaryImage, setPrimaryImage] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [newSecondaryImages, setNewSecondaryImages] = useState([]);
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({ lat: null, lon: null });
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [formData, setFormData] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null); 

  useEffect(() => {
    if (primaryImage) clearErrors('primaryImage');
    if (secondaryImages.length > 0) clearErrors('secondaryImages');
    if (address) clearErrors('address');
    if (selectedDistrict) clearErrors('state');
  }, [primaryImage, secondaryImages, address, selectedDistrict, clearErrors]);

  useEffect(() => {
    const fetchHotelData = async () => {
      if (hotelId) {
        try {
          const docRef = doc(db, 'tripcey-hotels', hotelId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(data);
            setValue('hotelName', data.hotelName);
            setValue('description', data.description);
            setValue('category', data.category);
            setValue('contactNumber', data.contactNumber);
            setValue('website', data.website || '');
            setAddress(data.address || '');
            setLocation({ lat: data.lat, lon: data.lon });
            setTags(data.tags || []);
            setPrimaryImage(data.primaryImage);
            setSecondaryImages(data.secondaryImages);
            setSelectedDistrict(data.state);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching document:', error);
        }
      }
    };
    fetchHotelData();
  }, [hotelId, setValue]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const uid = await getUserId();
        setUserId(uid);
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  const generateHotelId = () => `hotel_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const generateImageId = () => `image_${Math.floor(Math.random() * 10000)}`;


  const uploadImageToFirebase = async (image, hotelId) => {
    const uniqueId = generateImageId(); // Example: you can use a timestamp for uniqueness
    const imageName = `${uniqueId}_${image.name}`;
  
    const imageRef = ref(storage, `hotel-images/${hotelId}/${imageName}`);
    await uploadBytes(imageRef, image);
    const downloadURL = await getDownloadURL(imageRef);
    
    return downloadURL;
  };
  

  const deleteImageFromFirebase = async (imageUrl) => {
    const baseUrl = "https://firebasestorage.googleapis.com/v0/b/traveler-admin.appspot.com/o/";
    const imagePath = decodeURIComponent(imageUrl.replace(baseUrl, "").split("?")[0]);
    const imageRef = ref(storage, imagePath);
    try {
      await deleteObject(imageRef);
      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  };

  const handlePrimaryImageChange = (e) => setPrimaryImage(e.target.files[0]);
  
  const handleSecondaryImagesChange = (e) => {
    const selectedImages = Array.from(e.target.files);
    setSecondaryImages(prevImages => [...prevImages, ...selectedImages]);
    setNewSecondaryImages(prevImages => [...prevImages, ...selectedImages]);
  };

  const handleRemoveSecondaryImage = (index) => {
    const imageToRemove = secondaryImages[index];
    if (typeof imageToRemove === 'string') {
      setImagesToDelete(prevImages => [...prevImages, imageToRemove]);
    }
    setSecondaryImages(prevImages => prevImages.filter((_, i) => i !== index));
    setNewSecondaryImages(prevImages => prevImages.filter((_, i) => prevImages[i] !== imageToRemove));
  };

  const handleSelectLocation = async (location) => {
    setLocation(location);
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`);
      setAddress(response.data.display_name);
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };
  

  const onSubmit = async (data) => {
    setLoading(true);
    let hasError = false;

    if (!primaryImage) {
      setError('primaryImage', { type: 'required', message: 'Primary image is required' });
      hasError = true;
    }
    if (secondaryImages.length === 0) {
      setError('secondaryImages', { type: 'required', message: 'At least one secondary image is required' });
      hasError = true;
    }
    if (!address) {
      setError('address', { type: 'required', message: 'Address is required' });
      hasError = true;
    }
    if (!selectedDistrict) {
      setError('state', { type: 'required', message: 'State is required' });
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      let hId = hotelId || generateHotelId();
      let primaryImageUrl = primaryImage;
      let secondaryImageUrls = secondaryImages;

      if (!hotelId) {
        primaryImageUrl = await uploadImageToFirebase(primaryImage, hId);
        secondaryImageUrls = await Promise.all(secondaryImages.map(image => uploadImageToFirebase(image, hId)));
        await setDoc(doc(db, "tripcey-hotels", hId), {
          ...data,
          address,
          id: hId,
          payment_status: 'Not Paid',
          lat: location.lat,
          lon: location.lon,
          primaryImage: primaryImageUrl,
          secondaryImages: secondaryImageUrls,
          state: selectedDistrict,
          status: "Draft",
          step: 1,
          active: true,
          userId,
          uploadDate: Timestamp.now(),
          tags,
        });
      } else {
        if (typeof primaryImage !== 'string') {
          primaryImageUrl = await uploadImageToFirebase(primaryImage, hId);
        }
        const newSecondaryImageUrls = await Promise.all(newSecondaryImages.map(image => uploadImageToFirebase(image, hId)));
        const existingSecondaryImages = secondaryImages.filter(img => typeof img === 'string');
        secondaryImageUrls = [...existingSecondaryImages, ...newSecondaryImageUrls];
        await updateDoc(doc(db, "tripcey-hotels", hId), {
          ...data,
          address,
          lat: location.lat,
          lon: location.lon,
          primaryImage: primaryImageUrl,
          secondaryImages: secondaryImageUrls,
          state: selectedDistrict,
          uploadDate: Timestamp.now(),
          tags,
        });
        for (const imageUrl of imagesToDelete) {
          await deleteImageFromFirebase(imageUrl);
        }
      }
      setHotelId(hId);
      onNext();
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setLoading(false);
    }
  };

      // Convert districts to react-select options
      const districtOptions = districts.map(district => ({
        value: district,
        label: district
      }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '10px',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '10px',
    }),
    option: (provided) => ({
      ...provided,
      borderRadius: '10px', // Set to 0 if you don't want rounded options
    }),
  };

  return (
    <div className={styles.hotelForm}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.hotelformGroup}>
          <div className={styles.leftSide}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Hotel Name <span className={styles.required}>*</span></label>
              <input {...register('hotelName', { required: true })} className={styles.input} placeholder="Enter hotel name" />
              {errors.hotelName && <p className={styles.error}>This field is required</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description <span className={styles.required}>*</span></label>
              <textarea {...register('description', { required: true })} className={styles.textarea} placeholder="Enter description"></textarea>
              {errors.description && <p className={styles.error}>This field is required</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                State <span className={styles.required}>*</span>
              </label>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: true }}
                    defaultValue={selectedDistrict}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={districtOptions}
                        styles={customStyles}
                        className={styles.selectstate}
                        classNamePrefix="react-select"
                        placeholder={selectedDistrict || "Select district"}
                        onChange={(selectedOption) => {
                      setSelectedDistrict(selectedOption.value);
                      field.onChange(selectedOption.value);
                    }}
                      />
                    )}
                  />
                  {errors.state && (
                    <p className={styles.error}>This field is required</p>
                  )}
                </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Category <span className={styles.required}>*</span></label>
              <div className={styles.radioGroup}>
                <label>
                  <input type="radio" value="Luxury" {...register('category', { required: true })} className={styles.radio} /> Luxury
                </label>
                <label>
                  <input type="radio" value="Mid Range" {...register('category', { required: true })} className={styles.radio} /> Mid-Range
                </label>
                <label>
                  <input type="radio" value="Budget" {...register('category', { required: true })} className={styles.radio} /> Budget
                </label>
              </div>
              {errors.category && <p className={styles.error}>This field is required</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Contact Number <span className={styles.required}>*</span></label>
              <input type="tel" {...register('contactNumber', { 
                required: true,
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Invalid phone number"
                }
              })} className={styles.input} placeholder="ex- 0771234567" />
              {errors.contactNumber && <p className={styles.error}>{errors.contactNumber.message}</p>}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Primary Image <span className={styles.required}>*</span></label>
              <div className={styles.imageUploadWrapper}>
                <input type="file" onChange={handlePrimaryImageChange} className={styles.fileInput} />
                {!primaryImage && (
                  <div className={styles.imageUploadPlaceholder}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadIcon} />
                    <div>Upload image</div>
                    <div className={styles.uploadtxt}>Supported format: PNG, JPG</div>
                    <div>(max-size: 1MB)</div>
                  </div>
                )}
            
                {primaryImage && (
                <div className={styles.imagePreviewWrapper}>
                  <img
                    src={typeof primaryImage === 'string' ? primaryImage : URL.createObjectURL(primaryImage)}
                    alt="Primary"
                    className={styles.primaryImagePreview}
                  />

                </div>
              )}
                {errors.primaryImage && <p className={styles.error}>{errors.primaryImage.message}</p>}
              </div>
            </div>
            <label className={styles.label}>Tags</label>
            <TagsInput onChange={setTags} initialTagsArray={tags} /> {/* Add TagsInput component */}
            
          </div>
          <div className={styles.rightSide}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Address <span className={styles.required}>*</span></label>
              <input value={address} readOnly className={styles.input} placeholder="Select location" />
              <div className={styles.mapPicker}>
                <MapPicker onSelectLocation={handleSelectLocation} address={address}/>
              </div>
              {errors.address && <p className={styles.error}>{errors.address.message}</p>}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Secondary Images <span className={styles.required}>*</span></label>
              <div className={styles.imageUploadWrapper}>
                <input type="file" multiple onChange={handleSecondaryImagesChange} className={styles.fileInput} />
                {!secondaryImages.length && (
                  <div className={styles.imageUploadPlaceholder}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} className={styles.uploadIcon} />
                    <div>Upload images</div>
                    <div className={styles.uploadtxt}>Supported format: PNG, JPG</div>
                    <div>(max-size: 1MB)</div>
                  </div>
                )}
                {secondaryImages.length > 0 && (
                  <div className={styles.imagePreviewContainer}>
                    {secondaryImages.map((image, index) => (
                      <div key={index} className={styles.imagePreviewWrapper}>
                        <img 
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Secondary ${index}`} 
                        className={styles.imagePreview} 

                        />
                        
                        <button type="button" className={styles.clearButton} onClick={() => handleRemoveSecondaryImage(index)}>✖</button>
                      </div>
                    ))}
                  </div>
                )}
                {errors.secondaryImages && <p className={styles.error}>{errors.secondaryImages.message}</p>}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Website</label>
              <input type="url" {...register('website')} className={styles.input} placeholder="www.example.com" />
            </div>
          </div>
        </div>
        <button type="submit" className={`${styles.button} ${loading ? styles.loading : ''}`} disabled={loading}>
  {loading ? (
    <div className={styles.loadingDots}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  ) : (
    'Save & Continue'
  )}
</button>

      </form>
      {hotelId && ( <button type="button" onClick={onNext} className={styles.nextbtn}>Next</button>)}
     

    </div>
  );
};

export default dynamic(() => Promise.resolve(HotelForm), { ssr: false });
