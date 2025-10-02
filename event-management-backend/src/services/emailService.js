// Stub for sending emails
export const sendEmail = async (to, subject, text) => {
  // Replace with nodemailer or other service in production
  console.log(`Email sent to ${to}: ${subject} - ${text}`);
};
