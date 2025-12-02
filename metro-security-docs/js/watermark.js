class WatermarkSystem {
    constructor() {
        this.watermarkText = '';
        this.init();
    }

    async init() {
        await this.generateWatermarkText();
    }

    async generateWatermarkText() {
        const user = await firebaseConfig.getCurrentUserWithVerification();
        if (!user) return;

        const timestamp = new Date().toLocaleString('ru-RU');
        const ip = await this.getIPAddress();
        
        this.watermarkText = `${user.email} | ${timestamp} | ${ip} | Metro Security Docs`;
    }

    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    }

    async applyWatermarkToCanvas(canvas) {
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;

        // Save original state
        ctx.save();
        
        // Set watermark properties
        ctx.globalAlpha = 0.1;
        ctx.font = '20px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Rotate for diagonal watermark
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 4);

        // Fill entire canvas with watermark
        const textWidth = ctx.measureText(this.watermarkText).width;
        const spacing = 200;

        for (let x = -width; x < width * 2; x += textWidth + spacing) {
            for (let y = -height; y < height * 2; y += 100) {
                ctx.fillText(this.watermarkText, x, y);
            }
        }

        // Restore context
        ctx.restore();
    }

    async applyWatermarkToImage(imgElement) {
        if (!imgElement) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;

        // Draw original image
        ctx.drawImage(imgElement, 0, 0);

        // Apply watermark
        ctx.globalAlpha = 0.1;
        ctx.font = '30px Arial';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Rotate text
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);

        const textWidth = ctx.measureText(this.watermarkText).width;
        const spacing = 300;

        for (let x = -canvas.width; x < canvas.width * 2; x += textWidth + spacing) {
            for (let y = -canvas.height; y < canvas.height * 2; y += 150) {
                ctx.fillText(this.watermarkText, x, y);
            }
        }

        // Replace image with watermarked version
        imgElement.src = canvas.toDataURL('image/png');
    }

    createDynamicWatermark() {
        const watermarkDiv = document.createElement('div');
        watermarkDiv.id = 'dynamic-watermark';
        watermarkDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.05;
            background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 100px,
                rgba(255,0,0,0.1) 100px,
                rgba(255,0,0,0.1) 200px
            );
        `;

        // Add user info as watermark
        const textOverlay = document.createElement('div');
        textOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 24px;
            color: rgba(255,0,0,0.3);
            white-space: nowrap;
            font-weight: bold;
        `;
        textOverlay.textContent = this.watermarkText;

        watermarkDiv.appendChild(textOverlay);
        document.body.appendChild(watermarkDiv);

        // Prevent removal
        this.protectWatermark(watermarkDiv);
    }

    protectWatermark(element) {
        // MutationObserver to prevent removal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.removedNodes.length) {
                    mutation.removedNodes.forEach((node) => {
                        if (node === element || node.contains?.(element)) {
                            document.body.appendChild(element);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true });

        // Prevent right-click and copy
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            alert('Копирование запрещено');
        });
    }

    generateHiddenWatermark(data) {
        // Create steganography-like watermark
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        
        // Convert to binary string
        let binary = '';
        for (let byte of dataBuffer) {
            binary += byte.toString(2).padStart(8, '0');
        }

        // Return as invisible Unicode characters
        let hiddenWatermark = '';
        for (let i = 0; i < binary.length; i += 2) {
            const bits = binary.substr(i, 2);
            const codePoint = 0x200B + parseInt(bits, 2); // Use zero-width spaces
            hiddenWatermark += String.fromCodePoint(codePoint);
        }

        return hiddenWatermark;
    }

    extractHiddenWatermark(text) {
        // Extract hidden watermark from text
        const chars = Array.from(text);
        let binary = '';

        for (let char of chars) {
            const codePoint = char.codePointAt(0);
            if (codePoint >= 0x200B && codePoint <= 0x200F) {
                const bits = (codePoint - 0x200B).toString(2).padStart(2, '0');
                binary += bits;
            }
        }

        // Convert binary back to data
        const bytes = [];
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            if (byte.length === 8) {
                bytes.push(parseInt(byte, 2));
            }
        }

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(new Uint8Array(bytes)));
    }
}

// Initialize watermark system
const watermarkSystem = new WatermarkSystem();

// Apply watermark on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('viewer.html')) {
        setTimeout(() => {
            watermarkSystem.createDynamicWatermark();
        }, 1000);
    }
});

// Export
window.watermarkSystem = watermarkSystem;
