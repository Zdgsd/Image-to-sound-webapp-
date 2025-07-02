# Image Sonifier

An interactive web application that transforms images into unique soundscapes. Upload an image, adjust audio parameters, and listen to the sonified result. This tool supports both file uploads and direct webcam capture, offering a unique way to experience visual information through sound.

## Features

*   **Image-to-Sound Conversion**: Converts standard image files (PNG, JPEG, BMP) into audible soundscapes.
*   **Webcam Support**: Capture an image directly from your webcam for instant sonification.
*   **Dynamic Audio Controls**: Fine-tune the sound with real-time controls for:
    *   **Image Resolution (Max Size)**: Controls the detail level of the image analysis.
    *   **Time Density**: Stretches or compresses the sound horizontally.
    *   **Duration**: Sets the total length of the audio clip.
    *   **Frequency Range**: Maps the image's vertical axis to a specific range of sound frequencies.
    *   **Wave Shape**: Choose between Sine, Square, Sawtooth, and Triangle waves for different timbres.
*   **Intelligent Analysis**: Automatically analyzes the uploaded image's brightness and contrast to suggest optimal initial settings for duration and frequency.
*   **Multiple Visualizations**:
    *   **Spectrogram View**: A detailed frequency-over-time visualization of the generated audio.
    *   **Waveform View**: A classic amplitude-over-time view of the audio signal.
    *   **Equation View**: Displays the underlying mathematical formula used for sound synthesis.
*   **Playback & Export**: Full playback controls (play/pause) and the ability to save your creation as a high-quality `.wav` file.
*   **Responsive UI**: A clean, modern interface built with Tailwind CSS that works seamlessly on desktop and mobile devices.

## How It Works

The process of turning an image into sound, or "sonification," follows a precise procedure:

1.  **Image Processing**: The input image is resized to the dimensions specified by the `Max Size` and `Density` settings and converted into a 2D array of grayscale values. To make the process intuitive, pixel darkness is inverted—**darker pixels are given higher values (closer to 1.0)**, which translates to higher amplitude.

2.  **Column-by-Column Synthesis**: The application scans the image array from left to right, one column of pixels at a time. Each column represents a small slice of time in the final audio.

3.  **Frequency Mapping**: The vertical axis of the image is mapped to the frequency range set by the user. Pixels at the **top of the image produce higher frequencies**, while pixels at the bottom produce lower frequencies.

4.  **Additive Synthesis**: For each time slice (column), the application generates sound by combining multiple oscillators—one for each row of pixels. The amplitude of each oscillator is determined by the brightness of its corresponding pixel. The resulting sound for that slice is the sum of all these waves.

5.  **Audio Generation**: The audio slices for all columns are stitched together to form a continuous audio stream. This stream is normalized to prevent clipping and loaded into an audio buffer, ready for playback.

## Technology Stack

*   **Frontend**: React (v19) with TypeScript, using hooks for state management and side effects.
*   **Styling**: Tailwind CSS for a modern, utility-first design.
*   **Audio**: The **Web Audio API** is used for audio playback. All audio generation and processing, including a custom Radix-2 FFT for the spectrogram, is implemented from scratch in TypeScript.
*   **Dependencies**: No build step is required. The app uses ES modules and loads React from `esm.sh`.

## Running Locally

To run this application on your local machine, you'll need a modern web browser and a simple local web server.

1.  **Save the Files**: Ensure all the project files are in a single folder, maintaining the directory structure (`components/`, `services/`).

2.  **Start a Local Server**: Since the app uses ES modules, you cannot open `index.html` directly from the filesystem. You must serve it.
    *   If you have **Node.js** installed, you can use the `serve` package:
        ```bash
        npx serve .
        ```
    *   If you have **Python** installed, you can use its built-in server:
        ```bash
        # Python 3
        python -m http.server

        # Python 2
        python -m SimpleHTTPServer
        ```
    *   Alternatively, use a tool like the **Live Server** extension in Visual Studio Code.

3.  **Open in Browser**: Navigate to the local address provided by your server (e.g., `http://localhost:3000` or `http://localhost:8000`). The application should now be running.

## Code Overview

*   `App.tsx`: The main component that orchestrates the entire application. It manages the global state, handles user interactions, and connects the UI components with the audio processing logic.
*   `services/audioUtils.ts`: The core of the application. This file contains all the critical logic for:
    *   `imageToGrayscaleArray()`: Image loading and conversion.
    *   `generateAudioFromImage()`: The main sound synthesis engine.
    *   `analyzeImageForAudioSettings()`: The logic for suggesting settings based on image properties.
    *   `computeSpectrogramData()`: A custom FFT implementation and logic to create spectrogram data.
    *   `encodeWAV()`: A function to convert the raw `Float32Array` audio buffer into a downloadable `.wav` blob.
*   `components/`: A folder containing all the reusable React components that make up the UI, such as `ControlPanel.tsx`, `ImageDropzone.tsx`, and `AudioVisualizer.tsx`.
