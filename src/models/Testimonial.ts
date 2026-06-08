import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITestimonial extends Document {
    client: mongoose.Types.ObjectId;
    clientName: string;
    pujaOrServiceOpted: string;
    comment: string;
    rating: number;
    adminApproved: boolean;
    createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: "Client",
        required: [true, "Client reference is required"],
    },
    clientName: {
        type: String,
        required: [true, "Client name is required"],
        trim: true,
    },
    pujaOrServiceOpted: {
        type: String,
        required: [true, "Puja / Service name is required"],
        trim: true,
    },
    comment: {
        type: String,
        required: [true, "Please write your feedback"],
        trim: true,
        minlength: [10, "Feedback must be at least 10 characters"],
        maxlength: [1000, "Feedback cannot exceed 1000 characters"],
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1 star"],
        max: [5, "Rating cannot exceed 5 stars"],
        default: 5,
    },
    adminApproved: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Testimonial;
}

const Testimonial: Model<ITestimonial> =
    mongoose.models.Testimonial ||
    mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);

export default Testimonial;
