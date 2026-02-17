// ============================================
// زادي — Zadi (za-di.com)
// Frontend Application
// ============================================

let currentDhikr = null;
let selectedCategory = '';
let selectedCardStyle = 'royal';

// ============ Category Selection ============

function selectCategory(btn, category) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCategory = category;
    getRandomDhikr();
}

// ============ Fetch Random Dhikr ============

async function getRandomDhikr() {
    const card = document.getElementById('dhikrCard');
    const textEl = document.getElementById('dhikrText');
    const sourceEl = document.querySelector('.source-text');
    const typeEl = document.getElementById('cardType');
    const categoryEl = document.getElementById('cardCategory');
    const btn = document.getElementById('mainBtn');

    textEl.classList.add('loading');
    btn.disabled = true;

    try {
        let url = '/api/random-dhikr';
        if (selectedCategory) url += `?category=${selectedCategory}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            currentDhikr = data;
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';

            setTimeout(() => {
                textEl.textContent = data.text;
                textEl.classList.remove('loading');
                sourceEl.textContent = data.source;

                typeEl.innerHTML = data.type === 'quran'
                    ? '<span class="type-badge quran">قرآن كريم</span>'
                    : '<span class="type-badge dhikr">ذكر مأثور</span>';

                if (data.category) categoryEl.textContent = data.category;

                card.style.transition = 'all 0.4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 200);
        }
    } catch (err) {
        textEl.textContent = 'حدث خطأ في الاتصال، حاول مرة أخرى';
        textEl.classList.remove('loading');
    }
    btn.disabled = false;
}

// ============ Copy & Share ============

function copyDhikr() {
    if (!currentDhikr) { showToast('اضغط "تزوَّد" أولاً'); return; }
    const text = `${currentDhikr.text}\n\n— ${currentDhikr.source}\n\nزادي 🕌 za-di.com`;
    navigator.clipboard.writeText(text).then(() => showToast('تم النسخ بنجاح ✓')).catch(() => {
        const ta = document.createElement('textarea'); ta.value = text;
        document.body.appendChild(ta); ta.select(); document.execCommand('copy');
        document.body.removeChild(ta); showToast('تم النسخ بنجاح ✓');
    });
}

function shareDhikr() {
    if (!currentDhikr) { showToast('اضغط "تزوَّد" أولاً'); return; }
    const text = `${currentDhikr.text}\n\n— ${currentDhikr.source}\n\nزادي 🕌 za-di.com`;
    if (navigator.share) {
        navigator.share({ title: 'زادي — Zadi', text }).catch(() => {});
    } else { copyDhikr(); }
}

// ============ Style Picker Modal ============

function openStylePicker() {
    if (!currentDhikr) { showToast('اضغط "تزوَّد" أولاً'); return; }
    document.getElementById('stylePickerOverlay').classList.add('open');
}

function closeStylePicker(e) {
    document.getElementById('stylePickerOverlay').classList.remove('open');
}

function selectStyle(btn, style) {
    document.querySelectorAll('.style-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedCardStyle = style;
}

// ============ Card Style Definitions ============

const CARD_STYLES = {
    royal: {
        name: 'ملكي',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                ctx.fillStyle = `rgb(${10+7*Math.sin(t*Math.PI)},${22+11*Math.sin(t*Math.PI)},${40+13*Math.sin(t*Math.PI)})`;
                ctx.fillRect(0, y, w, 1);
            }
        },
        glow1: { x: 0.15, y: 0.15, color: '201,168,76', alpha: 0.008 },
        glow2: { x: 0.85, y: 0.85, color: '74,144,164', alpha: 0.006 },
        accent: '201,168,76',
        textColor: '#e8dcc8',
        sourceColor: '107,97,88',
        ornamentStyle: 'classic',
    },
    nature: {
        name: 'طبيعة',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                ctx.fillStyle = `rgb(${8+6*Math.sin(t*Math.PI)},${30+18*Math.sin(t*Math.PI)},${18+10*Math.sin(t*Math.PI)})`;
                ctx.fillRect(0, y, w, 1);
            }
        },
        glow1: { x: 0.2, y: 0.1, color: '80,180,100', alpha: 0.007 },
        glow2: { x: 0.8, y: 0.9, color: '60,140,80', alpha: 0.005 },
        accent: '120,200,120',
        textColor: '#d8ecd0',
        sourceColor: '90,130,90',
        ornamentStyle: 'leaves',
    },
    midnight: {
        name: 'ليلي',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                ctx.fillStyle = `rgb(${12+8*Math.sin(t*Math.PI)},${8+6*Math.sin(t*Math.PI)},${35+20*Math.sin(t*Math.PI)})`;
                ctx.fillRect(0, y, w, 1);
            }
        },
        glow1: { x: 0.5, y: 0.1, color: '140,120,200', alpha: 0.008 },
        glow2: { x: 0.3, y: 0.8, color: '100,80,180', alpha: 0.006 },
        accent: '160,140,220',
        textColor: '#ddd8f0',
        sourceColor: '120,110,150',
        ornamentStyle: 'stars',
    },
    marble: {
        name: 'رخامي',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                const v = 235 + 10 * Math.sin(t * Math.PI);
                ctx.fillStyle = `rgb(${v},${v-5},${v-15})`;
                ctx.fillRect(0, y, w, 1);
            }
            // Marble veins
            ctx.globalAlpha = 0.03;
            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                let x = Math.random() * w;
                let y = Math.random() * h;
                ctx.moveTo(x, y);
                for (let j = 0; j < 8; j++) {
                    x += (Math.random() - 0.5) * 200;
                    y += Math.random() * 200;
                    ctx.lineTo(x, y);
                }
                ctx.strokeStyle = '#a09080';
                ctx.lineWidth = Math.random() * 3 + 0.5;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        },
        glow1: { x: 0.2, y: 0.2, color: '180,160,120', alpha: 0.004 },
        glow2: { x: 0.8, y: 0.8, color: '160,140,100', alpha: 0.003 },
        accent: '140,120,80',
        textColor: '#2a2520',
        sourceColor: '100,90,70',
        ornamentStyle: 'classic',
    },
    sunset: {
        name: 'غروب',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                const r = 25 + 15 * Math.sin(t * Math.PI * 0.8);
                const g = 10 + 5 * Math.sin(t * Math.PI);
                const b = 35 + 20 * Math.sin(t * Math.PI * 0.6);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(0, y, w, 1);
            }
        },
        glow1: { x: 0.5, y: 0.25, color: '200,100,80', alpha: 0.007 },
        glow2: { x: 0.5, y: 0.75, color: '180,80,160', alpha: 0.005 },
        accent: '220,150,120',
        textColor: '#f0dcd0',
        sourceColor: '160,120,100',
        ornamentStyle: 'crescents',
    },
    ocean: {
        name: 'محيط',
        bg: (ctx, w, h) => {
            for (let y = 0; y < h; y++) {
                const t = y / h;
                ctx.fillStyle = `rgb(${8+5*Math.sin(t*Math.PI)},${20+14*Math.sin(t*Math.PI)},${40+20*Math.sin(t*Math.PI)})`;
                ctx.fillRect(0, y, w, 1);
            }
        },
        glow1: { x: 0.15, y: 0.2, color: '60,160,200', alpha: 0.008 },
        glow2: { x: 0.85, y: 0.8, color: '40,120,180', alpha: 0.006 },
        accent: '100,190,220',
        textColor: '#d0e8f0',
        sourceColor: '80,140,160',
        ornamentStyle: 'waves',
    },
};

// ============ Download Card ============

function downloadCard() {
    if (!currentDhikr) { showToast('اضغط "تزوَّد" أولاً'); return; }

    const style = CARD_STYLES[selectedCardStyle];
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');
    const w = 1080, h = 1920;
    canvas.width = w; canvas.height = h;

    // 1. Background gradient
    style.bg(ctx, w, h);

    // 2. Radial glows
    drawGlow(ctx, w * style.glow1.x, h * style.glow1.y, style.glow1.color, style.glow1.alpha);
    drawGlow(ctx, w * style.glow2.x, h * style.glow2.y, style.glow2.color, style.glow2.alpha);

    // 3. Ornaments per style
    drawOrnaments(ctx, w, h, style);

    // 4. Frame lines & corners
    const topY = h * 0.2, bottomY = h * 0.8;
    drawFadeLine(ctx, w, topY, style.accent);
    drawFadeLine(ctx, w, bottomY, style.accent);

    ctx.strokeStyle = `rgba(${style.accent},0.18)`;
    ctx.lineWidth = 2;
    drawLBracket(ctx, 45, topY, 55, 'tl');
    drawLBracket(ctx, w - 45, topY, 55, 'tr');
    drawLBracket(ctx, 45, bottomY, 55, 'bl');
    drawLBracket(ctx, w - 45, bottomY, 55, 'br');

    ctx.fillStyle = `rgba(${style.accent},0.22)`;
    drawDiamond(ctx, w / 2, topY, 10);
    drawDiamond(ctx, w / 2, bottomY, 10);

    ctx.fillStyle = `rgba(${style.accent},0.12)`;
    [topY, bottomY].forEach(ly => {
        ctx.beginPath(); ctx.arc(w/2 - 30, ly, 3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(w/2 + 30, ly, 3, 0, Math.PI*2); ctx.fill();
    });

    // 5. Type badge
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const typeText = currentDhikr.type === 'quran' ? '﴿ قرآن كريم ﴾' : '☽ ذكر مأثور ☽';
    ctx.font = '34px Amiri, serif';
    ctx.fillStyle = `rgba(${style.accent},0.55)`;
    ctx.fillText(typeText, w / 2, topY + 80);

    // 6. Main text
    ctx.font = '54px Amiri, serif';
    ctx.fillStyle = style.textColor;
    const lines = wrapText(ctx, currentDhikr.text, w - 160);
    const lineH = 105;
    const totalH = lines.length * lineH;
    const startY = (h / 2) - (totalH / 2) + 30;
    lines.forEach((line, i) => ctx.fillText(line, w / 2, startY + i * lineH));

    // 7. Source
    ctx.font = '30px Tajawal, Arial';
    ctx.fillStyle = `rgba(${style.sourceColor},0.8)`;
    ctx.fillText(`— ${currentDhikr.source}`, w / 2, startY + totalH + 65);

    // 8. Category
    if (currentDhikr.category) {
        ctx.font = '26px Tajawal, Arial';
        ctx.fillStyle = `rgba(${style.accent},0.3)`;
        ctx.fillText(currentDhikr.category, w / 2, startY + totalH + 115);
    }

    // 9. Branding
    ctx.font = 'bold 30px Amiri, serif';
    ctx.fillStyle = `rgba(${style.accent},0.35)`;
    ctx.fillText('زادي — za-di.com', w / 2, h - 200);
    ctx.font = '22px Tajawal, Arial';
    ctx.fillStyle = `rgba(${style.sourceColor},0.25)`;
    ctx.fillText('صدقة جارية تقنية لأمي وأمهات المسلمين', w / 2, h - 155);

    // 10. Download
    const link = document.createElement('a');
    link.download = `zadi-${selectedCardStyle}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    closeStylePicker();
    showToast('تم تحميل البطاقة ✓');
}

// ============ Drawing Helpers ============

function drawGlow(ctx, cx, cy, color, alpha) {
    for (let i = 0; i < 60; i++) {
        const t = i / 60;
        const r = 300 * (1 - t);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${alpha * (1 - t)})`;
        ctx.fill();
    }
}

function drawOrnaments(ctx, w, h, style) {
    const accent = style.accent;
    const type = style.ornamentStyle;

    if (type === 'classic' || type === 'stars') {
        // 8-pointed stars scattered
        const positions = [
            [w*0.1,h*0.08],[w*0.9,h*0.08],[w*0.1,h*0.92],[w*0.9,h*0.92],
            [w*0.5,h*0.05],[w*0.5,h*0.95],[w*0.25,h*0.5],[w*0.75,h*0.5],
        ];
        ctx.strokeStyle = `rgba(${accent},0.04)`;
        ctx.lineWidth = 1;
        positions.forEach(([x,y]) => drawStar8(ctx, x, y, 35, 17));

        if (type === 'stars') {
            // Extra smaller stars for midnight
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * w, y = Math.random() * h;
                ctx.fillStyle = `rgba(${accent},${0.01 + Math.random()*0.02})`;
                ctx.beginPath(); ctx.arc(x, y, Math.random()*2+0.5, 0, Math.PI*2); ctx.fill();
            }
        }
    }

    if (type === 'leaves') {
        // Organic leaf-like curves
        ctx.strokeStyle = `rgba(${accent},0.035)`;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
            const cx = w * (0.1 + Math.random()*0.8);
            const cy = h * (0.05 + Math.random()*0.9);
            ctx.beginPath();
            ctx.ellipse(cx, cy, 30+Math.random()*20, 10+Math.random()*8, Math.random()*Math.PI, 0, Math.PI*2);
            ctx.stroke();
        }
    }

    if (type === 'crescents') {
        // Scattered crescents
        for (let i = 0; i < 6; i++) {
            const cx = w * (0.1 + Math.random()*0.8);
            const cy = h * (0.05 + Math.random()*0.9);
            const r = 15 + Math.random() * 20;
            ctx.fillStyle = `rgba(${accent},0.03)`;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = style.textColor === '#f0dcd0'
                ? `rgb(25,10,35)` : `rgb(${10},${8},${35})`;
            ctx.globalAlpha = 0.8;
            ctx.beginPath(); ctx.arc(cx + r*0.35, cy - r*0.2, r*0.8, 0, Math.PI*2); ctx.fill();
            ctx.globalAlpha = 1;
        }
        // Plus 8-pointed stars
        ctx.strokeStyle = `rgba(${accent},0.03)`;
        ctx.lineWidth = 1;
        [[w*0.15,h*0.12],[w*0.85,h*0.88],[w*0.5,h*0.04],[w*0.5,h*0.96]].forEach(
            ([x,y]) => drawStar8(ctx, x, y, 25, 12)
        );
    }

    if (type === 'waves') {
        // Gentle wave lines
        ctx.strokeStyle = `rgba(${accent},0.03)`;
        ctx.lineWidth = 1;
        for (let wave = 0; wave < 5; wave++) {
            const baseY = h * (0.1 + wave * 0.2);
            ctx.beginPath();
            for (let x = 0; x <= w; x += 5) {
                const y = baseY + Math.sin(x * 0.008 + wave) * 40;
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        // Small circles like bubbles
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random()*w, Math.random()*h, Math.random()*4+1, 0, Math.PI*2);
            ctx.fillStyle = `rgba(${accent},${0.01+Math.random()*0.02})`;
            ctx.fill();
        }
    }
}

function drawStar8(ctx, cx, cy, outerR, innerR) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawFadeLine(ctx, w, y, accent) {
    const seg = 120, segW = w / seg;
    for (let i = 0; i < seg; i++) {
        const alpha = Math.sin((i / seg) * Math.PI) * 0.18;
        ctx.strokeStyle = `rgba(${accent},${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(i*segW, y); ctx.lineTo((i+1)*segW, y); ctx.stroke();
    }
}

function drawLBracket(ctx, x, y, size, corner) {
    ctx.beginPath();
    if (corner === 'tl') { ctx.moveTo(x, y-size); ctx.lineTo(x, y); ctx.lineTo(x+size, y); }
    else if (corner === 'tr') { ctx.moveTo(x, y-size); ctx.lineTo(x, y); ctx.lineTo(x-size, y); }
    else if (corner === 'bl') { ctx.moveTo(x, y+size); ctx.lineTo(x, y); ctx.lineTo(x+size, y); }
    else if (corner === 'br') { ctx.moveTo(x, y+size); ctx.lineTo(x, y); ctx.lineTo(x-size, y); }
    ctx.stroke();
}

function drawDiamond(ctx, cx, cy, size) {
    ctx.beginPath();
    ctx.moveTo(cx, cy-size); ctx.lineTo(cx+size, cy);
    ctx.lineTo(cx, cy+size); ctx.lineTo(cx-size, cy);
    ctx.closePath(); ctx.fill();
}

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const word of words) {
        const test = cur ? cur + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && cur) {
            lines.push(cur); cur = word;
        } else { cur = test; }
    }
    if (cur) lines.push(cur);
    return lines;
}

