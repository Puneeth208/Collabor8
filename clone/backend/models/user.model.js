import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{type:String,required:true},
        username :{ type:String ,required:true, unique:true},
        email :{ type:String ,required:true, unique:true},
        password :{ type:String , required:true},
        profilePicture :{ type:String , default:""},
        bannerImg :{ type:String , default:""},
        location :{ type:String , default:""},
        about :{ type:String , default:""},
        skills: [String],//skills:array of string 
        experience: [//exp will be an array of objects of type below
            {
                title:String,
                company: String,
                startDate: Date,
                endDate: Date,
                description:String,
            },
        ],
        education :[//edu will be an array of objects of type below
            {
                school:String,
                fieldOfStudy:String,
                startYear:Number,
                endYear:Number,
            },
        ],
        connections:[
            {
                type:mongoose.Schema.Types.ObjectId, ref:"User" //each connection is user model of schema 
            }
        ],
        role: {
            type: String,
            enum: ["NGO", "Organisation", "Individual"], // Restrict values to the three options
            required: true, // Make it required
        },
        achievements: [//exp will be an array of objects of type below
            {
                title:String,
                date: Date, 
                description:String,
            },
        ],
        mission: { type: String }, 
        type: { type: String },
        yearOfEstablishment: {
            type: Number,
            min: 1800,    // Validating minimum year
            max: new Date().getFullYear(), // Ensures year is not in the future
          },
    },
    {timestamps:true}

);


const User= mongoose.model("User",userSchema);
export default User;