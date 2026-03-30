import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Location from "@/models/Location";
import imagekit from "@/lib/imagekit";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const contentType = req.headers.get("content-type") || "";
        let body: any;
        let fileToUpload;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body = Object.fromEntries(formData);
            fileToUpload = formData.get("file") || formData.get("image");
        } else {
            body = await req.json();
            fileToUpload = body.imageUrl || body.file;
        }

        if (typeof body.services === "string") {
            body.services = JSON.parse(body.services);
        }

        // Basic validation
        if (!body.name || !body.city || !body.state) {
            return NextResponse.json({ error: "Name, City, and State are required" }, { status: 400 });
        }

        if (fileToUpload) {
            if (!imagekit) {
                throw new Error("ImageKit is not configured. Please check environment variables.");
            }

            let fileData: string | Buffer = fileToUpload as string;

            if (typeof fileToUpload !== "string" && (fileToUpload as any).arrayBuffer) {
                const arrayBuffer = await (fileToUpload as unknown as File).arrayBuffer();
                fileData = Buffer.from(arrayBuffer);
            }

            if (typeof fileToUpload !== "string" || !fileToUpload.startsWith("http")) {
                const uploadResponse = await imagekit.upload({
                    file: fileData,
                    fileName: `location-${Date.now()}`,
                    folder: "/location-pics"
                });
                body.imageUrl = uploadResponse.url;
            }
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
        const locations = await Location.find({}).sort({ name: 1 }).lean();
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const contentType = req.headers.get("content-type") || "";
        let body: any;
        let fileToUpload;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            body = Object.fromEntries(formData);
            fileToUpload = formData.get("file") || formData.get("image");
        } else {
            body = await req.json();
            fileToUpload = body.imageUrl || body.file;
        }

        if (typeof body.services === "string") {
            body.services = JSON.parse(body.services);
        }

        const { id, _id, ...updateData } = body;
        const locationId = id || _id;

        if (!locationId) {
            return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
        }

        if (fileToUpload) {
            let fileData: string | Buffer = fileToUpload as string;

            if (typeof fileToUpload !== "string" && (fileToUpload as any).arrayBuffer) {
                const arrayBuffer = await (fileToUpload as unknown as File).arrayBuffer();
                fileData = Buffer.from(arrayBuffer);
            }

            if (typeof fileToUpload !== "string" || !fileToUpload.startsWith("http")) {
                if (!imagekit) {
                    throw new Error("ImageKit is not configured. Please check environment variables.");
                }

                const uploadResponse = await imagekit.upload({
                    file: fileData,
                    fileName: `location-${Date.now()}`,
                    folder: "/location-pics"
                });
                updateData.imageUrl = uploadResponse.url;
            }
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
