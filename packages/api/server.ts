const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log('Time: ', Date.now());
  next();
});


app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(5000, () => console.log('Example app is listening on port 5000.'));