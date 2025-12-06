/**
 * Web APIs Demonstration
 * Demonstrates usage of Geolocation, Speech Synthesis, Battery, Navigator, and Clipboard APIs
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================================================
    // Geolocation API
    // ============================================================================
    
    const getLocationBtn = document.getElementById('getLocationBtn');
    const locationResult = document.getElementById('locationResult');
    
    if (getLocationBtn && locationResult) {
        getLocationBtn.addEventListener('click', function() {
            if (!navigator.geolocation) {
                locationResult.innerHTML = '<div class="alert alert-danger">Геолокация не поддерживается вашим браузером.</div>';
                return;
            }
            
            getLocationBtn.disabled = true;
            getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Получение...';
            
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const accuracy = position.coords.accuracy;
                    
                    let html = '<div class="alert alert-success">';
                    html += '<h6><i class="fas fa-check-circle"></i> Местоположение получено:</h6>';
                    html += '<p class="mb-1"><strong>Широта:</strong> ' + lat.toFixed(6) + '°</p>';
                    html += '<p class="mb-1"><strong>Долгота:</strong> ' + lon.toFixed(6) + '°</p>';
                    html += '<p class="mb-1"><strong>Точность:</strong> ±' + Math.round(accuracy) + ' метров</p>';
                    html += '<p class="mb-0"><a href="https://www.google.com/maps?q=' + lat + ',' + lon + '" target="_blank" class="btn btn-sm btn-primary mt-2">';
                    html += '<i class="fas fa-external-link-alt"></i> Открыть в Google Maps</a></p>';
                    html += '</div>';
                    
                    locationResult.innerHTML = html;
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Получить местоположение';
                },
                function(error) {
                    let errorMsg = 'Ошибка получения местоположения: ';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg += 'Пользователь отклонил запрос геолокации.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg += 'Информация о местоположении недоступна.';
                            break;
                        case error.TIMEOUT:
                            errorMsg += 'Время ожидания запроса истекло.';
                            break;
                        default:
                            errorMsg += 'Произошла неизвестная ошибка.';
                            break;
                    }
                    locationResult.innerHTML = '<div class="alert alert-danger">' + errorMsg + '</div>';
                    getLocationBtn.disabled = false;
                    getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Получить местоположение';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }
    
    // ============================================================================
    // Speech Synthesis API
    // ============================================================================
    
    const speakBtn = document.getElementById('speakBtn');
    const stopSpeakBtn = document.getElementById('stopSpeakBtn');
    const speechText = document.getElementById('speechText');
    const speechRate = document.getElementById('speechRate');
    const speechPitch = document.getElementById('speechPitch');
    const rateValue = document.getElementById('rateValue');
    const pitchValue = document.getElementById('pitchValue');
    
    if (speechRate && rateValue) {
        speechRate.addEventListener('input', function() {
            rateValue.textContent = this.value;
        });
    }
    
    if (speechPitch && pitchValue) {
        speechPitch.addEventListener('input', function() {
            pitchValue.textContent = this.value;
        });
    }
    
    if (speakBtn && speechText) {
        speakBtn.addEventListener('click', function() {
            const text = speechText.value.trim();
            if (!text) {
                alert('Пожалуйста, введите текст для озвучивания.');
                return;
            }
            
            if (!('speechSynthesis' in window)) {
                alert('Синтез речи не поддерживается вашим браузером.');
                return;
            }
            
            // Stop any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = parseFloat(speechRate.value) || 1;
            utterance.pitch = parseFloat(speechPitch.value) || 1;
            utterance.lang = 'ru-RU';
            
            utterance.onstart = function() {
                speakBtn.disabled = true;
                speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Озвучивание...';
            };
            
            utterance.onend = function() {
                speakBtn.disabled = false;
                speakBtn.innerHTML = '<i class="fas fa-play"></i> Озвучить';
            };
            
            utterance.onerror = function(event) {
                alert('Ошибка синтеза речи: ' + event.error);
                speakBtn.disabled = false;
                speakBtn.innerHTML = '<i class="fas fa-play"></i> Озвучить';
            };
            
            window.speechSynthesis.speak(utterance);
        });
    }
    
    if (stopSpeakBtn) {
        stopSpeakBtn.addEventListener('click', function() {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                if (speakBtn) {
                    speakBtn.disabled = false;
                    speakBtn.innerHTML = '<i class="fas fa-play"></i> Озвучить';
                }
            }
        });
    }
    
    // ============================================================================
    // Battery API
    // ============================================================================
    
    const getBatteryBtn = document.getElementById('getBatteryBtn');
    const batteryResult = document.getElementById('batteryResult');
    
    if (getBatteryBtn && batteryResult) {
        getBatteryBtn.addEventListener('click', async function() {
            try {
                if (!navigator.getBattery) {
                    batteryResult.innerHTML = '<div class="alert alert-warning">Battery API не поддерживается вашим браузером.</div>';
                    return;
                }
                
                getBatteryBtn.disabled = true;
                getBatteryBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Проверка...';
                
                const battery = await navigator.getBattery();
                
                const level = Math.round(battery.level * 100);
                const charging = battery.charging;
                const chargingTime = battery.chargingTime !== Infinity ? Math.round(battery.chargingTime / 60) : null;
                const dischargingTime = battery.dischargingTime !== Infinity ? Math.round(battery.dischargingTime / 60) : null;
                
                let html = '<div class="alert alert-info">';
                html += '<h6><i class="fas fa-battery-full"></i> Информация о батарее:</h6>';
                html += '<p class="mb-1"><strong>Уровень заряда:</strong> ' + level + '%</p>';
                html += '<div class="progress mb-2" style="height: 20px;">';
                const progressBarClass = level > 50 ? 'bg-success' : (level > 20 ? 'bg-warning' : 'bg-danger');
                html += '<div class="progress-bar ' + progressBarClass + '" role="progressbar" style="width: ' + level + '%">' + level + '%</div>';
                html += '</div>';
                const chargingStatus = charging ? '<span class="text-success">Заряжается</span>' : '<span class="text-warning">Разряжается</span>';
                html += '<p class="mb-1"><strong>Статус:</strong> ' + chargingStatus + '</p>';
                if (chargingTime !== null) {
                    html += '<p class="mb-1"><strong>Время до полной зарядки:</strong> ' + chargingTime + ' минут</p>';
                }
                if (dischargingTime !== null) {
                    html += '<p class="mb-0"><strong>Время до разрядки:</strong> ' + dischargingTime + ' минут</p>';
                }
                html += '</div>';
                
                batteryResult.innerHTML = html;
                getBatteryBtn.disabled = false;
                getBatteryBtn.innerHTML = '<i class="fas fa-battery-half"></i> Проверить батарею';
                
                // Listen for battery changes
                battery.addEventListener('chargingchange', function() {
                    if (batteryResult.innerHTML) {
                        getBatteryBtn.click();
                    }
                });
                
                battery.addEventListener('levelchange', function() {
                    if (batteryResult.innerHTML) {
                        getBatteryBtn.click();
                    }
                });
            } catch (error) {
                batteryResult.innerHTML = '<div class="alert alert-danger">Ошибка получения информации о батарее: ' + error.message + '</div>';
                getBatteryBtn.disabled = false;
                getBatteryBtn.innerHTML = '<i class="fas fa-battery-half"></i> Проверить батарею';
            }
        });
    }
    
    // ============================================================================
    // Navigator API
    // ============================================================================
    
    const getNavigatorBtn = document.getElementById('getNavigatorBtn');
    const navigatorResult = document.getElementById('navigatorResult');
    
    if (getNavigatorBtn && navigatorResult) {
        getNavigatorBtn.addEventListener('click', function() {
            const info = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                languages: navigator.languages ? navigator.languages.join(', ') : 'N/A',
                cookieEnabled: navigator.cookieEnabled ? 'Да' : 'Нет',
                onLine: navigator.onLine ? 'Да' : 'Нет',
                hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
                maxTouchPoints: navigator.maxTouchPoints || 0,
                deviceMemory: navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A',
                connection: null
            };
            
            // Network Information API
            if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                info.connection = {
                    effectiveType: connection.effectiveType || 'N/A',
                    downlink: connection.downlink ? connection.downlink + ' Mbps' : 'N/A',
                    rtt: connection.rtt ? connection.rtt + ' ms' : 'N/A',
                    saveData: connection.saveData ? 'Да' : 'Нет'
                };
            }
            
            let html = '<div class="alert alert-info">';
            html += '<h6><i class="fas fa-info-circle"></i> Информация о браузере:</h6>';
            html += '<p class="mb-1"><strong>User Agent:</strong> <small>' + info.userAgent + '</small></p>';
            html += '<p class="mb-1"><strong>Платформа:</strong> ' + info.platform + '</p>';
            html += '<p class="mb-1"><strong>Язык:</strong> ' + info.language + '</p>';
            html += '<p class="mb-1"><strong>Языки:</strong> ' + info.languages + '</p>';
            html += '<p class="mb-1"><strong>Cookies включены:</strong> ' + info.cookieEnabled + '</p>';
            const onlineStatus = info.onLine ? '<span class="text-success">Да</span>' : '<span class="text-danger">Нет</span>';
            html += '<p class="mb-1"><strong>Онлайн:</strong> ' + onlineStatus + '</p>';
            html += '<p class="mb-1"><strong>Ядер CPU:</strong> ' + info.hardwareConcurrency + '</p>';
            html += '<p class="mb-1"><strong>Точек касания:</strong> ' + info.maxTouchPoints + '</p>';
            html += '<p class="mb-1"><strong>Память устройства:</strong> ' + info.deviceMemory + '</p>';
            
            if (info.connection) {
                html += '<hr><h6>Информация о сети:</h6>';
                html += '<p class="mb-1"><strong>Тип соединения:</strong> ' + info.connection.effectiveType + '</p>';
                html += '<p class="mb-1"><strong>Скорость загрузки:</strong> ' + info.connection.downlink + '</p>';
                html += '<p class="mb-1"><strong>Задержка (RTT):</strong> ' + info.connection.rtt + '</p>';
                html += '<p class="mb-0"><strong>Экономия данных:</strong> ' + info.connection.saveData + '</p>';
            }
            
            html += '</div>';
            navigatorResult.innerHTML = html;
        });
    }
    
    // ============================================================================
    // Clipboard API
    // ============================================================================
    
    const copyToClipboardBtn = document.getElementById('copyToClipboardBtn');
    const pasteFromClipboardBtn = document.getElementById('pasteFromClipboardBtn');
    const clipboardText = document.getElementById('clipboardText');
    const clipboardResult = document.getElementById('clipboardResult');
    
    if (copyToClipboardBtn && clipboardText && clipboardResult) {
        copyToClipboardBtn.addEventListener('click', async function() {
            try {
                if (!navigator.clipboard) {
                    clipboardResult.innerHTML = '<div class="alert alert-warning">Clipboard API не поддерживается. Используйте старый метод.</div>';
                    // Fallback for older browsers
                    clipboardText.select();
                    document.execCommand('copy');
                    clipboardResult.innerHTML = '<div class="alert alert-success">Текст скопирован (старый метод).</div>';
                    return;
                }
                
                await navigator.clipboard.writeText(clipboardText.value);
                clipboardResult.innerHTML = '<div class="alert alert-success"><i class="fas fa-check"></i> Текст успешно скопирован в буфер обмена!</div>';
            } catch (error) {
                clipboardResult.innerHTML = '<div class="alert alert-danger">Ошибка копирования: ' + error.message + '</div>';
            }
        });
    }
    
    if (pasteFromClipboardBtn && clipboardResult) {
        pasteFromClipboardBtn.addEventListener('click', async function() {
            try {
                if (!navigator.clipboard) {
                    clipboardResult.innerHTML = '<div class="alert alert-warning">Clipboard API не поддерживается.</div>';
                    return;
                }
                
                const text = await navigator.clipboard.readText();
                if (clipboardText) {
                    clipboardText.value = text;
                }
                clipboardResult.innerHTML = '<div class="alert alert-success"><i class="fas fa-check"></i> Текст вставлен из буфера обмена: "' + text + '"</div>';
            } catch (error) {
                clipboardResult.innerHTML = '<div class="alert alert-danger">Ошибка вставки: ' + error.message + '. Возможно, нет разрешения на чтение буфера.</div>';
            }
        });
    }
});

