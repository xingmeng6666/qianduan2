import { CONFIG, DEMO_SONGS } from './config.js';
import { formatTime, generateAlbumArt } from './utils.js';

export class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.isPlaying = false;
        this.playlist = JSON.parse(JSON.stringify(DEMO_SONGS));
        this.currentIndex = 0;
        this.loopMode = 'none';
        this.volume = CONFIG.DEFAULT_VOLUME;
        this.isSeeking = false;

        this.audio.volume = this.volume;
        this.initEvents();
        this.initPlaylist();
    }

    initEvents() {
        this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
        this.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
        this.audio.addEventListener('ended', () => this.onEnded());
        this.audio.addEventListener('loadstart', () => this.onLoadStart());
        this.audio.addEventListener('canplay', () => this.onCanPlay());
        this.audio.addEventListener('error', (e) => this.onError(e));
    }

    initPlaylist() {
        this.playlist.forEach((song, index) => {
            if (!song.cover) {
                song.cover = generateAlbumArt(index);
            }
        });
        this.loadCurrentSong();
    }

    loadFiles(files) {
        Array.from(files).forEach(file => {
            const url = URL.createObjectURL(file);
            const song = {
                id: Date.now() + Math.random(),
                name: file.name.replace(/\.[^/.]+$/, ''),
                artist: '本地音乐',
                album: '未知专辑',
                cover: generateAlbumArt(),
                url: url,
                file: file,
                duration: 0
            };
            this.playlist.push(song);
        });
    }

    loadFile(file) {
        const url = URL.createObjectURL(file);
        const song = {
            id: Date.now() + Math.random(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            artist: '本地音乐',
            album: '未知专辑',
            cover: generateAlbumArt(),
            url: url,
            file: file,
            duration: 0
        };

        this.playlist.push(song);
        this.currentIndex = this.playlist.length - 1;
        this.loadCurrentSong();

        return song;
    }

    play() {
        if (this.playlist.length === 0) return;

        if (!this.audio.src) {
            this.loadCurrentSong();
        }

        this.audio.play().catch(e => {
            console.log('音频播放失败:', e);
        });
        this.isPlaying = true;
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
        return this.isPlaying;
    }

    seek(percent) {
        if (!this.audio.duration) return;
        this.audio.currentTime = percent * this.audio.duration;
    }

    seekToTime(time) {
        if (!this.audio.duration) return;
        this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        this.audio.volume = this.volume;
    }

    next() {
        if (this.playlist.length === 0) return;

        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadCurrentSong();
        if (this.isPlaying) {
            this.play();
        }
    }

    prev() {
        if (this.playlist.length === 0) return;

        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
            return;
        }

        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadCurrentSong();
        if (this.isPlaying) {
            this.play();
        }
    }

    playSong(index) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        this.loadCurrentSong();
        this.play();
    }

    loadCurrentSong() {
        const song = this.playlist[this.currentIndex];
        if (song) {
            this.audio.src = song.url;
        }
    }

    toggleLoopMode() {
        const modes = CONFIG.LOOP_MODES;
        const currentIndex = modes.indexOf(this.loopMode);
        this.loopMode = modes[(currentIndex + 1) % modes.length];
        return this.loopMode;
    }

    getCurrentSong() {
        return this.playlist[this.currentIndex];
    }

    onTimeUpdate() {
        if (this.onTimeUpdateCallback && !this.isSeeking) {
            const song = this.getCurrentSong();
            // 优先使用音频文件的真实时长
            const duration = this.audio.duration || song?.duration || 0;
            this.onTimeUpdateCallback(this.audio.currentTime, duration);
        }
    }

    onLoadedMetadata() {
        const song = this.getCurrentSong();
        // 优先使用音频文件的真实时长
        if (song) {
            song.duration = this.audio.duration;
        }

        if (this.onLoadedMetadataCallback) {
            this.onLoadedMetadataCallback(this.audio.duration);
        }
    }

    onEnded() {
        if (this.loopMode === 'one') {
            this.audio.currentTime = 0;
            this.play();
        } else if (this.loopMode === 'all' || this.currentIndex < this.playlist.length - 1) {
            this.next();
        } else {
            // 只有真正停止的时候才更新状态
            this.isPlaying = false;
            if (this.onEndedCallback) {
                this.onEndedCallback();
            }
        }
    }

    onLoadStart() {
        if (this.onLoadStartCallback) {
            this.onLoadStartCallback();
        }
    }

    onCanPlay() {
        if (this.onCanPlayCallback) {
            this.onCanPlayCallback();
        }
    }

    onError(e) {
        console.log('音频文件不存在，使用演示模式');
        if (this.onErrorCallback) {
            this.onErrorCallback(e);
        }
    }

    onTimeUpdateChange(callback) {
        this.onTimeUpdateCallback = callback;
    }

    onLoadedMetadataChange(callback) {
        this.onLoadedMetadataCallback = callback;
    }

    onEndedChange(callback) {
        this.onEndedCallback = callback;
    }

    onLoadStartChange(callback) {
        this.onLoadStartCallback = callback;
    }

    onCanPlayChange(callback) {
        this.onCanPlayCallback = callback;
    }

    onErrorChange(callback) {
        this.onErrorCallback = callback;
    }
}
