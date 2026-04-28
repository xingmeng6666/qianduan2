import { CONFIG } from './config.js';
import { formatTime, generateAlbumArt } from './utils.js';

export class UIManager {
    constructor(player) {
        this.player = player;
        this.isDragging = false;
        this.isDraggingVolume = false;
        this.lyrics = [];
        this.initElements();
        this.initEvents();
        this.bindPlayerEvents();
        this.initUI();
    }

    initUI() {
        const song = this.player.getCurrentSong();
        if (song) {
            console.log('初始化歌曲信息:', song);
            this.songTitle.textContent = song.name;
            this.songArtist.textContent = song.artist;
            this.songAlbum.textContent = song.album;
            if (song.cover) {
                this.cdCover.src = song.cover;
            }
            this.songTitle.classList.remove('placeholder-title');
            // 优先使用音频文件的真实时长
            const duration = this.player.audio.duration || song.duration || 0;
            this.totalTimeEl.textContent = formatTime(duration);
            console.log('设置时长:', duration, formatTime(duration));
            this.loadLyrics(song.lyrics);
            this.updatePlaylist();
            
            // 初始化唱针状态为默认（抬起）
            // 不需要添加类，CSS默认就是抬起状态
        }
    }

    initElements() {
        this.cdContainer = document.getElementById('cdContainer');
        this.cdCover = document.getElementById('cdCover');
        this.needle = document.getElementById('needle');
        this.songTitle = document.getElementById('songTitle');
        this.songArtist = document.getElementById('songArtist');
        this.songAlbum = document.querySelector('.song-album');

        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.playlistBtn = document.getElementById('playlistBtn');
        this.addMusicBtn = document.getElementById('addMusicBtn');
        this.musicInput = document.getElementById('musicInput');

        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.currentTimeEl = document.getElementById('currentTime');
        this.totalTimeEl = document.getElementById('totalTime');

        this.volumeBar = document.getElementById('volumeBar');
        this.volumeFill = document.getElementById('volumeFill');

        this.playlistPanel = document.getElementById('playlistPanel');
        this.playlistContent = document.getElementById('playlistContent');

        this.lyricsContainer = document.getElementById('lyricsContainer');
        this.lyricsScroll = document.getElementById('lyricsScroll');
    }

