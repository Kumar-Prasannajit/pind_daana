import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import PuriPuja from "@/models/PuriPuja";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await dbConnect();
        const puriPuja = await PuriPuja.findById(resolvedParams.id);

        if (!puriPuja) {
            return NextResponse.json({ error: "Puri Puja not found" }, { status: 404 });
        }

        return NextResponse.json(puriPuja);
    } catch (error) {
        console.error("Error fetching puri puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await dbConnect();
        const deletedPuriPuja = await PuriPuja.findByIdAndDelete(resolvedParams.id);

        if (!deletedPuriPuja) {
            return NextResponse.json({ error: "Puri Puja not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Puri Puja deleted successfully" });
    } catch (error) {
        console.error("Error deleting puri puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
