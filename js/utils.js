export function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function generateRandomColor(seed = null) {
    const colors = [
        '#c92727', '#27c954', '#2759c9', '#c927a2', '#c9a227',
        '#27c9c9', '#9427c9', '#27c974', '#c95427', '#4a1a6b'
    ];
    if (seed !== null) {
        return colors[seed % colors.length];
    }
    return colors[Math.floor(Math.random() * colors.length)];
}

export function generateAlbumArt(seed = null) {
    const color = generateRandomColor(seed);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 250);
    gradient.addColorStop(0, lightenColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, darkenColor(color, 30));

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);

    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(
            200 + Math.cos(i * Math.PI / 4) * 100,
            200 + Math.sin(i * Math.PI / 4) * 100,
            50 + i * 10,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const characters = ['♪', '♫', '♩', '♬', '🎵', '🎶'];
    const char = characters[seed !== null ? seed % characters.length : Math.floor(Math.random() * characters.length)];
    ctx.fillText(char, 200, 200);

    ctx.beginPath();
    ctx.arc(200, 200, 140, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    return canvas.toDataURL('image/png');
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
