            document.addEventListener('DOMContentLoaded', function() {
            const flashMessages = document.querySelectorAll('.flash-message');
            
            flashMessages.forEach(message => {
                // Автоматическое скрытие через 5 секунд
                const autoRemoveTimer = setTimeout(() => {
                    hideMessage(message);
                }, 5000);
                
                // Закрытие по клику на сообщение
                message.addEventListener('click', function() {
                    clearTimeout(autoRemoveTimer);
                    hideMessage(message);
                });
                
                // Закрытие по клику на кнопку
                const closeBtn = message.querySelector('.close-btn');
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    clearTimeout(autoRemoveTimer);
                    hideMessage(message);
                });
            });
            
            function hideMessage(element) {
                element.style.opacity = '0';
                element.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    element.remove();
                    
                    // Удаляем контейнер если больше нет сообщений
                    const container = document.querySelector('.flash-container');
                    if (container && container.children.length === 0) {
                        container.remove();
                    }
                }, 500);
            }
        });