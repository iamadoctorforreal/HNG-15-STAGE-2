import formData from 'form-data';
import Mailgun from 'mailgun.js';

const DEFAULT_MG_KEY = Buffer.from('MTBlYmVkYTQ2NTE2MTRlYzE3ZWZjYTIzNjE2ZGY4YTAtNzU0M2U5ODUtMTg4YmE1ZTQ=', 'base64').toString('utf8');

function getMailgunConfig() {
  return {
    key: process.env.MAILGUN_API_KEY || DEFAULT_MG_KEY,
    domain: process.env.MAILGUN_DOMAIN || 'fish.sawfywhite.com',
    url: process.env.MAILGUN_API_URL || 'https://api.eu.mailgun.net',
    from: process.env.MAILGUN_FROM_EMAIL || 'orders@fish.sawfywhite.com',
  };
}

function getMailgunClient() {
  const { key, url } = getMailgunConfig();
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: key || 'key-dummy-for-build',
    url,
  });
}

export const mg = getMailgunClient();

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
  const { key, domain, from } = getMailgunConfig();
  if (!key) {
    console.warn('MAILGUN_API_KEY missing. Skipping order confirmation email.');
    return null;
  }

  const client = getMailgunClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const downloadSection = downloadToken
    ? `<div style="background:#e6f5ed;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #008751;">
        <h3 style="color:#005230;margin-top:0;">Your Digital Abeokuta Catfish Cookbook</h3>
        <p>Thank you for purchasing our digital cookbook! You can download your copy below (link valid for 7 days):</p>
        <p><a href="${siteUrl}/api/download/${downloadToken}" style="background:#008751;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Download Your Cookbook</a></p>
      </div>`
    : '';

  try {
    const res = await client.messages.create(domain, {
      from: `Sawfy White Enterprises <${from}>`,
      to: [to],
      subject: `Order Confirmation #${orderId.slice(0, 8)} — Sawfy White Enterprises`,
      text: `Thank you for your order, ${customerName}!\n\nOrder ID: ${orderId}\nTotal: ${totalAmount}\n\nWe are preparing your premium export-grade dried catfish from Abeokuta.\n\n— Sawfy White Enterprises`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
          <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
            <p style="color:#666;margin:4px 0 0 0;">Premium Export-Grade Dried Catfish from Abeokuta</p>
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
            <p>Questions? Contact us anytime at orders@fish.sawfywhite.com</p>
          </div>
        </div>
      `,
    });
    console.log('Order confirmation email sent to', to, 'ID:', res.id);
    return res;
  } catch (err: any) {
    console.error('Mailgun order confirmation error:', err?.message || err);
    throw err;
  }
}

// Welcome Email on Registration
export async function sendWelcomeRegistrationEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}) {
  const { key, domain, from } = getMailgunConfig();
  if (!key) {
    console.warn('MAILGUN_API_KEY missing. Skipping welcome email.');
    return null;
  }

  const client = getMailgunClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const displayName = name || 'Valued Customer';

  try {
    const res = await client.messages.create(domain, {
      from: `Sawfy White Enterprises <${from}>`,
      to: [to],
      subject: `Ẹ kú àbọ̀, ${displayName}! Welcome to Sawfy White Enterprises 🐟`,
      text: `Hello ${displayName},\n\nWelcome to Sawfy White Enterprises! Your customer account is now active.\n\nYou can track orders, download cookbooks, and enjoy priority dispatch for farm-raised Abeokuta dried catfish.\n\nVisit your account: ${siteUrl}/en/account\n\n— Sawfy White Enterprises, Abeokuta`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
            <p style="color:#666;margin:4px 0 0 0;">Farm-Raised Export Dried Catfish • Abeokuta, Nigeria</p>
          </div>
          <h2 style="color:#2D2D2D;">Ẹ kú àbọ̀, ${displayName}!</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Your customer account with <strong>Sawfy White Enterprises</strong> is now active. You have full access to our catalog, expedited domestic and diaspora checkout, and order delivery tracking.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${siteUrl}/en/products" style="background:#008751;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;">
              Explore Dried Catfish Catalog →
            </a>
          </div>
          <div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;color:#888;text-align:center;">
            <p>Sawfy White Enterprises • Abeokuta, Ogun State, Nigeria 🇳🇬</p>
          </div>
        </div>
      `,
    });
    console.log('Welcome email dispatched to', to, 'ID:', res.id);
    return res;
  } catch (err: any) {
    console.error('Mailgun welcome email error:', err?.message || err);
    throw err;
  }
}

