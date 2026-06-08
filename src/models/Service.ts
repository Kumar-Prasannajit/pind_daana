import mongoose, { Schema, Model, Document } from "mongoose";

export interface IService extends Document {
    name: string;
    details: string;
    imageUrl?: string;
    availability: "explore" | "coming_soon";
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
    availability: {
        type: String,
        enum: ["explore", "coming_soon"],
        default: "explore",
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

if (mongoose.models.Service) {
    delete mongoose.models.Service;
}

const Service: Model<IService> = mongoose.model<IService>("Service", ServiceSchema);

export default Service;
