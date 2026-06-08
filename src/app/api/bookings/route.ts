import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Booking from "@/models/Booking";
import Client from "@/models/Client";
import Service from "@/models/Service";
import LocationModel from "@/models/Location";
import { markPaymentCompleted } from "@/lib/milestones";
import crypto from "crypto";
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic validation
        if (!body.client || (!body.puja && !body.puriPuja && (!body.location || !body.service)) || !body.priceCategory || !body.price) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // --- DUPLICATE BOOKING PREVENTION (Task 5) ---
        // Prevent duplicate bookings created within a 5-minute window
        // (e.g. from double-clicks or retry on slow networks)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const duplicateQuery: any = {
            client: body.client,
            priceCategory: body.priceCategory,
            createdAt: { $gte: fiveMinutesAgo },
        };

        if (body.puja) {
            duplicateQuery.puja = body.puja;
        } else if (body.puriPuja) {
            duplicateQuery.puriPuja = body.puriPuja;
        } else {
            duplicateQuery.service = body.service;
            duplicateQuery.location = body.location;
        }

        const existingBooking = await Booking.findOne(duplicateQuery);
        if (existingBooking) {
            return NextResponse.json(
                { message: "Booking already exists", booking: existingBooking },
                { status: 200 }
            );
        }
        // --- END DUPLICATE PREVENTION ---

        const isRazorpayPayment = body.paymentMethod === "razorpay";
        if (isRazorpayPayment) {
            const { razorpayOrderId, transactionId, razorpaySignature } = body;
            if (!razorpayOrderId || !transactionId || !razorpaySignature || !process.env.RAZORPAY_KEY_SECRET) {
                return NextResponse.json({ error: "Razorpay payment verification failed" }, { status: 400 });
            }

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpayOrderId}|${transactionId}`)
                .digest("hex");

            if (expectedSignature !== razorpaySignature) {
                return NextResponse.json({ error: "Invalid Razorpay payment signature" }, { status: 400 });
            }
        }

        const bookingData = {
            ...body,
            paymentStatus: isRazorpayPayment ? "Completed" : body.paymentStatus || "Pending",
            isPaymentVerified: isRazorpayPayment,
            completedMilestones: isRazorpayPayment
                ? markPaymentCompleted(body.completedMilestones)
                : body.completedMilestones || [],
            status: body.status || "Pending"
        };

        const newBooking = await Booking.create(bookingData);

        // --- GOOGLE SHEETS INTEGRATION ---
        try {
            // Use a specific env var for Bookings
            const scriptUrl = process.env.GOOGLE_SHEETS_BOOKINGS_URL;
            const clientDetails = await Client.findById(body.client);

            let serviceName = "Unknown Service";
            let locationName = "Unknown Location";

            if (body.puja) {
                // Fetch Puja details
                const Puja = (await import("@/models/Puja")).default; // Dynamic import to avoid circular dep issues if any
                const pujaDetails = await Puja.findById(body.puja);
                if (pujaDetails) {
                    serviceName = pujaDetails.name;
                    locationName = pujaDetails.location; // Puja model has string location
                }
            } else if (body.puriPuja) {
                const PuriPuja = (await import("@/models/PuriPuja")).default;
                const puriPujaDetails = await PuriPuja.findById(body.puriPuja);
                if (puriPujaDetails) {
                    serviceName = puriPujaDetails.name;
                    locationName = "Jagannath Temple, Puri";
                }
            } else {
                // Fetch Service/Location details
                const [serviceDetails, locationDetails] = await Promise.all([
                    Service.findById(body.service),
                    LocationModel.findById(body.location)
                ]);
                if (serviceDetails) serviceName = serviceDetails.name;
                if (locationDetails) locationName = locationDetails.name;
            }

            if (clientDetails && scriptUrl) {
                const sheetData = {
                    name: clientDetails.name,
                    email: clientDetails.email,
                    phone: clientDetails.phone,
                    address: clientDetails.address || "N/A",
                    service: serviceName,
                    location: locationName,
                    package: body.package,
                    price: body.price,
                    paymentMethod: body.paymentMethod,
                    transactionId: body.transactionId
                };

                // 2. Send to Google Apps Script
                fetch(scriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sheetData)
                }).then(res => res.text())
                    .catch(err => console.error("Google Sheet Error:", err));
            } else {
                console.warn("Skipping Google Sheet Sync: Missing details or Env Var.");
            }
        } catch (sheetError) {
            console.error("Error sending to Google Sheet:", sheetError);
            // Don't fail the booking if sheet sync fails
        }
        // ---------------------------------

        // Update Client Status
        await Client.findByIdAndUpdate(body.client, {
            $set: { isBooked: true },
            $unset: { expireAt: "" }
        });

        return NextResponse.json({ message: "Booking created successfully", booking: newBooking }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating booking:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
