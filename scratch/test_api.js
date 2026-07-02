fetch('http://localhost:3000/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ patient: { id: 'P-999', age: 45, gender: 'M', vitals: { hr: 90, temp: 37, bp: "120/80", rr: 16, spo2: 98 }, labs: {} } })
}).then(res => res.json()).then(console.log).catch(console.error);
