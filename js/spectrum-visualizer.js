export class SpectrumVisualizer {
    constructor(audioElement) {
        this.audio = audioElement;
        this.canvas = document.getElementById('spectrumCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 创建音频分析器
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        
        // 连接音频源
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }
    
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    start() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isPlaying = true;
        this.draw();
    }
    
    stop() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    draw() {
        if (!this.isPlaying) return;
        
        this.animationId = requestAnimationFrame(() => this.draw());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = (width / this.bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        this.ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = (this.dataArray[i] / 255) * height * 0.8;
            
            // 创建渐变
            const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
            gradient.addColorStop(0, 'rgba(255, 105, 180, 0.8)');
            gradient.addColorStop(0.5, 'rgba(255, 135, 200, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 182, 193, 0.3)');
            
            this.ctx.fillStyle = gradient;
            
            // 绘制圆角矩形
            this.ctx.beginPath();
            this.ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, 4);
            this.ctx.fill();
            
            x += barWidth;
        }
    }
}