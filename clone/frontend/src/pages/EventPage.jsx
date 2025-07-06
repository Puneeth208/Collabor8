import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Event from "../components/Event";
import EventCreation from "../components/EventCreation";
import { Users } from "lucide-react";
import MyEvents from "../components/MyEvents";
import ApplicationList from "../components/AppList";
const EventPage = () => {
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const { data: events, isLoading } = useQuery({
        queryKey: ["events"],
        queryFn: async () => {
            const res = await axiosInstance.get("/events/");
            return res.data;
        },
    });

    if (isLoading) return <div className='text-gray-600 p-8'>Loading events...</div>;

    console.log("events");
    console.log(events);

    return (
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 p-6'>
            {/* Sidebar */}
            <div className='hidden lg:block lg:col-span-1'>
                <Sidebar user={authUser} />
            </div>

            {/* Main Content */}
            <div className='col-span-1 lg:col-span-2 overflow-y-auto'>
                {/* Event Creation for Non-Individual Users */}
                {authUser.role !== "Individual" && (
                    <div className='mb-8'>
                        <EventCreation user={authUser} />
                    </div>
                )}

                {/* My Events for NGO and Organisation Users */}
                {(authUser.role === "NGO" || authUser.role === "Organisation") && (
                    <MyEvents userId={authUser._id} />
                )}

                {/* All Events Section for Individual and NGO Users */}
                {(authUser.role === "Individual" || authUser.role === "NGO") && (
                    <div>
                        <h2 className='text-2xl font-bold mt-8 mb-6 text-gray-800'>All Events</h2>
                        {events?.length > 0 ? (
                            <div className='space-y-6 overflow-y-auto'>
                                {events.map((event) => (
                                    <Event key={event._id} event={event} />
                                ))}
                            </div>
                        ) : (
                            <div className='bg-white rounded-lg shadow p-8 text-center border border-gray-100'>
                                <div className='mb-6'>
                                    <Users size={64} className='mx-auto text-blue-500' />
                                </div>
                                <h2 className='text-2xl font-bold mb-4 text-gray-800'>No Events Yet</h2>
                                <p className='text-gray-600'>Check back later for upcoming events.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className='col-span-1 lg:col-span-1'>
            {authUser.role !== "Individual" && (
                <div className="sticky top-20 z-50">
                    <ApplicationList />
                </div>
                )}
            </div>

            
        </div>
    );
};

export default EventPage;