    initEvents() {
        this.playBtn.addEventListener('click', () => this.handlePlayToggle());
        this.prevBtn.addEventListener('click', () => this.handlePrev());
        this.nextBtn.addEventListener('click', () => this.handleNext());
        this.loopBtn.addEventListener('click', () => this.handleLoopToggle());
        this.playlistBtn.addEventListener('click', () => this.handlePlaylistToggle());
        this.addMusicBtn.addEventListener('click', () => this.handleAddMusic());
        this.musicInput.addEventListener('change', (e) => this.handleMusicSelected(e));

        this.progressBar.addEventListener('mousedown', (e) => this.handleProgressStart(e));
        this.progressBar.addEventListener('mousemove', (e) => this.handleProgressMove(e));
        this.progressBar.addEventListener('mouseup', (e) => this.handleProgressEnd(e));
        this.progressBar.addEventListener('mouseleave', (e) => this.handleProgressEnd(e));

        this.progressBar.addEventListener('touchstart', (e) => this.handleProgressStart(e), { passive: false });
        this.progressBar.addEventListener('touchmove', (e) => this.handleProgressMove(e), { passive: false });
        this.progressBar.addEventListener('touchend', (e) => this.handleProgressEnd(e));

        this.volumeBar.addEventListener('mousedown', (e) => this.handleVolumeStart(e));
        this.volumeBar.addEventListener('mousemove', (e) => this.handleVolumeMove(e));
        this.volumeBar.addEventListener('mouseup', (e) => this.handleVolumeEnd(e));
        this.volumeBar.addEventListener('mouseleave', (e) => this.handleVolumeEnd(e));

        // 时间显示悬停事件
        this.totalTimeEl.addEventListener('mouseenter', () => this.showRemainingTime());
        this.totalTimeEl.addEventListener('mouseleave', () => this.showTotalTime());

        document.addEventListener('click', (e) => {
            if (!this.playlistBtn.contains(e.target) && !this.playlistPanel.contains(e.target)) {
                this.playlistPanel.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    bindPlayerEvents() {
        this.player.onTimeUpdateChange((current, total) => {
            if (!this.isDragging) {
                this.updateProgress(current, total);
                this.updateLyrics(current);
            }
        });

        this.player.onLoadedMetadataChange((duration) => {
            const song = this.player.getCurrentSong();
            this.totalTimeEl.textContent = formatTime(duration || song?.duration || 0);
            this.updatePlaylist();
        });

        this.player.onLoadStartChange(() => {
            this.updateSongInfo();
        });

        this.player.onCanPlayChange(() => {
        });

        this.player.onEndedChange(() => {
            this.updatePlayButton(false);
            this.updateCDAnimation(false);
        });
    }

    handlePlayToggle() {
        const isPlaying = this.player.togglePlay();
        this.updatePlayButton(isPlaying);
        this.updateCDAnimation(isPlaying);
        
        // 控制频谱可视化
        if (this.visualizer) {
            if (isPlaying) {
                this.visualizer.start();
            } else {
                this.visualizer.stop();
            }
        }
    }
    
    setVisualizer(visualizer) {
        this.visualizer = visualizer;
    }
    
    setNotificationSystem(notificationSystem) {
        this.notifications = notificationSystem;
    }

    handlePrev() {
        this.animateSongChange(() => {
            this.player.prev();
            this.updateSongInfo();
            this.updatePlaylist();
        });
    }

    handleNext() {
        this.animateSongChange(() => {
            this.player.next();
            this.updateSongInfo();
            this.updatePlaylist();
        });
    }
    
    animateSongChange(callback) {
        const songInfo = document.querySelector('.song-info');
        songInfo.classList.add('changing');
        
        setTimeout(() => {
            callback();
            songInfo.classList.remove('changing');
            songInfo.classList.add('changed');
            
            // 添加打字机效果
            this.applyTypewriterEffect();
            
            // 显示切歌通知
            if (this.notifications) {
                const song = this.player.getCurrentSong();
                if (song) {
                    this.notifications.show('🎵 正在播放', song.name + ' - ' + song.artist);
                }
            }
            
            setTimeout(() => {
                songInfo.classList.remove('changed');
            }, 500);
        }, 300);
    }
    
    applyTypewriterEffect() {
        const title = document.getElementById('songTitle');
        const artist = document.getElementById('songArtist');
        
        if (title) {
            title.classList.add('typewriter');
            setTimeout(() => title.classList.remove('typewriter'), 2000);
        }
        
        if (artist) {
            setTimeout(() => {
                artist.classList.add('typewriter');
                setTimeout(() => artist.classList.remove('typewriter'), 2000);
            }, 500);
        }
    }

    handleLoopToggle() {
        const mode = this.player.toggleLoopMode();
        this.updateLoopButton(mode);
    }

    handlePlaylistToggle() {
        this.playlistPanel.classList.toggle('active');
    }

    handleAddMusic() {
        this.musicInput.click();
    }

    handleMusicSelected(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.player.loadFiles(files);
            this.updatePlaylist();
            if (!this.player.isPlaying) {
                this.updateSongInfo();
            }
        }
        e.target.value = '';
    }

    handleProgressStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.player.isSeeking = true;
        this.updateProgressFromEvent(e);
    }

    handleProgressMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.updateProgressFromEvent(e);
    }

    handleProgressEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.player.isSeeking = false;
        this.updateProgressFromEvent(e);
    }

    updateProgressFromEvent(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const song = this.player.getCurrentSong();
        // 优先使用音频文件的真实时长
        const duration = this.player.audio.duration || song?.duration || 0;
        const current = percent * duration;

        this.player.seek(percent);
        this.progressFill.style.width = (percent * 100) + '%';
        this.currentTimeEl.textContent = formatTime(current);
        this.updateLyrics(current);
    }

    handleVolumeStart(e) {
        this.isDraggingVolume = true;
        this.updateVolumeFromEvent(e);
    }

    handleVolumeMove(e) {
        if (!this.isDraggingVolume) return;
        this.updateVolumeFromEvent(e);
    }

