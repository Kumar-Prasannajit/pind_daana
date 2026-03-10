import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Puja from "@/models/Puja";

import imagekit from "@/lib/imagekit";

/* -------------------- */
/* POST: Create Puja   */
/* -------------------- */
export async function POST(req: Request) {
  try {
    await dbConnect();

    // Determine content type to parse accordingly
    const contentType = req.headers.get("content-type") || "";
    let data;
    let fileToUpload;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
      fileToUpload = formData.get("file") || formData.get("image"); // Expecting 'file' or 'image' field
      // Extract other fields from JSON string if needed, or simple fields
      if (typeof data.services === 'string') {
        try {
          data.services = JSON.parse(data.services);
        } catch (e) {
          // ignore
        }
      }
    } else {
      data = await req.json();
      fileToUpload = data.imageUrl || data.file;
    }

    if (fileToUpload) {
      if (!imagekit) {
        throw new Error("ImageKit is not configured. Please check environment variables.");
      }

      let fileData: string | Buffer = fileToUpload as string;

      // If it's a File object (from formData), convert to Buffer
      if (typeof fileToUpload !== 'string' && (fileToUpload as any).arrayBuffer) {
        const arrayBuffer = await (fileToUpload as unknown as File).arrayBuffer();
        fileData = Buffer.from(arrayBuffer);
      }

      const uploadResponse = await imagekit.upload({
        file: fileData,
        fileName: `puja-${Date.now()}`,
        folder: "/temple-pics"
      });
      data.imageUrl = uploadResponse.url;
    }

    const puja = await Puja.create(data);

    return NextResponse.json(
      { success: true, data: puja },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating puja:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

/* -------------------- */
/* GET: Fetch All Puja */
/* -------------------- */
export async function GET() {
  try {
    await dbConnect();

    const pujas = await Puja.find()
      .populate("services.service", "name significance")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, data: pujas },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* -------------------- */
/* PATCH: Update Puja   */
/* -------------------- */
export async function PATCH(req: Request) {
  try {
    await dbConnect();

    const contentType = req.headers.get("content-type") || "";
    let data;
    let fileToUpload;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
      fileToUpload = formData.get("file") || formData.get("image");

      if (typeof data.services === 'string') {
        try {
          data.services = JSON.parse(data.services);
        } catch (e) {
          // ignore
        }
      }
    } else {
      data = await req.json();
      fileToUpload = data.imageUrl || data.file;
    }

    if (!data.id && !data._id) {
      return NextResponse.json(
        { success: false, message: "Puja ID is required" },
        { status: 400 }
      );
    }

    const id = data.id || data._id;

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
          fileName: `puja-${Date.now()}`,
          folder: "/temple-pics"
        });
        data.imageUrl = uploadResponse.url;
      }
    }

    const puja = await Puja.findByIdAndUpdate(id, data, { new: true });

    if (!puja) {
      return NextResponse.json(
        { success: false, message: "Puja not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: puja },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating puja:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
