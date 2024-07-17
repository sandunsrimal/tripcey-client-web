


// ItemCard.js
import styles from './styles/ItemCard.module.css';

const ItemCard = ({ items, handleEdit, handleAvailability, handleRemove }) => {
    return (
      <div className={styles.itemContainer}>
        {items.map(item => (
          <div key={item.id} className={styles.itemCard}>
            <div className={`${styles.status} ${
              item.status === 'Active' ? styles.active : 
              item.status === 'In Review' ? styles.inReview : 
              item.status === 'Rejected' ? styles.rejected : 
              styles.pending
            }`}>
              {item.status}
            </div>
            <img src={item.primaryImage} alt={item.name} className={styles.itemImage} />
            <div className={styles.itemDetails}>
              <h2 className={styles.itemName}>{item.name}</h2>
              <p className={styles.itemState}>{item.state}</p>
              <p className={styles.itemDescription}>{item.description}</p>
              <div className={styles.buttonContainer}>
                <div className={styles.topButtons}>
                  <button onClick={() => handleAvailability(item.id)} className={styles.viewButton}>Show Availability</button>
                  <button onClick={() => handleEdit(item.id)} className={styles.editButton}>Edit</button>
                </div>
                <button onClick={() => handleRemove(item.id)} className={styles.removeButton}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
};

export default ItemCard;