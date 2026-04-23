require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
// Connect to MongoDB
connectDB();

// Configure Cloudinary
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/users', require('./routes/authRoutes'));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
