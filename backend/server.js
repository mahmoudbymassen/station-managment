// server.js
require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

const employeeRoutes = require('./routes/employees');
const stationRoutes = require('./routes/stations');
const productRoutes = require('./routes/products');
const tankRoutes = require('./routes/tanks');
const pompRoutes = require('./routes/pompes');
const supplierRoutes = require('./routes/suppliers');
const attendanceRoutes = require('./routes/Attendances');
const salesRoutes = require('./routes/sales');
const fuelPriceRoutes = require('./routes/fuelPrice');
const stockRoutes = require('./routes/stock');
const serviceRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');




app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/tanks', tankRoutes);
app.use('/api/pumps', pompRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/fuel-price', fuelPriceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});