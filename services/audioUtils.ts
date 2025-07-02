import type { Settings } from '../types';

/**
 * Converts an HTMLImageElement to a 2D array of grayscale values.
 * Darker pixels will have higher values (closer to 1.0).
 */
export const imageToGrayscaleArray = (
    image: HTMLImageElement,
    width: number,
    height: number
): Promise<number[][]> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        ctx.drawImage(image, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        const grayscaleArray: number[][] = [];

        for (let y = 0; y < height; y++) {
            const row: number[] = [];
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Using luminance formula for grayscale conversion
                const grayscale = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
                // Invert the grayscale value so that darker pixels have higher amplitude
                row.push(1.0 - grayscale);
            }
            grayscaleArray.push(row);
        }
        resolve(grayscaleArray);
    });
};

/**
 * Generates an audio signal from a 2D image array.
 */
export const generateAudioFromImage = (
    imageArray: number[][],
    sampleRate: number,
    durationPerColumn: number,
    minFreq: number,
    maxFreq: number,
    waveShape: Settings['waveShape']
): Promise<Float32Array> => {
    return new Promise((resolve) => {
        const [height, width] = [imageArray.length, imageArray[0]?.length || 0];
        if (width === 0 || height === 0) {
            resolve(new Float32Array(0));
            return;
        }

        const samplesPerColumn = Math.floor(sampleRate * durationPerColumn);
        const totalSamples = samplesPerColumn * width;
        const audio = new Float32Array(totalSamples);
        // Map top of image (lower row index) to higher frequencies to match visual representation
        const freqs = Array.from({ length: height }, (_, i) => maxFreq - (i / (height - 1)) * (maxFreq - minFreq));
        
        let maxAmplitude = 0;

        for (let col = 0; col < width; col++) {
            for (let t_idx = 0; t_idx < samplesPerColumn; t_idx++) {
                const time = t_idx / sampleRate;
                let sample = 0;
                for (let row = 0; row < height; row++) {
                    const amplitude = imageArray[row][col];
                    if (amplitude > 0) {
                        const freq = freqs[row];
                        const phase = 2 * Math.PI * freq * time;
                        let waveSample = 0;
                        switch (waveShape) {
                            case 'square':
                                waveSample = Math.sin(phase) >= 0 ? 1 : -1;
                                break;
                            case 'sawtooth':
                                // T = 1 / freq => time / T = time * freq
                                const phaseNormalized = time * freq;
                                waveSample = 2 * (phaseNormalized - Math.floor(phaseNormalized + 0.5));
                                break;
                            case 'triangle':
                                waveSample = (2 / Math.PI) * Math.asin(Math.sin(phase));
                                break;
                            case 'sin':
                            default:
                                waveSample = Math.sin(phase);
                                break;
                        }
                        sample += amplitude * waveSample;
                    }
                }
                const audioIndex = col * samplesPerColumn + t_idx;
                audio[audioIndex] = sample;
                if (Math.abs(sample) > maxAmplitude) {
                    maxAmplitude = Math.abs(sample);
                }
            }
        }

        if (maxAmplitude > 0) {
            for (let i = 0; i < audio.length; i++) {
                audio[i] /= maxAmplitude;
            }
        }
        
        resolve(audio);
    });
};

/**
 * Analyzes an image array and suggests optimal audio settings.
 */
export const analyzeImageForAudioSettings = async (
    imageArray: number[][]
): Promise<{ newSettings: Partial<Settings> }> => {
    const height = imageArray.length;
    if (!height || !imageArray[0]?.length) {
        return { newSettings: {} };
    }

    const flatValues = imageArray.flat();
    const sum = flatValues.reduce((a, b) => a + b, 0);
    // Note: With inverted grayscale, "brightness" now represents the amount of dark pixels.
    const brightness = sum / flatValues.length;

    const mean = brightness;
    const variance = flatValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / flatValues.length;
    const contrast = Math.sqrt(variance);

    // Heuristics to map image stats to audio settings
    // Images with more dark areas (higher "brightness" now) get longer duration
    const duration = 3.0 + brightness * 9.0;
    const freqRange = 2000 + contrast * 30000;
    const minFreq = Math.max(20, 400 - contrast * 700);
    const maxFreq = Math.min(20000, minFreq + freqRange);

    const newSettings: Partial<Settings> = {
        duration: parseFloat(duration.toFixed(1)),
        minFreq: parseInt(minFreq.toFixed(0)),
        maxFreq: parseInt(maxFreq.toFixed(0)),
    };

    return { newSettings };
};


// A simplified complex number array for FFT
type Complex = { re: number; im: number };

const fft_radix2 = (x: Complex[]): Complex[] => {
    const N = x.length;
    if (N <= 1) return x;

    const even = fft_radix2(x.filter((_, i) => i % 2 === 0));
    const odd = fft_radix2(x.filter((_, i) => i % 2 !== 0));

    const result: Complex[] = new Array(N);
    for (let k = 0; k < N / 2; k++) {
        const angle = -2 * Math.PI * k / N;
        const t: Complex = {
            re: Math.cos(angle) * odd[k].re - Math.sin(angle) * odd[k].im,
            im: Math.cos(angle) * odd[k].im + Math.sin(angle) * odd[k].re,
        };
        result[k] = { re: even[k].re + t.re, im: even[k].im + t.im };
        result[k + N / 2] = { re: even[k].re - t.re, im: even[k].im - t.im };
    }
    return result;
}

export const computeSpectrogramData = (
    audioBuffer: Float32Array,
    fftSize: number = 1024
): { data: number[][], freqs: number[], times: number[] } => {
    const hopLength = Math.floor(fftSize / 4);
    const numFrames = Math.floor((audioBuffer.length - fftSize) / hopLength) + 1;
    const spectrogram: number[][] = [];
    const times: number[] = [];

    // Hann window
    const window = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) {
        window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
    }

    for (let i = 0; i < numFrames; i++) {
        const start = i * hopLength;
        const frame = audioBuffer.slice(start, start + fftSize);
        if (frame.length < fftSize) continue;

        const windowedFrame: Complex[] = new Array(fftSize);
        for (let j = 0; j < fftSize; j++) {
            windowedFrame[j] = { re: frame[j] * window[j], im: 0 };
        }
        
        const fftResult = fft_radix2(windowedFrame);
        const magnitudes = fftResult.slice(0, fftSize / 2).map(c => Math.sqrt(c.re * c.re + c.im * c.im));
        
        // Convert to dB
        const dbMagnitudes = magnitudes.map(mag => 20 * Math.log10(mag + 1e-10));
        spectrogram.push(dbMagnitudes);
        times.push(start / 44100);
    }
    const freqs = Array.from({length: fftSize/2}, (_, i) => i * 44100 / fftSize);
    
    // Transpose for easier rendering
    const transposed = spectrogram[0] ? spectrogram[0].map((_, colIndex) => spectrogram.map(row => row[colIndex])) : [];
    
    return { data: transposed.reverse(), freqs, times }; // reversed for drawing
};

/**
 * Encodes a Float32Array into a WAV file Blob.
 */
export const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return new Blob([view], { type: 'audio/wav' });
};