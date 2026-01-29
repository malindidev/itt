const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const context = canvas.getContext('2d');

let showPoints = true;
let showLines = true;

// Info Modal
const helpModal = document.getElementById('helpModal');
document.getElementById('helpBtn').addEventListener('click', () => {
  helpModal.style.display = 'flex';
});
document.getElementById('closeModal').addEventListener('click', () => {
  helpModal.style.display = 'none';
});
window.addEventListener('click', (e) => {
  if(e.target === helpModal) helpModal.style.display = 'none';
});

// Toggle buttons
document.getElementById('togglePoints').addEventListener('click', () => showPoints = !showPoints);
document.getElementById('toggleLines').addEventListener('click', () => showLines = !showLines);

// Load Models
async function loadModels() {
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
}

// Start Video
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
    video.srcObject = stream;
  } catch (err) {
    console.error("Camera access error:", err);
    alert("Unable to access camera.");
  }
}

// Render Face
async function renderFace() {
  if(video.readyState !== 4) {
    requestAnimationFrame(renderFace);
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks(true, new faceapi.FaceLandmark68TinyNet());

  context.clearRect(0,0,canvas.width,canvas.height);

  detections.forEach(({ landmarks }) => {
    const points = landmarks.positions;

    if(showLines){
      context.strokeStyle = 'lime';
      context.lineWidth = 2;
      context.beginPath();
      points.forEach((pt,i)=>{
        if(i===0) context.moveTo(pt.x,pt.y);
        else context.lineTo(pt.x,pt.y);
      });
      context.closePath();
      context.stroke();
    }

    if(showPoints){
      points.forEach(pt => {
        context.fillStyle = 'red';
        context.beginPath();
        context.arc(pt.x,pt.y,3,0,Math.PI*2);
        context.fill();
      });
    }
  });

  requestAnimationFrame(renderFace);
}

// Initialise
loadModels().then(()=>{
  startVideo();
  video.addEventListener('play', renderFace);
});
