//app/api/login/route.js
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
    const user = rows[0]

    return NextResponse.json({
      success: true,
      isAdmin: user.username === 'admin', 
    })
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' });
  }
}
