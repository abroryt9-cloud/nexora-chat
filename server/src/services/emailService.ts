import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"Nexora" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendEmail(email, 'Verify your email', `<a href="${url}">Click here</a>`);
};
