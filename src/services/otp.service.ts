import crypto from 'crypto';
import { sendOtpEmail as sendEmail } from '../lib/email';

export const generateOtp = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

export const hashOtp = (otp: string): string => {
    const secret = process.env.OTP_SECRET;
    if (!secret) {
        throw new Error('OTP_SECRET environment variable is missing.');
    }
    // OTP never stored plain — always HMAC-SHA256(otp, OTP_SECRET) before saving
    return crypto.createHmac('sha256', secret).update(otp).digest('hex');
};

export const sendOtpEmail = async (to: string, name: string, otp: string) => {
    // Email via Nodemailer/Resend: subject "Your verification code", body contains the 6-digit code
    // NEVER log the plain OTP value. NEVER include it in any API response field.
    await sendEmail({ to, name, otp });
};

export const sendOtpWhatsApp = async (to: string, otp: string) => {
    // WhatsApp via Twilio WhatsApp API: send to whatsapp_number
    // NEVER log the plain OTP value
    // Commented out as requested for future use
    /*
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    await client.messages.create({
        body: `Your verification code is ${otp}`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${to}`
    });
    */
    console.log(`[WhatsApp OTP] Send logic commented out for ${to}`);
};
