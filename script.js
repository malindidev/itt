const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const extractBtn = document.getElementById('extractBtn');
const result = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');
const resultContainer = document.querySelector('.result');

const cameraBtn = document.getElementById('cameraBtn');
const cameraModal = document.getElementById('cameraModal');
const qrVideo = document.getElementById('qrVideo');
const captureBtn = document.getElementById('captureBtn');
const closeCamera = document.getElementById('closeCamera');

let imageSrc = '';
let stream;

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    imageSrc = URL.createObjectURL(file);
    preview.src = imageSrc;
  }
});

cameraBtn.addEventListener('click', async () => {
  cameraModal.setAttribute('aria-hidden', 'false');
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    qrVideo.srcObject = stream;
  } catch (err) {
    alert('Camera access denied or not available.');
    cameraModal.setAttribute('aria-hidden', 'true');
  }
});

captureBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = qrVideo.videoWidth;
  canvas.height = qrVideo.videoHeight;
  canvas.getContext('2d').drawImage(qrVideo, 0, 0);
  imageSrc = canvas.toDataURL('image/png');
  preview.src = imageSrc;
  stopCamera();
});

closeCamera.addEventListener('click', stopCamera);

function stopCamera() {
  cameraModal.setAttribute('aria-hidden', 'true');
  if (stream) stream.getTracks().forEach(track => track.stop());
}

extractBtn.addEventListener('click', () => {
  if (!imageSrc) {
    alert('Please select or capture an image first.');
    return;
  }
  resultContainer.setAttribute('aria-hidden', 'true');
  result.textContent = 'Processing...';

  Tesseract.recognize(imageSrc, 'eng', { logger: m => console.log(m) })
    .then(({ data: { text } }) => {
      result.textContent = text.trim() || 'No text detected.';
      resultContainer.setAttribute('aria-hidden', 'false');
    });
});

copyBtn.addEventListener('click', () => {
  if (!result.textContent.trim()) return;
  navigator.clipboard.writeText(result.textContent).then(() => {
    alert('Text copied to clipboard!');
  });
});
