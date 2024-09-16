const mongoose = require("mongoose");

const connectDB = async () => {
  MONGO_URI = 'mongodb+srv://malithiroshan9:malith3541@cluster0.m9av1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected : ${conn.connection.host} 😎`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
