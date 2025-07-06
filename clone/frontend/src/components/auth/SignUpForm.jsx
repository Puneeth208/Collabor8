import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../../lib/axios.js";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore.js";

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState(""); // Default role as an empty string

	const queryClient = useQueryClient(); // use to rerun query

	const { connectSocket, checkAuth } = useAuthStore();
	const { mutate: signUpMutation, isLoading } = useMutation({
		mutationFn: async (data) => {
			const res = await axiosInstance.post("/auth/signup", data);
			return res.data;
		},
		onSuccess: async () => {
			toast.success("Account created successfully");
			await queryClient.invalidateQueries({ queryKey: ["authUser"] }); // invalidates the current query and reruns the query which reloads the page after signup
			const authUser = queryClient.getQueryData(["authUser"]);
			checkAuth(authUser); // Process the authenticated user
			connectSocket();
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Something went wrong!!");
		},
	});

	const handleSignUp = (e) => {
		e.preventDefault();
		signUpMutation({ name, username, email, password, role }); // Include role in the data
	};

	return (
		<form onSubmit={handleSignUp} className='flex flex-col gap-4'>
			<input
				type='text'
				placeholder='Full name'
				value={name}
				onChange={(e) => setName(e.target.value)}
				className='input input-bordered w-full'
				required
			/>
			<input
				type='text'
				placeholder='Username'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className='input input-bordered w-full'
				required
			/>
			<input
				type='email'
				placeholder='Email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className='input input-bordered w-full'
				required
			/>
			<input
				type='password'
				placeholder='Password (6+ characters)'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className='input input-bordered w-full'
				required
			/>
			<select
				value={role}
				onChange={(e) => setRole(e.target.value)}
				className='select select-bordered w-full'
				required
			>
				<option value="" disabled>
					Choose your role
				</option>
				<option value="Individual">Individual</option>
				<option value="Organisation">Organisation</option>
				<option value="NGO">NGO</option>
			</select>
			<button
				type="submit"
				disabled={isLoading}
				className="btn btn-primary w-full text-white"
			>
				{isLoading ? <Loader className="size-5 animate-spin" /> : "Agree & Join"}
			</button>
		</form>
	);
};

export default SignUpForm;
