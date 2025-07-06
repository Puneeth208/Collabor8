import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader, MessageCircle, Send, Share2, ThumbsUp, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import PostAction from './PostAction';
import { formatDistanceToNow } from 'date-fns';
import { useApplicationStore } from '../store/useAppStore';

const Event = ({ event }) => {
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState(event.comments || []);
    const [applicants, setApplicants] = useState(event.applicants || []);
    const isOwner = authUser._id === event.host._id;
    const isLiked = event.likes.includes(authUser._id);
    const hasApplied = applicants.includes(authUser._id);

    const queryClient = useQueryClient();

    const { setSelectedEvent } = useApplicationStore();
    // Mutation to delete an event
    const { mutate: deleteEvent, isPending: isDeletingEvent } = useMutation({
        mutationFn: async () => {
            await axiosInstance.delete(`/events/delete/${event._id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('Event deleted successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    // Mutation to add a comment
    const { mutate: createComment, isPending: isAddingComment } = useMutation({
        mutationFn: async (newComment) => {
            await axiosInstance.post(`/events/${event._id}/comment`, { content: newComment });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('Comment added successfully');
        },
        onError: (err) => {
            toast.error(err.response.data.message || 'Failed to add comment');
        },
    });

    // Mutation to like an event
    const { mutate: likeEvent, isPending: isLikingEvent } = useMutation({
        mutationFn: async () => {
            await axiosInstance.post(`/events/${event._id}/like`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['event', event._id] });
        },
    });

    // Mutation to apply for an event
    const { mutate: applyEvent, isPending: isApplying } = useMutation({
        mutationFn: async () => {
            await axiosInstance.post(`/events/apply/${event._id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            toast.success('Application submitted successfully');
            setApplicants([...applicants, authUser._id]); // Update local state
        },
        onError: (err) => {
            toast.error(err.response.data.message || 'Failed to apply for the event');
        },
    });

    // Handle delete event
    const handleDeleteEvent = () => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        deleteEvent();
    };

    // Handle like event
    const handleLikeEvent = async () => {
        if (isLikingEvent) return; // Prevent multiple likes
        likeEvent();
    };

    // Handle add comment
    const handleAddComment = async (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            createComment(newComment);
            setNewComment('');
            setComments([
                ...comments,
                {
                    content: newComment,
                    user: {
                        _id: authUser._id,
                        name: authUser.name,
                        profilePicture: authUser.profilePicture,
                    },
                    createdAt: new Date(),
                },
            ]);
        }
    };

    // Handle apply for event
    const handleApplyEvent = async () => {
        if (hasApplied) {
            toast.error('You have already applied for this event.');
            return;
        }
        applyEvent();
    };

    

    return (
        <div className='bg-secondary rounded-lg shadow mb-4'>
            <div className='p-4'>
                {/* Event Header */}
                <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center'>
                        <Link to={`/profile/${event?.host?.username}`}>
                            <img
                                src={event.host.profilePicture || '/avatar.png'}
                                alt={event.host.name}
                                className='size-10 rounded-full mr-3'
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${event?.host?.username}`}>
                                <h3 className='font-semibold'>{event.host.name}</h3>
                            </Link>
                            <p className='text-xs text-info'>{event.host.role}</p>
                            <p className='text-xs text-info'>
                                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    {isOwner && (
                        <button onClick={handleDeleteEvent} className='text-red-500 hover:text-red-700'>
                            {isDeletingEvent ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
                        </button>
                    )}
                </div>

                {/* Event Details */}
                <div>
                    <h2 className='text-xl font-bold mb-2'>{event.title}</h2>
                    <p className='mb-2'>{event.description}</p>
                    <p className='text-sm text-info mb-2'>
                        <strong>Location:</strong> {event.location}
                    </p>
                    <p className='text-sm text-info mb-2'>
                        <strong>Event Type:</strong> {event.eventType}
                    </p>
                    <p className='text-sm text-info mb-4'>
                        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                    </p>
                </div>

                {/* Event Image */}
                {event.image && <img src={event.image} alt='Event content' className='rounded-lg w-full mb-4' />}

                {/* Event Actions */}
                <div className='flex justify-between text-info'>
                    <PostAction
                        icon={<ThumbsUp size={18} className={isLiked ? 'text-blue-500 fill-blue-300' : ''} />}
                        text={`Like (${event.likes.length})`}
                        onClick={handleLikeEvent}
                    />
                    <PostAction
                        icon={<MessageCircle size={18} />}
                        text={`Comment (${comments.length})`}
                        onClick={() => setShowComments(!showComments)}
                    />
                    <PostAction icon={<Share2 size={18} />} text='Share' />
                </div>

                {/* Apply Button */}
                {!isOwner && (
                    <button
                        onClick={handleApplyEvent}
                        className='w-full bg-primary text-white p-2 rounded-lg mt-4 hover:bg-primary-dark transition duration-300'
                        disabled={isApplying || hasApplied}
                    >
                        {isApplying ? (
                            <Loader size={18} className='animate-spin mx-auto' />
                        ) : hasApplied ? (
                            'Applied'
                        ) : (
                            'Apply'
                        )}
                    </button>
                )}
                {isOwner && (
                    <button
                        onClick={() => setSelectedEvent(event)}
                        className='w-full bg-primary text-white p-2 rounded-lg mt-4 hover:bg-primary-dark transition duration-300'
                        disabled={isApplying || hasApplied}
                    >
                        View Applications
                    </button>
                )}
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className='px-4 pb-4'>
                    <div className='mb-4 max-h-60 overflow-y-auto'>
                        {comments.map((comment) => (
                            <div key={comment._id} className='mb-2 bg-base-100 p-2 rounded flex items-start'>
                                <img
                                    src={comment.user.profilePicture || '/avatar.png'}
                                    alt={comment.user.name}
                                    className='w-8 h-8 rounded-full mr-2 flex-shrink-0'
                                />
                                <div className='flex-grow'>
                                    <div className='flex items-center mb-1'>
                                        <span className='font-semibold mr-2'>{comment.user.name}</span>
                                        <span className='text-xs text-info'>
                                            {formatDistanceToNow(new Date(comment.createdAt))}
                                        </span>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleAddComment} className='flex items-center'>
                        <input
                            type='text'
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder='Add a comment...'
                            className='flex-grow p-2 rounded-l-full bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary'
                        />
                        <button
                            type='submit'
                            className='bg-primary text-white p-2 rounded-r-full hover:bg-primary-dark transition duration-300'
                            disabled={isAddingComment}
                        >
                            {isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Event;