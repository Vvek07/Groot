import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Search users when query changes
        const searchUsers = async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const response = await axios.get(`/api/search?query=${searchQuery}`);
                    // Filter out users already selected
                    const filtered = response.data.users.filter(
                        u => !selectedMembers.find(selected => selected._id === u._id)
                    );
                    setSearchResults(filtered);
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setSearchResults([]);
            }
        };

        const timeout = setTimeout(searchUsers, 300);
        return () => clearTimeout(timeout);
    }, [searchQuery, selectedMembers]);

    const handleAddMember = (user) => {
        setSelectedMembers([...selectedMembers, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveMember = (userId) => {
        setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            const memberIds = selectedMembers.map(m => m._id);
            await axios.post('/api/groups', {
                name,
                description,
                members: memberIds
            });
            onGroupCreated();
            onClose();
        } catch (error) {
            console.error('Create group error:', error);
            alert('Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-dark-card border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">Create New Group</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
                            placeholder="e.g. Weekend Plan"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
                            rows="2"
                            placeholder="What's this group about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Add Members</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-dark-bg border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-highlight text-text-primary"
                            placeholder="Search friends..."
                        />

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="mt-2 bg-dark-hover rounded-lg max-h-40 overflow-y-auto border border-gray-700">
                                {searchResults.map(user => (
                                    <div
                                        key={user._id}
                                        className="p-2 flex items-center justify-between hover:bg-gray-700 cursor-pointer"
                                        onClick={() => handleAddMember(user)}
                                    >
                                        <div className="flex items-center">
                                            <img src={user.image?.url} alt={user.username} className="w-8 h-8 rounded-full mr-2" />
                                            <span className="text-text-primary">{user.username}</span>
                                        </div>
                                        <span className="text-highlight text-sm">+ Add</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected Members */}
                    {selectedMembers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedMembers.map(member => (
                                <div key={member._id} className="bg-highlight/20 text-highlight px-3 py-1 rounded-full flex items-center text-sm">
                                    <span>{member.username}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveMember(member._id)}
                                        className="ml-2 hover:text-white"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-highlight to-pink-500 hover:from-pink-500 hover:to-highlight text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
