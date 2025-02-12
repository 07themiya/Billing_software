import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import "./BillHistory.css";

function BillHistory() {
  const [billNumber, setBillNumber] = useState("");
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = () => {
    const db = getDatabase();
    const billsRef = ref(db, "Bills");
    onValue(billsRef, (snapshot) => {
      const bills = snapshot.val();
      if (bills) {
        const foundBill = Object.values(bills).find(
          (b) => b.billNumber === billNumber
        );
        if (foundBill) {
          setBill(foundBill);
          setError("");
        } else {
          setBill(null);
          setError("Bill not found.");
        }
      } else {
        setError("No bills found in the database.");
      }
    });
  };

  return (
    <div className="bill-history-page">
      <h1>Bill History</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Enter Bill Number"
          value={billNumber}
          onChange={(e) => setBillNumber(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {error && <p className="error">{error}</p>}
      {bill && (
        <div className="bill-details">
          <h2>Bill Number: {bill.billNumber}</h2>
          <p>Date: {bill.date}</p>
          <p>Time: {bill.time}</p>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {bill.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemName}</td>
                  <td>{item.quantity}</td>
                  <td>Rs.{item.price}</td>
                  <td>Rs.{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Total: Rs.{bill.total}</h3> 
          <h3>Cash: Rs.{bill.cash}</h3> 
          <h3>Balance: Rs.{bill.balance}</h3>
        </div>
      )}
    </div>
  );
}

export default BillHistory;