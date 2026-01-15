// ========================================
// FINANCE PRO - MOBILE ENHANCEMENTS v1.1
// CORRIGIDO - Adicione ao final do <script> do HTML
// ========================================

// ========================================
// HAPTIC FEEDBACK (Vibração)
// ========================================

function hapticFeedback(type = 'light') {
    if (!navigator.vibrate) return;
    
    const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        double: [10, 50, 10],
        success: [10, 50, 10, 50, 10],
        error: [50, 100, 50]
    };
    
    navigator.vibrate(patterns[type] || patterns.light);
}

// Adicionar feedback em botões
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button, .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hapticFeedback('light');
            btn.classList.add('haptic-feedback');
            setTimeout(() => btn.classList.remove('haptic-feedback'), 100);
        });
    });
});

// ========================================
// SWIPE ENTRE TABS
// ========================================

let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50;

function handleSwipe() {
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
        const tabs = ['dashboard', 'receitas', 'poupanca', 'gastos-fixos', 'assinaturas', 'parcelamentos', 'dividas', 'graficos'];
        const currentTab = tabs.find(tab => !document.getElementById(tab).classList.contains('hidden'));
        const currentIndex = tabs.indexOf(currentTab);
        
        if (diff > 0 && currentIndex < tabs.length - 1) {
            // Swipe left - próxima tab
            const nextTab = tabs[currentIndex + 1];
            const tabButton = Array.from(document.querySelectorAll('.tab')).find(btn => 
                btn.textContent.toLowerCase().includes(nextTab.split('-')[0])
            );
            if (tabButton) {
                hapticFeedback('light');
                tabButton.click();
            }
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - tab anterior
            const prevTab = tabs[currentIndex - 1];
            const tabButton = Array.from(document.querySelectorAll('.tab')).find(btn => 
                btn.textContent.toLowerCase().includes(prevTab.split('-')[0])
            );
            if (tabButton) {
                hapticFeedback('light');
                tabButton.click();
            }
        }
    }
}

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

// ========================================
// PULL TO REFRESH
// ========================================

let pullStartY = 0;
let pullDistance = 0;
const PULL_THRESHOLD = 100;

function createPullIndicator() {
    if (document.querySelector('.pull-to-refresh')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh';
    indicator.innerHTML = '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>';
    document.body.appendChild(indicator);
}

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        pullStartY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (window.scrollY === 0 && pullStartY > 0) {
        pullDistance = e.touches[0].clientY - pullStartY;
        
        if (pullDistance > 0 && pullDistance < PULL_THRESHOLD * 2) {
            const indicator = document.querySelector('.pull-to-refresh');
            if (indicator) {
                indicator.classList.add('active');
                indicator.style.transform = `translateX(-50%) scale(${Math.min(1, pullDistance / PULL_THRESHOLD)})`;
            }
        }
    }
}, { passive: true });

document.addEventListener('touchend', () => {
    const indicator = document.querySelector('.pull-to-refresh');
    
    if (pullDistance > PULL_THRESHOLD) {
        hapticFeedback('success');
        
        if (indicator) {
            indicator.querySelector('svg').style.animation = 'rotate 1s linear infinite';
        }
        
        // Recarregar dados (se função existir)
        setTimeout(() => {
            if (typeof renderAll === 'function') {
                renderAll();
            }
            if (typeof mostrarFeedback === 'function') {
                mostrarFeedback('✅ Dados atualizados!', 'success');
            }
            
            if (indicator) {
                indicator.classList.remove('active');
                indicator.style.transform = 'translateX(-50%) scale(0)';
                indicator.querySelector('svg').style.animation = 'none';
            }
        }, 1000);
    } else {
        if (indicator) {
            indicator.classList.remove('active');
            indicator.style.transform = 'translateX(-50%) scale(0)';
        }
    }
    
    pullStartY = 0;
    pullDistance = 0;
}, { passive: true });

// ========================================
// DETECTOR DE CONEXÃO (Online/Offline)
// ========================================

function createOfflineIndicator() {
    if (document.querySelector('.offline-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'offline-indicator';
    indicator.textContent = '📡 Sem conexão - Modo Offline';
    document.body.appendChild(indicator);
    
    return indicator;
}

window.addEventListener('online', () => {
    const indicator = document.querySelector('.offline-indicator');
    if (indicator) {
        indicator.textContent = '✅ Conexão restaurada!';
        indicator.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        indicator.classList.add('show');
        
        hapticFeedback('success');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 3000);
    }
});

window.addEventListener('offline', () => {
    const indicator = createOfflineIndicator();
    indicator.classList.add('show');
    hapticFeedback('error');
});

// Verificar conexão inicial
if (!navigator.onLine) {
    const indicator = createOfflineIndicator();
    indicator.classList.add('show');
}

// ========================================
// ORIENTATION CHANGE
// ========================================

window.addEventListener('orientationchange', () => {
    // Recarregar gráficos após rotação (se funções existirem)
    setTimeout(() => {
        const graficosTab = document.getElementById('graficos');
        const poupancaTab = document.getElementById('poupanca');
        
        if (graficosTab && !graficosTab.classList.contains('hidden') && typeof renderCharts === 'function') {
            renderCharts();
        }
        if (poupancaTab && !poupancaTab.classList.contains('hidden') && typeof renderPoupancaChart === 'function') {
            renderPoupancaChart();
        }
    }, 300);
});

// ========================================
// PREVENÇÃO DE ZOOM (Opcional)
// ========================================

document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
});

