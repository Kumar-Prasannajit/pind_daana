import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBooking extends Document {
    client: mongoose.Types.ObjectId;
    location?: mongoose.Types.ObjectId;
    service?: mongoose.Types.ObjectId;
    puja?: mongoose.Types.ObjectId;
    pujaService?: mongoose.Types.ObjectId;
    puriPuja?: mongoose.Types.ObjectId;
    priceCategory: string;
    price: number;
    agent?: mongoose.Types.ObjectId;
    paymentStatus: "Pending" | "Completed";
    paymentMethod?: string;
    paymentDetails?: string;
    transactionId?: string;
    isPaymentVerified: boolean;
    status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
    isCompleted: boolean;
    completedMilestones: string[];
    bookingDate: Date;
    createdAt: Date;
}

const BookingSchema: Schema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: [true, "Please provide a client"],
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: "Location",
    },
    service: {
        type: Schema.Types.ObjectId,
        ref: "Service",
    },
    puja: {
        type: Schema.Types.ObjectId,
        ref: "Puja",
    },
    pujaService: {
        type: Schema.Types.ObjectId,
        ref: "PujaService",
    },
    puriPuja: {
        type: Schema.Types.ObjectId,
        ref: "PuriPuja",
    },
    priceCategory: {
        type: String,
        required: [true, "Please provide a price category"],
    },
    price: {
        type: Number,
        required: [true, "Please provide a price"],
    },
    agent: {
        type: Schema.Types.ObjectId,
        ref: "Agent",
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending",
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "qr", "cash", "bank_transfer"],
        default: "qr",
    },
    paymentDetails: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        default: "Pending",
    },
    transactionId: {
        type: String, // Transaction ID or UTR Reference
    },
    isPaymentVerified: {
        type: Boolean,
        default: false,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    completedMilestones: {
        type: [String],
        default: [],
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Booking;
}
const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