// ============ Toast ============

function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ============ API Toggle ============

function toggleAPI() {
    document.getElementById('apiContent').classList.toggle('open');
    document.getElementById('apiChevron').classList.toggle('open');
}

// ============ Copy Code ============

function copyCode(btn) {
    const code = btn.closest('.code-block').querySelector('code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'تم ✓';
        setTimeout(() => btn.textContent = 'نسخ', 1500);
    });
}

// ============ Keyboard Shortcut ============

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); getRandomDhikr(); }
    if (e.code === 'Escape') closeStylePicker();
});

// ============ Init ============

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => getRandomDhikr(), 500);
    loadSurahList();
    loadHijriDate();
});

// ============ Quran Player ============

let currentSurah = null;
let currentAyahIndex = 0;
let ayahsData = [];
let isPlaying = false;
let isRepeat = false;

const QURAN_API = 'https://api.alquran.cloud/v1';

async function loadSurahList() {
    try {
        const res = await fetch(`${QURAN_API}/surah`);
        const data = await res.json();
        const select = document.getElementById('surahSelect');

        data.data.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.number;
            option.textContent = `${surah.number}. ${surah.name} (${surah.englishName}) - ${surah.numberOfAyahs} آية`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load surah list:', err);
    }
}

async function loadSurah() {
    const surahNum = document.getElementById('surahSelect').value;
    if (!surahNum) return;

    const reciter = document.getElementById('reciterSelect').value;
    const translation = document.getElementById('translationSelect').value;

    try {
        // Load Arabic text
        const arabicRes = await fetch(`${QURAN_API}/surah/${surahNum}`);
        const arabicData = await arabicRes.json();

        ayahsData = arabicData.data.ayahs.map(ayah => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            audio: ``, // Will be set by loadAyahAudio
            translation: ''
        }));

        currentSurah = {
            number: arabicData.data.number,
            name: arabicData.data.name,
            englishName: arabicData.data.englishName,
            numberOfAyahs: arabicData.data.numberOfAyahs
        };

        // Load translation if selected
        if (translation) {
            const transRes = await fetch(`${QURAN_API}/surah/${surahNum}/${translation}`);
            const transData = await transRes.json();
            transData.data.ayahs.forEach((ayah, idx) => {
                if (ayahsData[idx]) ayahsData[idx].translation = ayah.text;
            });
        }

        currentAyahIndex = 0;
        renderAyahNavigator();
        displayAyah(0);
        updateSurahInfo();

        // Hide bismillah for Surah At-Tawbah (9)
        const bismillah = document.getElementById('bismillah');
        bismillah.style.display = surahNum === '9' ? 'none' : 'block';

    } catch (err) {
        console.error('Failed to load surah:', err);
        showToast('حدث خطأ في تحميل السورة');
    }
}

