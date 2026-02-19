import mongoose, { Schema, Model, Document } from "mongoose";

export interface IClient extends Document {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address?: string;
    resetPasswordToken?: string;
    resetPasswordTokenExpiry?: Date;
    createdAt: Date;
    isBooked: boolean;
    expireAt?: Date;
}

const ClientSchema: Schema = new Schema({
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
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    phone: {
        type: String,
        required: [true, "Please provide a phone number"],
    },
    address: {
        type: String,
        trim: true,
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordTokenExpiry: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
    expireAt: {
        type: Date,
        index: { expires: 0 }, // Documents expire at the time specified in this field
    },
});

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
