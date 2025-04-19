const express = require('express');
const cors = require('cors');

const billRoutes = require('./routes/bills')

const app = express();

// Middleware
app.use(cors()); // Enable CORS to allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Define a simple route
app.get('/', (req, res) => {
  res.status(200).send('Hello from the server!');
});

app.use('/bills', billRoutes)

// Error handling (improved)
app.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Handle 404 errors - Route not found
app.use((req, res, next) => {
    res.status(404).send('Sorry, that route does not exist');
});

module.exports = app;
