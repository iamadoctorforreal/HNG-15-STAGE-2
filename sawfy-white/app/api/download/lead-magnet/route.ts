import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guideHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The 7 Hidden Health Benefits of Dried Catfish — Sawfy White Enterprises</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #2D2D2D; background: #FAF8F5; margin: 0; padding: 40px 20px; }
    .container { max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e0e0e0; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { text-align: center; border-bottom: 2px solid #008751; padding-bottom: 24px; margin-bottom: 30px; }
    h1 { color: #005230; font-size: 28px; margin: 8px 0; font-family: Georgia, serif; }
    .sub { color: #D4A843; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
    .cover-img { width: 100%; max-height: 380px; object-fit: cover; border-radius: 12px; margin: 20px 0; border: 2px solid #008751; }
    .benefit { margin-bottom: 24px; padding: 16px; background: #fdfcf9; border-left: 4px solid #008751; border-radius: 6px; }
    .benefit h3 { margin: 0 0 8px 0; color: #006b3f; font-size: 18px; }
    .benefit p { margin: 0; font-size: 14px; color: #555; }
    .footer { text-align: center; border-top: 1px solid #eee; margin-top: 36px; padding-top: 20px; font-size: 12px; color: #888; }
    .cta-btn { display: inline-block; background: #008751; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="sub">Sawfy White Enterprises • Abeokuta, Nigeria</div>
      <h1>The 7 Hidden Health Benefits of Dried Catfish</h1>
      <p style="color:#666;font-size:14px;margin:0;">Farm-Raised in Abeokuta Fish Farms • 100% Sand-Free • Nutrient Dense</p>
    </div>

    <img src="/images/catfish-real-glass-plate.png" alt="Authentic Round-Curled Dried Catfish on Plate" class="cover-img" />

    <p style="font-size:15px;color:#444;">
      Dried African catfish (<em>Clarias gariepinus</em>, traditionally known as <strong>Eja Aro</strong>) is far more than a savory delicacy in authentic Nigerian cooking—it is one of nature’s most concentrated sources of bioavailable nutrients. Here are the 7 proven health benefits:
    </p>

    <div class="benefit">
      <h3>1. Extraordinary High Protein Density (Over 65% Dry Weight)</h3>
      <p>Because gentle moisture reduction concentrates the flesh without compromising amino acids, dried catfish provides almost triple the protein per gram compared to fresh fish, fueling lean muscle growth and cellular repair.</p>
    </div>

    <div class="benefit">
      <h3>2. Rich in Cardio-Protective Omega-3 Fatty Acids</h3>
      <p>Loaded with EPA and DHA, dried catfish supports healthy blood pressure, lowers triglycerides, and nourishes brain tissue, making it an essential food for children and adults alike.</p>
    </div>

    <div class="benefit">
      <h3>3. 100% Zero Carbohydrates & Keto-Friendly</h3>
      <p>Contains zero sugar and zero carbohydrates. It provides satiating, clean fuel that prevents insulin spikes, making it an ideal staple for diabetic and low-carb lifestyles.</p>
    </div>

    <div class="benefit">
      <h3>4. Calcium and Phosphorus for Strong Bones & Teeth</h3>
      <p>Slow dehydration preserves essential skeletal minerals. Pounding or cooking dried catfish into stews naturally releases calcium directly into your meals.</p>
    </div>

    <div class="benefit">
      <h3>5. High Vitamin B12 for Sustained Energy & Nerve Function</h3>
      <p>A single portion provides over 100% of your daily Vitamin B12 needs, combating fatigue, supporting red blood cell formation, and boosting vitality.</p>
    </div>

    <div class="benefit">
      <h3>6. Rich in Trace Minerals: Iron, Zinc, and Selenium</h3>
      <p>Supports robust immune defense, boosts metabolism, and protects cells from oxidative stress across all ages.</p>
    </div>

    <div class="benefit">
      <h3>7. Pristine, Sand-Free Hygiene & Long Shelf Life</h3>
      <p>Unlike ordinary market fish dried on open ground, Sawfy White catfish is raised in controlled Abeokuta ponds, cleaned with purified water, and packaged grit-free with a 6-month export shelf life.</p>
    </div>

    <div style="text-align:center;margin:30px 0;">
      <a href="/en/products" class="cta-btn">Order Authentic Abeokuta Dried Catfish Now →</a>
    </div>

    <div class="footer">
      <p>© 2026 Sawfy White Enterprises • Abeokuta, Ogun State, Nigeria 🇳🇬</p>
      <p>Delivering domestic across Nigeria and export airfreight to the UK & USA.</p>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(guideHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
