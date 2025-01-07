import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import "./UploadPage.css";

function UploadPage() {
  const [items, setItems] = useState([]);
  const [editedItems, setEditedItems] = useState({}); // To track edits

  const db = getDatabase();

  useEffect(() => {
    const itemsRef = ref(db, "items/");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const itemsArray = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setItems(itemsArray);
    });
  }, [db]);

  // Handle input change for editing
  const handleInputChange = (id, field, value) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // Save changes to Firebase
  const handleSave = (id) => {
    const itemRef = ref(db, `items/${id}`);
    update(itemRef, editedItems[id] || {}).then(() => {
      alert("Item updated successfully!");
    });
  };

  // Delete item from Firebase
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const itemRef = ref(db, `items/${id}`);
      remove(itemRef).then(() => {
        alert("Item deleted successfully!");
      });
    }
  };

  return (
    <div className="upload-page">
      <h1>Update Page</h1>
      <table className="upload-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  type="text"
                  defaultValue={item.itemName}
                  onChange={(e) =>
                    handleInputChange(item.id, "itemName", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={item.price}
                  onChange={(e) =>
                    handleInputChange(item.id, "price", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  defaultValue={item.quantity}
                  onChange={(e) =>
                    handleInputChange(item.id, "quantity", e.target.value)
                  }
                />
              </td>
              <td>
                <button onClick={() => handleSave(item.id)}>Save</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UploadPage;
