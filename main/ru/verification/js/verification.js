async function sendVerificationCode(email) {
    const sendBtn = document.getElementById('sendCodeBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    
    try {
        // Используем window.supabase из конфига
        const { error } = await window.supabase.auth.signInWithOtp({
            email: email,
            options: {
                emailRedirectTo: 'https://kirill12633.github.io/Metro.New.Official/main/ru/verification/verified.email.html'
            }
        });
        
        if (error) {
            if (error.message.includes('rate limit')) {
                throw new Error('Слишком много запросов. Подождите 1 минуту.');
            }
            throw error;
        }
        
        // Успех
        window.verificationState.currentEmail = email;
        showNotification('✅ Код отправлен', `Проверьте почту ${email}`, 'success');
        
        // Переход к шагу 2
        goToStep(2);
        document.getElementById('currentEmail').textContent = email;
        startCountdown();
        
    } catch (error) {
        console.error('Send error:', error);
        showNotification('❌ Ошибка', error.message || 'Не удалось отправить код', 'error');
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить код';
    }
}
