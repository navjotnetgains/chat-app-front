
import { connect } from "mongoose";
import connectMongo from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(req) {

    const { email, password, name } = await req.json();

    if (!email && !password && !name) {
        return Response.json({ message: "enter email and passowrd" }, { status: 400 })
    }

 await connectMongo();

 const existingEmail= await User.findOne({email});

 if(existingEmail){
    Response.json({
        message:"email is already exists"
    })
 }

 const newUser= new User({
    email,
    password
 })

 const saveUser=await newUser.save();


 return Response.json({message:"user successfully created "},{status:201})


}