async function changeReciter() {
    if (!currentSurah) return;
    const reciter = document.getElementById('reciterSelect').value;

    // Update audio URLs for all ayahs with everyayah.com format
    ayahsData.forEach((ayah) => {
        const surahStr = String(currentSurah.number).padStart(3, '0');
        const ayahStr = String(ayah.number).padStart(3, '0');
        ayah.audio = `https://everyayah.com/data/${reciter}/${surahStr}${ayahStr}.mp3`;
    });

    // Reload current ayah with new reciter
    if (isPlaying) {
        const audio = document.getElementById('quranAudio');
        audio.pause();
        isPlaying = false;
        updatePlayButton();
    }
    loadAyahAudio(currentAyahIndex);
}

async function changeTranslation() {
    if (!currentSurah) return;
    await loadSurah(); // Reload with new translation
}

function loadAyahAudio(index) {
    const audio = document.getElementById('quranAudio');
    const ayah = ayahsData[index];
    if (!ayah || !currentSurah) return;

    // Use everyayah.com CDN format
    const reciter = document.getElementById('reciterSelect').value;
    const surahStr = String(currentSurah.number).padStart(3, '0');
    const ayahStr = String(ayah.number).padStart(3, '0');
    audio.src = `https://everyayah.com/data/${reciter}/${surahStr}${ayahStr}.mp3`;
    audio.load();
}

