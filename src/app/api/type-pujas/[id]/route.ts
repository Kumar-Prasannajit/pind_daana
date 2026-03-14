import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import PujaService from "@/models/PujaService";
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        await dbConnect();
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
        await dbConnect();
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
