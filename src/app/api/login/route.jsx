
import { connect } from "mongoose";
import connectMongo from "@/lib/mongodb";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req) {
    const cookieStore=await cookies();

    const { email, password } = await req.json();

    if (!email && !password ) {
        return Response.json({ message: "enter email and passowrd" }, { status: 400 })
    }

 await connectMongo();

 const user= await User.findOne({email});
  if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );    
    }

  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log(token)
cookieStore.set('token',token, {
     secure:true         
    })


 return Response.json({message:"user successfully login "},{status:200})


}