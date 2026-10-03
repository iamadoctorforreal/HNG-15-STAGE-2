import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);

export const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'key-dummy-for-build',
  // US accounts use https://api.mailgun.net, EU-region domains use https://api.eu.mailgun.net
  url: process.env.MAILGUN_API_URL || 'https://api.mailgun.net',
});

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  customerName,
  totalAmount,
  downloadToken,
}: {
  to: string;
  orderId: string;
  customerName: string;
  totalAmount: string;
  downloadToken?: string;
}) {
  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    console.warn('Mailgun credentials missing. Skipping email dispatch.');
    return null;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const downloadSection = downloadToken
    ? `<div style="background:#e6f5ed;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #008751;">
        <h3 style="color:#005230;margin-top:0;">Your Digital Abeokuta Catfish Cookbook</h3>
        <p>Thank you for purchasing our digital cookbook! You can download your copy below (link valid for 7 days):</p>
        <p><a href="${siteUrl}/api/download/${downloadToken}" style="background:#008751;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Download Your Cookbook</a></p>
      </div>`
    : '';

  return await mg.messages.create(process.env.MAILGUN_DOMAIN, {
    from:
      process.env.MAILGUN_FROM_EMAIL ||
      `Sawfy White Enterprises <orders@${process.env.MAILGUN_DOMAIN}>`,
    to: [to],
    subject: `Order Confirmation #${orderId.slice(0, 8)} — Sawfy White Enterprises`,
    text: `Thank you for your order, ${customerName}!\n\nOrder ID: ${orderId}\nTotal: ${totalAmount}\n\nWe are preparing your premium export-grade dried catfish from Abeokuta.\n\n— Sawfy White Enterprises`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
        <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
          <p style="color:#666;margin:4px 0 0 0;">Premium Export-Grade Dried Catfish from Abeokuta 🐟</p>
        </div>
        <h2 style="color:#2D2D2D;">Ẹ kú oríire! Thank you for your order, ${customerName}!</h2>
        <p style="color:#555;font-size:16px;line-height:1.5;">
          Your order has been received and verified. Our Abeokuta team is carefully packing your premium dried catfish for safe dispatch.
        </p>
        <div style="background:#FAF8F5;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:4px 0;"><strong>Order ID:</strong> #${orderId.slice(0, 8)}</p>
          <p style="margin:4px 0;"><strong>Total Paid:</strong> ${totalAmount}</p>
          <p style="margin:4px 0;"><strong>Status:</strong> Processing & Packing</p>
        </div>
        ${downloadSection}
        <div style="border-top:1px solid #eee;padding-top:16px;margin-top:24px;font-size:13px;color:#888;text-align:center;">
          <p>Sawfy White Enterprises • Abeokuta, Ogun State, Nigeria 🇳🇬</p>
          <p>Questions? Contact us anytime at support@sawfywhite.com</p>
        </div>
      </div>
    `,
  });
}
