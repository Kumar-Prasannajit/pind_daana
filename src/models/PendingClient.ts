import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPendingClient extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    otp: string;
    otpExpiry: Date;
    createdAt: Date;
}

const PendingClientSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a client name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // Documents expire after 24 hours (86400 seconds)
    },
});

const PendingClient: Model<IPendingClient> = mongoose.models.PendingClient || mongoose.model<IPendingClient>("PendingClient", PendingClientSchema);

export default PendingClient;
