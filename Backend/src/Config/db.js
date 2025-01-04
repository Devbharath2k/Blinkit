import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Mongodb = process.env.MONGODB_URI;

if(!Mongodb){
    throw new Error('MONGODB_URI is not defined');
}

const HandlerDatabase = async (req, res, next) => {
    try {
        await mongoose.connect(Mongodb);
        console.log('MongoDB Connected...');    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

export default HandlerDatabase;