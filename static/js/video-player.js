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

    let isDragging = false;
    let savedVolume = video.volume;

    /* ================= FORMAT TIME ================= */
    function formatTime(seconds) {
        if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    /* ================= UPDATE PROGRESS ================= */
    function updateProgressUI() {
        if (!isFinite(video.duration) || video.duration === 0) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (progressFilled) progressFilled.style.width = percent + '%';
        if (progressHandle) progressHandle.style.left = percent + '%';
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(video.currentTime);
    }

    /* ================= PLAY / PAUSE ================= */
    function togglePlay() {
        video.paused ? video.play() : video.pause();
    }

    function updatePlayPauseIcons() {
        if (!playPauseBtn) return;
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        if (video.paused) {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        } else {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
        }
    }

    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updatePlayPauseIcons);
    video.addEventListener('pause', updatePlayPauseIcons);
    updatePlayPauseIcons();

    /* ================= HOTKEYS ================= */
    document.addEventListener('keydown', e => {
        const activeElement = document.activeElement;
        const tag = activeElement?.tagName;
        const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || activeElement?.isContentEditable;
        if (isTyping) return;

        switch(e.code) {
            case 'Space':
            case 'Spacebar':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 5);
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration || 999999, video.currentTime + 5);
                break;
            case 'KeyM':
                e.preventDefault();
                video.muted = !video.muted;
                if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
                updateMuteIcon();
                break;
            case 'KeyF':
                e.preventDefault();
                if (!document.fullscreenElement) videoContainer?.requestFullscreen();
                else document.exitFullscreen();
                break;
        }
    }, true);

    /* ================= PROGRESS BAR ================= */
    function setVideoTimeFromEvent(clientX) {
        if (!isFinite(video.duration)) return;
        const rect = progressBar.getBoundingClientRect();
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.min(Math.max(pos, 0), 1);
        video.currentTime = pos * video.duration;
        updateProgressUI();
    }

    video.addEventListener('loadedmetadata', () => {
        if (durationSpan) durationSpan.textContent = formatTime(video.duration);
        updateProgressUI();
    });
    video.addEventListener('timeupdate', updateProgressUI);

    if (progressBar) {
        // ==== SCRUB PREVIEW ====
        let wasPlaying = false;
        const startScrub = (clientX) => {
            if (!video.duration) return;
            isDragging = true;
            wasPlaying = !video.paused;
            video.pause();
            setVideoTimeFromEvent(clientX);
        };
        const scrubMove = (clientX) => {
            if (!isDragging) return;
            setVideoTimeFromEvent(clientX);
        };
        const stopScrub = () => {
            if (!isDragging) return;
            isDragging = false;
            if (wasPlaying) video.play();
        };

        // Mouse
        progressBar.addEventListener('mousedown', e => { e.preventDefault(); startScrub(e.clientX); });
        document.addEventListener('mousemove', e => { scrubMove(e.clientX); });
        document.addEventListener('mouseup', stopScrub);

        // Touch
        progressBar.addEventListener('touchstart', e => { startScrub(e.touches[0].clientX); });
        document.addEventListener('touchmove', e => { scrubMove(e.touches[0].clientX); });
        document.addEventListener('touchend', stopScrub);

        // Hover time
        let hoverTimeout;
        progressBar.addEventListener('mousemove', e => {
            if (isDragging) return;
            const rect = progressBar.getBoundingClientRect();
            let pos = (e.clientX - rect.left) / rect.width;
            pos = Math.min(Math.max(pos, 0), 1);
            const hoverTime = pos * video.duration;
            if (currentTimeSpan) { currentTimeSpan.textContent = formatTime(hoverTime); currentTimeSpan.style.opacity = '0.7'; }
            if (hoverTimeout) clearTimeout(hoverTimeout);
            hoverTimeout = setTimeout(() => {
                if (currentTimeSpan && !isDragging) { currentTimeSpan.textContent = formatTime(video.currentTime); currentTimeSpan.style.opacity = '1'; }
            }, 500);
        });
        progressBar.addEventListener('mouseleave', () => {
            if (currentTimeSpan && !isDragging) { currentTimeSpan.textContent = formatTime(video.currentTime); currentTimeSpan.style.opacity = '1'; }
        });
    }

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
        volumeSlider.value = video.volume;
        volumeSlider.addEventListener('input', function() {
            video.volume = parseFloat(this.value);
            video.muted = false;
            updateMuteIcon();
        });
    }
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (video.muted) { video.muted = false; video.volume = savedVolume || 1; }
            else { savedVolume = video.volume; video.muted = true; video.volume = 0; }
            if (volumeSlider) volumeSlider.value = video.muted ? 0 : video.volume;
            updateMuteIcon();
        });
    }
    updateMuteIcon();

    // Колесо мыши для громкости на контейнере
    videoContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        let delta = e.deltaY < 0 ? 0.05 : -0.05;
        video.volume = Math.min(1, Math.max(0, video.volume + delta));
        video.muted = false;
        if (volumeSlider) volumeSlider.value = video.volume;
        updateMuteIcon();
    }, { passive: false });

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
    document.addEventListener('click', e => { if (speedBtn && speedMenu && !speedBtn.contains(e.target) && !speedMenu.contains(e.target)) speedMenu.classList.add('hidden'); });

    /* ================= FULLSCREEN ================= */
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => { if (!document.fullscreenElement) videoContainer?.requestFullscreen(); else document.exitFullscreen(); });
    document.addEventListener('fullscreenchange', () => {
        if (!fullscreenBtn) return;
        const fsIcon = fullscreenBtn.querySelector('.fullscreen-icon');
        const exitIcon = fullscreenBtn.querySelector('.fullscreen-exit-icon');
        if (document.fullscreenElement === videoContainer) { if (fsIcon) fsIcon.style.display = 'none'; if (exitIcon) exitIcon.style.display = 'block'; }
        else { if (fsIcon) fsIcon.style.display = 'block'; if (exitIcon) exitIcon.style.display = 'none'; }
    });

    /* ================= AUTO-HIDE CONTROLS ================= */
    let hideTimeout;
    function showControlsTemporarily() {
        if (!videoControls) return;
        videoControls.style.opacity = '1';
        videoControls.style.pointerEvents = 'auto';
        clearTimeout(hideTimeout);
        if (!video.paused) {
            hideTimeout = setTimeout(() => { videoControls.style.opacity = '0'; videoControls.style.pointerEvents = 'none'; }, 1000);
        }
    }
    function resetHideTimer() { if (!video.paused) showControlsTemporarily(); }
    videoContainer.addEventListener('mousemove', resetHideTimer);
    videoContainer.addEventListener('touchstart', resetHideTimer);
    showControlsTemporarily();

    /* ================= DOUBLE TAP FULLSCREEN ================= */
    let lastTap = 0;
    video.addEventListener('click', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            if (!document.fullscreenElement) videoContainer?.requestFullscreen();
            else document.exitFullscreen();
        }
        lastTap = currentTime;
    });

    /* ================= VERTICAL VIDEO ================= */
    video.addEventListener('loadedmetadata', () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        video.style.objectFit = (videoWidth && videoHeight && videoHeight > videoWidth) ? 'contain' : 'cover';
    });
});