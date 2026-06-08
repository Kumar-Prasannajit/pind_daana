import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPuriPuja extends Document {
    name: string;
    significance: string;
    imageUrl?: string;
    pricing: { name: string; amount: number }[];
    milestones: string[];
    createdAt: Date;
}

const PuriPujaSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a puri puja name"],
        unique: true,
        trim: true,
    },
    significance: {
        type: String,
        required: [true, "Please provide puri puja significance"],
    },
    imageUrl: {
        type: String,
        required: false,
    },
    pricing: [
        {
            name: { type: String, required: true },
            amount: { type: Number, required: true },
        }
    ],
    milestones: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Force-delete the cached model so HMR always uses the latest schema
if (mongoose.models.PuriPuja) {
    delete (mongoose.models as any).PuriPuja;
}

const PuriPuja: Model<IPuriPuja> = mongoose.model<IPuriPuja>("PuriPuja", PuriPujaSchema);

export default PuriPuja;
