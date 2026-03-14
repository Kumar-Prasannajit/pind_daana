import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import PujaService from "@/models/PujaService";
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

        const { name, significance } = data;

        if (!name || !significance) {
            return NextResponse.json({ error: "Name and significance are required" }, { status: 400 });
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
                fileName: `type-puja-${Date.now()}`,
                folder: "/temple-pics"
            });
            data.imageUrl = uploadResponse.url;
        }

        const newPujaService = await PujaService.create({ 
            name, 
            significance,
            ...(data.imageUrl && { imageUrl: data.imageUrl })
        });

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
        await dbConnect();
        const typePujas = await PujaService.find({}).sort({ createdAt: -1 });
        return NextResponse.json(typePujas);
    } catch (error) {
        console.error("Error fetching type pujas:", error);
        return NextResponse.json({ error: "Failed to fetch type pujas" }, { status: 500 });
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

        const { id, _id, name, significance } = data;
        const pujaId = id || _id;

        if (!pujaId) {
            return NextResponse.json({ error: "Type Puja ID is required" }, { status: 400 });
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
                    fileName: `type-puja-${Date.now()}`,
                    folder: "/temple-pics"
                });
                data.imageUrl = uploadResponse.url;
            }
        }

        const updateData: any = { name, significance };
        if (data.imageUrl) {
            updateData.imageUrl = data.imageUrl;
        }

        const updatedPujaService = await PujaService.findByIdAndUpdate(
            pujaId,
            updateData,
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
