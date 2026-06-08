import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPendingClient extends Document {
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    ref_id: string;
    otp_hash: string;
    otp_attempts: number;
    can_resend_at: Date;
    createdAt: Date;
}

const PendingClientSchema: Schema = new Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true, 
        minlength: 2, 
        maxlength: 100 
    },
    email: { 
        type: String, 
        required: true, 
        lowercase: true, 
        trim: true 
    },
    phone: { 
        type: String, 
        required: true, 
        trim: true 
    },
    whatsapp_number: { 
        type: String, 
        required: true, 
        trim: true 
    },
    ref_id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    otp_hash: { 
        type: String, 
        required: true 
    },
    otp_attempts: { 
        type: Number, 
        default: 0 
    },
    can_resend_at: { 
        type: Date, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { strict: true });

// TTL: MongoDB auto-deletes entire document (signup data + OTP together) after 10 minutes
PendingClientSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });
// Removed manual index for ref_id and email to prevent duplicate index warnings since unique: true is used in schema


// Delete cached model in dev so schema changes are always applied on hot-reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.PendingClient) {
    delete mongoose.models.PendingClient;
}

const PendingClient: Model<IPendingClient> = mongoose.models.PendingClient || mongoose.model<IPendingClient>("PendingClient", PendingClientSchema);

export default PendingClient;
