import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        location: { type: String, required: true },
        image: { type: String },

        host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Organisation or NGO hosting the event

        eventType: {
            type: String,
            enum: ["Org-NGO", "NGO-Volunteer","Org-Individual"], // Differentiates between both types
            required: true,
        },

        applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // NGOs or Volunteers applying

        status: {
            type: String,
            enum: ["Upcoming", "Ongoing", "Completed"],
            default: "Upcoming",
        },

        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the event

        comments: [
            {
                content: { type: String, required: true },
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
