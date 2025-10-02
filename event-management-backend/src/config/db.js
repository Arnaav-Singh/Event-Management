import mongoose from "mongoose";
import chalk from "chalk";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("❌ MongoDB URI not found. Check your .env file.");
    }

    await mongoose.connect(MONGO_URI);

    console.log(chalk.green(`✅ MongoDB Connected: ${mongoose.connection.host}`));
  } catch (error) {
    console.error(chalk.red(`❌ MongoDB Connection Error: ${error.message}`));
    process.exit(1);
  }
};

export default connectDB;
