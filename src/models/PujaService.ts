import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPujaService extends Document {
    name: string;
    significance: string;
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PujaService: Model<IPujaService> = mongoose.models.PujaService || mongoose.model<IPujaService>("PujaService", PujaServiceSchema);

export default PujaService;