function displayAyah(index) {
    const ayah = ayahsData[index];
    if (!ayah) return;

    document.getElementById('ayahText').innerHTML = `<p>${ayah.text}</p>`;
    document.getElementById('ayahTranslation').textContent = ayah.translation || '';
    document.getElementById('ayahTranslation').style.display = ayah.translation ? 'block' : 'none';
    document.getElementById('ayahNumber').textContent = `آية ${ayah.number} من ${currentSurah.numberOfAyahs}`;

    // Update navigator
    document.querySelectorAll('.ayah-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
        if (idx <= index) item.classList.add('played');
    });

    loadAyahAudio(index);
}

function updateSurahInfo() {
    if (!currentSurah) return;
    const info = document.getElementById('surahInfo');
    const revelationType = currentSurah.number <= 86 && currentSurah.number !== 1 ? 'مكية' : 'مدنية';
    info.innerHTML = `
        <span>${currentSurah.name}</span>
        <span>(${currentSurah.englishName})</span>
        <span>${revelationType}</span>
        <span>${currentSurah.numberOfAyahs} آية</span>
    `;
}

function renderAyahNavigator() {
    const list = document.getElementById('ayahList');
    list.innerHTML = '';
    ayahsData.forEach((ayah, idx) => {
        const item = document.createElement('div');
        item.className = 'ayah-item';
        item.textContent = ayah.number;
        item.onclick = () => { currentAyahIndex = idx; displayAyah(idx); };
        list.appendChild(item);
    });
}

function togglePlay() {
    const audio = document.getElementById('quranAudio');
    if (!audio.src) return;

    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play().then(() => {
            isPlaying = true;
        }).catch(() => {
            showToast('حدث خطأ في تشغيل الصوت');
        });
    }
    updatePlayButton();
}

function updatePlayButton() {
    document.getElementById('playIcon').style.display = isPlaying ? 'none' : 'block';
    document.getElementById('pauseIcon').style.display = isPlaying ? 'block' : 'none';
}

function nextAyah() {
    if (currentAyahIndex < ayahsData.length - 1) {
        currentAyahIndex++;
        displayAyah(currentAyahIndex);
        if (isPlaying) {
            setTimeout(() => togglePlay(), 100);
        }
    }
}

function prevAyah() {
    if (currentAyahIndex > 0) {
        currentAyahIndex--;
        displayAyah(currentAyahIndex);
        if (isPlaying) {
            setTimeout(() => togglePlay(), 100);
        }
    }
}

function toggleRepeat() {
    isRepeat = !isRepeat;
    document.getElementById('repeatBtn').classList.toggle('active', isRepeat);
    showToast(isRepeat ? 'تم تفعيل التكرار ✓' : 'تم إلغاء التكرار');
}

// Audio event listeners
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('quranAudio');

    audio.addEventListener('play', () => { isPlaying = true; updatePlayButton(); });
    audio.addEventListener('pause', () => { isPlaying = false; updatePlayButton(); });
    audio.addEventListener('ended', () => {
        if (currentAyahIndex < ayahsData.length - 1) {
            nextAyah();
        } else if (isRepeat) {
            currentAyahIndex = 0;
            displayAyah(0);
            setTimeout(() => togglePlay(), 100);
        }
    });
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        document.getElementById('totalTime').textContent = formatTime(audio.duration);
    });

    // Load banner dates on page load
    loadBannerDates();
});

function updateProgress() {
    const audio = document.getElementById('quranAudio');
    if (!audio.duration || !isFinite(audio.duration)) return;

    try {
        const percent = (audio.currentTime / audio.duration) * 100;
        document.getElementById('progressBar').style.width = percent + '%';
        document.getElementById('progressHandle').style.left = percent + '%';
        document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
        document.getElementById('totalTime').textContent = formatTime(audio.duration);
    } catch (e) {
        // Ignore CORS-related errors
    }
}

function seekAudio(e) {
    const container = document.getElementById('progressContainer');
    const rect = container.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const audio = document.getElementById('quranAudio');

    if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = percent * audio.duration;
    }
}

function formatTime(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function toggleQuran() {
    const content = document.getElementById('quranContent');
    const chevron = document.getElementById('quranChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');
}

// ============ Date Banner ============

async function loadBannerDates() {
    try {
        // Load Hijri date
        const res = await fetch('https://api.aladhan.com/v1/gToH');
        const data = await res.json();
        const hijri = data.data.hijri;
        const gregorian = data.data.gregorian;

        // Update Hijri date in banner
        const hijriBanner = document.getElementById('hijriDateBanner');
        if (hijriBanner) {
            hijriBanner.textContent = `${hijri.day} ${hijri.month.ar} ${hijri.year}هـ`;
        }

        // Update Gregorian date in banner
        const gregorianBanner = document.getElementById('gregorianDateBanner');
        if (gregorianBanner) {
            const gregDate = new Date(gregorian.date);
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            gregorianBanner.textContent = gregDate.toLocaleDateString('en-US', options);
        }
    } catch (err) {
        console.error('Failed to load banner dates:', err);
        // Set fallback dates
        const now = new Date();
        const hijriBanner = document.getElementById('hijriDateBanner');
        const gregorianBanner = document.getElementById('gregorianDateBanner');

        if (hijriBanner) hijriBanner.textContent = 'جاري التحديث...';
        if (gregorianBanner) {
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            gregorianBanner.textContent = now.toLocaleDateString('en-US', options);
        }
    }
}

// ============ Prayer Times ============

function togglePrayer() {
    const content = document.getElementById('prayerContent');
    const chevron = document.getElementById('prayerChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');
}

async function getLocationAndPrayerTimes() {
    const status = document.getElementById('locationStatus');

    if (!navigator.geolocation) {
        status.textContent = 'المتصفح لا يدعم تحديد الموقع';
        return;
    }

    status.textContent = 'جاري تحديد الموقع...';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchPrayerTimes(latitude, longitude);
        },
        (err) => {
            status.textContent = 'تعذر تحديد الموقع. استخدام موقع افتراضي (مكة)';
            fetchPrayerTimes(21.4225, 39.8262); // Mecca
        }
    );
}

