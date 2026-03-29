import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import Service from "@/models/Service";
import imagekit from "@/lib/imagekit";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const contentType = req.headers.get("content-type") || "";
        let data: any;
        let fileToUpload;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            data = Object.fromEntries(formData);
            fileToUpload = formData.get("file") || formData.get("image");
        } else {
            data = await req.json();
            fileToUpload = data.imageUrl || data.file;
        }

        const { name, details } = data;
        const milestones: string[] = data.milestones
            ? (typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones)
            : [];

        if (!name || !details) {
            return NextResponse.json({ error: "Name and details are required" }, { status: 400 });
        }

        if (fileToUpload) {
            if (!imagekit) {
                throw new Error("ImageKit is not configured. Please check environment variables.");
            }

            let fileData: string | Buffer = fileToUpload as string;

            if (typeof fileToUpload !== 'string' && (fileToUpload as any).arrayBuffer) {
                const arrayBuffer = await (fileToUpload as unknown as File).arrayBuffer();
                fileData = Buffer.from(arrayBuffer);
            }

            const uploadResponse = await imagekit.upload({
                file: fileData,
                fileName: `service-${Date.now()}`,
                folder: "/service-pics"
            });
            data.imageUrl = uploadResponse.url;
        }

        const newService = await Service.create({
            name,
            details,
            milestones,
            ...(data.imageUrl && { imageUrl: data.imageUrl })
        });

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

        const contentType = req.headers.get("content-type") || "";
        let data: any;
        let fileToUpload;

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            data = Object.fromEntries(formData);
            fileToUpload = formData.get("file") || formData.get("image");
        } else {
            data = await req.json();
            fileToUpload = data.imageUrl || data.file;
        }

        const { id, _id, name, details } = data;
        const milestones: string[] = data.milestones
            ? (typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones)
            : [];
        const serviceId = id || _id;

        if (!serviceId) {
            return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
        }

        if (fileToUpload) {
            let fileData: string | Buffer = fileToUpload as string;

            if (typeof fileToUpload !== 'string' && (fileToUpload as any).arrayBuffer) {
                const arrayBuffer = await (fileToUpload as unknown as File).arrayBuffer();
                fileData = Buffer.from(arrayBuffer);
            }

            // Only upload if it's new file data (not an existing URL)
            if (typeof fileToUpload !== 'string' || !fileToUpload.startsWith('http')) {
                if (!imagekit) {
                    throw new Error("ImageKit is not configured. Please check environment variables.");
                }

                const uploadResponse = await imagekit.upload({
                    file: fileData,
                    fileName: `service-${Date.now()}`,
                    folder: "/service-pics"
                });
                data.imageUrl = uploadResponse.url;
            }
        }

        const updateData: any = { name, details, milestones };
        if (data.imageUrl) {
            updateData.imageUrl = data.imageUrl;
        }

        const updatedService = await Service.findByIdAndUpdate(
            serviceId,
            updateData,
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
