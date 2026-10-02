fetch('https://script.google.com/macros/s/AKfycbxmGeVP0tq9V00EHwLW-32EdfD6fgMNGYBwKrkSY4pnzr7dXWVbr6sPfLOrj4au2F5i/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ to: 'belamichoco@gmail.com', subject: 'Test Fetch', body: 'This is a test' })
})
.then(r => r.text())
.then(t => console.log('Response:', t))
.catch(e => console.error('Error:', e));