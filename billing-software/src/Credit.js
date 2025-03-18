import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import "./Credit.css";

function Credit() {
  const [creditBills, setCreditBills] = useState([]);

  // Fetch credit bills from the database
  const fetchCreditBills = () => {
    const db = getDatabase();
    const billsRef = ref(db, "Bills");

    onValue(billsRef, (snapshot) => {
      const bills = snapshot.val();
      if (bills) {
        // Filter credit bills (where cash is less than discountedTotal or cash is not defined)
        let filteredBills = Object.entries(bills).map(([id, bill]) => ({
          id, // Include the bill ID
          ...bill,
        })).filter((bill) => {
          const discountedTotal = bill.total - bill.discountAmount;
          return !bill.cash || parseFloat(bill.cash) < discountedTotal;
        });

        // Sort by date (oldest first)
        filteredBills.sort((a, b) => new Date(a.date) - new Date(b.date));

        setCreditBills(filteredBills);
      } else {
        setCreditBills([]);
      }
    });
  };

  useEffect(() => {
    fetchCreditBills();
  }, []);

  // Handle cash input change
  const handleCashChange = (billId, value) => {
    setCreditBills((prevBills) =>
      prevBills.map((bill) =>
        bill.id === billId ? { ...bill, cash: value } : bill
      )
    );
  };

  // Save cash value to Firebase
  const saveCash = (billId, cash) => {
    const db = getDatabase();
    const billRef = ref(db, `Bills/${billId}`);

    update(billRef, { cash: parseFloat(cash) })
      .then(() => {
        alert("Cash value saved successfully!");
        // Refresh the table after saving
        fetchCreditBills();
      })
      .catch((error) => {
        console.error("Error saving cash value:", error);
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
              <th>Cash (Rs.)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {creditBills.map((bill) => {
              const discountedTotal = bill.total - bill.discountAmount;
              return (
                <tr key={bill.id}>
                  <td>{bill.billNumber}</td>
                  <td>{bill.date}</td>
                  <td>{bill.total}</td>
                  <td>{discountedTotal.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      value={bill.cash || ""}
                      onChange={(e) => handleCashChange(bill.id, e.target.value)}
                      placeholder="Enter cash"
                    />
                  </td>
                  <td>
                    <button
                      className="save-btn"
                      onClick={() => saveCash(bill.id, bill.cash)}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Credit;