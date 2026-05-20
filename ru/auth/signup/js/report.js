// ============================================
// МОДУЛЬ ОТПРАВКИ ЖАЛОБ И ОШИБОК
// ============================================

var ReportSystem = {
    
    init: function() {
        this.createModal();
        this.bindEvents();
        console.log('📝 Модуль жалоб загружен');
    },
    
    createModal: function() {
        var html = '';
        html += '<div id="reportModal">';
        html += '<div class="report-modal-content">';
        
        // Заголовок
        html += '<div class="report-modal-header">';
        html += '<div class="report-modal-icon"><i class="fas fa-bug"></i></div>';
        html += '<div>';
        html += '<h3 class="report-modal-title">Сообщить об ошибке</h3>';
        html += '<p class="report-modal-subtitle">Помогите нам стать лучше</p>';
        html += '</div>';
        html += '<button class="report-modal-close" onclick="ReportSystem.close()">&times;</button>';
        html += '</div>';
        
        // Форма
        html += '<form id="reportForm">';
        
        // Тип проблемы
        html += '<div style="margin-bottom:16px;">';
        html += '<label class="form-label">Тип проблемы</label>';
        html += '<div class="report-type-grid">';
        html += '<label class="report-type-option"><input type="radio" name="errorType" value="Баг" checked><span>🐛 Баг</span></label>';
        html += '<label class="report-type-option"><input type="radio" name="errorType" value="Безопасность"><span>🔒 Безопасность</span></label>';
        html += '<label class="report-type-option"><input type="radio" name="errorType" value="Идея"><span>💡 Идея</span></label>';
        html += '<label class="report-type-option"><input type="radio" name="errorType" value="Другое"><span>❓ Другое</span></label>';
        html += '</div></div>';
        
        // Описание
        html += '<div style="margin-bottom:16px;">';
        html += '<label class="form-label">Опишите проблему</label>';
        html += '<textarea id="errorDescription" class="report-textarea" placeholder="Что случилось? Что вы делали перед этим?"></textarea>';
        html += '<div class="report-char-info">';
        html += '<span id="charCount">0/500</span>';
        html += '<span><i class="fas fa-shield-alt"></i> Данные защищены</span>';
        html += '</div></div>';
        
        // Кнопки
        html += '<div class="report-buttons">';
        html += '<button type="button" class="report-btn-cancel" onclick="ReportSystem.close()">Отмена</button>';
        html += '<button type="submit" class="report-btn-submit"><i class="fas fa-paper-plane"></i> Отправить</button>';
        html += '</div>';
        
        html += '</form></div></div>';
        
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Счётчик символов
        var textarea = document.getElementById('errorDescription');
        if (textarea) {
            textarea.addEventListener('input', function() {
                var count = this.value.length;
                document.getElementById('charCount').textContent = count + '/500';
            });
        }
        
        // Отправка
        var form = document.getElementById('reportForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                ReportSystem.submit();
            });
        }
        
        // Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') ReportSystem.close();
        });
        
        // Клик на фон
        var modal = document.getElementById('reportModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) ReportSystem.close();
            });
        }
    },
    
    bindEvents: function() {
        var btn = document.getElementById('reportErrorFooter');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                ReportSystem.open();
            });
        }
    },
    
    open: function() {
        var modal = document.getElementById('reportModal');
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close: function() {
        var modal = document.getElementById('reportModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
        var form = document.getElementById('reportForm');
        if (form) form.reset();
        var counter = document.getElementById('charCount');
        if (counter) counter.textContent = '0/500';
    },
    
    submit: function() {
        var errorType = document.querySelector('input[name="errorType"]:checked');
        var description = document.getElementById('errorDescription');
        
        if (!description || !description.value || description.value.length < 10) {
            alert('Пожалуйста, опишите проблему подробнее (минимум 10 символов)');
            return;
        }
        
        var type = errorType ? errorType.value : 'Баг';
        var desc = description.value;
        
        var btn = document.querySelector('.report-btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        
        var self = this;
        
        // Пробуем Firestore
        if (window.firebaseDB && window.firebaseDB.db) {
            var db = window.firebaseDB.db;
            
            window.firebaseDB.addDoc(
                window.firebaseDB.collection(db, 'error_reports'),
                {
                    type: type,
                    description: desc,
                    url: window.location.href,
                    userAgent: navigator.userAgent,
                    timestamp: window.firebaseDB.serverTimestamp(),
                    language: navigator.language,
                    screenResolution: screen.width + 'x' + screen.height
                }
            ).then(function() {
                self.showSuccess();
            }).catch(function() {
                self.sendByEmail(type, desc);
            }).finally(function() {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить';
            });
        } else {
            this.sendByEmail(type, desc);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить';
        }
    },
    
    showSuccess: function() {
        this.close();
        setTimeout(function() {
            alert('✅ Спасибо! Ваш отчёт отправлен.');
        }, 300);
    },
    
    sendByEmail: function(type, description) {
        var subject = 'Отчёт об ошибке: ' + type;
        var body = 'Тип проблемы: ' + type + '\n\n';
        body += 'Описание:\n' + description + '\n\n';
        body += '------------------------\n';
        body += 'URL: ' + window.location.href + '\n';
        body += 'Время: ' + new Date().toLocaleString() + '\n';
        body += 'Браузер: ' + navigator.userAgent + '\n';
        body += 'Язык: ' + navigator.language + '\n';
        body += 'Экран: ' + screen.width + 'x' + screen.height;
        
        window.location.href = 'mailto:metro.new.help@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
};

// Запуск
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { ReportSystem.init(); });
} else {
    ReportSystem.init();
}
