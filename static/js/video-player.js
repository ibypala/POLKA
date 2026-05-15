document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    if (!video) return;

    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const progressBar = document.getElementById('progressBar');
    const progressFilled = document.getElementById('progressFilled');
    const progressHandle = document.getElementById('progressHandle');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const speedBtn = document.getElementById('speedBtn');
    const speedMenu = document.getElementById('speedMenu');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const videoContainer = document.getElementById('videoPlayerContainer');
    const videoControls = document.querySelector('.video-controls');

    /* ================= FORMAT TIME ================= */
    function formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /* ================= PLAY / PAUSE ================= */
    function togglePlay() { video.paused ? video.play() : video.pause(); }
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    video.addEventListener('play', () => {
        if (!playPauseBtn) return;
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        if (playIcon) playIcon.style.display = 'none';
        if (pauseIcon) pauseIcon.style.display = 'block';
    });

    video.addEventListener('pause', () => {
        if (!playPauseBtn) return;
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';
    });

    /* ================= HOTKEYS ================= */
    document.addEventListener('keydown', e => {
        const activeElement = document.activeElement;
        const tag = activeElement?.tagName;
        const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || activeElement?.isContentEditable;
        if (isTyping) return;

        switch(e.code){
            case 'Space':
            case 'Spacebar':
                e.preventDefault(); togglePlay(); break;
            case 'ArrowLeft':
                e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); break;
            case 'ArrowRight':
                e.preventDefault(); video.currentTime = Math.min(video.duration || 999999, video.currentTime + 5); break;
            case 'KeyM':
                e.preventDefault(); video.muted = !video.muted; updateMuteIcon(); break;
            case 'KeyF':
                e.preventDefault();
                if (!document.fullscreenElement) videoContainer.requestFullscreen();
                else document.exitFullscreen();
                break;
        }
    }, true);

    /* ================= PROGRESS ================= */
    function updateProgress() {
        if (!isFinite(video.duration)) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (progressFilled) progressFilled.style.width = percent + '%';
        if (progressHandle) progressHandle.style.left = percent + '%';
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(video.currentTime);
    }
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', () => {
        if (durationSpan) durationSpan.textContent = formatTime(video.duration);
        updateProgress();
    });
    if (progressBar) progressBar.addEventListener('click', e => {
        if (!isFinite(video.duration)) return;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    });

    /* ================= VOLUME ================= */
    function updateMuteIcon() {
        if (!muteBtn) return;
        const volHigh = muteBtn.querySelector('.volume-high-icon');
        const volMute = muteBtn.querySelector('.volume-mute-icon');
        if (video.muted || video.volume === 0) {
            if (volHigh) volHigh.style.display = 'none';
            if (volMute) volMute.style.display = 'block';
        } else {
            if (volHigh) volHigh.style.display = 'block';
            if (volMute) volMute.style.display = 'none';
        }
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('input', function() {
            video.volume = parseFloat(this.value); video.muted = false; updateMuteIcon();
        });
        // колесо мыши по всей области блока громкости
        const volumeArea = muteBtn.parentElement;
        volumeArea.addEventListener('wheel', e => {
            e.preventDefault();
            let delta = e.deltaY < 0 ? 0.05 : -0.05;
            video.volume = Math.min(1, Math.max(0, video.volume + delta));
            volumeSlider.value = video.volume;
            video.muted = video.volume === 0;
            updateMuteIcon();
        });
    }
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
            updateMuteIcon();
        });
    }
    updateMuteIcon();

    /* ================= SPEED ================= */
    if (speedBtn) speedBtn.addEventListener('click', e => { e.stopPropagation(); speedMenu?.classList.toggle('hidden'); });
    if (speedMenu) {
        document.querySelectorAll('.speed-option').forEach(option => {
            option.addEventListener('click', function() {
                const speed = parseFloat(this.dataset.speed);
                video.playbackRate = speed;
                if (speedBtn) speedBtn.textContent = speed + 'x';
                document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                speedMenu.classList.add('hidden');
            });
        });
    }
    document.addEventListener('click', e => {
        if (speedBtn && speedMenu && !speedBtn.contains(e.target) && !speedMenu.contains(e.target)) speedMenu.classList.add('hidden');
    });

    /* ================= FULLSCREEN ICON ================= */
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) videoContainer.requestFullscreen();
            else document.exitFullscreen();
        });
    }
    document.addEventListener('fullscreenchange', () => {
        if (!fullscreenBtn) return;
        const fsIcon = fullscreenBtn.querySelector('.fullscreen-icon');
        const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit-icon');
        if (document.fullscreenElement === videoContainer) {
            if (fsIcon) fsIcon.style.display = 'none';
            if (exitIcon) exitIcon.style.display = 'block';
        } else {
            if (fsIcon) fsIcon.style.display = 'block';
            if (exitIcon) exitIcon.style.display = 'none';
        }
    });

    /* ================= AUTOSHOW / HIDE CONTROLS ================= */
    let hideTimeout;
    function showControls() {
        if (!videoControls) return;
        videoControls.style.opacity = 1;
        videoControls.style.pointerEvents = 'auto';
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            if (!video.paused) { 
                videoControls.style.opacity = 0; 
                videoControls.style.pointerEvents = 'none'; 
            }
        }, 1000); // автоскрытие 1 сек
    }
    video.addEventListener('mousemove', showControls);
    video.addEventListener('touchstart', showControls);
    showControls();

    /* ================= DOUBLE TAP ================= */
    let lastTap = 0;
    video.addEventListener('click', e => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // только fullscreen по двойному тапу
            if (!document.fullscreenElement) videoContainer.requestFullscreen();
            else document.exitFullscreen();
        }
        lastTap = currentTime;
    });

    /* ================= SHOW SEEK TIME ================= */
    // Показываем текущий hover-time прямо в прогресс-бара через title заменяем на display: можно потом overlay
    progressBar.addEventListener('mousemove', e => {
        if (!isFinite(video.duration)) return;
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const hoverTime = pos * video.duration;
        currentTimeSpan.textContent = formatTime(hoverTime); // временно отображаем hover в currentTime
    });
    progressBar.addEventListener('mouseleave', updateProgress);
});