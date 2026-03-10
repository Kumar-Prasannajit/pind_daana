import { NextResponse } from "next/server";
import mongoose from "mongoose";
import PujaService from "@/models/PujaService";

// Helper function to connect to DB
const connectToDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
    } catch (error) {
        console.error("DB Connection Error:", error);
    }
};

export async function POST(req: Request) {
    try {
        await connectToDB();
        const { name, significance } = await req.json();

        if (!name || !significance) {
            return NextResponse.json({ error: "Name and significance are required" }, { status: 400 });
        }

        const newPujaService = await PujaService.create({ name, significance });

        return NextResponse.json({ message: "Type Puja created successfully", pujaService: newPujaService }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Type Puja with this name already exists" }, { status: 400 });
        }
        console.error("Error creating type puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDB();
        const typePujas = await PujaService.find({}).sort({ createdAt: -1 });
        return NextResponse.json(typePujas);
    } catch (error) {
        console.error("Error fetching type pujas:", error);
        return NextResponse.json({ error: "Failed to fetch type pujas" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDB();
        const { id, _id, name, significance } = await req.json();

        const pujaId = id || _id;

        if (!pujaId) {
            return NextResponse.json({ error: "Type Puja ID is required" }, { status: 400 });
        }

        const updatedPujaService = await PujaService.findByIdAndUpdate(
            pujaId,
            { name, significance },
            { new: true }
        );

        if (!updatedPujaService) {
            return NextResponse.json({ error: "Type Puja not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Type Puja updated successfully", pujaService: updatedPujaService });
    } catch (error) {
        console.error("Error updating type puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
