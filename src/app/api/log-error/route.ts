import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const logPath = path.join(process.cwd(), 'client-error.log');
    fs.appendFileSync(logPath, JSON.stringify(body, null, 2) + '\n\n');
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
