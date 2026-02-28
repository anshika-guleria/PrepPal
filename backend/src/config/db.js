import dns from "dns";
import mongoose from "mongoose";

// Force Node to prefer IPv4 over IPv6 (fixes querySrv EREFUSED)
dns.setDefaultResultOrder("ipv4first");

const connectDB = async (retryCount = 0) => {
  const maxRetries = 5; // max retry attempts
  const retryDelay = 5000; // 5 seconds

  try {
    // Connect without extra deprecated options
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(`❌ MongoDB connection failed (attempt ${retryCount + 1})`);
    console.error(error.message);

    if (retryCount < maxRetries) {
      console.log(`🔁 Retrying in ${retryDelay / 1000}s...`);
      setTimeout(() => connectDB(retryCount + 1), retryDelay);
    } else {
      console.error(`💀 Could not connect to MongoDB after ${maxRetries} attempts. Exiting.`);
      process.exit(1);
    }
  }
};

export default connectDB;