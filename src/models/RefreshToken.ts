import mongoose, { Schema, Model, Document } from "mongoose";

export interface IRefreshToken extends Document {
    client_id: mongoose.Types.ObjectId;
    token_hash: string;
    createdAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
    client_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Client', 
        required: true 
    },
    token_hash: { 
        type: String, 
        required: true, 
        unique: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { strict: true });

// TTL: auto-deleted after 7 days
RefreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
// Removed manual index for token_hash to prevent duplicate index warnings

const RefreshToken: Model<IRefreshToken> = mongoose.models.RefreshToken || mongoose.model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

export default RefreshToken;