document.addEventListener('gestureend', function (e) {
    e.preventDefault();
});

// Prevenir double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function (e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// ========================================
// LAZY LOADING DE IMAGENS
// ========================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// ========================================
// DEBOUNCE para Performance
// ========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar debounce em renderizações (se função existir)
if (typeof renderAll === 'function') {
    const debouncedRenderAll = debounce(renderAll, 300);
    window.debouncedRenderAll = debouncedRenderAll; // Exportar para uso global
}

// ========================================
// KEYBOARD MOBILE FIXES
// ========================================

// Esconder teclado ao scrollar
let lastScrollTop = 0;
window.addEventListener('scroll', function() {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScrollTop && document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
    }
    lastScrollTop = st <= 0 ? 0 : st;
}, { passive: true });

// Fix viewport ao abrir teclado
const originalHeight = window.innerHeight;
window.addEventListener('resize', () => {
    if (window.innerHeight < originalHeight - 100) {
        // Teclado aberto
        document.body.style.height = originalHeight + 'px';
    } else {
        // Teclado fechado
        document.body.style.height = '';
    }
});

// ========================================
// INSTALAÇÃO PWA - Melhorias
// ========================================

// Mostrar botão install após algum tempo
setTimeout(() => {
    const installBtn = document.getElementById('install-button');
    if (installBtn && installBtn.style.display !== 'block') {
        // Verificar se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            installBtn.style.display = 'none';
        }
    }
}, 5000);

// ========================================
// BACKGROUND SYNC (quando voltar online) - CORRIGIDO!
// ========================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
        .then(registration => {
            if ('sync' in registration) {
                return registration.sync.register('sync-finances');
            }
        })
        .then(() => console.log('📊 Background sync registrado'))
        .catch(err => console.log('❌ Background sync error:', err));
}

// ========================================
// SHARE API (Compartilhar dados)
// ========================================

function shareFinances() {
    if (!navigator.share) {
        if (typeof mostrarFeedback === 'function') {
            mostrarFeedback('⚠️ Compartilhamento não disponível neste dispositivo', 'warning');
        }
        return;
    }
    
    // Verificar se funções necessárias existem
    if (typeof calcularTotais !== 'function' || typeof getMonthName !== 'function' || typeof formatMoney !== 'function') {
        console.error('Funções necessárias não encontradas para compartilhamento');
        return;
    }
    
    const totais = calcularTotais();
    const mes = getMonthName(currentMonth);
    const texto = `Finance Pro - ${mes} ${currentYear}
💰 Receitas: ${formatMoney(totais.totalReceitas)}
💳 Despesas: ${formatMoney(totais.totalDespesas)}
📊 Saldo: ${formatMoney(totais.saldo)}`;
    
    navigator.share({
        title: 'Finance Pro - Resumo',
        text: texto
    }).then(() => {
        hapticFeedback('success');
        if (typeof mostrarFeedback === 'function') {
            mostrarFeedback('✅ Compartilhado com sucesso!', 'success');
        }
    }).catch(err => {
        console.log('Compartilhamento cancelado:', err);
    });
}

// Adicionar botão de compartilhar (opcional)
function addShareButton() {
    if (!navigator.share) return;
    if (document.getElementById('share-button')) return; // Evitar duplicatas
    
    const shareBtn = document.createElement('button');
    shareBtn.id = 'share-button';
    shareBtn.className = 'btn btn-sm';
    shareBtn.innerHTML = '📤 Compartilhar';
    shareBtn.style.cssText = 'position: fixed; bottom: 5rem; right: 2rem; z-index: 999;';
    shareBtn.onclick = shareFinances;
    
    document.body.appendChild(shareBtn);
}

// ========================================
// INICIALIZAÇÃO MOBILE
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Mobile Enhancements v1.1 carregados!');
    
    createPullIndicator();
    
    // Detectar se é mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log('📱 Dispositivo móvel detectado');
        document.body.classList.add('mobile');
        
        // Desabilitar context menu (menu ao segurar)
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('.btn')) {
                e.preventDefault();
            }
        });
        
        // Adicionar botão de compartilhar (opcional)
        // addShareButton();
    }
    
    // Animação de entrada
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});

// ========================================
// PERFORMANCE MONITORING
// ========================================

if (window.performance) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Page load time: ${pageLoadTime}ms`);
            
            if (pageLoadTime > 3000) {
                console.warn('⚠️ Página demorou mais de 3s para carregar');
            }
        }, 0);
    });
}

// Exportar funções para uso global
window.hapticFeedback = hapticFeedback;
window.shareFinances = shareFinances;

console.log('✅ Mobile JavaScript v1.1 carregado!');