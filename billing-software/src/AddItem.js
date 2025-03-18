import React, { useState } from "react";
import { getDatabase, ref, push } from "firebase/database";
import app from "./firebaseConfig"; // Import the Firebase app
import "./AddItem.css";

const AddItem = () => {
  const [items, setItems] = useState([
    { itemName: "", searchKey: "", price: "", quantity: "", lowLimit: "" },
  ]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addNewItemRow = () => {
    setItems([
      ...items,
      { itemName: "", searchKey: "", price: "", quantity: "", lowLimit: "" },
    ]);
  };

  const handleAddItems = () => {
    const database = getDatabase(app);
    const itemsRef = ref(database, "items");
  
    items.forEach((item) => {
      const newItem = {
        itemName: item.itemName,
        searchKey: item.searchKey, // Added searchKey field
        price: item.price ? parseFloat(item.price) : 0, // Ensure valid number
        quantity: item.quantity ? parseInt(item.quantity) : 0, // Ensure valid number
        lowLimit: item.lowLimit ? parseInt(item.lowLimit) : 0, // Ensure valid number
      };
  
      if (!newItem.itemName || !newItem.searchKey) {
        console.error("Item Name and Search Key are required!");
        return;
      }
  
      push(itemsRef, newItem)
        .then(() => {
          setSuccessMessage("Items added successfully!");
        })
        .catch((error) => {
          console.error("Error adding items: ", error);
        });
    });
  
    // Clear all input rows after successful addition
    setItems([{ itemName: "", searchKey: "", price: "", quantity: "", lowLimit: "" }]);
  };
  

  return (
    <div className="add-item-container">
      <h2>Add Items</h2>
      <div className="button-group">
        <button onClick={addNewItemRow}>Add New Item</button>
        <button onClick={handleAddItems}>Add Items</button>
      </div>
      {items.map((item, index) => (
        <div className="item-row" key={index}>
          <input
            type="text"
            placeholder="Item Name (Sinhala)"
            value={item.itemName}
            onChange={(e) => handleInputChange(index, "itemName", e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Search Key (English)"
            value={item.searchKey}
            onChange={(e) => handleInputChange(index, "searchKey", e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={item.price}
            onChange={(e) => handleInputChange(index, "price", e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Quantity"
            value={item.quantity}
            onChange={(e) => handleInputChange(index, "quantity", e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Low Limit"
            value={item.lowLimit}
            onChange={(e) => handleInputChange(index, "lowLimit", e.target.value)}
            required
          />
        </div>
      ))}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default AddItem;
