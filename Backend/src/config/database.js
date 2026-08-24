import mongoose from "mongoose";
import {config} from '../config/config.js';


  const connecToDB = async () => {
    try {
        await mongoose.connect(config.Mongo_URI);
        console.log('Database Connected successfully');
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

export default connecToDB