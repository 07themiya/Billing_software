import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import "./Billing.css";

const Billing = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const database = getDatabase();
    const itemsRef = ref(database, "items");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const itemList = data ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) : [];
      setItems(itemList);
    });
  }, []);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...selectedItems];
    if (!updatedItems[index]) {
      updatedItems[index] = { itemName: "", price: 0, quantity: 0 };
    }
    updatedItems[index][field] = value;

    if (field === "itemName") {
      const selectedItem = items.find((item) => item.itemName === value);
      updatedItems[index].price = selectedItem ? selectedItem.price : 0;
    }

    setSelectedItems(updatedItems);
  };

  const calculateTotal = () => {
    const totalCost = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(totalCost);
  };

  return (
    <div className="billing-container">
      <h2>Billing Page</h2>
      <div className="billing-card">
        {selectedItems.map((item, index) => (
          <div className="billing-row" key={index}>
            <select
              onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
              value={item.itemName}
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.itemName}>
                  {item.itemName}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={item.quantity || ""}
              onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
            />
            <span>Price: {item.price || 0}</span>
          </div>
        ))}
        <button className="add-row-btn" onClick={() => setSelectedItems([...selectedItems, {}])}>
          Add Items
        </button>
      </div>
      <button className="calculate-btn" onClick={calculateTotal}>
        Calculate Total
      </button>
      <h3>Total: {total}</h3>
    </div>
  );
};

export default Billing;
