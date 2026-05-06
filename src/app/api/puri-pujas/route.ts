import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/db";
import PuriPuja from "@/models/PuriPuja";
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
        const pricing = data.pricing
            ? (typeof data.pricing === 'string' ? JSON.parse(data.pricing) : data.pricing)
            : [];
        const milestones: string[] = data.milestones
            ? (typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones)
            : [];

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
                fileName: `puri-puja-${Date.now()}`,
                folder: "/temple-pics"
            });
            data.imageUrl = uploadResponse.url;
        }

        const newPuriPuja = await PuriPuja.create({
            name,
            significance,
            milestones,
            pricing,
            ...(data.imageUrl && { imageUrl: data.imageUrl })
        });

        return NextResponse.json({ message: "Puri Puja created successfully", puriPuja: newPuriPuja }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Puri Puja with this name already exists" }, { status: 400 });
        }
        console.error("Error creating puri puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const puriPujas = await PuriPuja.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(puriPujas);
    } catch (error) {
        console.error("Error fetching puri pujas:", error);
        return NextResponse.json({ error: "Failed to fetch puri pujas" }, { status: 500 });
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
        const pricing = data.pricing
            ? (typeof data.pricing === 'string' ? JSON.parse(data.pricing) : data.pricing)
            : undefined;
        const milestones: string[] = data.milestones
            ? (typeof data.milestones === 'string' ? JSON.parse(data.milestones) : data.milestones)
            : [];
        const pujaId = id || _id;

        if (!pujaId) {
            return NextResponse.json({ error: "Puri Puja ID is required" }, { status: 400 });
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
                    fileName: `puri-puja-${Date.now()}`,
                    folder: "/temple-pics"
                });
                data.imageUrl = uploadResponse.url;
            }
        }

        const updateData: any = { name, significance, milestones };
        if (pricing !== undefined) {
            updateData.pricing = pricing;
        }
        if (data.imageUrl) {
            updateData.imageUrl = data.imageUrl;
        }

        const updatedPuriPuja = await PuriPuja.findByIdAndUpdate(
            pujaId,
            updateData,
            { new: true }
        );

        if (!updatedPuriPuja) {
            return NextResponse.json({ error: "Puri Puja not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Puri Puja updated successfully", puriPuja: updatedPuriPuja });
    } catch (error) {
        console.error("Error updating puri puja:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
