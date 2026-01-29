const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const extractBtn = document.getElementById('extractBtn');
const result = document.getElementById('result');
const copyBtn = document.getElementById('copyBtn');
const cameraBtn = document.getElementById('cameraBtn');
const pasteBtn = document.getElementById('pasteBtn');

let imageSrc = '';

// Load image from file input
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        imageSrc = URL.createObjectURL(file);
        preview.src = imageSrc;
    }
});

// Camera functionality
cameraBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.7)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.appendChild(video);

        const snapBtn = document.createElement('button');
        snapBtn.textContent = 'Capture';
        snapBtn.style.position = 'absolute';
        snapBtn.style.bottom = '20px';
        snapBtn.style.padding = '15px 30px';
        snapBtn.style.borderRadius = '25px';
        snapBtn.style.backgroundColor = '#4CAF50';
        snapBtn.style.color = '#fff';
        modal.appendChild(snapBtn);

        document.body.appendChild(modal);

        snapBtn.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            imageSrc = canvas.toDataURL('image/png');
            preview.src = imageSrc;
            stream.getTracks().forEach(track => track.stop());
            modal.remove();
        });
    } catch (err) {
        alert('Camera access denied or not available.');
    }
});

// Paste image from clipboard
pasteBtn.addEventListener('click', () => {
    window.addEventListener('paste', function pasteHandler(e) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                imageSrc = URL.createObjectURL(file);
                preview.src = imageSrc;
            }
        }
        window.removeEventListener('paste', pasteHandler);
    });
    alert('Paste your image now (Ctrl+V or Cmd+V)');
});

// Extract text using Tesseract.js
extractBtn.addEventListener('click', () => {
    if (!imageSrc) {
        alert('Please select or capture an image first.');
        return;
    }
    result.value = 'Processing...';
    Tesseract.recognize(
        imageSrc,
        'eng',
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        result.value = text;
    });
});

// Copy text to clipboard
copyBtn.addEventListener('click', () => {
    if (result.value.trim() === '') return;
    navigator.clipboard.writeText(result.value).then(() => {
        alert('Text copied to clipboard!');
    });
});
