import { AudioPlayer } from './audio-player.js';
import { UIManager } from './ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    const player = new AudioPlayer();
    const ui = new UIManager(player);

    ui.updateVolumeBar(player.volume);

    console.log('🎵 仿网易云音乐播放器已启动');
    console.log('⌨️ 快捷键: 空格-播放/暂停 | ←→-快进/快退 | ↑↓-音量 | M-播放列表');
});
