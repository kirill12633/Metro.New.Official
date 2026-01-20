document.addEventListener('DOMContentLoaded', () => {

    // Аккордеон FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });

    // Фильтр категорий
    const categoryBtns = document.querySelectorAll('.category-btn');
    const faqCategories = document.querySelectorAll('.faq-category');

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.category;
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            faqCategories.forEach(faq => {
                faq.style.display = (cat === 'all' || faq.dataset.category === cat) ? 'block' : 'none';
            });
        });
    });

    // Поиск по FAQ
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        faqItems.forEach(item => {
            const q = item.querySelector('.faq-question').textContent.toLowerCase();
            const a = item.querySelector('.faq-answer').textContent.toLowerCase();
            if(q.includes(term) || a.includes(term)){
                item.style.display = 'block';
                item.closest('.faq-category').style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Автоматический год в футере
    const year = new Date().getFullYear();
    document.getElementById('currentYear').textContent = year;

    // reCAPTCHA
    if(typeof grecaptcha !== 'undefined'){
        grecaptcha.ready(() => {
            grecaptcha.execute('6LfhAZkrAAAAAO1NxGCMX1J2HKiDp01FW9AuHR7r', {action:'homepage'});
        });
    }
});
