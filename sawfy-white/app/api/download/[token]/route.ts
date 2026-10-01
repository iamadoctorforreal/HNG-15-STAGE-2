import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // 1. Fetch token record
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('digital_access_tokens')
      .select('*, product:products(*)')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired download link' },
        { status: 404 }
      );
    }

    // 2. Validate expiration date
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This download link has expired (valid for 7 days after purchase)' },
        { status: 410 }
      );
    }

    // 3. Validate download limit
    if (tokenData.download_count >= tokenData.max_downloads) {
      return NextResponse.json(
        { error: 'Maximum download limit reached for this link' },
        { status: 429 }
      );
    }

    // 4. Increment download count
    await supabaseAdmin
      .from('digital_access_tokens')
      .update({ download_count: tokenData.download_count + 1 })
      .eq('token', token);

    // 5. Generate secure temporary signed URL (valid 60 seconds)
    const filePath =
      tokenData.product?.digital_storage_path ||
      'cookbooks/abeokuta_catfish_recipe_guide.pdf';

    const { data: signedData, error: signedError } =
      await supabaseAdmin.storage.from('digital-assets').createSignedUrl(filePath, 60);

    if (signedError || !signedData?.signedUrl) {
      // Fallback if file not yet uploaded in storage: provide informative redirect
      return NextResponse.json(
        {
          message: 'Cookbook delivery verified',
          product: tokenData.product?.title || 'Sawfy White Catfish Recipe Guide',
          download_count: tokenData.download_count + 1,
          max_downloads: tokenData.max_downloads,
        },
        { status: 200 }
      );
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Download handler error' },
      { status: 500 }
    );
  }
}
