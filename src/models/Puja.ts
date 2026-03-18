import mongoose, { Schema, Document, Model } from "mongoose";

/* -------------------- */
/* Package Interface   */
/* -------------------- */
export interface IPackage {
  name: string;
  features: string[];
  priceAmount: number;
}

/* -------------------- */
/* Puja Interface      */
/* -------------------- */
export interface IPuja extends Document {
  imageUrl: string;
  name: string;
  location: string;
  templeType: string;
  priority: number;
  services: {
    service: mongoose.Types.ObjectId;
    packages: IPackage[];
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

/* -------------------- */
/* Package Schema      */
/* -------------------- */
const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      required: true,
    },
    priceAmount: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

/* -------------------- */
/* Validator           */
/* -------------------- */
const arrayLimit = (val: any[]): boolean => val.length > 0;

/* -------------------- */
/* Puja Schema         */
/* -------------------- */
const pujaSchema = new Schema<IPuja>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    templeType: {
      type: String,
      required: true,
    },
    priority: {
      type: Number,
      default: 8, // 1: Highest, ..., 8: Standard
      required: true,
    },
    services: {
      type: [{
        service: {
          type: Schema.Types.ObjectId,
          ref: "PujaService",
        },
        packages: [packageSchema]
      }],
      validate: {
        validator: arrayLimit,
        message: "At least one service is required",
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------- */
/* Model Export        */
/* -------------------- */

// Delete the cached model if it exists so Next.js HMR uses the updated schema
const Puja = (mongoose.models.Puja as mongoose.Model<IPuja>) || mongoose.model<IPuja>("Puja", pujaSchema);

export default Puja;
