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
    const volumeArea = document.querySelector('.volume-control');

    let isDragging = false;
    let wasPlaying = false;
    let hideTimeout = null;

    // ================= FORMAT TIME =================
    function formatTime(seconds) {
        if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ================= VOLUME =================
    let savedVolume = parseFloat(localStorage.getItem('videoVolume')) || 1;
    video.volume = savedVolume;

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

    function setVolume(v) {
        video.volume = Math.min(1, Math.max(0, v));
        video.muted = video.volume === 0;
        if(volumeSlider) volumeSlider.value = video.volume;
        localStorage.setItem('videoVolume', video.volume);
        updateMuteIcon();
    }

    if (volumeSlider) {
        volumeSlider.value = video.volume;
        volumeSlider.addEventListener('input', e => {
            setVolume(parseFloat(e.target.value));
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if(video.muted){
                video.muted = false;
                setVolume(savedVolume || 1);
            } else {
                savedVolume = video.volume;
                video.muted = true;
                setVolume(0);
            }
        });
    }

    // колесо мыши только на volumeArea
    if (volumeArea) {
        volumeArea.addEventListener('wheel', e => {
            e.preventDefault();
            let delta = e.deltaY < 0 ? 0.05 : -0.05;
            setVolume(video.volume + delta);
        }, {passive:false});
    }
    updateMuteIcon();

    // ================= PLAY/PAUSE =================
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

    // ================= HOTKEYS =================
    document.addEventListener('keydown', e => {
        const tag = document.activeElement?.tagName;
        if(tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
        switch(e.code){
            case 'Space':
            case 'Spacebar':
                e.preventDefault(); togglePlay(); break;
            case 'ArrowLeft':
                e.preventDefault(); video.currentTime = Math.max(0, video.currentTime-5); break;
            case 'ArrowRight':
                e.preventDefault(); video.currentTime = Math.min(video.duration||999999, video.currentTime+5); break;
            case 'KeyM':
                e.preventDefault(); video.muted = !video.muted; if(volumeSlider) volumeSlider.value = video.muted?0:video.volume; updateMuteIcon(); break;
            case 'KeyF':
                e.preventDefault();
                if(!document.fullscreenElement) videoContainer?.requestFullscreen();
                else document.exitFullscreen();
                break;
        }
    }, true);

    // ================= PROGRESS BAR =================
    function updateProgressUI() {
        if (!isFinite(video.duration)) return;
        const percent = (video.currentTime / video.duration) * 100;
        if (progressFilled) progressFilled.style.width = percent+'%';
        if (progressHandle) progressHandle.style.transform = `translateX(${percent}%) translateY(-50%)`;
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(video.currentTime);
    }

    video.addEventListener('timeupdate', throttle(() => updateProgressUI(), 100));
    video.addEventListener('loadedmetadata', () => {
        if(durationSpan) durationSpan.textContent = formatTime(video.duration);
        updateProgressUI();
    });

    if(progressBar){
        const startScrub = clientX => {
            if(!video.duration) return;
            isDragging = true;
            wasPlaying = !video.paused;
            video.pause();
            setVideoTimeFromEvent(clientX);
            showControls();
        };
        const scrubMove = clientX => {
            if(!isDragging) return;
            setVideoTimeFromEvent(clientX);
            showControls();
        };
        const stopScrub = () => {
            if(!isDragging) return;
            isDragging = false;
            if(wasPlaying) video.play();
        };

        function setVideoTimeFromEvent(clientX){
            const rect = progressBar.getBoundingClientRect();
            let pos = (clientX - rect.left)/rect.width;
            pos = Math.min(Math.max(pos,0),1);
            video.currentTime = pos*video.duration;
            updateProgressUI();
        }

        progressBar.addEventListener('mousedown', e => { e.preventDefault(); startScrub(e.clientX); });
        document.addEventListener('mousemove', e => { scrubMove(e.clientX); });
        document.addEventListener('mouseup', stopScrub);
        progressBar.addEventListener('touchstart', e => startScrub(e.touches[0].clientX));
        document.addEventListener('touchmove', e => scrubMove(e.touches[0].clientX));
        document.addEventListener('touchend', stopScrub);
    }

    // ================= SPEED =================
    if(speedBtn) speedBtn.addEventListener('click', e => { e.stopPropagation(); speedMenu?.classList.toggle('hidden'); });
    if(speedMenu){
        document.querySelectorAll('.speed-option').forEach(opt=>{
            opt.addEventListener('click', function(){
                const speed = parseFloat(this.dataset.speed);
                video.playbackRate = speed;
                if(speedBtn) speedBtn.textContent = speed+'x';
                document.querySelectorAll('.speed-option').forEach(o=>o.classList.remove('active'));
                this.classList.add('active');
                speedMenu.classList.add('hidden');
            });
        });
    }
    document.addEventListener('click', e => {
        if(speedBtn && speedMenu && !speedBtn.contains(e.target) && !speedMenu.contains(e.target)){
            speedMenu.classList.add('hidden');
        }
    });

    // ================= FULLSCREEN =================
    if(fullscreenBtn){
        const toggleFullscreen = (e)=>{
            e.preventDefault(); // обязательно, чтобы iOS не игнорировал
            e.stopPropagation();
            if(!document.fullscreenElement) videoContainer?.requestFullscreen();
            else document.exitFullscreen();
        };
        
        fullscreenBtn.addEventListener('click', toggleFullscreen);      // для десктопа
        fullscreenBtn.addEventListener('touchend', toggleFullscreen);   // для iPhone/iPad
    }
    

    // ================= CONTROLS & CURSOR =================
    function showControls(){ if(!videoControls) return; videoControls.style.opacity='1'; videoControls.style.pointerEvents='auto'; videoContainer.style.cursor='default'; clearTimeout(hideTimeout);}
    function hideControls(delay=1000){ 
        if(!videoControls) return;
        clearTimeout(hideTimeout);
        if(video.paused) return; 
        hideTimeout = setTimeout(()=>{ videoControls.style.opacity='0'; videoControls.style.pointerEvents='none'; videoContainer.style.cursor='none'; }, delay);
    }

    const throttledMouse = throttle(()=>{ showControls(); if(!video.paused) hideControls(1000); else hideControls(500); }, 50);
    videoContainer.addEventListener('mousemove', throttledMouse);
    videoContainer.addEventListener('mouseenter', showControls);
    videoContainer.addEventListener('mouseleave', ()=>{ hideControls(video.paused?500:1000); });
    videoContainer.addEventListener('touchstart', showControls);

    document.addEventListener('fullscreenchange', ()=>{
        if(document.fullscreenElement === videoContainer){
            showControls();
            if(!video.paused) hideControls();
        } else showControls();
    });

    if(video.paused) showControls(); else hideControls();

    // ================= DOUBLE TAP FULLSCREEN =================
    let lastTap=0;
    video.addEventListener('click', e=>{
        const now = Date.now();
        if(now-lastTap < 300){
            e.preventDefault();
            if(!document.fullscreenElement) videoContainer?.requestFullscreen();
            else document.exitFullscreen();
        }
        lastTap = now;
    });

    // ================= VERTICAL VIDEO =================
    video.addEventListener('loadedmetadata', ()=>{
        const w=video.videoWidth, h=video.videoHeight;
        video.style.objectFit = (w && h && h>w)?'contain':'cover';
    });

    // ================= UTILS =================
    function throttle(func, limit){
        let lastFunc, lastRan;
        return function(...args){
            const context=this;
            if(!lastRan){
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function(){
                    if((Date.now()-lastRan)>=limit){
                        func.apply(context,args);
                        lastRan = Date.now();
                    }
                }, limit-(Date.now()-lastRan));
            }
        };
    }
});