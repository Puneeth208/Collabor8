import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Event from "../components/Event";

const MyEvents = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false); // State to manage dropdown visibility

    const { data: myEvents, isLoading, isError, error } = useQuery({
        queryKey: ["myEvents", userId],
        queryFn: async () => {
            const res = await axiosInstance.get(`/events/my-events/${userId}`);
            return res.data;
        },
    });

    if (isLoading) return <div className='text-gray-600'>Loading your events...</div>;
    if (isError) return <div className='text-red-500'>Error: {error.message}</div>;

    return (
        <div className='mb-8'>
            {/* Dropdown Header */}
            <div
                className='flex justify-between items-center cursor-pointer bg-white p-4 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-200'
                onClick={() => setIsOpen(!isOpen)} // Toggle dropdown
            >
                <h2 className='text-xl font-semibold text-gray-800'>My Events</h2>
                <svg
                    className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""} text-gray-600`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                    />
                </svg>
            </div>

            {/* Dropdown Content */}
            {isOpen && (
                <div className='mt-4 space-y-4 overflow-y-auto'>
                    {myEvents?.length > 0 ? (
                        myEvents.map((event) => <Event key={event._id} event={event} />)
                    ) : (
                        <div className='bg-white rounded-lg shadow p-6 text-center'>
                            <p className='text-gray-600'>You haven't hosted any events yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyEvents;
