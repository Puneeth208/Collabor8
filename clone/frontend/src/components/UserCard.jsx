import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

import { Link } from "react-router-dom";
import { useState } from "react";


function UserCard({ user, isConnection }) {
	const [isUserConnected, setIsUserConnected] = useState(isConnection);
	const { data: curuser } = useQuery({ queryKey: ["authUser"] });
	const [isPending, setIsPending] = useState(false); 
	const queryClient = useQueryClient();
	
	const { mutate: unfollow ,isLoading} = useMutation({
	mutationFn: (connectionId) => {
		if(isUserConnected)
		{
			axiosInstance.delete(`/connections/${connectionId}`)
		}
		else
		{	
			axiosInstance.post(`/connections/request/${connectionId}`)
		}
	},
	onSuccess: () => {
		if(isUserConnected)
		{
		toast.success("dis-Connected successfully");
		queryClient.invalidateQueries({ queryKey: ["connections",curuser._id ] });
		setIsUserConnected(false);
		}
		else{
			toast.success("request sent successfully");
		queryClient.invalidateQueries({ queryKey: ["connections",curuser._id ] });
		setIsPending(true);
		}
	},
	onError: (error) => {
		toast.error(error.response?.data?.error || "An error occurred");
	},
});
	return (
		<div className='bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md'>
			<Link to={`/profile/${user.username}`} className='flex flex-col items-center'>
				<img
					src={user.profilePicture || "/avatar.png"}
					alt={user.name}
					className='w-24 h-24 rounded-full object-cover mb-4'
				/>
				<h3 className='font-semibold text-lg text-center'>{user.name}</h3>
			</Link>
			<p className='text-gray-600 text-center'>{user.role}</p>
			<p className='text-sm text-gray-500 mt-2'>{user.connections?.length} connections</p>
			<button className={`mt-4 bg-primary ${isPending? 'bg-yellow-500':'bg-primary'} text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors w-full`} onClick={() => unfollow(user._id)} disabled={isLoading || isPending}>
			{isPending ? "Pending..." : isUserConnected ? "Dis-connect" : "Connect"}
			</button>
		</div>
	);
}

export default UserCard;