import { useState } from "react";

const MissionSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [mission, setMission] = useState(userData.mission || "");

    const handleSave = () => {
        setIsEditing(false);
        onSave({mission});
    };
    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Mission</h2>
            {isOwnProfile && (
                <>
                    {isEditing ? (
                        <>
                            <input
                                value={mission}
                                onChange={(e) => setMission(e.target.value)}
                                className='w-full p-2 border rounded'
                                rows='4'
                            />
                            <button
                                onClick={handleSave}
                                className='mt-2 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark 
                                transition duration-300'
                            >
                                Save
                            </button>
                        </>
                    ) : (
                        <>
                            <p>{userData.mission}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className='mt-2 text-primary hover:text-primary-dark transition duration-300'
                            >
                                Edit
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
export default MissionSection;