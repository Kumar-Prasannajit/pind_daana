import mongoose, { Schema, Model, Document } from "mongoose";

export interface ILocation extends Document {
    name: string;
    description: string;
    imageUrl?: string;
    city: string;
    state: string;
    services: {
        service: mongoose.Types.ObjectId;
        pricing: {
            name: string;
            price: number;
            features: string[];
            recommended?: boolean;
        }[];
    }[];
    createdAt: Date;
}

const LocationSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a location name"],
        trim: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
    city: {
        type: String,
        required: [true, "Please provide a city"],
    },
    state: {
        type: String,
        required: [true, "Please provide a state"],
    },
    services: [{
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
        },
        pricing: [{
            name: { type: String, required: true },
            price: { type: Number, required: true },
            features: [String],
            recommended: { type: Boolean, default: false }
        }]
    }],
    // Removed legacy flat pricing field
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Location: Model<ILocation> = mongoose.models.Location || mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
