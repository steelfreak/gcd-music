class MusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.songs = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        
        this.elements = {
            currentSong: document.getElementById('currentSong'),
            progressContainer: document.getElementById('progressContainer'),
            progressBar: document.getElementById('progressBar'),
            currentTime: document.getElementById('currentTime'),
            duration: document.getElementById('duration'),
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            stopBtn: document.getElementById('stopBtn'),
            songList: document.getElementById('songList'),
            player: document.getElementById('player')
        };

        this.init();
        window.player = this; // For drag & drop access
    }

    init() {
        this.bindEvents();
        this.scanMusicFolder();
        this.audio.addEventListener('ended', () => this.nextSong());
    }

    bindEvents() {
        this.elements.playBtn.addEventListener('click', () => this.togglePlay());
        this.elements.prevBtn.addEventListener('click', () => this.prevSong());
        this.elements.nextBtn.addEventListener('click', () => this.nextSong());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        
        this.elements.progressContainer.addEventListener('click', (e) => {
            const rect = this.elements.progressContainer.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    }

    scanMusicFolder() {
        // demoSongs comes from songs.js
        this.songs = demoSongs || [];
        this.renderSongList();
    }

    renderSongList() {
        this.elements.songList.innerHTML = '';
        
        if (this.songs.length === 0) {
            this.elements.songList.innerHTML = '<div class="status">No songs found. Drag & drop MP3 files!</div>';
            return;
        }

        this.songs.forEach((song, index) => {
            const songEl = document.createElement('div');
            songEl.className = 'song-item';
            songEl.innerHTML = `<span class="song-icon">🎵</span>${song.name}`;
            songEl.addEventListener('click', () => this.playSong(index));
            if (index === this.currentSongIndex) songEl.classList.add('active');
            this.elements.songList.appendChild(songEl);
        });
    }

    playSong(index) {
        this.currentSongIndex = index;
        this.audio.src = this.songs[index].path;
        this.audio.load();
        this.play();
        this.updateCurrentSong();
        this.renderSongList(); // Refresh to update active song
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.audio.src && this.songs.length > 0) {
            this.playSong(this.currentSongIndex);
            return;
        }
        this.audio.play();
        this.isPlaying = true;
        this.elements.playBtn.textContent = '⏸';
        this.elements.player.classList.add('playing');
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶';
        this.elements.player.classList.remove('playing');
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.elements.playBtn.textContent = '▶';
        this.elements.player.classList.remove('playing');
    }

    nextSong() {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
        this.playSong(this.currentSongIndex);
    }

    prevSong() {
        if (this.songs.length === 0) return;
        this.currentSongIndex = (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
        this.playSong(this.currentSongIndex);
    }

    updateCurrentSong() {
        this.elements.currentSong.textContent =
            this.songs[this.currentSongIndex]?.name || 'No song selected';
    }

    updateProgress() {
        if (this.audio.duration) {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.elements.progressBar.style.width = progress + '%';
            this.elements.currentTime.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        this.elements.duration.textContent = this.formatTime(this.audio.duration || 0);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});

// Drag & drop songs
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const musicFiles = files.filter(file =>
        file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)
    );
    
    musicFiles.forEach(file => {
        const song = {
            name: file.name,
            path: URL.createObjectURL(file)
        };
        if (window.player) {
            window.player.songs.push(song);
            window.player.renderSongList();
        }
    });
});
