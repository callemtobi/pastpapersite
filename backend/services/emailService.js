import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_KEY);

export const sendPaperStatusEmail = async (user, paper, status) => {
  const subject =
    status === "approved"
      ? "Your paper has been approved"
      : "Your paper was not approved";
  const body =
    status === "approved"
      ? `Good news — your uploaded paper for ${paper.course} is now live and visible to other students.`
      : `Your uploaded paper for ${paper.course} was not approved. Reason: ${paper.verificationReason || "did not meet quality guidelines"}.`;

  await resend.emails.send({
    from: process.env.RESEND_FROM || "onboarding@resend.dev",
    to: user.email,
    subject,
    text: body,
  });
};
