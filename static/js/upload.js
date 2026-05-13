// ========== ЗАГРУЗКА ВИДЕО ==========

document.addEventListener('DOMContentLoaded', function() {
    const titleInput = document.getElementById('id_title');
    const videoInput = document.getElementById('id_video_file');
    const videoFileName = document.getElementById('videoFileName');
    const thumbnailInput = document.getElementById('id_thumbnail');
    const thumbnailFileName = document.getElementById('thumbnailFileName');
    const thumbnailPreview = document.getElementById('thumbnailPreview');
    const previewContainer = document.getElementById('previewContainer');
    const submitBtn = document.getElementById('submitBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // Функция проверки активности кнопки
    function checkFormValidity() {
        const hasTitle = titleInput.value.trim().length > 0;
        const hasVideo = videoInput.files.length > 0;
        
        if (hasTitle && hasVideo) {
            submitBtn.disabled = false;
            submitBtn.classList.add('active');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.remove('active');
        }
    }
    
    // Название видео
    if (titleInput) {
        titleInput.addEventListener('input', checkFormValidity);
    }
    
    // Видео файл
    if (videoInput) {
        videoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                videoFileName.textContent = file.name;
                videoFileName.style.color = 'var(--text-primary)';
                
                // Проверка размера
                if (file.size > 500 * 1024 * 1024) {
                    alert('⚠️ Файл больше 500 MB. Загрузка может быть долгой.');
                }
                
                // Проверка формата
                const ext = file.name.split('.').pop().toLowerCase();
                const validExt = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
                if (!validExt.includes(ext)) {
                    alert('❌ Неподдерживаемый формат. Используйте: MP4, MOV, AVI, MKV, WebM');
                    videoInput.value = '';
                    videoFileName.textContent = 'Файл не выбран';
                    videoFileName.style.color = 'var(--text-secondary)';
                }
            } else {
                videoFileName.textContent = 'Файл не выбран';
                videoFileName.style.color = 'var(--text-secondary)';
            }
            checkFormValidity();
        });
    }
    
    // Превью
    if (thumbnailInput) {
        thumbnailInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                thumbnailFileName.textContent = file.name;
                thumbnailFileName.style.color = 'var(--text-primary)';
                
                if (!file.type.match('image.*')) {
                    alert('❌ Пожалуйста, выберите изображение');
                    thumbnailInput.value = '';
                    thumbnailFileName.textContent = 'Будет взято из видео';
                    thumbnailFileName.style.color = 'var(--text-secondary)';
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('⚠️ Изображение больше 5 MB');
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    thumbnailPreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                thumbnailFileName.textContent = 'Будет взято из видео';
                thumbnailFileName.style.color = 'var(--text-secondary)';
                previewContainer.style.display = 'none';
            }
        });
    }
    
    // Отправка формы с реальным прогрессом
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Отменяем стандартную отправку
            
            const videoFile = videoInput.files[0];
            
            if (videoFile && videoFile.size > 500 * 1024 * 1024) {
                if (!confirm('⚠️ Файл очень большой. Загрузка может занять много времени. Продолжить?')) {
                    return;
                }
            }
            
            // Собираем данные формы
            const formData = new FormData(uploadForm);
            
            // Показываем прогресс
            submitBtn.disabled = true;
            uploadProgress.style.display = 'block';
            progressText.style.display = 'block';
            progressBar.style.width = '0%';
            progressText.textContent = '0% загружено';
            
            // Создаем AJAX запрос
            const xhr = new XMLHttpRequest();
            
            // Отслеживаем прогресс загрузки
            xhr.upload.addEventListener('progress', function(event) {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.textContent = percentComplete + '% загружено';
                }
            });
            
            // Когда загрузка завершена
            xhr.addEventListener('load', function() {
                if (xhr.status === 200) {
                    progressBar.style.width = '100%';
                    progressText.textContent = 'Загрузка завершена! Перенаправление...';
                    
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.redirect_url) {
                            // Перенаправляем на страницу видео
                            setTimeout(() => {
                                window.location.href = response.redirect_url;
                            }, 1000);
                        } else {
                            // Или на главную
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 1000);
                        }
                    } catch (e) {
                        // Если ответ не JSON, просто редирект на главную
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1000);
                    }
                } else {
                    alert('❌ Ошибка загрузки. Код ошибки: ' + xhr.status);
                    submitBtn.disabled = false;
                    uploadProgress.style.display = 'none';
                    progressText.style.display = 'none';
                }
            });
            
            // Обработка ошибок сети
            xhr.addEventListener('error', function() {
                alert('❌ Ошибка соединения. Проверьте интернет и попробуйте снова.');
                submitBtn.disabled = false;
                uploadProgress.style.display = 'none';
                progressText.style.display = 'none';
            });
            
            // Таймаут
            xhr.addEventListener('timeout', function() {
                alert('❌ Таймаут загрузки. Попробуйте снова.');
                submitBtn.disabled = false;
                uploadProgress.style.display = 'none';
                progressText.style.display = 'none';
            });
            
            xhr.timeout = 300000; // 5 минут таймаут
            
            // Открываем соединение и отправляем
            xhr.open('POST', uploadForm.action, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            xhr.send(formData);
        });
    }
});