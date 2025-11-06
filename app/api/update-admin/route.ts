import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Service role 클라이언트 생성 (RLS 우회 가능)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json();

    // Service role로 직접 업데이트 (RLS 무시)
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: role })
      .eq('id', userId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
