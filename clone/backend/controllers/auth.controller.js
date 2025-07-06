import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
export const signup = async(req,res) => {
    
    try {
        const {name ,username,email,password,role}=req.body;
        
        if(!name||!username||!email||!password||!role){
            return res.status(400).json({message:"All fields are required"});
        }
        
        const exsistingEmail= await User.findOne({email});
        if(exsistingEmail){
            return res.status(400).json({message:"Email already exists"});
        }
        
        const exsistingUsername= await User.findOne({username});
        if(exsistingUsername){
            return res.status(400).json({message:"username already exists"});
        }

        if(password.length<6)
        {
            return res.status(400).json({message:"Password must be atleast 6 characters"});
        }

        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const user=new User({
            name,
            email,
            password:hashedPassword,
            username,
            role
        })
        
        await user.save();

        const token=jwt.sign({userId:user._id}, process.env.JWT_SECRET,{expiresIn:"3d"})

        //cookie
        res.cookie("jwt-linkedin",token,{
            httpOnly:true,//prevent xss attack by allowing http to access the cookie
            maxAge:3*24*3600*1000,
            sameSite:"strict", //prevents csrf attack
            secure:process.env.NODE_ENV==="production",//prevents man in the middle atk
        })
        res.status(201).json({
            message:"User registered successfully"
        });


        //todo: welcome email

        const profileUrl=process.env.CLIENT_URL+"/profile/"+user.username

        try {
            await sendWelcomeEmail(user.email,user.name,profileUrl)
        } catch (emailError) {
            console.error("Error sending welcome Email",emailError);
        }

    } catch (error) {
        console.log("Error in signup :",error.message);
        res.status(500).json({
            message:"Internal Server error"
        });
    }
}
export const login = async(req,res) => {
   try {
    const {username,password}=req.body;

    //validate name
    const user= await User.findOne({username});
    if(!user){
        return res.status(400).json({message :"Invalid credentials"});
    }
    //validate password
    const isMatch= await bcrypt.compare(password,user.password);
    if(!isMatch){
        return res.status(400).json({message :"Invalid credentials"});
    }
    //create and send token
    const token =jwt.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:"3d"});
    await res.cookie("jwt-linkedin",token,{
        httpOnly:true,//prevent xss attack by allowing http to access the cookie
        maxAge:3*24*3600*1000,
        sameSite:"strict", //prevents csrf attack
        secure:process.env.NODE_ENV==="production",//prevents man in the middle atk
    })

    res.json({message:"Logged in successfully"});

   } 
   catch (error) {
    console.error("Error in login controller:",error);
    res.status(500).json({message:"Server error"});
   }
};
export const logout = (req,res) => {
    res.clearCookie("jwt-linkedin");
    res.json({message:"Logged out successfully"}); 
}


export const getCurrentUser= async(req,res)=>{
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getCurrentUser controller:",error);
        return res.status(500).json({message:"Server error"});
    }
}

export const checkAuth=async(req,res)=>{
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}