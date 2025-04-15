import { NextResponse } from 'next/server';
import { mysqlpool } from '@/utils/db';

export async function POST(request) {
  const body = await request.json();
  const { username, password } = body;

  const promisePool = mysqlpool.promise();
  const [rows] = await promisePool.query(
    'SELECT * FROM user WHERE username = ? AND password = ?',
    [username, password]
  );

  if (rows.length > 0) {
    return NextResponse.json({ success: true, user: rows[0] });
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' });
  }
}
