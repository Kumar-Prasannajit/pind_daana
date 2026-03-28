import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, details } = await req.json();

        if (!name || !details) {
            return NextResponse.json({ error: "Name and details are required" }, { status: 400 });
        }

        const newService = await Service.create({ name, details });

        return NextResponse.json({ message: "Service created successfully", service: newService }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Service with this name already exists" }, { status: 400 });
        }
        console.error("Error creating service:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const services = await Service.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, _id, name, details } = await req.json();

        const serviceId = id || _id;

        if (!serviceId) {
            return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
        }

        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            { name, details },
            { new: true }
        );

        if (!updatedService) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Service updated successfully", service: updatedService });
    } catch (error) {
        console.error("Error updating service:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
        }

        const deletedService = await Service.findByIdAndDelete(id);

        if (!deletedService) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Service deleted successfully" });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
