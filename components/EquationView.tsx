import React from 'react';
import type { Settings } from '../types';

export const EquationView: React.FC<{ settings: Settings }> = ({ settings }) => {
    const getWaveFunctionString = (shape: Settings['waveShape']) => {
        switch (shape) {
            case 'square': return 'sgn(sin(2\u03C0ft))';
            case 'sawtooth': return '2(t/T - floor(t/T + 0.5))';
            case 'triangle': return '2/\u03C0 \u00B7 asin(sin(2\u03C0ft))';
            case 'sin':
            default:
                return 'sin(2\u03C0ft)';
        }
    };

    return (
        <div className="w-full h-full p-6 flex flex-col justify-center items-center text-gray-300 rounded-lg select-none">
            <h3 className="text-2xl font-bold text-cyan-400 mb-6">Sound Generation Formula</h3>
            <div className="font-mono text-lg space-y-4 bg-gray-900/50 p-6 rounded-md shadow-inner text-left max-w-full overflow-x-auto">
                <p>S(t) = &Sigma;<sub>r=0..H</sub> [ A(c,r) &times; Wave(f<sub>r</sub>, t') ]</p>
                <div className="pl-4 mt-4 border-l-2 border-gray-700 space-y-2 text-base">
                    <p><span className="text-purple-400 font-semibold">Wave(f,t)</span> = {getWaveFunctionString(settings.waveShape)}</p>
                    <p><span className="text-purple-400 font-semibold">A(c,r)</span> = Image Brightness at (col, row)</p>
                    <p><span className="text-purple-400 font-semibold">f<sub>r</sub></span> = Frequency for row 'r'</p>
                    <p className="pl-4 text-gray-400">&rarr; Mapped from {settings.minFreq} Hz to {settings.maxFreq} Hz</p>
                     <p><span className="text-purple-400 font-semibold">t'</span> = Time within a single column segment</p>
                </div>
            </div>
            <p className="mt-6 text-gray-500 text-sm">Change the <span className='font-bold text-gray-400'>Wave Shape</span> in Settings to alter the formula and sound.</p>
        </div>
    );
};
