import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";

import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import SkillsSection from "../components/SkillsSection";
import toast from "react-hot-toast";
import AchievementSection from "../components/AchievementSection";
import YoeSection from "../components/YoeSection";
import TypeSection from "../components/TypeSection";
import MissionSection from "../components/MissionSection";

const ProfilePage = () => {
	const { username } = useParams();
	const queryClient = useQueryClient();

	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
	});

	const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: () => axiosInstance.get(`/users/${username}`),
	});

	const { mutate: updateProfile } = useMutation({
		mutationFn: async (updatedData) => {
			await axiosInstance.put("/users/profile", updatedData);
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			queryClient.invalidateQueries(["userProfile", username]);
		},
	});

	if (isLoading || isUserProfileLoading) return null;

	const isOwnProfile = authUser.username === userProfile.data.username;
	const userData = isOwnProfile ? authUser : userProfile.data;
	console.log(userData);
	const handleSave = (updatedData) => {
		updateProfile(updatedData); 
	};

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
			<AboutSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
			{/* Conditionally render ExperienceSection based on role */}
			{(userData.role === 'Individual') && (
      			<div>
					<ExperienceSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
					<EducationSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
					<SkillsSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				</div>
    		)}
			{(userData.role !== 'Individual') && (
      			<div>
					<YoeSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave}></YoeSection>
					<TypeSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave}></TypeSection>
					<MissionSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave}></MissionSection>
					<AchievementSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
				</div>
    		)}
			
		</div>
	); 
};
export default ProfilePage;