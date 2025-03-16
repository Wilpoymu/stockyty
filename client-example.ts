// Example of how to format the request correctly
const createAgenda = async () => {
  const response = await fetch('http://localhost:5000/api/agenda', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-token-here'
    },
    body: JSON.stringify({
      date: new Date('2023-11-15'), // Will be serialized to ISO string
      time: '14:00-15:00',
      description: 'Initial consultation with new client',
      status: 'PENDING',
      notes: 'Meeting in Conference Room A'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
