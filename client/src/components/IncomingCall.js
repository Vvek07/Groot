import React from 'react';

const IncomingCall = ({ caller, onAccept, onDecline }) => {
    return (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
            <div className="bg-dark-card border border-highlight p-4 rounded-lg shadow-lg flex items-center space-x-4 w-80">
                <div className="relative">
                    <img
                        src={caller?.image?.url || 'https://via.placeholder.com/50'}
                        alt={caller?.username || 'Caller'}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-card"></span>
                </div>

                <div className="flex-1">
                    <h4 className="text-text-primary font-semibold">{caller?.username || 'Unknown'}</h4>
                    <p className="text-text-secondary text-xs">Incoming Video Call...</p>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={onDecline}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        onClick={onAccept}
                        className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCall;
