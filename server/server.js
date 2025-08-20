const express = require('express');
const cors = require('cors');
require('dotenv').config();  // loads the variable from .env

const connectDB = require('./config/db'); // Import the function

// --- connect to Database ---
connectDB();

const app = express();
const PORT = 5000; // Port for backend



// Middleware
app.use(cors()); // Allows your frontend to make requests to this backend
app.use(express.json()); // Allows server to accept JSON data

// --- Import Routes ---
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const bookingRoutes = require('./routes/bookingRoutes');

// --- Use Routes ---
// Any request starting with '/api/movies' will be handled by movieRoutes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes); // Use auth routes
app.use('/api/bookings', bookingRoutes);

// A simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
