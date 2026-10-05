// Sawfy White Enterprises — Fail-Safe Mailgun REST Client
// Uses native fetch directly against Mailgun EU API (https://api.eu.mailgun.net)

const VERIFIED_MG_KEY = Buffer.from('MTBlYmVkYTQ2NTE2MTRlYzE3ZWZjYTIzNjE2ZGY4YTAtNzU0M2U5ODUtMTg4YmE1ZTQ=', 'base64').toString('utf8');
const MG_KEY = VERIFIED_MG_KEY;
const MG_DOMAIN = 'fish.sawfywhite.com';
const MG_URL = 'https://api.eu.mailgun.net';
const MG_FROM = 'orders@fish.sawfywhite.com';

async function dispatchMailgunREST({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const auth = Buffer.from(`api:${MG_KEY}`).toString('base64');
  const body = new URLSearchParams();
  body.append('from', `Sawfy White Enterprises <${MG_FROM}>`);
  body.append('to', to);
  body.append('subject', subject);
  body.append('text', text);
  body.append('html', html);

  const res = await fetch(`${MG_URL}/v3/${MG_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const resText = await res.text();
  let data: any;
  try {
    data = JSON.parse(resText);
  } catch {
    data = { message: resText };
  }

  if (!res.ok) {
    console.error('Mailgun API Error:', res.status, data);
    throw new Error(data.message || `Mailgun HTTP ${res.status}`);
  }
  console.log('Mailgun message dispatched successfully:', data.id);
  return data;
}

// Dummy export for backward compatibility
export const mg = {
  messages: {
    create: async (_domain: string, params: any) =>
      dispatchMailgunREST({
        to: Array.isArray(params.to) ? params.to[0] : params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
  },
};

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const downloadSection = downloadToken
    ? `<div style="background:#e6f5ed;padding:16px;border-radius:8px;margin:20px 0;border-left:4px solid #008751;">
        <h3 style="color:#005230;margin-top:0;">Your Digital Abeokuta Catfish Cookbook</h3>
        <p>Thank you for purchasing our digital cookbook! You can download your copy below (link valid for 7 days):</p>
        <p><a href="${siteUrl}/api/download/${downloadToken}" style="background:#008751;color:#ffffff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:bold;">Download Your Cookbook</a></p>
      </div>`
    : '';

  return await dispatchMailgunREST({
    to,
    subject: `Order Confirmation #${orderId.slice(0, 8)} — Sawfy White Enterprises`,
    text: `Thank you for your order, ${customerName}!\n\nOrder ID: ${orderId}\nTotal: ${totalAmount}\n\nWe are preparing your premium export-grade dried catfish from Abeokuta.\n\n— Sawfy White Enterprises`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;">
        <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
          <p style="color:#666;margin:4px 0 0 0;">Premium Export-Grade Dried Catfish from Abeokuta</p>
        </div>
        <h2 style="color:#2D2D2D;">Congratulations! Thank you for your order, ${customerName}!</h2>
        <p style="color:#008751;font-size:13px;font-weight:bold;margin-top:2px;">
          Félicitations • Barka • Ẹ kú oríire • Ekele
        </p>
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
}

// Welcome Email on Registration
export async function sendWelcomeRegistrationEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const displayName = name || 'Customer';

  return await dispatchMailgunREST({
    to,
    subject: `Welcome, ${displayName}! — Sawfy White Enterprises 🐟`,
    text: `Hello ${displayName},\n\nWelcome to Sawfy White Enterprises! Your customer account is now active.\n\nYou can track orders, download cookbooks, and enjoy priority dispatch for farm-raised Abeokuta dried catfish.\n\nVisit your account: ${siteUrl}/en/account\n\n— Sawfy White Enterprises, Abeokuta`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
        <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
          <p style="color:#666;margin:4px 0 0 0;">Farm-Raised Export Dried Catfish • Abeokuta, Nigeria</p>
        </div>
        <h2 style="color:#2D2D2D;margin-bottom:4px;">Welcome, ${displayName}!</h2>
        <p style="color:#008751;font-size:13px;font-weight:bold;margin-top:0;margin-bottom:16px;">
          Bienvenue • Barka da zuwa • Ẹ kú àbọ̀ • Nnọọ
        </p>
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
}

// Lead Magnet eBook Delivery Email
export async function sendLeadMagnetEmail({
  to,
  name,
}: {
  to: string;
  name?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shop.sawfywhite.com';
  const displayName = name || 'Friend';

  return await dispatchMailgunREST({
    to,
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
  const displayName = name || 'Customer';

  return await dispatchMailgunREST({
    to,
    subject: `Confirm Your Email — Sawfy White Enterprises 🐟`,
    text: `Hello ${displayName},\n\nPlease confirm your email address to activate your Sawfy White Enterprises account.\n\nClick the link below to verify:\n${verificationUrl}\n\nThis verification link will expire in 24 hours.\n\n— Sawfy White Enterprises, Abeokuta`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px;background:#ffffff;">
        <div style="text-align:center;border-bottom:2px solid #008751;padding-bottom:16px;margin-bottom:24px;">
          <h1 style="color:#008751;margin:0;font-size:24px;">Sawfy White Enterprises</h1>
          <p style="color:#666;margin:4px 0 0 0;">Abeokuta Fish Farms • Dried Catfish</p>
        <h2 style="color:#2D2D2D;margin-bottom:4px;">Welcome, ${displayName}!</h2>
        <p style="color:#008751;font-size:13px;font-weight:bold;margin-top:0;margin-bottom:16px;">
          Bienvenue • Barka da zuwa • Ẹ kú àbọ̀ • Nnọọ
        </p>
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
}
