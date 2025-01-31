import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { getDatabase, ref, onValue, update } from "firebase/database";
import "./App.css";
import "./Billing.css";

function Billing() {
  const [items, setItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
          quantity: data[key].quantity || 0, // Default quantity to 0 if missing
        }));
        setItems(itemList);
      }
    });
  }, []);

  const addItemToBill = () => {
    const item = items.find((item) => item.id === selectedItem.value);
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

    if (!isQuotation) {
      const db = getDatabase();
      billItems.forEach((billItem) => {
        const purchaseQuantity = parseInt(billItem.quantity, 10); // Quantity purchased
        const currentStock = parseInt(
          items.find((item) => item.id === billItem.id)?.quantity || 0,
          10
        ); // Current stock

        if (isNaN(purchaseQuantity) || isNaN(currentStock)) {
          console.error(
            `Invalid quantity or stock for item: ${billItem.itemName}. Stock: ${currentStock}, Quantity: ${purchaseQuantity}`
          );
          return; // Skip this item
        }

        const updatedQuantity = currentStock - purchaseQuantity;

        if (updatedQuantity >= 0) {
          const itemRef = ref(db, `items/${billItem.id}`);
          update(itemRef, { quantity: updatedQuantity }).catch((error) => {
            console.error(`Failed to update quantity for ${billItem.itemName}:`, error);
          });
        } else {
          alert(
            `Insufficient stock for ${billItem.itemName}. Available: ${currentStock}, Requested: ${purchaseQuantity}`
          );
        }
      });
    }
  };

  const handlePrint = () => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const billNumber = Math.floor(100000 + Math.random() * 900000);

    const printContent = printRef.current.innerHTML;
    const newWindow = window.open("", "_blank", "width=400,height=600");
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
              text-align: left;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            table, th, td {
              border: none;
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

  const options = items.map((item) => ({
    value: item.id,
    label: `${item.itemName} - Rs.${item.price}`,
  }));

  const handleChange = (selectedOption) => {
    setSelectedItem(selectedOption);
  };

  return (
    <div className="billing-page">
      <div className="billing-container">
        {/* Left Column */}
        <div className="billing-left">
          <h2>Billing Process</h2>
          <div className="billing-form">
            <label htmlFor="item-select">Select Item:</label>
            <Select
              className="basic-single"
              classNamePrefix="select"
              value={selectedItem}
              onChange={handleChange}
              isClearable={true}
              isSearchable={true}
              name="item"
              options={options}
              placeholder="Select Item"
              menuPortalTarget={document.body} // Ensures the dropdown can expand beyond the container
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999, // Ensures the dropdown is above other elements
                }),
                menu: (base) => ({
                  ...base,
                  width: "300px", // Adjust the dropdown menu width
                }),
                control: (base) => ({
                  ...base,
                  height: "50px",
                  width: "300px", // Adjust the search bar width
                  minHeight: "30px",
                  minWidth: "300px",
                }),
              }}
            />

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
          <button className="calculate-button" onClick={calculateTotal}>Calculate Total</button>
          <button className="print-button" onClick={handlePrint}>Print</button>
        </div>

        {/* Right Column */}
        <div className="billing-right" ref={printRef}>
          <h2>ABC Hardware</h2>
          <div className="bill-header">
            <p>Contact: +94 71 234 5678</p>
            <p>Address: 123 Main Street, Colombo</p>
            <p>-------------------------------------------------------------------</p>
            <p>Date: {new Date().toLocaleDateString()} Time: {new Date().toLocaleTimeString()}</p>
            <p>Bill Number: {Math.floor(100000 + Math.random() * 900000)}</p>
            <p>-------------------------------------------------------------------</p>
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
                  <td style={{ textAlign: "center" }}>{item.quantity}</td>
                  <td>Rs.{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>-------------------------------------------------------------------</p>
          <h3 style={{ textAlign: "left" }}>Total: Rs.{total}</h3>

          <div className="bill-footer">
            <p>**********************************************************</p>
            <p>Thank you for your business!</p>
            <p>**********************************************************</p>
            <p>Software By: Thushan Chathuranga <br />
              Contact: thushanthemiya@gmail.com </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Billing;