async function fetchPrayerTimes(lat, lng) {
    try {
        const date = new Date();
        const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`);
        const data = await res.json();

        const timings = data.data.timings;
        const hijri = data.data.date.hijri;

        document.getElementById('fajrTime').textContent = formatPrayerTime(timings.Fajr);
        document.getElementById('sunriseTime').textContent = formatPrayerTime(timings.Sunrise);
        document.getElementById('dhuhrTime').textContent = formatPrayerTime(timings.Dhuhr);
        document.getElementById('asrTime').textContent = formatPrayerTime(timings.Asr);
        document.getElementById('maghribTime').textContent = formatPrayerTime(timings.Maghrib);
        document.getElementById('ishaTime').textContent = formatPrayerTime(timings.Isha);

        document.getElementById('hijriDateText').textContent =
            `${hijri.day} ${hijri.month.ar} ${hijri.year}هـ`;

        document.getElementById('locationStatus').textContent = data.data.meta.timezone;

        highlightNextPrayer(timings);

    } catch (err) {
        console.error('Failed to fetch prayer times:', err);
        document.getElementById('locationStatus').textContent = 'حدث خطأ في تحميل المواقيت';
    }
}

function formatPrayerTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
}

function highlightNextPrayer(timings) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayerMinutes = {
        Fajr: parseTime(timings.Fajr),
        Sunrise: parseTime(timings.Sunrise),
        Dhuhr: parseTime(timings.Dhuhr),
        Asr: parseTime(timings.Asr),
        Maghrib: parseTime(timings.Maghrib),
        Isha: parseTime(timings.Isha)
    };

    let nextPrayer = null;
    let minDiff = Infinity;

    for (const [prayer, minutes] of Object.entries(prayerMinutes)) {
        if (minutes > currentMinutes) {
            const diff = minutes - currentMinutes;
            if (diff < minDiff) {
                minDiff = diff;
                nextPrayer = prayer;
            }
        }
    }

    // If all prayers passed, next is tomorrow's Fajr
    if (!nextPrayer) nextPrayer = 'Fajr';

    document.querySelectorAll('.prayer-card').forEach(card => {
        card.classList.remove('next-prayer');
        if (card.dataset.prayer === nextPrayer) {
            card.classList.add('next-prayer');
        }
    });
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

async function loadHijriDate() {
    try {
        const res = await fetch('https://api.aladhan.com/v1/gToH');
        const data = await res.json();
        const hijri = data.data.hijri;

        // Update the hijri date in prayer section if not already set
        const hijriText = document.getElementById('hijriDateText');
        if (hijriText && hijriText.textContent === 'جاري التحميل...') {
            hijriText.textContent = `${hijri.day} ${hijri.month.ar} ${hijri.year}هـ`;
        }
    } catch (err) {
        console.error('Failed to load hijri date:', err);
    }
}

// ============ Tasbih Counter ============

let tasbihCount = 0;
let tasbihTarget = 33;
let currentDhikrText = '';

function toggleTasbih() {
    const content = document.getElementById('tasbihContent');
    const chevron = document.getElementById('tasbihChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');
}

function incrementTasbih() {
    tasbihCount++;
    updateTasbihDisplay();

    if (tasbihCount === tasbihTarget) {
        showToast('تم إكمال الهدف! بارك الله فيك ✓');
        vibrate();
    } else if (tasbihCount % 33 === 0) {
        vibrate();
    }
}

function updateTasbihDisplay() {
    document.getElementById('tasbihCount').textContent = tasbihCount;
    document.getElementById('tasbihTarget').textContent = tasbihTarget;
}

function setTarget(target) {
    tasbihTarget = target;
    updateTasbihDisplay();

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === String(target));
    });
}

function resetTasbih() {
    tasbihCount = 0;
    updateTasbihDisplay();
}

function setDhikr(dhikr) {
    currentDhikrText = dhikr;
    document.getElementById('currentDhikrDisplay').textContent = dhikr;

    document.querySelectorAll('.dhikr-preset').forEach(btn => {
        btn.classList.toggle('active', btn.textContent === dhikr);
    });

    // Reset counter when changing dhikr
    tasbihCount = 0;
    updateTasbihDisplay();
}

function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// ============ 99 Names of Allah ============

const ALLAH_NAMES = [
    { name: "الله", transliteration: "Allah", meaning: "الاسم الأعظم", description: "الاسم الأعظم والأول لله سبحانه وتعالى، ويشمل جميع صفات الكمال" },
    { name: "الرَّحْمَن", transliteration: "Ar-Rahman", meaning: "الرحمن", description: "ذو الرحمة العامة التي وسعت جميع الخلائق" },
    { name: "الرَّحِيم", transliteration: "Ar-Raheem", meaning: "الرحيم", description: "ذو الرحمة الخاصة بالمؤمنين في الآخرة" },
    { name: "الْمَلِك", transliteration: "Al-Malik", meaning: "الملك", description: "مالك الملك، المتصرف في خلقه بمشيئته" },
    { name: "الْقُدُّوس", transliteration: "Al-Quddus", meaning: "القدوس", description: "الطاهر المنزه عن كل عيب ونقص" },
    { name: "السَّلَام", transliteration: "As-Salam", meaning: "السلام", description: "السلام من كل عيب، والمصدر للسلامة" },
    { name: "الْمُؤْمِن", transliteration: "Al-Mu'min", meaning: "المؤمن", description: "الذي يؤمن عباده من عذابه" },
    { name: "الْمُهَيْمِن", transliteration: "Al-Muhaymin", meaning: "المهيمن", description: "الرقيب الحافظ لكل شيء" },
    { name: "الْعَزِيز", transliteration: "Al-Aziz", meaning: "العزيز", description: "الغالب الذي لا يُقهر، ذو العزة" },
    { name: "الْجَبَّار", transliteration: "Al-Jabbar", meaning: "الجبار", description: "المتكبر على خلقه، المصرف أمورهم" },
    { name: "الْمُتَكَبِّر", transliteration: "Al-Mutakabbir", meaning: "المتكبر", description: "المتعال على جميع خلقه" },
    { name: "الْخَالِق", transliteration: "Al-Khaliq", meaning: "الخالق", description: "المبدع الموجد من العدم" },
    { name: "الْبَارِئ", transliteration: "Al-Bari'", meaning: "البارئ", description: "المبرئ المخلص الخلق" },
    { name: "الْمُصَوِّر", transliteration: "Al-Musawwir", meaning: "المصور", description: "المعطي لكل خلق صورة خاصة" },
    { name: "الْغَفَّار", transliteration: "Al-Ghaffar", meaning: "الغفار", description: "كثير المغفرة والإغماد" },
    { name: "الْقَهَّار", transliteration: "Al-Qahhar", meaning: "القهار", description: "الذي قهر كل شيء وذلله" },
    { name: "الْوَهَّاب", transliteration: "Al-Wahhab", meaning: "الوهاب", description: "المعطي بلا مقابل ولا سبب" },
    { name: "الرَّزَّاق", transliteration: "Ar-Razzaq", meaning: "الرزاق", description: "المقسم للأرزاق، الموسع على خلقه" },
    { name: "الْفَتَّاح", transliteration: "Al-Fattah", meaning: "الفتاح", description: "مفتاح كل خير، ميسر الأمور" },
    { name: "الْعَلِيم", transliteration: "Al-Aleem", meaning: "العليم", description: "المحيط علمه بكل شيء" },
    { name: "الْقَابِض", transliteration: "Al-Qabid", meaning: "القابض", description: "قابض الأرواح والأرزاق" },
    { name: "الْبَاسِط", transliteration: "Al-Basit", meaning: "الباسط", description: "باسط الرزق والفضل والرحمة" },
    { name: "الْخَافِض", transliteration: "Al-Khafid", meaning: "الخافض", description: "خافض الكافرين والأشقياء" },
    { name: "الرَّافِع", transliteration: "Ar-Rafi'", meaning: "الرافع", description: "رافع المؤمنين والأبرار" },
    { name: "الْمُعِزُّ", transliteration: "Al-Mu'izz", meaning: "المعز", description: "معز أوليائه بتمكينهم" },
    { name: "الْمُذِلُّ", transliteration: "Al-Mudhill", meaning: "المذل", description: "مذل أعدائه وأهل الكفر" },
    { name: "السَّمِيع", transliteration: "As-Samee'", meaning: "السميع", description: "السامع لجميع الأصوات" },
    { name: "الْبَصِير", transliteration: "Al-Baseer", meaning: "البصير", description: "المحيط بجميع المبصرات" },
    { name: "الْحَكَم", transliteration: "Al-Hakam", meaning: "الحكم", description: "الحاكم العدل الذي لا يُرَد قضاؤه" },
    { name: "الْعَدْل", transliteration: "Al-Adl", meaning: "العدل", description: "العدل في أحكامه وأفعاله" },
    { name: "اللَّطِيف", transliteration: "Al-Lateef", meaning: "اللطيف", description: "البر الرفيق بعباده" },
    { name: "الْخَبِير", transliteration: "Al-Khabeer", meaning: "الخبير", description: "المحيط علمه ببواطن الأمور" },
    { name: "الْحَلِيم", transliteration: "Al-Haleem", meaning: "الحليم", description: "الذي لا يعاجل بالعقوبة" },
    { name: "الْعَظِيم", transliteration: "Al-Azeem", meaning: "العظيم", description: "الذي جلت عظمته عن الإدراك" },
    { name: "الْغَفُور", transliteration: "Al-Ghafoor", meaning: "الغفور", description: "كثير الغفران والستر" },
    { name: "الشَّكُور", transliteration: "Ash-Shakoor", meaning: "الشكور", description: "المجازي على القليل بكثير" },
    { name: "الْعَلِيُّ", transliteration: "Al-Aliyy", meaning: "العلي", description: "الذي علا بذاته وصفاته" },
    { name: "الْكَبِير", transliteration: "Al-Kabeer", meaning: "الكبير", description: "الذي جلت كبرياؤه" },
    { name: "الْحَفِيظ", transliteration: "Al-Hafeedh", meaning: "الحفيظ", description: "الحافظ لكل شيء، المنعم" },
    { name: "الْمُقِيت", transliteration: "Al-Muqeet", meaning: "المقيت", description: "المقتدر، المقسم للأرزاق" },
    { name: "الْحَسِيب", transliteration: "Al-Haseeb", meaning: "الحسيب", description: "الكافي، المجازي" },
    { name: "الْجَلِيل", transliteration: "Al-Jaleel", meaning: "الجليل", description: "الذي جلت صفاته" },
    { name: "الْكَرِيم", transliteration: "Al-Kareem", meaning: "الكريم", description: "الجواد المنان، سابغ النعم" },
    { name: "الرَّقِيب", transliteration: "Ar-Raqeeb", meaning: "الرقيب", description: "المراقب لأحوال العباد" },
    { name: "الْمُجِيب", transliteration: "Al-Mujeeb", meaning: "المجيب", description: "المجيب لدعوة المضطرين" },
    { name: "الْوَاسِع", transliteration: "Al-Wasi'", meaning: "الواسع", description: "الواسع في رزقه وعلمه" },
    { name: "الْحَكِيم", transliteration: "Al-Hakeem", meaning: "الحكيم", description: "الحكيم في أقواله وأفعاله" },
    { name: "الْوَدُود", transliteration: "Al-Wadood", meaning: "الودود", description: "المحب لأوليائه" },
    { name: "الْمَجِيد", transliteration: "Al-Majeed", meaning: "المجيد", description: "الذي جلت مجده أوصافه" },
    { name: "الْبَاعِث", transliteration: "Al-Ba'ith", meaning: "الباعث", description: "باعث الموتى للحساب" },
    { name: "الشَّهِيد", transliteration: "Ash-Shaheed", meaning: "الشهيد", description: "الحاضر المحيط بكل شيء" },
    { name: "الْحَقُّ", transliteration: "Al-Haqq", meaning: "الحق", description: "الثابت الوجود، العدل" },
    { name: "الْوَكِيل", transliteration: "Al-Wakeel", meaning: "الوكيل", description: "المفوض إليه الأمور" },
    { name: "الْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "القوي", description: "الذي لا يُغلب، صاحب القوة" },
    { name: "الْمَتِين", transliteration: "Al-Mateen", meaning: "المتين", description: "الشديد القوة، الثابت" },
    { name: "الْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "الولي", description: "الناصر لأوليائه" },
    { name: "الْحَمِيد", transliteration: "Al-Hameed", meaning: "الحميد", description: "المحمود في أفعاله" },
    { name: "الْمُحْصِي", transliteration: "Al-Muhsi", meaning: "المحصي", description: "المحيط علمه بعدد كل شيء" },
    { name: "الْمُبْدِئ", transliteration: "Al-Mubdi'", meaning: "المبدئ", description: "المبدئ للخلق من العدم" },
    { name: "الْمُعِيد", transliteration: "Al-Mu'eed", meaning: "المعيد", description: "المعيد للخلق بعد الموت" },
    { name: "الْمُحْيِي", transliteration: "Al-Muhyee", meaning: "المحيي", description: "المحيي للموتى، المعطي الحياة" },
    { name: "الْمُمِيت", transliteration: "Al-Mumeet", meaning: "المميت", description: "مسلط الموت على من شاء" },
    { name: "الْحَيُّ", transliteration: "Al-Hayy", meaning: "الحي", description: "الحي الذي لا يموت" },
    { name: "الْقَيُّوم", transliteration: "Al-Qayyoom", meaning: "القيوم", description: "القائم بنفسه، المقيم لغيره" },
    { name: "الْوَاجِد", transliteration: "Al-Wajid", meaning: "الواجد", description: "الذي لا يُدرك بالحواس" },
    { name: "الْمَاجِد", transliteration: "Al-Majid", meaning: "الماجد", description: "الذي جلت مكانته" },
    { name: "الْوَاحِد", transliteration: "Al-Wahid", meaning: "الواحد", description: "الفرد الصمد، المتفرد" },
    { name: "الصَّمَد", transliteration: "As-Samad", meaning: "الصمد", description: "المقصود في الحوائج" },
    { name: "الْقَادِر", transliteration: "Al-Qadir", meaning: "القادر", description: "القادر على كل شيء" },
    { name: "الْمُقْتَدِر", transliteration: "Al-Muqtadir", meaning: "المقتدر", description: "المتصرف في المخلوقات" },
    { name: "الْمُقَدِّم", transliteration: "Al-Muqaddim", meaning: "المقدم", description: "المقدم من يشاء" },
    { name: "الْمُؤَخِّر", transliteration: "Al-Mu'akhkhir", meaning: "المؤخر", description: "المؤخر من يشاء" },
    { name: "الأوَّل", transliteration: "Al-Awwal", meaning: "الأول", description: "الذي لم يتقدمه شيء" },
    { name: "الآخِر", transliteration: "Al-Akhir", meaning: "الآخر", description: "الذي لا يزول وجوده" },
    { name: "الظَّاهِر", transliteration: "Az-Zahir", meaning: "الظاهر", description: "الظاهر بآياته وعلمه" },
    { name: "الْبَاطِن", transliteration: "Al-Batin", meaning: "الباطن", description: "المحيط بكل شيء، العال" },
    { name: "الْوَالِي", transliteration: "Al-Waali", meaning: "الوالي", description: "المالي لكل شيء، المتحكم" },
    { name: "الْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "المتعالي", description: "العالي فوق كل شيء" },
    { name: "الْبَرُّ", transliteration: "Al-Barr", meaning: "البر", description: "الصادق في وعده، المحسن" },
    { name: "التَّوَّاب", transliteration: "At-Tawwab", meaning: "التواب", description: "المقبل التوبة على عباده" },
    { name: "الْمُنْتَقِم", transliteration: "Al-Muntaqim", meaning: "المنتقم", description: "المنتقم من أعدائه" },
    { name: "العَفُو", transliteration: "Al-Afuww", meaning: "العفو", description: "الذي يعفو ويتجاوز" },
    { name: "الرَّؤُوف", transliteration: "Ar-Ra'oof", meaning: "الرؤوف", description: "الرحيم الرفيق بعباده" },
    { name: "مَالِك الْمُلْك", transliteration: "Malik-ul-Mulk", meaning: "مالك الملك", description: "مالك الملك والتصرف" },
    { name: "ذُو الْجَلَالِ وَالْإكْرَام", transliteration: "Dhul-Jalali wal-Ikram", meaning: "ذو الجلال والإكرام", description: "ذو العزة والكبرياء" },
    { name: "الْمُقْسِط", transliteration: "Al-Muqsit", meaning: "المقسط", description: "العدل في قضائه" },
    { name: "الْجَامِع", transliteration: "Al-Jami'", meaning: "الجامع", description: "الجامع بين المخلوقات" },
    { name: "الْغَنِيُّ", transliteration: "Al-Ghaniyy", meaning: "الغني", description: "الغني الذي لا يحتاج" },
    { name: "الْمُغْنِي", transliteration: "Al-Mughni", meaning: "المغني", description: "المغني من يشاء من عباده" },
    { name: "الْمَانِع", transliteration: "Al-Mani'", meaning: "المانع", description: "مانع العطاء عن من يشاء" },
    { name: "الضَّارَّ", transliteration: "Ad-Daar", meaning: "الضار", description: "الذي يضر من يشاء" },
    { name: "النَّافِع", transliteration: "An-Nafi'", meaning: "النافع", description: "النافع لمن يشاء" },
    { name: "النُّور", transliteration: "An-Nur", meaning: "النور", description: "نور السماوات والأرض" },
    { name: "الْهَادِي", transliteration: "Al-Hadi", meaning: "الهادي", description: "الهادي أولياءه للصراط" },
    { name: "الْبَدِيع", transliteration: "Al-Badee'", meaning: "البديع", description: "البديع في صنعه" },
    { name: "الْبَاقِي", transliteration: "Al-Baqi", meaning: "الباقي", description: "الباقي بعد فناء الخلائق" },
    { name: "الْوَارِث", transliteration: "Al-Warith", meaning: "الوارث", description: "وارث كل شيء" },
    { name: "الرَّشِيد", transliteration: "Ar-Rasheed", meaning: "الرشيد", description: "الرشيد في تدبيره" },
    { name: "الصَّبُور", transliteration: "As-Saboor", meaning: "الصبور", description: "الذي لا يعجل بالعقوبة" }
];

let currentNameIndex = 0;

function toggleNames() {
    const content = document.getElementById('namesContent');
    const chevron = document.getElementById('namesChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');

    if (content.classList.contains('open') && !document.getElementById('namesList').children.length) {
        renderNamesList();
    }
}

function displayName(index) {
    const name = ALLAH_NAMES[index];
    if (!name) return;

    document.getElementById('nameArabic').textContent = name.name;
    document.getElementById('nameTransliteration').textContent = name.transliteration;
    document.getElementById('nameMeaning').textContent = name.meaning;
    document.getElementById('nameDescription').textContent = name.description;

    // Update list selection
    document.querySelectorAll('.name-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });

    currentNameIndex = index;
}

function nextName() {
    currentNameIndex = (currentNameIndex + 1) % ALLAH_NAMES.length;
    displayName(currentNameIndex);
}

function prevName() {
    currentNameIndex = (currentNameIndex - 1 + ALLAH_NAMES.length) % ALLAH_NAMES.length;
    displayName(currentNameIndex);
}

function randomName() {
    currentNameIndex = Math.floor(Math.random() * ALLAH_NAMES.length);
    displayName(currentNameIndex);
}

function renderNamesList() {
    const list = document.getElementById('namesList');
    list.innerHTML = '';
    ALLAH_NAMES.forEach((name, idx) => {
        const item = document.createElement('div');
        item.className = 'name-item';
        item.textContent = idx + 1;
        item.onclick = () => displayName(idx);
        list.appendChild(item);
    });
    displayName(0);
}

// ============ Hadith of the Day ============

const HADITH_COLLECTION = [
    {
        text: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
        narrator: "عن عمر بن الخطاب رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلَاةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ",
        narrator: "عن ابن عمر رضي الله عنهما",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        narrator: "عن أنس بن مالك رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ",
        narrator: "عن عبد الله بن عمرو رضي الله عنهما",
        source: "صحيح البخاري"
    },
    {
        text: "لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا، وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ",
        narrator: "عن مُعَاوِيَةَ رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ، وَمَا زَادَ اللَّهُ عَبْدًا بِعَفْوٍ إِلَّا عِزًّا",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "ادْنُسُوا الْجَنَّةَ بِالطُّوبَى، وَالْقَنَاعِمِ، وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "الرِّبَا ثَلَاثَةٌ وَسَبْعُونَ بَابًا، أَصْغَرُهَا أَنْ يَنْكِحَ الرَّجُلُ أُمَّهُ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "ابن ماجه"
    },
    {
        text: "مَنْ تَرَكَ الْمَالَ لِلْوَرَثَةِ فَلْيَتْرُكْهُ وَافِرًا، وَمَنْ تَرَكَ دَيْنًا أَوْ ضَيَاعًا فَلْيَتْرُكْهُ قَلِيلًا",
        narrator: "عن جابر رضي الله عنه",
        source: "مسند أحمد"
    },
    {
        text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
        narrator: "عن عثمان بن عفان رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "مَا أَنْزَلَ اللَّهُ دَاءً إِلَّا أَنْزَلَ لَهُ شِفَاءً",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح البخاري"
    },
    {
        text: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح مسلم"
    },
    {
        text: "مَنْ أَحْيَا أَرْضًا مَيِّتَةً فَلَهُ فِيهَا أَجْرٌ",
        narrator: "عن أنس بن مالك رضي الله عنه",
        source: "سنن أبي داود"
    },
    {
        text: "لَيْسَ الْبِرَّ أَنْ تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ، وَلَكِنَّ الْبِرَّ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَالْمَلَائِكَةِ وَالْكِتَابِ وَالنَّبِيِّينَ",
        narrator: "عن ابن عمر رضي الله عنهما",
        source: "صحيح البخاري"
    },
    {
        text: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُصِبْ مِنْهُ",
        narrator: "عن أبي هريرة رضي الله عنه",
        source: "صحيح البخاري"
    }
];

let currentHadith = null;

function toggleHadith() {
    const content = document.getElementById('hadithContent');
    const chevron = document.getElementById('hadithChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');

    if (content.classList.contains('open') && !currentHadith) {
        loadRandomHadith();
    }
}

function loadRandomHadith() {
    const randomIndex = Math.floor(Math.random() * HADITH_COLLECTION.length);
    currentHadith = HADITH_COLLECTION[randomIndex];

    document.getElementById('hadithText').textContent = currentHadith.text;
    document.getElementById('hadithNarrator').textContent = currentHadith.narrator;
    document.getElementById('hadithSource').textContent = currentHadith.source;
}

function copyHadith() {
    if (!currentHadith) return;

    const text = `${currentHadith.text}\n\n${currentHadith.narrator}\n${currentHadith.source}\n\nزادي — za-di.com`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم نسخ الحديث ✓');
    });
}

// ============ Qibla Direction ============

let qiblaAngle = 0;
let deviceOrientation = 0;

function toggleQibla() {
    const content = document.getElementById('qiblaContent');
    const chevron = document.getElementById('qiblaChevron');
    content.classList.toggle('open');
    chevron.classList.toggle('open');
}

async function getQiblaDirection() {
    const status = document.getElementById('qiblaLocation');

    if (!navigator.geolocation) {
        status.textContent = 'المتصفح لا يدعم تحديد الموقع';
        return;
    }

    status.textContent = 'جاري تحديد الموقع...';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            calculateQibla(latitude, longitude);
            status.textContent = `موقعك: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            // Try to get device orientation for compass
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', handleOrientation);
                showToast('حرك جهازك لتحديث البوصلة');
            }
        },
        (err) => {
            status.textContent = 'تعذر تحديد الموقع. استخدام مكة (45.0°)';
            calculateQibla(21.4225, 39.8262); // Mecca
        }
    );
}

