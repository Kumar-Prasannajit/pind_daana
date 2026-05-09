import mongoose, { Schema, Model, Document } from "mongoose";

export interface ILoginOtp extends Document {
    ref_id: string;
    client_ref: string;
    otp_hash: string;
    otp_attempts: number;
    can_resend_at: Date;
    createdAt: Date;
}

const LoginOtpSchema: Schema = new Schema({
    ref_id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    client_ref: { 
        type: String, 
        required: true 
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

// TTL: auto-deleted after 2 minutes
LoginOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
// Removed manual index for ref_id to prevent duplicate index warnings
LoginOtpSchema.index({ client_ref: 1 });

const LoginOtp: Model<ILoginOtp> = mongoose.models.LoginOtp || mongoose.model<ILoginOtp>("LoginOtp", LoginOtpSchema);

export default LoginOtp;
