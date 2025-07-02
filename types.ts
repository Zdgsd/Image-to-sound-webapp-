export interface Settings {
    maxSize: number;
    density: number;
    duration: number;
    minFreq: number;
    maxFreq: number;
    waveShape: 'sin' | 'square' | 'sawtooth' | 'triangle';
}

export type ViewMode = 'spectrogram' | 'waveform' | 'equation';
