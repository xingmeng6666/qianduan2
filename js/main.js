import { AudioPlayer } from './audio-player.js';
import { UIManager } from './ui-manager.js';
import { SpectrumVisualizer } from './spectrum-visualizer.js';
import { ParticleSystem, initLoading, NotificationSystem, TypewriterEffect } from './effects.js';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化加载动画
    initLoading();
    
    const player = new AudioPlayer();
    const ui = new UIManager(player);
    const visualizer = new SpectrumVisualizer(player.audio);
    const particles = new ParticleSystem();
    const notifications = new NotificationSystem();

    ui.updateVolumeBar(player.volume);
    
    // 将可视化器传递给 UI 管理器
    ui.setVisualizer(visualizer);
    
    // 将通知系统传递给 UI 管理器
    ui.setNotificationSystem(notifications);

    // 初始化鼠标跟随光效
    initCursorGlow();
    
    // 显示欢迎通知
    setTimeout(() => {
        notifications.show('🎵 欢迎', '仿网易云音乐播放器已启动');
    }, 1000);

    console.log('🎵 仿网易云音乐播放器已启动');
    console.log('⌨️ 快捷键: 空格-播放/暂停 | ←→-快进/快退 | ↑↓-音量 | M-播放列表');
});

// 鼠标跟随光效
function initCursorGlow() {
    const cursorGlow = document.getElementById('cursorGlow');
    if (!cursorGlow) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let isMoving = false;
    let moveTimeout;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isMoving = true;
        
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
    });

    // 平滑跟随动画
    function animate() {
        if (isMoving) {
            // 使用缓动效果
            currentX += (mouseX - currentX) * 0.1;
            currentY += (mouseY - currentY) * 0.1;
            
            cursorGlow.style.left = currentX + 'px';
            cursorGlow.style.top = currentY + 'px';
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}
