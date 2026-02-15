import React, { useState, useEffect } from 'react';

// ... (existing imports)

const POS = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Load data from the Backend Volume on startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/data');
        const data = await response.json();
        if (data.sales) {
          setSales(data.sales);
          // Also sync to local storage as a secondary backup
          localStorage.setItem('safa_water_state_v18', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to load from server, checking local backup:", error);
        const localData = localStorage.getItem('safa_water_state_v18');
        if (localData) setSales(JSON.parse(localData).sales);
      } finally {
        setLoading(loading => false);
      }
    };
    loadData();
  }, []);

  // 2. Save data to the Backend Volume whenever a sale happens
  const handleCompleteSale = async (newSale) => {
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);

    // Save to server (Docker Volume)
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales: updatedSales })
      });
    } catch (error) {
      console.error("Server save failed. Data only saved locally.");
    }

    // Keep LocalStorage as a fallback
    localStorage.setItem('safa_water_state_v18', JSON.stringify({ sales: updatedSales }));
  };

  if (loading) return <div>Loading System Data...</div>;

  return (
    // ... (rest of your UI remains the same)
  );
};
