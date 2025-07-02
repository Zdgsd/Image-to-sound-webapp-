import React from 'react';

export const TitleBar: React.FC = () => {
    return (
        <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                    Image Sonifier
                </span>
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                Transform visuals into soundscapes.
            </p>
        </div>
    );
};
