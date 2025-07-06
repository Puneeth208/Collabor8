import cloudinary from "../lib/cloudinary.js";
import Event from "../models/event.model.js";


// Get feed events (for NGOs or Volunteers)
export const getFeedEvents = async (req, res) => {
    try {
        const { role, _id, connections } = req.user; // Authenticated user's role, ID, and connections

        let events;

        if (role === "Individual") {
            // Individuals see events hosted by NGOs in their connections and events of type "Org-Individual"
            events = await Event.find({
                host: { $in: connections },
                eventType: { $in: ["NGO-Volunteer", "Org-Individual"] },
            })
                .populate("host", "name username profilePicture type")
                .populate("comments.user", "name profilePicture")
                .sort({ createdAt: -1 });

        } else if (role === "NGO") {
            // NGOs see events hosted by Organizations in their connections with eventType "Org-NGO"
            events = await Event.find({
                host: { $in: connections },
                eventType: "Org-NGO",
            })
                .populate("host", "name username profilePicture type")
                .populate("comments.user", "name profilePicture")
                .sort({ createdAt: -1 });

        } else if (role === "Organisation") {
            // Organizations see only the events they created
            events = await Event.find({ host: _id })
                .populate("host", "name username profilePicture type")
                .populate("comments.user", "name profilePicture")
                .sort({ createdAt: -1 });

        } else {
            // Default: Return all events (or handle other roles)
            events = await Event.find({})
                .populate("host", "name username profilePicture type")
                .populate("comments.user", "name profilePicture")
                .sort({ createdAt: -1 });
        }

        console.log(events);
        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getFeedEvents controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getEventApplications = async (req, res) => {
    try {
        const { eventId } = req.params;
        console.log("Received eventId:", eventId);
        // Check if event exists
        const event = await Event.findById(eventId).populate("applicants", "username profilePicture");
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        // If applicants exist, return the applicants
        if (event.applicants.length === 0) {
            return res.status(200).json({ message: "No applicants for this event." });
        }

        // Return the list of applicants
        res.status(200).json(event.applicants);
    } catch (error) {
        console.error("Error fetching event applications:", error);
        res.status(500).json({ message: "Server error while fetching applications." });
    }
};


// Create a new event (Org → NGO OR NGO → Volunteer)
export const createEvent = async (req, res) => {
    try {
        const { title, description, eventType, date, location, image } = req.body;

        // Validate required fields
        if (!title || !description || !eventType || !date || !location) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Ensure date is a valid Date object
        const eventDate = new Date(date);
        if (isNaN(eventDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        let newEvent;

        // Handle image upload if present
        if (image) {
            try {
                const imgResult = await cloudinary.uploader.upload(image, {
                    folder: "events", // Optional: You can specify a folder for organizing images in Cloudinary
                });
                newEvent = new Event({
                    host: req.user._id,
                    title,
                    description,
                    eventType,
                    date: eventDate,
                    location,
                    image: imgResult.secure_url, // Store the Cloudinary image URL
                });
            } catch (uploadError) {
                console.error("Image upload failed:", uploadError);
                return res.status(500).json({ message: "Image upload failed" });
            }
        } else {
            // Create event without an image
            newEvent = new Event({
                host: req.user._id,
                title,
                description,
                eventType,
                date: eventDate,
                location,
            });
        }
 
        // Save the event to the database
        await newEvent.save();

        // Return the created event
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error in createEvent controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Delete an event
export const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Ensure only the event host can delete it
        if (event.host.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this event" });
        }

        // Delete image from cloudinary if exists
        if (event.image) {
            await cloudinary.uploader.destroy(event.image.split("/").pop().split(".")[0]);
        }

        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error in deleteEvent controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get event by ID
export const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId)
            .populate("host", "name username profilePicture type")
            .populate("comments.user", "name profilePicture");

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Error in getEventById controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Apply for an event (NGO applies for Org event, Volunteer applies for NGO event)
export const applyEvent = async (req, res) => {
    try {
        const { id } = req.params; // Event ID
        const userId = req.user._id;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Ensure only valid applicants apply based on event type
        if (event.eventType === "Org-NGO" && req.user.role !== "NGO") {
            return res.status(403).json({ message: "Only NGOs can apply for this event." });
        }

        if (event.eventType === "NGO-Volunteer" && req.user.role !== "Individual") {
            return res.status(403).json({ message: "Only Individuals can apply for this event." });
        }

        // Prevent duplicate applications
        if (event.applicants.includes(userId)) {
            return res.status(400).json({ message: "You have already applied for this event." });
        }

        event.applicants.push(userId);
        await event.save();

        res.status(200).json({ message: "Application successful", event });
    } catch (error) {
        console.error("Error in applyEvent controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Comment on an event
export const createComment = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { content } = req.body;

        const event = await Event.findByIdAndUpdate(
            eventId,
            { $push: { comments: { user: req.user._id, content } } },
            { new: true }
        ).populate("host", "name email username profilePicture");

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        console.error("Error in createComment controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Like an event
export const likeEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await Event.findById(eventId);
        const userId = req.user._id;

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.likes.includes(userId)) {
            // Unlike the event
            event.likes = event.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            // Like the event
            event.likes.push(userId);
        }

        await event.save();
        res.status(200).json(event);
    } catch (error) {
        console.error("Error in likeEvent controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getMyEvents = async (req, res) => {
    try {
        const { userId } = req.params;
        const events = await Event.find({ host: userId })
            .populate("host", "name username profilePicture type")
            .populate("comments.user", "name profilePicture")
            .sort({ createdAt: -1 });

        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getMyEvents controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};