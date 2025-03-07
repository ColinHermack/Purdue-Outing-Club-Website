import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Verify the user's email against your database here
  // const userExists = await db.user.findUnique({ 
  //   where: { email: session.user.email } 
  // });
  
  // if (!userExists) {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }
  
  // Return protected data
  return NextResponse.json({ 
    message: "This is protected data", 
    user: session.user.email 
  });
}
