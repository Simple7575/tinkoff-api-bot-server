import mongoose, { type Mongoose } from "mongoose";
import { MONGO_URI } from "../envConstants.js";

mongoose.set("strictQuery", false);
export const connectDB = async (): Promise<Mongoose> => {
    if (!MONGO_URI) throw new Error("MONGO uri needed.");
    const connect = mongoose
        .connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4,
        })
        .then(() => {
            console.log(`Connected to mongo ${mongoose.connection.name}`);
            return mongoose;
        });

    await connect;
    return connect;
};