function calculateQibla(lat, lng) {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const lat1 = lat * Math.PI / 180;
    const lng1 = lng * Math.PI / 180;
    const lat2 = meccaLat * Math.PI / 180;
    const lng2 = meccaLng * Math.PI / 180;

    // Calculate Qibla angle using spherical trigonometry
    const y = Math.sin(lng2 - lng1);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(lng2 - lng1);

    qiblaAngle = Math.atan2(y, x) * 180 / Math.PI;
    qiblaAngle = (qiblaAngle + 360) % 360;

    // Update display
    document.getElementById('qiblaAngle').textContent = qiblaAngle.toFixed(1) + '°';
    document.getElementById('qiblaIndicator').classList.add('show');

    // Rotate compass to show Qibla
    updateCompass();
}

function handleOrientation(event) {
    if (event.alpha !== null) {
        deviceOrientation = event.alpha;
        updateCompass();
    }
}

function updateCompass() {
    const compass = document.getElementById('compass');
    const arrow = document.getElementById('compassArrow');
    const indicator = document.getElementById('qiblaIndicator');

    // Rotate compass so North points up
    compass.style.transform = `rotate(${-deviceOrientation}deg)`;

    // Calculate Qibla direction relative to device
    const relativeQibla = (qiblaAngle - deviceOrientation + 360) % 360;

    // Position Kaaba indicator
    const radius = 70;
    const angleRad = (relativeQibla - 90) * Math.PI / 180;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    indicator.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