    handleVolumeEnd(e) {
        this.isDraggingVolume = false;
    }

    updateVolumeFromEvent(e) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        this.player.setVolume(percent);
        this.updateVolumeBar(percent);
    }

    handleKeydown(e) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.handlePlayToggle();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                const currentTime = this.player.audio.currentTime || 0;
                // 优先使用音频文件的真实时长
                const duration = this.player.audio.duration || this.player.getCurrentSong()?.duration || 0;
                const newTime = Math.max(0, currentTime - 5);
                this.player.seekToTime(newTime);
                this.updateProgress(newTime, duration);
                this.updateLyrics(newTime);
                break;
            case 'ArrowRight':
                e.preventDefault();
                const currTime = this.player.audio.currentTime || 0;
                // 优先使用音频文件的真实时长
                const dur = this.player.audio.duration || this.player.getCurrentSong()?.duration || 0;
                const newT = Math.min(dur, currTime + 5);
                this.player.seekToTime(newT);
                this.updateProgress(newT, dur);
                this.updateLyrics(newT);
                break;
            case 'ArrowUp':
                e.preventDefault();
                const volumeUp = Math.min(1, this.player.volume + 0.1);
                this.player.setVolume(volumeUp);
                this.updateVolumeBar(volumeUp);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const volumeDown = Math.max(0, this.player.volume - 0.1);
                this.player.setVolume(volumeDown);
                this.updateVolumeBar(volumeDown);
                break;
            case 'KeyM':
                this.handlePlaylistToggle();
                break;
        }
    }

    updatePlayButton(isPlaying) {
        const icon = isPlaying ? this.getPauseIcon() : this.getPlayIcon();
        this.playBtn.innerHTML = icon;
    }

    updateCDAnimation(isPlaying) {
        // 只操作 playing 类，不添加 paused 类
        // 这样动画会保持当前状态而不是重置
        if (isPlaying) {
            this.cdContainer.classList.add('playing');
            this.needle.classList.add('playing');
        } else {
            this.cdContainer.classList.remove('playing');
            this.needle.classList.remove('playing');
        }
    }

    updateProgress(current, total) {
        const percent = (current / total) * 100 || 0;
        this.progressFill.style.width = percent + '%';
        this.currentTimeEl.textContent = formatTime(current);
        this.currentTotal = total;
        this.currentProgress = current;
        
        // 更新总时长显示（如果不是悬停状态）
        if (!this.isHoveringTotalTime) {
            this.totalTimeEl.textContent = formatTime(total);
        }
    }
    
    showRemainingTime() {
        this.isHoveringTotalTime = true;
        this.totalTimeEl.classList.add('remaining');
        if (this.currentTotal && this.currentProgress !== undefined) {
            const remaining = this.currentTotal - this.currentProgress;
            this.totalTimeEl.textContent = formatTime(remaining);
        }
    }
    
    showTotalTime() {
        this.isHoveringTotalTime = false;
        this.totalTimeEl.classList.remove('remaining');
        if (this.currentTotal) {
            this.totalTimeEl.textContent = formatTime(this.currentTotal);
        }
    }

    updateVolumeBar(volume) {
        this.volumeFill.style.width = (volume * 100) + '%';
        this.updateVolumeIcon(volume);
    }

    updateVolumeIcon(volume) {
        let icon;
        if (volume === 0) {
            icon = this.getVolumeMuteIcon();
        } else if (volume < 0.5) {
            icon = this.getVolumeLowIcon();
        } else {
            icon = this.getVolumeHighIcon();
        }
        this.volumeBtn.innerHTML = icon;
    }

    updateLoopButton(mode) {
        this.loopBtn.classList.toggle('active', mode !== 'none');
        if (mode === 'one') {
            this.loopBtn.innerHTML = this.getLoopOneIcon();
        } else {
            this.loopBtn.innerHTML = this.getLoopIcon();
        }
        this.loopBtn.title = CONFIG.LOOP_MODE_NAMES[mode];
    }

    async updateSongInfo() {
        const song = this.player.getCurrentSong();

        if (song) {
            console.log('更新歌曲信息:', song);
            this.songTitle.textContent = song.name;
            this.songArtist.textContent = song.artist;
            this.songAlbum.textContent = song.album;
            if (song.cover) {
                this.cdCover.src = song.cover;
            }
            this.songTitle.classList.remove('placeholder-title');
            // 优先使用音频文件的真实时长
            const duration = this.player.audio.duration || song.duration || 0;
            this.totalTimeEl.textContent = formatTime(duration);
            this.updateProgress(0, duration);
            await this.loadLyrics(song.lyrics);
        }
    }

    async loadLyrics(lyricsData) {
        console.log('开始加载歌词...', lyricsData);
        this.lyrics = [];
        this.lyricsScroll.innerHTML = '<div class="lyric-line active">暂无歌词</div>';

        if (lyricsData) {
            if (Array.isArray(lyricsData)) {
                console.log('歌词格式：数组');
                // 如果是数组，直接使用（简单格式）
                this.lyrics = lyricsData.filter(line => line.trim() !== '').map((text, index) => ({
                    time: index * 5,  // 简单分配时间
                    text: text
                }));
            } else if (typeof lyricsData === 'string') {
                console.log('歌词格式：字符串');
                // 检查是不是LRC格式（包含 [mm:ss.xx]）
                if (lyricsData.includes('[') && lyricsData.includes(':')) {
                    console.log('检测到LRC格式，直接解析...');
                    // 直接解析LRC字符串
                    this.parseLRC(lyricsData);
                } else {
                    console.log('尝试加载文件...');
                    // 尝试加载文件
                    try {
                        const response = await fetch(lyricsData);
                        const text = await response.text();
                        this.parseLRC(text);
                    } catch (e) {
                        console.log('加载歌词失败', e);
                    }
                }
            }
            
            console.log('解析后的歌词数量：', this.lyrics.length);
            if (this.lyrics.length > 0) {
                this.renderLyrics();
            }
        }
    }

    parseLRC(lrcText) {
        console.log('开始解析LRC...');
        this.lyrics = [];
        const lines = lrcText.split('\n');
        console.log('总行数：', lines.length);
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        lines.forEach((line, index) => {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);
                const time = minutes * 60 + seconds + milliseconds / 1000;
                const text = line.replace(timeRegex, '').trim();
                
                // 不过滤，显示所有歌词
                if (text) {
                    this.lyrics.push({
                        time: time,
                        text: text
                    });
                    console.log(`解析第${index+1}行: ${text} (${time}s)`);
                }
            }
        });

        console.log('解析完成，歌词数量：', this.lyrics.length);

        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
    }

    renderLyrics() {
        console.log('开始渲染歌词...');
        this.lyricsScroll.innerHTML = '';
        this.lyrics.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'lyric-line';
            div.textContent = item.text;
            div.dataset.index = index;
            div.dataset.time = item.time;
            this.lyricsScroll.appendChild(div);
        });
        // 默认高亮第一行并居中显示
        if (this.lyrics.length > 0) {
            const firstLine = this.lyricsScroll.querySelector('.lyric-line');
            firstLine.classList.add('active');
            console.log('歌词渲染完成，第一行：', firstLine.textContent);
            // 立即调用一次updateLyrics来设置初始位置
            this.updateLyrics(0);
        }
    }

    updateLyrics(currentTime) {
        if (this.lyrics.length === 0) return;

        // 找到当前时间对应的歌词
        let currentLineIndex = this.lyrics.length - 1;
        for (let i = 0; i < this.lyrics.length; i++) {
            if (currentTime < this.lyrics[i].time) {
                currentLineIndex = Math.max(0, i - 1);
                break;
            }
        }

        console.log(`当前时间: ${currentTime.toFixed(2)}s, 选中歌词索引: ${currentLineIndex}, 歌词: "${this.lyrics[currentLineIndex].text}"`);
        
        const lines = this.lyricsScroll.querySelectorAll('.lyric-line');
        
        if (currentLineIndex >= 0 && currentLineIndex < lines.length) {
            const containerHeight = this.lyricsContainer.clientHeight;
            const currentLine = lines[currentLineIndex];
            
            // 临时禁用过渡，避免闪烁
            this.lyricsScroll.style.transition = 'none';
            
            // 先移除所有状态类
            lines.forEach((line, index) => {
                line.classList.remove('active', 'passed', 'pending');
                if (index < currentLineIndex) {
                    line.classList.add('passed');
                } else if (index > currentLineIndex) {
                    line.classList.add('pending');
                }
            });
            
            // 计算当前行的位置，让它居中显示
            const lineOffsetTop = currentLine.offsetTop;
            let lineHeight = currentLine.offsetHeight;
            // 防止lineHeight为0导致的计算问题
            if (lineHeight === 0) {
                lineHeight = 50; // 使用默认高度
            }
            const offset = containerHeight / 2 - lineHeight / 2 - lineOffsetTop;
            
            console.log(`滚动偏移: ${offset}px, 容器高度: ${containerHeight}, 行高度: ${lineHeight}, 行偏移: ${lineOffsetTop}`);
            
            // 立即设置滚动位置
            this.lyricsScroll.style.transform = `translateY(${offset}px)`;
            
            // 强制浏览器重排
            this.lyricsScroll.offsetHeight;
            
            // 恢复过渡效果
            this.lyricsScroll.style.transition = 'transform 0.3s ease';
            
            // 最后设置 active 类
            currentLine.classList.add('active');
        }
    }

    updatePlaylist() {
        this.playlistContent.innerHTML = '';

        if (this.player.playlist.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'playlist-empty';
            emptyItem.textContent = '播放列表为空';
            emptyItem.style.padding = '20px';
            emptyItem.style.color = 'var(--text-secondary)';
            emptyItem.style.textAlign = 'center';
            emptyItem.style.fontSize = '14px';
            this.playlistContent.appendChild(emptyItem);
            return;
        }

        this.player.playlist.forEach((song, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item' + (index === this.player.currentIndex ? ' active' : '');
            item.innerHTML = `
                <span class="item-index">${index + 1}</span>
                <div class="item-info">
                    <div class="item-name">${song.name}</div>
                    <div class="item-artist">${song.artist}</div>
                </div>
                <span class="item-duration">${song.duration ? formatTime(song.duration) : '--:--'}</span>
            `;

            item.addEventListener('click', () => {
                this.player.playSong(index);
                this.updatePlayButton(true);
                this.updateCDAnimation(true);
                this.updateSongInfo();
                this.updatePlaylist();
            });

            this.playlistContent.appendChild(item);
        });
    }

    getPlayIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="8,5 19,12 8,19"></polygon>
        </svg>`;
    }

    getPauseIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14"></rect>
            <rect x="14" y="5" width="4" height="14"></rect>
        </svg>`;
    }

    getLoopIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17,1 21,5 17,9"></polyline>
            <path d="M3,11V9a4,4,0,0,1,4-4h14"></path>
            <polyline points="7,23 3,19 7,15"></polyline>
            <path d="M21,13v2a4,4,0,0,1-4,4H3"></path>
        </svg>`;
    }

    getLoopOneIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="17,1 21,5 17,9"></polyline>
            <path d="M3,11V9a4,4,0,0,1,4-4h14"></path>
            <polyline points="7,23 3,19 7,15"></polyline>
            <path d="M21,13v2a4,4,0,0,1-4,4H3"></path>
            <text x="10" y="15" font-size="8" fill="currentColor" text-anchor="middle" font-weight="bold">1</text>
        </svg>`;
    }

    getVolumeHighIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
            <path d="M19.07,4.93a10,10,0,0,1,0,14.14"></path>
            <path d="M15.54,8.46a5,5,0,0,1,0,7.07"></path>
        </svg>`;
    }

    getVolumeLowIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
            <path d="M15.54,8.46a5,5,0,0,1,0,7.07"></path>
        </svg>`;
    }

    getVolumeMuteIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11,5 6,9 2,9 2,15 6,15 11,19"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>`;
    }

    getPlaylistIcon() {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3" y2="6"></line>
            <line x1="3" y1="12" x2="3" y2="12"></line>
            <line x1="3" y1="18" x2="3" y2="18"></line>
        </svg>`;
    }
}
