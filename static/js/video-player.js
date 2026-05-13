// ========== VIDEO PLAYER ==========

document.addEventListener('DOMContentLoaded', () => {

    const video =
        document.getElementById('video');

    if (!video) return;

    const playPauseBtn =
        document.getElementById('playPauseBtn');

    const muteBtn =
        document.getElementById('muteBtn');

    const volumeSlider =
        document.getElementById('volumeSlider');

    const progressBar =
        document.getElementById('progressBar');

    const progressFilled =
        document.getElementById('progressFilled');

    const progressHandle =
        document.getElementById('progressHandle');

    const currentTimeSpan =
        document.getElementById('currentTime');

    const durationSpan =
        document.getElementById('duration');

    const speedBtn =
        document.getElementById('speedBtn');

    const speedMenu =
        document.getElementById('speedMenu');

    const fullscreenBtn =
        document.getElementById('fullscreenBtn');

    const videoContainer =
        document.getElementById(
            'videoPlayerContainer'
        );


    /* ========================================= */
    /* FORMAT TIME */
    /* ========================================= */

    function formatTime(seconds) {

        if (!isFinite(seconds)) {
            return '0:00';
        }

        const mins =
            Math.floor(seconds / 60);

        const secs =
            Math.floor(seconds % 60);

        return `${mins}:${
            secs < 10 ? '0' : ''
        }${secs}`;

    }


    /* ========================================= */
    /* PLAY / PAUSE */
    /* ========================================= */

    function togglePlay() {

        if (video.paused) {

            video.play();

        } else {

            video.pause();

        }

    }

    if (playPauseBtn) {

        playPauseBtn.addEventListener(
            'click',
            togglePlay
        );

    }

    video.addEventListener(
        'click',
        togglePlay
    );

    video.addEventListener('play', () => {

        if (!playPauseBtn) return;

        const playIcon =
            playPauseBtn.querySelector(
                '.play-icon'
            );

        const pauseIcon =
            playPauseBtn.querySelector(
                '.pause-icon'
            );

        if (playIcon) {
            playIcon.style.display = 'none';
        }

        if (pauseIcon) {
            pauseIcon.style.display = 'block';
        }

    });

    video.addEventListener('pause', () => {

        if (!playPauseBtn) return;

        const playIcon =
            playPauseBtn.querySelector(
                '.play-icon'
            );

        const pauseIcon =
            playPauseBtn.querySelector(
                '.pause-icon'
            );

        if (playIcon) {
            playIcon.style.display = 'block';
        }

        if (pauseIcon) {
            pauseIcon.style.display = 'none';
        }

    });


    /* ========================================= */
    /* HOTKEYS */
    /* ========================================= */

    document.addEventListener('keydown', e => {

        const activeElement =
            document.activeElement;

        const tag =
            activeElement?.tagName;

        const isTyping =
            tag === 'INPUT' ||
            tag === 'TEXTAREA' ||
            activeElement?.isContentEditable;

        if (isTyping) return;

        /* SPACE */

        if (
            e.code === 'Space' ||
            e.key === ' '
        ) {

            e.preventDefault();

            togglePlay();

        }

        /* LEFT */

        if (
            e.key === 'ArrowLeft' ||
            e.code === 'ArrowLeft'
        ) {

            e.preventDefault();

            e.stopPropagation();

            video.currentTime = Math.max(
                0,
                video.currentTime - 5
            );

        }

        /* RIGHT */

        if (
            e.key === 'ArrowRight' ||
            e.code === 'ArrowRight'
        ) {

            e.preventDefault();

            e.stopPropagation();

            video.currentTime = Math.min(
                video.duration || 999999,
                video.currentTime + 5
            );

        }

    }, true);


    /* ========================================= */
    /* UPDATE PROGRESS */
    /* ========================================= */

    function updateProgress() {

        if (!isFinite(video.duration)) {
            return;
        }

        const percent =
            (video.currentTime / video.duration)
            * 100;

        if (progressFilled) {

            progressFilled.style.width =
                percent + '%';

        }

        if (progressHandle) {

            progressHandle.style.left =
                percent + '%';

        }

        if (currentTimeSpan) {

            currentTimeSpan.textContent =
                formatTime(video.currentTime);

        }

    }

    video.addEventListener(
        'timeupdate',
        updateProgress
    );

    video.addEventListener(
        'loadedmetadata',
        () => {

            if (durationSpan) {

                durationSpan.textContent =
                    formatTime(video.duration);

            }

            updateProgress();

        }
    );


    /* ========================================= */
    /* PROGRESS BAR */
    /* ========================================= */

    if (progressBar) {

        progressBar.addEventListener(
            'click',
            e => {

                if (!isFinite(video.duration)) {
                    return;
                }

                const rect =
                    progressBar.getBoundingClientRect();

                const pos =
                    (e.clientX - rect.left)
                    / rect.width;

                video.currentTime =
                    pos * video.duration;

            }
        );

    }


    /* ========================================= */
    /* VOLUME */
    /* ========================================= */

    function updateMuteIcon() {

        if (!muteBtn) return;

        const volumeHighIcon =
            muteBtn.querySelector(
                '.volume-high-icon'
            );

        const volumeMuteIcon =
            muteBtn.querySelector(
                '.volume-mute-icon'
            );

        if (
            video.muted ||
            video.volume === 0
        ) {

            if (volumeHighIcon) {
                volumeHighIcon.style.display =
                    'none';
            }

            if (volumeMuteIcon) {
                volumeMuteIcon.style.display =
                    'block';
            }

        } else {

            if (volumeHighIcon) {
                volumeHighIcon.style.display =
                    'block';
            }

            if (volumeMuteIcon) {
                volumeMuteIcon.style.display =
                    'none';
            }

        }

    }

    if (volumeSlider) {

        volumeSlider.addEventListener(
            'input',
            function() {

                video.volume =
                    parseFloat(this.value);

                video.muted = false;

                updateMuteIcon();

            }
        );

    }

    if (muteBtn) {

        muteBtn.addEventListener(
            'click',
            () => {

                video.muted =
                    !video.muted;

                if (volumeSlider) {

                    volumeSlider.value =
                        video.muted
                            ? 0
                            : video.volume;

                }

                updateMuteIcon();

            }
        );

    }

    updateMuteIcon();


    /* ========================================= */
    /* SPEED */
    /* ========================================= */

    if (speedBtn) {

        speedBtn.addEventListener(
            'click',
            e => {

                e.stopPropagation();

                if (speedMenu) {

                    speedMenu.classList.toggle(
                        'hidden'
                    );

                }

            }
        );

    }

    if (speedMenu) {

        document
            .querySelectorAll(
                '.speed-option'
            )
            .forEach(option => {

                option.addEventListener(
                    'click',
                    function() {

                        const speed =
                            parseFloat(
                                this.dataset.speed
                            );

                        video.playbackRate =
                            speed;

                        if (speedBtn) {

                            speedBtn.textContent =
                                speed + 'x';

                        }

                        document
                            .querySelectorAll(
                                '.speed-option'
                            )
                            .forEach(opt => {

                                opt.classList.remove(
                                    'active'
                                );

                            });

                        this.classList.add(
                            'active'
                        );

                        speedMenu.classList.add(
                            'hidden'
                        );

                    }
                );

            });

    }

    document.addEventListener(
        'click',
        e => {

            if (
                speedBtn &&
                speedMenu &&
                !speedBtn.contains(e.target) &&
                !speedMenu.contains(e.target)
            ) {

                speedMenu.classList.add(
                    'hidden'
                );

            }

        }
    );


    /* ========================================= */
    /* FULLSCREEN */
    /* ========================================= */

    if (fullscreenBtn) {

        fullscreenBtn.addEventListener(
            'click',
            () => {

                if (
                    !document.fullscreenElement
                ) {

                    if (videoContainer) {

                        videoContainer
                            .requestFullscreen();

                    }

                } else {

                    document.exitFullscreen();

                }

            }
        );

    }

    document.addEventListener(
        'fullscreenchange',
        () => {

            if (!fullscreenBtn) return;

            const fullscreenIcon =
                fullscreenBtn.querySelector(
                    '.fullscreen-icon'
                );

            const exitIcon =
                fullscreenBtn.querySelector(
                    '.fullscreen-exit-icon'
                );

            if (
                document.fullscreenElement
                === videoContainer
            ) {

                if (fullscreenIcon) {
                    fullscreenIcon.style.display =
                        'none';
                }

                if (exitIcon) {
                    exitIcon.style.display =
                        'block';
                }

            } else {

                if (fullscreenIcon) {
                    fullscreenIcon.style.display =
                        'block';
                }

                if (exitIcon) {
                    exitIcon.style.display =
                        'none';
                }

            }

        }
    );

});