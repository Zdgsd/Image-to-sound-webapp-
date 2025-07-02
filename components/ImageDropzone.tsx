import React, { useCallback, useState, useRef, useEffect } from 'react';
import { IconCamera, IconUpload, IconFile } from './Icons';

interface ImageDropzoneProps {
    onImageLoaded: (image: HTMLImageElement, name: string) => void;
    fileName: string | null;
    disabled: boolean;
}

const WebcamModal: React.FC<{
    onCapture: (image: HTMLImageElement) => void;
    onClose: () => void;
}> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Webcam error:", err);
                setError("Could not access webcam. Please check permissions.");
            });

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const handleCapture = () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Flip the context horizontally to mirror the camera
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const img = new Image();
            img.onload = () => onCapture(img);
            img.src = canvas.toDataURL('image/png');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 p-4 rounded-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Webcam Capture</h3>
                {error ? (
                    <p className="text-red-400">{error}</p>
                ) : (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        className="rounded-md w-full max-w-2xl"
                        style={{ transform: 'scaleX(-1)' }} // Mirror the preview
                    ></video>
                )}
                <div className="mt-4 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">Cancel</button>
                    <button onClick={handleCapture} disabled={!!error} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed rounded-md transition-colors">Capture</button>
                </div>
            </div>
        </div>
    );
};

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageLoaded, fileName, disabled }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => onImageLoaded(img, file.name);
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }, [onImageLoaded]);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile, disabled]);

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    };
    
    const handleBrowseClick = () => fileInputRef.current?.click();
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const handleWebcamCapture = (image: HTMLImageElement) => {
        onImageLoaded(image, `webcam-capture-${Date.now()}.png`);
    };

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragEvents}
                onDragEnter={handleDragEvents}
                onDragLeave={handleDragEvents}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDragging ? 'border-cyan-400 bg-gray-700' : 'border-gray-600 bg-gray-800'} ${disabled ? 'opacity-50' : ''}`}
            >
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                    <IconUpload className="w-12 h-12" />
                    <p className="font-semibold">Drag & drop an image here</p>
                    <p className="text-sm">or</p>
                </div>
                 <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/bmp"
                    className="hidden"
                    disabled={disabled}
                />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                     <button onClick={handleBrowseClick} disabled={disabled} className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors disabled:bg-cyan-800 disabled:cursor-not-allowed">
                        <IconFile className="w-5 h-5" />
                        <span>Browse Files</span>
                    </button>
                    <button onClick={() => setShowWebcam(true)} disabled={disabled} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors disabled:bg-purple-800 disabled:cursor-not-allowed">
                        <IconCamera className="w-5 h-5" />
                        <span>Use Webcam</span>
                    </button>
                </div>
                {fileName && <p className="text-sm text-gray-400 truncate">Current: <span className="font-medium text-gray-300">{fileName}</span></p>}
            </div>
            {showWebcam && <WebcamModal onCapture={handleWebcamCapture} onClose={() => setShowWebcam(false)} />}
        </div>
    );
};
