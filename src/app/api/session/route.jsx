// app/api/session/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get("token");
  const token = tokenCookie?.value;

  if (!token) {
    return Response.json({ user: null, token: null }, { status: 200 });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return Response.json({ user, token }, { status: 200 });
  } catch (err) {
    return Response.json({ user: null, token: null }, { status: 200 });
  }
}

