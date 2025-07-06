import { Link } from "react-router-dom";
import { useApplicationStore } from "../store/useAppStore";

const ApplicationList = () => {
    const { applications, selectedEvent, isApplicationsLoading } = useApplicationStore();

    if (!selectedEvent) {
        return <p className="text-gray-600 text-center mt-4">Select an event to view applications.</p>;
    }
    console.log(applications)
    return (
        <div className="bg-white shadow rounded-lg p-6 w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Applicants for {selectedEvent.title}
            </h3>

            {isApplicationsLoading ? (
                <p className="text-gray-500">Loading applications...</p>
            ) : applications.length > 0 ? (
                <div className="space-y-4">
                    {applications.map((applicant) => (
                        <div key={applicant._id} className="flex items-center justify-between border-b pb-3">
                            {/* Profile Picture & Name */}
                            <div className="flex items-center gap-4">
                                <img
                                    src={applicant.profilePicture || "/avatar.png"}
                                    alt={applicant.username}
                                    className="w-12 h-12 rounded-full object-cover border"
                                />
                                <p className="text-gray-800 font-medium">{applicant.username}</p>
                            </div>

                            {/* View Profile Button */}
                            <Link
                                to={`/profile/${applicant.username}`}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                            >
                                View Profile
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center">No applications yet.</p>
            )}
        </div>
    );
};

export default ApplicationList;
