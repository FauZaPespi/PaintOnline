/*
*   Auteur: FauZaPespi
*   Date: 26.08.2024 16:06
*/

// Get DOM elements
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const redSlider = document.getElementById('red');
const greenSlider = document.getElementById('green');
const blueSlider = document.getElementById('blue');
const colorPreview = document.getElementById('colorPreview');
const bgColorPicker = document.getElementById('bgColor');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const imageUploader = document.getElementById('imageUploader');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Variables for drawing and history
let drawing = false;
let currentColor = 'rgb(0, 0, 0)';
let backgroundColor = '#ffffff';
let drawingHistory = [];
let currentPath = [];
let startX, startY;
let isDrawingStraightLine = false;
let uploadedImage = null;

// Update color based on sliders
function updateColor() {
    const r = redSlider.value;
    const g = greenSlider.value;
    const b = blueSlider.value;
    currentColor = `rgb(${r}, ${g}, ${b})`;
    colorPreview.style.backgroundColor = currentColor;
}

// Start drawing
canvas.addEventListener('mousedown', (event) => {
    if (isDrawingStraightLine) {
        startX = event.clientX - canvas.offsetLeft;
        startY = event.clientY - canvas.offsetTop;
    } else {
        drawing = true;
        currentPath = [];
    }
});

// Stop drawing
canvas.addEventListener('mouseup', (event) => {
    if (isDrawingStraightLine) {
        drawStraightLine(startX, startY, event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        isDrawingStraightLine = false;
    } else {
        drawing = false;
        drawingHistory.push(currentPath);
        ctx.beginPath();
    }
});

// Drawing on the canvas
canvas.addEventListener('mousemove', (event) => {
    if (!drawing && !isDrawingStraightLine) return;

    const x = event.clientX - canvas.offsetLeft;
    const y = event.clientY - canvas.offsetTop;

    if (isDrawingStraightLine) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCanvas(); // Redraw the previous paths
        drawStraightLine(startX, startY, x, y);
    } else if (drawing) {
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;

        ctx.lineTo(x, y);
        ctx.stroke();

        currentPath.push({ x, y, color: currentColor });
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
});

// Draw a straight line
function drawStraightLine(x1, y1, x2, y2) {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Undo the last drawing (Ctrl+Z)
window.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 'z') {
        drawingHistory.pop();
        redrawCanvas();
    } else if (event.ctrlKey && event.key === 's') {
        isDrawingStraightLine = true;
    }
});

// Redraw the entire canvas from history
function redrawCanvas() {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawingHistory.forEach(path => {
        ctx.beginPath();
        path.forEach((point, index) => {
            ctx.strokeStyle = point.color;
            ctx.lineWidth = 5;
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        });
        ctx.beginPath();
    });

    if (uploadedImage) {
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
    }
}

// Clear the canvas
clearBtn.addEventListener('click', () => {
    drawingHistory = [];
    uploadedImage = null;
    redrawCanvas();
});

// Update the background color
bgColorPicker.addEventListener('input', () => {
    backgroundColor = bgColorPicker.value;
    redrawCanvas();
});

// Export canvas as PNG with background color
exportBtn.addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
});

// Handle image upload
imageUploader.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                uploadedImage = img;
                redrawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Initial color update
updateColor();

// Update color when sliders change
redSlider.addEventListener('input', updateColor);
greenSlider.addEventListener('input', updateColor);
blueSlider.addEventListener('input', updateColor);

// Initialize with the selected background color
redrawCanvas();
