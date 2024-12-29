const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
let currentEmotion = '';

// Load face-api models
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(() => {
    console.log("Models loaded successfully");
    startVideo();
}).catch(err => {
    console.error("Model loading failed:", err);
});

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error('Error accessing webcam:', err);
        });
}

video.addEventListener('loadedmetadata', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    canvas.width = displaySize.width;
    canvas.height = displaySize.height;

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Translate the canvas down by 2vh
        ctx.save();
        ctx.translate(0, 0); // Shift down by 2vh

        if (detections.length > 0) {
            console.log("Face detected");
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

            currentEmotion = getDominantEmotion(detections[0].expressions);
            console.log("Current emotion:", currentEmotion);
        } else {
            console.log("No face detected");
        }
        ctx.restore(); // Restore the context to its original state
    }, 100);
});

captureBtn.addEventListener('click', () => {
    const emotionToShow = currentEmotion === 'neutral' ? getRandomEmotion() : currentEmotion || 'neutral';
    const suggestedGenre = getGenre(emotionToShow);
    window.location.href = `emotion.html?emotion=${emotionToShow}&genre=${suggestedGenre}`;
});

function getDominantEmotion(expressions) {
    return Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
}

function getRandomEmotion() {
    const emotions = ['happy', 'sad', 'angry', 'surprised', 'disgusted', 'fearful'];
    return emotions[Math.floor(Math.random() * emotions.length)];
}

function getGenre(emotion) {
    switch (emotion) {
        case 'happy':
            return 'Romance';
        case 'sad':
        case 'angry':
            return 'Comedy';
        case 'surprised':
            return 'Thriller';
        default:
            return 'Fantasy';
    }
}
