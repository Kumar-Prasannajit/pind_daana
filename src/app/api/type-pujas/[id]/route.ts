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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await connectToDB();
        const typePuja = await PujaService.findById(resolvedParams.id);

        if (!typePuja) {
            return NextResponse.json({ error: "Type Puja not found" }, { status: 404 });
        }

        return NextResponse.json(typePuja);
    } catch (error) {
        console.error("Error fetching type puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await connectToDB();
        const deletedTypePuja = await PujaService.findByIdAndDelete(resolvedParams.id);

        if (!deletedTypePuja) {
            return NextResponse.json({ error: "Type Puja not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Type Puja deleted successfully" });
    } catch (error) {
        console.error("Error deleting type puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
