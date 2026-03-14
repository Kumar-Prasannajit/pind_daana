import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Location from "@/models/Location";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.name || !body.city || !body.state) {
            return NextResponse.json({ error: "Name, City, and State are required" }, { status: 400 });
        }

        const newLocation = await Location.create(body);

        return NextResponse.json({ message: "Location created successfully", location: newLocation }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating location:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const locations = await Location.find({}).sort({ name: 1 });
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, _id, ...updateData } = await req.json();
        const locationId = id || _id;

        if (!locationId) {
            return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
        }

        const updatedLocation = await Location.findByIdAndUpdate(
            locationId,
            updateData,
            { new: true }
        );

        if (!updatedLocation) {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Location updated successfully", location: updatedLocation });
    } catch (error) {
        console.error("Error updating location:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
        }

        const deletedLocation = await Location.findByIdAndDelete(id);

        if (!deletedLocation) {
            return NextResponse.json({ error: "Location not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Location deleted successfully" });
    } catch (error) {
        console.error("Error deleting location:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
