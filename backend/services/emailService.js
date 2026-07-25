// import { Resend } from "resend";
// const resend = new Resend(process.env.RESEND_KEY);

// export const sendPaperStatusEmail = async (user, paper, status) => {
//   const subject =
//     status === "approved"
//       ? "Your paper has been approved"
//       : "Your paper was not approved";
//   const body =
//     status === "approved"
//       ? `Good news — your uploaded paper for ${paper.course} is now live and visible to other students.`
//       : `Your uploaded paper for ${paper.course} was not approved. Reason: ${paper.verificationReason || "did not meet quality guidelines"}.`;

//   await resend.emails.send({
//     from: process.env.RESEND_FROM || "onboarding@resend.dev",
//     to: user.email,
//     subject,
//     text: body,
//   });
// };

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Pasty Paperyyy" <no-reply@example.com>',
    to,
    subject,
    html,
    text,
  });
};

export const sendPaperStatusEmail = async (user, paper, status) => {
  const subject =
    status === "approved"
      ? "Your paper has been approved"
      : "Your paper was not approved";
  const body =
    status === "approved"
      ? `Good news — your uploaded paper for ${paper.course} is now live and visible to other students.`
      : `Your uploaded paper for ${paper.course} was not approved. Reason: ${paper.verificationReason || "did not meet quality guidelines"}.`;

  await sendEmail({
    to: user.email,
    subject,
    text: body,
  });
};
