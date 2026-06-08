import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPujaService extends Document {
    name: string;
    significance: string;
    imageUrl?: string;
    milestones: string[];
    createdAt: Date;
}

const PujaServiceSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, "Please provide a type puja name"],
        unique: true,
        trim: true,
    },
    significance: {
        type: String,
        required: [true, "Please provide type puja significance"],
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

// Delete the cached model if it exists so Next.js HMR uses the updated schema
const PujaService: Model<IPujaService> = (mongoose.models.PujaService as Model<IPujaService>) || mongoose.model<IPujaService>("PujaService", PujaServiceSchema);

export default PujaService;