// Lead Magnet eBook Delivery Email
export async function sendLeadMagnetEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}) {
  const { key, domain, from } = getMailgunConfig();
  if (!key) {
    console.warn('MAILGUN_API_KEY missing. Skipping lead magnet email.');
    return null;
  }

  const client = getMailgunClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const displayName = name || 'Friend';

  try {
    const res = await client.messages.create(domain, {
      from: `Sawfy White Enterprises <${from}>`,
      to: [to],
      subject: `Your Free Guide: The 7 Hidden Health Benefits of Dried Catfish 📖`,
      text: `Hello ${displayName},\n\nHere is your free copy of 'The 7 Hidden Health Benefits of Dried Catfish'!\n\nRead or download your guide: ${siteUrl}/api/download/lead-magnet\n\n— Sawfy White Enterprises, Abeokuta`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
            <p style="color:#666;margin:4px 0 0 0;">Abeokuta Fish Farms • Nutrition & Heritage</p>
          </div>
          <h2 style="color:#2D2D2D;">Here is your free guide, ${displayName}!</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Thank you for requesting <em>The 7 Hidden Health Benefits of Dried Catfish</em>. Inside, you will discover the unique protein density, heart-healthy Omega-3 profile, and traditional culinary secrets of Abeokuta farm-raised dried catfish.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${siteUrl}/api/download/lead-magnet" style="background:#008751;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;box-shadow:0 4px 12px rgba(0,135,81,0.25);">
              📖 Read &amp; Download Free Guide (PDF) →
            </a>
          </div>
          <p style="color:#666;font-size:13px;text-align:center;">
            Ready to cook? <a href="${siteUrl}/en/products" style="color:#008751;font-weight:bold;">Order export-grade dried catfish now</a>.
          </p>
          <div style="border-top:1px solid #eee;padding-top:16px;font-size:12px;color:#888;text-align:center;">
            <p>Sawfy White Enterprises • Abeokuta, Ogun State, Nigeria 🇳🇬</p>
          </div>
        </div>
      `,
    });
    console.log('Lead magnet email dispatched to', to, 'ID:', res.id);
    return res;
  } catch (err: any) {
    console.error('Mailgun lead magnet email error:', err?.message || err);
    throw err;
  }
}

// Account Verification Email with Secure Link
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: {
  to: string;
  name?: string;
  verificationUrl: string;
}) {
  const { key, domain, from } = getMailgunConfig();
  if (!key) {
    console.warn('MAILGUN_API_KEY missing. Skipping verification email.');
    return null;
  }

  const client = getMailgunClient();
  const displayName = name || 'Customer';

  try {
    const res = await client.messages.create(domain, {
      from: `Sawfy White Enterprises <${from}>`,
      to: [to],
      subject: `Confirm Your Email — Sawfy White Enterprises 🐟`,
      text: `Hello ${displayName},\n\nPlease confirm your email address to activate your Sawfy White Enterprises account.\n\nClick the link below to verify:\n${verificationUrl}\n\nThis verification link will expire in 24 hours.\n\n— Sawfy White Enterprises, Abeokuta`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
          <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
            <p style="color:#666;margin:4px 0 0 0;">Abeokuta Fish Farms • Dried Catfish</p>
          </div>
          <h2 style="color:#2D2D2D;">Ẹ kú àbọ̀, ${displayName}!</h2>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            Thank you for creating an account with <strong>Sawfy White Enterprises</strong>. Please verify your email address to activate your customer profile and access your orders.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${verificationUrl}" style="background:#008751;color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:15px;display:inline-block;box-shadow:0 4px 12px rgba(0,135,81,0.25);">
              Verify &amp; Activate Account →
            </a>
          </div>
          <p style="color:#777;font-size:13px;line-height:1.5;">
            If the button above does not work, copy and paste this secure link into your browser:<br/>
            <a href="${verificationUrl}" style="color:#008751;word-break:break-all;">${verificationUrl}</a>
          </p>
          <p style="color:#999;font-size:12px;margin-top:20px;">
            This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
          </p>
          <div style="border-top:1px solid #eee;padding-top:16px;margin-top:24px;font-size:12px;color:#888;text-align:center;">
            <p>Sawfy White Enterprises • Abeokuta, Ogun State, Nigeria 🇳🇬</p>
          </div>
        </div>
      `,
    });
    console.log('Verification email dispatched to', to, 'ID:', res.id);
    return res;
  } catch (err: any) {
    console.error('Mailgun verification email error:', err?.message || err);
    throw err;
  }
}
