import { useState } from "react";

const TypeSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [type, setType] = useState(userData.type || "");

    const handleSave = () => {
        setIsEditing(false);
        onSave({ type });
    };
    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Type</h2>
            {isOwnProfile && (
                <>
                    {isEditing ? (
                        <>
                            <textarea
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className='w-full p-2 border rounded'
                                rows='1'
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
                            <p>{userData.type}</p>
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
export default TypeSection;