import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import './App.css';
import './Billing.css';

function Billing() {
  const [items, setItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [isQuotation, setIsQuotation] = useState(false);

  const printRef = useRef(null);

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

    // Deduct quantities from the database only if "Price Quotation" is unchecked
    if (!isQuotation) {
      const db = getDatabase();
      billItems.forEach((billItem) => {
        const itemRef = ref(db, `items/${billItem.id}`);
        const updatedQuantity = billItem.stock - billItem.quantity;
        update(itemRef, { stock: updatedQuantity });
      });
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const newWindow = window.open('', '_blank', 'width=400,height=600');
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Bill</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              text-align: center;
            }
            .bill-header {
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            table, th, td {
              border: 1px solid black;
            }
            th, td {
              padding: 5px;
              text-align: left;
            }
            h3 {
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <div className="billing-page">
      <div className="billing-container">
        {/* Left Column */}
        <div className="billing-left">
          <h2>Billing Process</h2>
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
          <div className="quotation-checkbox">
            <input
              type="checkbox"
              id="price-quotation"
              checked={isQuotation}
              onChange={(e) => setIsQuotation(e.target.checked)}
            />
            <label htmlFor="price-quotation">Price Quotation</label>
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
        </div>

        {/* Right Column */}
        <div className="billing-right" ref={printRef}>
          <h2>ABC Hardware</h2>
          <div className="bill-header">
            <p>Contact: +94 71 234 5678</p>
            <p>Address: 123 Main Street, Colombo</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {billItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.itemName}</td>
                  <td>{item.quantity}</td>
                  <td>Rs.{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: Rs.{total}</h3>
          <button onClick={handlePrint}>Print</button>
        </div>
      </div>
    </div>
  );
}

export default Billing;
