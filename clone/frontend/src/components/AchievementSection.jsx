import { Briefcase, X } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../utils/dateUtils";

const AchievementSection = ({ userData, isOwnProfile, onSave }) => {
    
	const [isEditing, setIsEditing] = useState(false);
	const [achievements, setAchievements] = useState(userData.achievements|| []);
	const [newAchievement, setNewAchievement] = useState({
		title: "",
		date: "",
		description: "",
	});
    console.log(achievements);
	const handleAddAchievement = () => {
		if (newAchievement.title && newAchievement.date) {
			setAchievements([...achievements, newAchievement]);

			setNewAchievement({
				title: "",
				date: "",
				description: "",
			});
		}
	};

	const handleDeleteAchievement = (id) => {
		setAchievements(achievements.filter((exp) => exp._id !== id));
	};

	const handleSave = () => {
		onSave({ achievements: achievements });
		setIsEditing(false);
	};



	return (
		<div className='bg-white shadow rounded-lg p-6 mb-6'>
			<h2 className='text-xl font-semibold mb-4'>Achievements</h2>
			{achievements.map((exp) => (
				<div key={exp._id} className='mb-4 flex justify-between items-start'>
					<div className='flex items-start'>
						<Briefcase size={20} className='mr-2 mt-1' />
						<div>
							<h3 className='font-semibold'>{exp.title}</h3>
							<p className='text-gray-500 text-sm'>
								{formatDate(exp.date)} 
							</p>
							<p className='text-gray-700'>{exp.description}</p>
						</div>
					</div>
					{isEditing && (
						<button onClick={() => handleDeleteAchievement(exp._id)} className='text-red-500'>
							<X size={20} />
						</button>
					)}
				</div>
			))}

			{isEditing && (
				<div className='mt-4'>
					<input
						type='text'
						placeholder='Title'
						value={newAchievement.title}
						onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
						className='w-full p-2 border rounded mb-2'
					/>
					<input
						type='date'
						placeholder='Date'
						value={newAchievement.date}
						onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
						className='w-full p-2 border rounded mb-2'
					/>
					<textarea
						placeholder='Description'
						value={newAchievement.description}
						onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
						className='w-full p-2 border rounded mb-2'
					/>
					<button
						onClick={handleAddAchievement}
						className='bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
					>
						Add Achievement
					</button>
				</div>
			)}

			{isOwnProfile && (
				<>
					{isEditing ? (
						<button
							onClick={handleSave}
							className='mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
						>
							Save Changes
						</button>
					) : (
						<button
							onClick={() => setIsEditing(true)}
							className='mt-4 text-primary hover:text-primary-dark transition duration-300'
						>
							Edit Achievements
						</button>
					)}
				</>
			)}
		</div>
	);
};
export default AchievementSection;