const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');

// Load face-api.js models from CDN
async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
}

// Start webcam video
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
  } catch (err) {
    console.error("Error accessing camera: ", err);
    alert("Unable to access camera.");
  }
}

// Draw facial landmarks on canvas
async function renderFace() {
  if (video.readyState !== 4) {
    requestAnimationFrame(renderFace);
    return;
  }

  // Match canvas size to video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                                   .withFaceLandmarks();

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (detections.length > 0) {
    detections.forEach(detection => {
      const landmarks = detection.landmarks.positions;

      context.strokeStyle = 'lime';
      context.lineWidth = 2;
      context.beginPath();

      landmarks.forEach((point, i) => {
        if (i === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });

      context.closePath();
      context.stroke();

      // Optional: draw points for more clarity
      landmarks.forEach(point => {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(point.x, point.y, 2, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  requestAnimationFrame(renderFace);
}

// Initialise
loadModels().then(() => {
  startVideo();
  video.addEventListener('play', renderFace);
});
