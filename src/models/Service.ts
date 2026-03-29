import mongoose, { Schema, Model, Document } from "mongoose";

export interface IService extends Document {
    name: string;
    details: string;
    imageUrl?: string;
    milestones: string[];
    createdAt: Date;
}

const ServiceSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a service name"],
        unique: true,
        trim: true,
    },
    details: {
        type: String,
        required: [true, "Please provide service details"],
    },
    imageUrl: {
        type: String,
        required: false,
    },
    milestones: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Service: Model<IService> = mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);

export default Service;
