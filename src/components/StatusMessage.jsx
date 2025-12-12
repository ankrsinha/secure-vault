import React, { useEffect, useState } from 'react';

export const StatusMessage = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            setProgress(100);

            const timer = setInterval(() => {
                setProgress(prev => Math.max(0, prev - 100 / 60)); // 3 seconds total
            }, 50);

            const closeTimer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, 3000);

            return () => {
                clearInterval(timer);
                clearTimeout(closeTimer);
            };
        } else {
            setIsVisible(false);
        }
    }, [message, onClose]);

    if (!message) return null;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
    };

    const bgColors = {
        success: 'bg-green-900/95 border-green-700',
        error: 'bg-red-900/95 border-red-700',
        warning: 'bg-yellow-900/95 border-yellow-700',
    };

    const textColors = {
        success: 'text-green-100',
        error: 'text-red-100',
        warning: 'text-yellow-100',
    };

    return (
        <div className={`fixed top-6 right-6 z-[100] transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className={`${bgColors[type]} ${textColors[type]} border rounded-xl p-4 shadow-2xl max-w-sm`}>
                <div className="flex items-center gap-3">
                    <span className="text-xl">{icons[type]}</span>
                    <div className="flex-1">
                        <p className="font-medium">{message}</p>
                        <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/40 transition-all duration-50"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
};