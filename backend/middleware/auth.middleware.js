import jwt from "jsonwebtoken";
import User from '../models/user.model.js';

export const protectRoute = async (req,res,next)=>{
    try {
        const token=req.cookies["jwt-linkedin"];

        if(!token){
            return res.status(401).json({message:"Unauthorised - No Token provided"});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded)
        {
            return res.status(401).json({message:"Unauthorised - No Token provided"});
        }

        const user=await User.findById(decoded.userId).select("-password");// we don't need password

        if(!user){
            return res.status(401).json({message:"User not found"});
        }

        req.user=user;
        next();

    } catch (error) {
        console.log("Error in protrctRoute middleware:",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
}
