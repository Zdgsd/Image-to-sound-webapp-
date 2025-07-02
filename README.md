# Image Sonifier

Turn any image into a unique soundscape. This web app lets you "hear" visuals by converting pixel data into audio, with deep controls to shape the final sound.

**[Try the Live Demo!](https://image-to-sound-webapp-git-main-zdgsds-projects.vercel.app/)**



## How It Works

This tool sonifies images—it turns them into sound. It works by scanning an image from left to right, treating each vertical column of pixels as a moment in time.

*   The **vertical position** of a pixel determines its **frequency** (pitch). Pixels at the top are high-pitched; pixels at the bottom are low-pitched.
*   The **darkness** of a pixel determines its **amplitude** (volume). Darker areas of the image create louder sounds.

You can upload your own image or even snap a picture with your webcam to get started. The app will automatically analyze your image and suggest some initial audio settings to give you a good starting point.

## Features & Customization

The real fun is in the control panel. You're not just listening to a pre-canned sound; you're shaping it in real-time.

*   **Shape the Sound**: Choose from `Sine`, `Square`, `Sawtooth`, or `Triangle` waves for different timbres.
*   **Control the Timing**: Adjust the total `Duration` and `Density` (how fast the scan moves across the image).
*   **Set the Frequency Range**: Map the image to a booming low-end, piercing highs, or anything in between.
*   **Change the Resolution**: Analyze a high-res or low-fi version of your image.

Once your sound is generated, you can see what you've created through a few different lenses: a **Spectrogram**, a **Waveform**, or even the underlying **mathematical equation**.

Happy with your creation? You can save it as a high-quality `.wav` file to use anywhere.

## Tech Stack

*   **Frontend**: React (v19) & TypeScript
*   **Styling**: Tailwind CSS
*   **Audio**: All audio processing, from synthesis to a custom Radix-2 FFT for the spectrogram, is built from scratch with the **Web Audio API**.
*   **Build**: Uses ES modules and the TypeScript compiler (`tsc`).

## How to Run It Locally

1.  **Save the Files**: Make sure all the project files are in a single folder.
2.  **Start a Local Server**: You need to serve the files, not just open `index.html` in your browser. If you have Node.js, you can run this command in the project folder:
    ```bash
    npx serve .
    ```
3.  **Open in Browser**: Navigate to the local address provided by the server (e.g., `http://localhost:3000`).

