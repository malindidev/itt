const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');

// Load face-api.js models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/'),
  faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js/weights/')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Error accessing camera: ", err));
}

video.addEventListener('play', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  async function renderFace() {
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
      });
    }
    requestAnimationFrame(renderFace);
  }

  renderFace();
});
