import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async ({ to, name, email, password }: any) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials missing. Skipping email send.');
        return;
    }

    const mailOptions = {
        from: `"Manima Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Welcome to Manima - Your Account Details',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #D35400; text-align: center;">Welcome to Manima!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>We are delighted to welcome you to the Manima family. Your account has been successfully created.</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Here are your login credentials:</strong></p>
                    <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
                </div>

                <p>Please log in to your dashboard and change your password immediately for security purposes.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/login" style="background-color: #D35400; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                </div>

                <p>If you have any questions, feel free to reply to this email.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Manima Team</strong></p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendResetLinkEmail = async ({ to, name, resetLink }: any) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials missing. Skipping email send.');
        return;
    }

    const mailOptions = {
        from: `"Manima Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset Your Password - Manima',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #D35400; text-align: center;">Password Reset Request</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>We received a request to reset your password. Click the button below to proceed:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #D35400; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>

                <p style="text-align: center; color: #666; font-size: 12px;">Or copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #D35400;">${resetLink}</a></p>

                <p>This link is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Manima Team</strong></p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending reset link:', error);
        throw error;
    }
};

export const sendBookingConfirmationEmail = async ({ to, name, bookingId, agentName }: any) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials missing. Skipping email send.');
        return;
    }

    const mailOptions = {
        from: `"Manima Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Booking Confirmed - Payment Verified & Agent Assigned',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #27AE60; text-align: center;">Booking Confirmed!</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>We are pleased to inform you that your payment has been successfully verified, and your booking is now confirmed.</p>
                
                <div style="background-color: #f0fff4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #27AE60;">
                    <p style="margin: 5px 0;"><strong>Agent Assigned:</strong> ${agentName}</p>
                    <p style="margin: 5px 0;"><strong>Booking Reference:</strong> #${bookingId}</p>
                </div>

                <p>Your assigned agent will be in touch with you shortly to coordinate further details.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/dashboard" style="background-color: #27AE60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">View Booking Details</a>
                </div>

                <p>If you have any questions, feel free to reply to this email.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Manima Team</strong></p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return null;
    }
};

export const sendOtpEmail = async ({ to, name, otp }: any) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials missing. Skipping email send.');
        return;
    }

    const mailOptions = {
        from: `"Manima Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Verify Your Account - Manima',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #D35400; text-align: center;">Verify Your Account</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for signing up with Manima. Please use the following OTP to verify your account:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #D35400;">${otp}</span>
                </div>

                <p>This OTP is valid for <strong>24 hours</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,</p>
                <p><strong>The Manima Team</strong></p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};
