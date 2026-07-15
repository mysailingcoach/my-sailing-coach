# User Guide - My Free Sailing Coach

Welcome to My Free Sailing Coach. This guide covers the basics of uploading GPX files, reviewing race analysis, and using the app locally or in a hosted deployment.

## Getting started

### 1. Open the app

When you launch the app, you will see the home screen with an upload area and navigation links.

### 2. Upload a GPX file

A GPX file is a standard GPS track export. Most GPS watches, phones, and sailing apps can export this format.

To upload a race:

1. Select a GPX file from your device
2. Enter a race name if you want
3. Click Analyze Race
4. Review the results when the upload completes

## What you will see

### Map view

The map shows your sailing route and the main points of the track.

### Metrics

You can review:

- Total distance
- Total duration
- Average speed
- Maximum and minimum speed
- Track point count

### Dashboard

The dashboard lists all saved races so you can open them again later or delete them.

## Tips for better data

- Record with a reliable GPS source
- Keep the recording interval short for more detail
- Avoid partial or corrupted files
- Use clear race names so you can find them later

## Using the app in a hosted environment

If you are using the deployed version of the app:

- The frontend should point to the backend API URL through VITE_API_URL
- The backend should allow the frontend origin through FRONTEND_URL
- If the app shows connection errors, verify the API URL in your hosting settings

## Troubleshooting

### Upload fails

- Ensure the file ends in .gpx
- Verify the file is valid XML/GPS data
- Check the browser console and backend logs for errors

### The app cannot connect to the API

- Confirm the frontend is configured with the correct API URL
- Make sure the backend is running and reachable
- Check CORS and environment settings if using a hosted deployment

## Privacy

Your uploaded race data is stored by the app and can be deleted from the dashboard if you no longer need it.

Happy sailing! ⛵
