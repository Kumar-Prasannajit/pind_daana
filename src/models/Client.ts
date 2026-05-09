import mongoose, { Schema, Model, Document } from "mongoose";

export interface IClient extends Document {
    name: string;
    email: string;
    phone: string;
    whatsapp_number: string;
    is_verified: boolean;
    address?: string;
    isBooked: boolean;
    createdAt: Date;
}

const ClientSchema: Schema = new Schema({
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
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    phone: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    whatsapp_number: { 
        type: String, 
        required: true, 
        trim: true 
    },
    is_verified: { 
        type: Boolean, 
        default: true 
    },
    address: {
        type: String,
        trim: true,
    },
    isBooked: {
        type: Boolean,
        default: false,
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, { strict: true });

// Delete cached model in dev so schema changes are always applied on hot-reload
if (process.env.NODE_ENV !== 'production' && mongoose.models.Client) {
    delete mongoose.models.Client;
}

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);

export default Client;
