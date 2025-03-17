import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import "./Credit.css";

function Credit() {
  const [creditBills, setCreditBills] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const billsRef = ref(db, "Bills");

    onValue(billsRef, (snapshot) => {
      const bills = snapshot.val();
      if (bills) {
        // Filter credit bills (where cash is empty or "0")
        let filteredBills = Object.values(bills).filter(
          (bill) => !bill.cash || bill.cash === "0"
        );

        // Sort by date (oldest first)
        filteredBills.sort((a, b) => new Date(a.date) - new Date(b.date));

        setCreditBills(filteredBills);
      } else {
        setCreditBills([]);
      }
    });
  }, []);

  // Remove bill from Firebase
  const removeBill = (billNumber) => {
    const db = getDatabase();
    const billRef = ref(db, `Bills/${billNumber}`);

    remove(billRef)
      .then(() => {
        setCreditBills(creditBills.filter((bill) => bill.billNumber !== billNumber));
      })
      .catch((error) => {
        console.error("Error removing bill:", error);
      });
  };

  return (
    <div className="credit-page">
      <h1>Credit Bills</h1>
      {creditBills.length === 0 ? (
        <p>No credit bills available.</p>
      ) : (
        <table className="credit-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Date</th>
              <th>Total (Rs.)</th>
              <th>Discounted Total (Rs.)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {creditBills.map((bill) => (
              <tr key={bill.billNumber}>
                <td>{bill.billNumber}</td>
                <td>{bill.date}</td>
                <td>{bill.total}</td>
                <td>{(bill.total - bill.discountAmount).toFixed(2)}</td>
                <td>
                  <button className="remove-btn" onClick={() => removeBill(bill.billNumber)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Credit;
