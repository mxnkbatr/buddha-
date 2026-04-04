// lib/mail.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendBookingNotification = async ({
  userEmail,
  userName,
  monkName,
  date,
  time,
  serviceName
}: {
  userEmail: string;
  userName: string;
  monkName: string;
  date: string;
  time: string;
  serviceName: string;
}) => {
  try {
    // 1. Email to the Client (User)
    await transporter.sendMail({
      from: `"Nirvana Sanctuary" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `Booking Confirmed: ${serviceName} with ${monkName}`,
      html: `
        <div style="font-family: serif; color: #451a03; padding: 20px;">
          <h1 style="color: #D97706;">Booking Confirmed</h1>
          <p>Dear ${userName},</p>
          <p>Your spiritual session has been successfully scheduled.</p>
          <div style="background: #FFFBEB; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Guide:</strong> ${monkName}</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
          </div>
          <p>Please arrive 10 minutes early to prepare your mind.</p>
          <p><i>Nirvana Team</i></p>
        </div>
      `,
    });

    // 2. Email to the Admin (Root Gmail)
    await transporter.sendMail({
      from: `"Nirvana System" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL, // Or send to the Monk's specific email if you have it
      subject: `NEW BOOKING: ${userName} - ${date}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Booking Request</h2>
          <p><strong>Client:</strong> ${userName} (${userEmail})</p>
          <p><strong>Monk:</strong> ${monkName}</p>
          <p><strong>Service:</strong> ${serviceName}</p>
          <p><strong>Date:</strong> ${date} at ${time}</p>
        </div>
      `,
    });

    console.log("Emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
    // Don't throw error here to avoid failing the booking if email server is down
  }
};
export const sendBookingStatusUpdate = async ({
  userEmail,
  userName,
  monkName,
  serviceName,
  date,
  time,
  status
}: {
  userEmail: string;
  userName: string;
  monkName: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'rejected';
}) => {
  try {
    const isConfirmed = status === 'confirmed';
    const subject = isConfirmed 
      ? `✅ Booking Confirmed: ${serviceName}` 
      : `❌ Booking Update: ${serviceName}`;

    const color = isConfirmed ? "#059669" : "#DC2626"; // Green or Red
    const messageTitle = isConfirmed ? "Booking Confirmed" : "Booking Declined";
    const messageBody = isConfirmed 
      ? `Your session with <strong>${monkName}</strong> has been confirmed. Please arrive on time.`
      : `Unfortunately, <strong>${monkName}</strong> is unable to accept this request at this time. Please try a different time slot.`;

    await transporter.sendMail({
      from: `"Nirvana Sanctuary" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; color: #451a03; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px;">
          <h1 style="color: ${color};">${messageTitle}</h1>
          <p>Dear ${userName},</p>
          <p>${messageBody}</p>
          
          <div style="background: #FFFBEB; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
            <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
          </div>

          <p style="font-size: 12px; color: #888;">Nirvana Spiritual Sanctuary</p>
        </div>
      `,
    });

    console.log(`Status update email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending status email:", error);
  }
};

export const sendBookingCancellation = async ({
  to,
  toName,
  monkName,
  serviceName,
  date,
  time,
  feeApplied,
  feeAmount,
  role,
  clientName
}: {
  to: string;
  toName: string;
  monkName: string;
  serviceName: string;
  date: string;
  time: string;
  feeApplied: boolean;
  feeAmount: number;
  role: 'client' | 'monk';
  clientName?: string;
}) => {
  try {
    const isClient = role === 'client';
    const subject = `❌ Захиалга цуцлагдлаа — ${serviceName}`;
    const feeHtml = feeApplied
      ? `<p style="color:#DC2626;font-weight:bold;">⚠️ Цуцлалтын хураамж: ${feeAmount.toLocaleString()}₮ (24 цагаас дотор цуцалсан)</p>`
      : '';

    const bodyHtml = isClient
      ? `<p>Эрхэм <strong>${toName}</strong>,</p>
         <p>Таны <strong>${serviceName}</strong> захиалга цуцлагдлаа.</p>
         ${feeHtml}
         <div style="background:#FEF2F2;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #DC2626;">
           <p><strong>Багш:</strong> ${monkName}</p>
           <p><strong>Огноо:</strong> ${date} ${time}</p>
         </div>`
      : `<p>Эрхэм <strong>${monkName}</strong>,</p>
         <p><strong>${clientName || 'Хэрэглэгч'}</strong>-н ${serviceName} захиалга цуцлагдлаа.</p>
         ${feeHtml}
         <div style="background:#FEF2F2;padding:15px;border-radius:8px;margin:20px 0;border-left:4px solid #DC2626;">
           <p><strong>Огноо:</strong> ${date} ${time}</p>
         </div>`;

    await transporter.sendMail({
      from: `"Gevabal" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `<div style="font-family:serif;color:#451a03;padding:20px;max-width:600px;">${bodyHtml}<p style="font-size:12px;color:#888;">Gevabal Spiritual Platform</p></div>`
    });
  } catch (error) {
    console.error("Cancellation email error:", error);
  }
};