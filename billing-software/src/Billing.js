import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import './App.css';
import './Billing.css';

function Billing() {
  const [items, setItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const db = getDatabase();
    const itemsRef = ref(db, "items");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setItems(itemList);
      }
    });
  }, []);

  const addItemToBill = () => {
    const item = items.find((item) => item.id === selectedItem);
    if (item) {
      const existingItem = billItems.find((billItem) => billItem.id === item.id);
      if (existingItem) {
        // Update quantity if the item is already added
        setBillItems(
          billItems.map((billItem) =>
            billItem.id === item.id
              ? { ...billItem, quantity: billItem.quantity + parseInt(quantity) }
              : billItem
          )
        );
      } else {
        // Add new item to bill
        setBillItems([...billItems, { ...item, quantity: parseInt(quantity) }]);
      }
    }
  };

  const calculateTotal = () => {
    const totalAmount = billItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(totalAmount);
  };

  return (
    <div className="billing-page">
      <h2>Billing</h2>
      <div className="billing-form">
        <label htmlFor="item-select">Select Item:</label>
        <select
          id="item-select"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value)}
        >
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.itemName} - Rs.{item.price}
            </option>
          ))}
        </select>
        <label htmlFor="quantity-input">Quantity:</label>
        <input
          id="quantity-input"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />
        <button onClick={addItemToBill}>Add Item</button>
      </div>
      <div className="bill-items">
        <h3>Bill Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>Rs.{item.price}</td>
                <td>{item.quantity}</td>
                <td>Rs.{item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={calculateTotal}>Calculate Total</button>
      {total > 0 && <h3>Total: Rs.{total}</h3>}
    </div>
  );
}

export default Billing;
