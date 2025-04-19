const app = require('./src/app'); // Import the Express app from app.js

const port = process.env.PORT || 3001; // Use process.env.PORT if available

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle server startup errors
server.on('error', (error) => {
    console.error('Error starting server:', error);
    //  Add more sophisticated error handling here (e.g., exit the process, notify admin)
});
