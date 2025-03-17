import React, { useState, useEffect, useRef, useCallback } from "react";
import Select from "react-select";
import { getDatabase, ref, onValue, update, push } from "firebase/database";
import { MdDeleteForever  } from "react-icons/md"; // Import the trash icon
import "./App.css";
import "./Billing.css";

function Billing() {
  const [items, setItems] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0); // Total is calculated dynamically
  const [isQuotation, setIsQuotation] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [cash, setCash] = useState(0); // State for cash amount
  const [balance, setBalance] = useState(0); // State for balance amount
  const [discount, setDiscount] = useState(0); // State for discount percentage
  

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
          quantity: data[key].quantity || 0,
        }));
        setItems(itemList);
      }
    });
  }, []);

  // Function to generate the next bill number
  const generateBillNumber = useCallback(async () => {
    const db = getDatabase();
    const billsRef = ref(db, "Bills");
    onValue(billsRef, (snapshot) => {
      const bills = snapshot.val();
      if (bills) {
        const lastBillKey = Object.keys(bills).pop();
        const lastBillNumber = bills[lastBillKey].billNumber;
        const nextNumber = getNextBillNumber(lastBillNumber);
        setBillNumber(nextNumber);
      } else {
        setBillNumber("A0001"); // If no bills exist, start with A0001
      }
    });
  }, []);

  // Helper function to generate the next bill number
  const getNextBillNumber = (lastBillNumber) => {
    if (!lastBillNumber) return "A0001";

    let prefix = lastBillNumber.match(/[A-Z]+/)[0];
    let number = parseInt(lastBillNumber.match(/\d+/)[0]);

    if (number === 9999) {
      prefix = incrementPrefix(prefix);
      number = 1;
    } else {
      number++;
    }

    return `${prefix}${String(number).padStart(4, "0")}`;
  };

  // Helper function to increment the prefix (A -> B, Z -> AA, etc.)
  const incrementPrefix = (prefix) => {
    let lastChar = prefix.slice(-1);
    if (lastChar === "Z") {
      return prefix.length === 1 ? "AA" : incrementPrefix(prefix.slice(0, -1)) + "A";
    } else {
      return prefix.slice(0, -1) + String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
  };

  useEffect(() => {
    generateBillNumber();
  }, [generateBillNumber]);

  // Calculate total dynamically whenever billItems change
  useEffect(() => {
    const totalAmount = billItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  
    // Calculate discount amount
    const discountAmount = (totalAmount * discount) / 100;
  
    // Update total after discount
    const discountedTotal = totalAmount - discountAmount;
  
    setTotal(discountedTotal);
  }, [billItems, discount]); // Recalculate when billItems or discount changes

  // Calculate balance dynamically whenever cash or total changes
  useEffect(() => {
    setBalance(cash - total);
  }, [cash, total]);

  const addItemToBill = () => {
    const item = items.find((item) => item.id === selectedItem.value);
    if (item) {
      const existingItem = billItems.find((billItem) => billItem.id === item.id);
      if (existingItem) {
        // Update quantity if the item is already added
        setBillItems((prevBillItems) =>
          prevBillItems.map((billItem) =>
            billItem.id === item.id
              ? { ...billItem, quantity: billItem.quantity + parseInt(quantity) }
              : billItem
          )
        );
      } else {
        // Add new item to bill
        setBillItems((prevBillItems) => [
          ...prevBillItems,
          { ...item, quantity: parseInt(quantity) },
        ]);
      }
    }
  };

  // Function to delete an item from the bill
  const handleDeleteItem = (itemId) => {
    setBillItems((prevBillItems) =>
      prevBillItems.filter((item) => item.id !== itemId)
    );
  };

  // Function to handle price change for an item
  const handlePriceChange = (itemId, newPrice) => {
    setBillItems((prevBillItems) =>
      prevBillItems.map((item) =>
        item.id === itemId ? { ...item, price: parseFloat(newPrice) } : item
      )
    );
  };

  // Function to save the bill to Firebase and print it
  const handlePrint = () => {
    const db = getDatabase();
  
    // Update stock quantities for each item in the bill
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

        // Calculate discount amount
        const discountAmount = (total * discount) / 100;

        // Calculate discounted total
    const discountedTotal = total - discountAmount;
  
    // Save the bill to Firebase
    const billRef = ref(db, "Bills");
    const newBill = {
      billNumber,
      items: billItems,
      total: total,
      discountedTotal: discountedTotal, // Add discounted total
      discount: discount, // Save discount percentage
      discountAmount: discountAmount, // Save discount amount
      cash: cash,
      balance: balance,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
    push(billRef, newBill)
      .then(() => {
        console.log("Bill saved successfully!");
      })
      .catch((error) => {
        console.error("Error saving bill:", error);
      });
  
    // Generate the bill content
    const printContent = `
      <html>
        <head>
          <title>Print Bill</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              text-align: center;
              width: 80mm; /* Set width to 8cm */
              margin: 0 auto;
              font-size: 10px; /* Smaller font size for compact layout */
            }
  
            .bill-header {
              margin-bottom: 5px;
              text-align: left;
              font-size: 12px;
            }
  
            .bill-header p {
              margin: 2px 0;
            }
  
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 5px 0;
              font-size: 10px;
            }
  
            table, th, td {
              border: none;
              padding: 3px;
              text-align: left;
            }
  
            h3 {
              margin-top: 5px;
              font-size: 12px;
            }
  
            .bill-footer {
              font-size: 8px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="bill-header">
            <h2 style="text-align: center;">ABC Hardware</h2>
            <p>Contact: +94 71 234 5678</p>
            <p>Address: 123 Main Street, Colombo</p>
            <hr>
            <p>Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}</p>
            <p>Bill Number: ${billNumber}</p>
            <hr>
          </div>
          <table>
            <thead>
              <tr style="font-size: 10px;">
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${billItems.map((item) => `
                <tr style="font-size: 18px;">
                  <td>${item.itemName}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td>Rs.${item.price * item.quantity}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <hr style="height: 5px; background-color: black; border: none;">
          <div style="text-align: left;">
            <h3 style="margin-bottom: 10px; font-size: 15px; font-weight: normal;">Total: Rs.${(total + discountAmount).toFixed(2)}</h3>
            <h3 style="margin-bottom: 10px; font-size: 15px; font-weight: normal;">Discount: (${discount}%)</h3>
            <h3 style="margin-bottom: 10px; font-size: 15px; font-weight: normal;">You Have saved: Rs.${discountAmount.toFixed(2)}</h3>
            <h3 style="margin-bottom: 10px; font-size: 18px;">Discounted Total: Rs.${total.toFixed(2)}</h3>
            <h3 style="margin-bottom: 10px; font-size: 15px; font-weight: normal;">Cash: Rs.${cash.toFixed(2)}</h3>
            <h3 style="font-size: 15px; font-weight: normal;">Balance: Rs.${balance.toFixed(2)}</h3> 
          </div>
          <div class="bill-footer">
            <hr>
            <p style="font-size: 10px;">ස්තූතියි නැවත එන්න...</p>
            <hr>
            <p>Software By: Thushan Chathuranga</p>
            <p>Contact: thushanthemiya@gmail.com</p>
          </div>
        </body>
      </html>
    `;
  
    // Open a new window for printing
    const newWindow = window.open("", "_blank", "width=80mm,height=600");
    newWindow.document.write(printContent);
    newWindow.document.close();
    newWindow.print();
  };

  // Function to reset the billing page for a new bill
  const handleNewBill = () => {
    setBillItems([]); // Clear bill items
    setTotal(0); // Reset total
    setSelectedItem(null); // Clear selected item
    setQuantity(1); // Reset quantity
    setIsQuotation(false); // Reset quotation checkbox
    setCash(0); // Reset cash
    setBalance(0); // Reset balance
    generateBillNumber(); // Generate a new bill number
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
            <button className="new-bill-button" onClick={handleNewBill}>
              New Bill
            </button>
          </div>
          <div className="bill-items">
            <h3>Bill Items</h3>

            <table>
              <thead>
                <tr>
                  <th></th> {/* Delete button column */}
                  <th>Item Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <MdDeleteForever  size={20} /> {/* Trash icon */}
                      </button>
                    </td>
                    <td>{item.itemName}</td>
                    <td>
                      <input
                        id="price-input"
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      />
                    </td>
                    <td>{item.quantity}</td>
                    <td>Rs.{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cash-balance">
            <h3>Total: Rs.{total.toFixed(2)}</h3>
            <label htmlFor="discount-input">Discount (%):</label>
            <input
              id="discount-input"
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value))}
              placeholder="Discount"
            />
            <label htmlFor="cash-input">Cash:</label>
            <input
              id="cash-input"
              type="number"
              min="0"
              value={cash}
              onChange={(e) => setCash(parseFloat(e.target.value))}
              placeholder="Cash"
            />
            <h3>Balance: Rs.{balance.toFixed(2)}</h3>
          </div>
          <div className="action-buttons">
            <button className="print-button" onClick={handlePrint}>
              Print
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="billing-right hide-right-column" ref={printRef}>
          <h2>ABC Hardware</h2>
          <div className="bill-header">
            <p>Contact: +94 71 234 5678<br/>
            Address: 123 Main Street, Colombo</p>
            <hr></hr>
            <p>Date: {new Date().toLocaleDateString()}&nbsp; 
            Time: {new Date().toLocaleTimeString()}<br/>
            Bill Number: {billNumber}</p>
            <hr></hr>
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

          <hr></hr>

              <h3>Total: &nbsp;Rs.{total.toFixed(2)} <br/>
              Cash: &nbsp;Rs.{cash.toFixed(2)} <br/>
              Balance: &nbsp;Rs.{balance.toFixed(2)}</h3>

          <div className="bill-footer">
            <hr></hr>
            <p>Thank you for your business!</p>
            <hr></hr>
            <p style={{ fontSize: "10px" }}>Software By: Thushan Chathuranga <br />Contact: thushanthemiya@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing;