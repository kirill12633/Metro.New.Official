document.addEventListener('DOMContentLoaded', function() {
    // Аккордеон FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // Фильтрация по категориям
    const categoryBtns = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            faqCategories.forEach(cat => {
                cat.style.display = (category === 'all' || cat.dataset.category === category) ? 'block' : 'none';
            });
        });
    });

    // Поиск по FAQ
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            if(question.includes(searchTerm) || answer.includes(searchTerm)){
                item.style.display = 'block';
                item.closest('.faq-category').style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Автоматический год в футере
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // reCAPTCHA
    grecaptcha.ready(function() {
        grecaptcha.execute('6LfhAZkrAAAAAO1NxGCMX1J2HKiDp01FW9AuHR7r', {action: 'homepage'});
    });
});
