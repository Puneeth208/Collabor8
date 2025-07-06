import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Image, Loader, Plus, Minus } from "lucide-react";

const CreateEvent = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [eventType, setEventType] = useState("");

  useEffect(() => {
    if (user.role === "NGO") {
      setEventType("NGO-Volunteer");
    }
  }, [user.role]);

  const queryClient = useQueryClient();

  const { mutate: createEventMutation, isPending } = useMutation({
    mutationFn: async (eventData) => {
      const res = await axiosInstance.post("/events/create", eventData, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      toast.success("Event created successfully");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["MyEvents"] });
      setIsOpen(false);
    },
    onError: (err) => {
      toast.error(err.response.data.message || "Failed to create event");
    },
  });

  const handleEventCreation = async () => {
    try {
      const eventData = {
        title,
        description,
        date,
        location,
        eventType,
      };
      if (image) eventData.image = await readFileAsDataURL(image);

      createEventMutation(eventData);
    } catch (error) {
      console.error("Error in handleEventCreation:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEventDate("");
    setLocation("");
    setImage(null);
    setImagePreview(null);
    if (user.role === "NGO") {
      setEventType("NGO-Volunteer");
    } else {
      setEventType("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      readFileAsDataURL(file).then(setImagePreview);
    } else {
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-secondary rounded-lg shadow mb-4 p-4">
      <div
        className="flex items-center justify-between p-2 rounded-lg bg-primary text-white cursor-pointer hover:bg-primary-dark transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Create Event</span>
        {isOpen ? <Minus size={20} /> : <Plus size={20} />}
      </div>

      {isOpen && (
        <div className="mt-4">
          <div className="flex space-x-3">
            <img
              src={user?.profilePicture || "/avatar.png"}
              alt={user?.name}
              className="size-12 rounded-full"
            />
            <div className="w-full">
              <input
                type="text"
                placeholder="Event Title"
                className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <textarea
              placeholder="Event Description"
              className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none resize-none transition-colors duration-200 min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Event Location"
              className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <input
              type="date"
              className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
              value={date}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          {user.role === "Organisation" && (
            <div className="mt-4">
              <select
                className="w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="" disabled>Select Event Type</option>
                <option value="Org-NGO">Org-NGO</option>
                <option value="Org-Individual">Org-Individual</option>
              </select>
            </div>
          )}

          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Selected" className="w-full h-auto rounded-lg" />
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <label className="flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer">
              <Image size={20} className="mr-2" />
              <span>Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>

            <button
              className="bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200"
              onClick={handleEventCreation}
              disabled={isPending}
            >
              {isPending ? <Loader className="size-5 animate-spin" /> : "Create Event"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
