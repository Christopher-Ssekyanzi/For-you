// --- iOS AUDIO UNLOCKER ---

function fireConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ffd700', '#ff8fa3', '#c084fc']
        });
    }
}

// Forces Apple Safari to grant audio permissions on her very first tap of the screen
document.body.addEventListener('touchstart', function unlockAudio() {
    const bgMusic = document.getElementById('slideshowAudio');
    if (bgMusic) {
        // Secretly play and immediately pause to unlock the audio engine
        let unlockPromise = bgMusic.play();
        if (unlockPromise !== undefined) {
            unlockPromise.then(() => {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }).catch(error => {
                console.log("iOS unlock standing by...");
            });
        }
    }
    // Remove this listener so it only runs exactly once
    document.body.removeEventListener('touchstart', unlockAudio);
});

function initSky() {
    const field = document.getElementById('starField');
    for (let i = 0; i < 250; i++) {
        const star = document.createElement('div'); star.className = 'star';
        star.style.width = star.style.height = `${Math.random() * 2 + 0.5}px`;
        star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
        star.style.setProperty('--duration', `${Math.random() * 4 + 2}s`);
        star.style.animationDelay = `${Math.random() * 5}s`; field.appendChild(star);
    }
    const planetColors = ['#ff5f6d', '#4facfe', '#ffdb00', '#ff8fa3'];
    for (let i = 0; i < 6; i++) {
        const planet = document.createElement('div'); planet.className = 'planet';
        const size = Math.random() * 100 + 40; planet.style.width = planet.style.height = `${size}px`;
        planet.style.background = `radial-gradient(circle, ${planetColors[i%4]}, transparent)`;
        planet.style.left = `${Math.random() * 90}%`; planet.style.top = `${Math.random() * 90}%`;
        planet.style.animationDuration = `${Math.random() * 40 + 40}s`; field.appendChild(planet);
    }
}
initSky();

let clicks = 0;
document.getElementById('secretAdminTrigger').addEventListener('click', () => {
    clicks++;
    if(clicks === 5) {
        document.getElementById('adminPanel').style.display = 'block';
        if(window.loadAdminData) window.loadAdminData();
        clicks = 0; 
    }
    setTimeout(() => clicks = 0, 3000); 
});

let isDiscounted = false;
function setMood(mood) {
    const feedback = document.getElementById('moodFeedback');
    const shopList = document.getElementById('shopList');
    const dynamicTasks = document.getElementById('dynamicTasks');
    
    document.getElementById('moodButtons').style.display = 'none';
    document.getElementById('moodTitle').innerText = "Mood Locked for this Session 🔒";
    
    if (mood === 'low') {
        isDiscounted = true;
        feedback.innerHTML = "<span style='font-size: 1.2rem;'>I'm sorry you're not feeling 100%, Princess. Take it easy today.</span><br><br><b style='color: var(--discount-color); font-size: 1.1rem;'>The Princess Discount is active. All shop items are 50% off! 💜</b>";
        shopList.classList.add('discount-active');
        
        dynamicTasks.innerHTML = `
            <button class="btn task-btn earn-btn" onclick="claimRest()">
                <span>☕ I drank hot tea / rested</span><span class="coin-badge">+20</span>
            </button>
        `;

        document.querySelectorAll('.shop-price').forEach(el => {
            let base = parseInt(el.getAttribute('data-base'));
            el.innerText = `-${base / 2}`;
        });
    } else {
        isDiscounted = false;
        feedback.innerHTML = "<span style='font-size: 1.2rem; color: #ffdb00;'>Glad you are feeling High Energy! Go crush it today! 🌟</span>";
        shopList.classList.remove('discount-active');
        
        dynamicTasks.innerHTML = `
            <button class="btn task-btn earn-btn" onclick="openInputModal('Academic Update', 20)">
                <span>📚 Academic update</span><span class="coin-badge">+20</span>
            </button>
        `;

        document.querySelectorAll('.shop-price').forEach(el => {
            let base = parseInt(el.getAttribute('data-base'));
            el.innerText = `-${base}`;
        });
    }
}

function spendCoins(baseAmount, reward) {
    let currentCoins = parseInt(document.getElementById('coinDisplay').innerText) || 0;
    let actualCost = isDiscounted ? (baseAmount / 2) : baseAmount;

    if (currentCoins >= actualCost) {
        window.dbRunTransaction(-actualCost);
        window.dbSaveMessage("Shop Purchase", `Gloria purchased: ${reward}`);
        fireConfetti();
        alert(`Request Locked In: ${reward}! Christopher has been notified. ❤️`);
    } else {
        alert(`You need ${actualCost - currentCoins} more coins for this!`);
    }
}

function claimWater() {
    window.dbRunTransaction(10);
    fireConfetti();
    const btn = document.getElementById('btnWater');
    btn.innerHTML = `<span class="fst-italic text-muted">Hydrating... (Cooldown 2 hrs)</span>`;
    btn.disabled = true;
    btn.style.opacity = 0.6;
}

function claimRest() {
    window.dbRunTransaction(20);
    fireConfetti();
    alert("Good job taking care of yourself. +20 Coins! 💜");
}

let verseTimer;
async function openVerseModal() {
    document.getElementById('verseModal').style.display = 'flex';
    document.getElementById('verseText').innerText = "Opening the Word... 📖";
    
    const claimBtn = document.getElementById('claimVerseBtn');
    claimBtn.disabled = true;
    claimBtn.className = "btn btn-secondary w-100 fw-bold rounded-pill";
    
    try {
        const response = await fetch('https://labs.bible.org/api/?passage=random&type=json');
        const data = await response.json();
        
        const book = data[0].bookname;
        const chapter = data[0].chapter;
        const verseNum = data[0].verse;
        const text = data[0].text;
        
        document.getElementById('verseText').innerHTML = `"${text}" <br><br><b>- ${book} ${chapter}:${verseNum}</b>`;
        
    } catch (error) {
        document.getElementById('verseText').innerText = '"Let all that you do be done in love." - 1 Corinthians 16:14';
    }

    let timeLeft = 15;
    clearInterval(verseTimer);
    verseTimer = setInterval(() => {
        timeLeft--;
        claimBtn.innerText = `Meditating... (Wait ${timeLeft}s)`;
        if(timeLeft <= 0) {
            clearInterval(verseTimer);
            claimBtn.disabled = false;
            claimBtn.className = "btn btn-success w-100 fw-bold rounded-pill";
            claimBtn.innerText = "Amen (+15 Coins)";
        }
    }, 1000);
}

function claimVerse() {
    window.dbRunTransaction(15);
    closeModal('verseModal');
    fireConfetti();
    
    const openBtn = document.getElementById('openVerseBtn');
    openBtn.disabled = true;
    openBtn.innerHTML = "Word Received Today ✨ (+15 Coins)";
    openBtn.className = "btn btn-success rounded-pill px-5 py-2 fw-bold";
    document.getElementById('spiritualSubtext').innerText = "You have completed your daily reflection.";
}

let currentTaskReward = 0;
let currentTaskType = "";

function openInputModal(title, rewardAmount) {
    currentTaskType = title;
    currentTaskReward = rewardAmount;
    document.getElementById('inputTitle').innerText = title;
    document.getElementById('taskInput').value = "";
    document.getElementById('wordCountErr').style.display = 'none';
    document.getElementById('inputModal').style.display = 'flex';
}

function submitTextTask() {
    const text = document.getElementById('taskInput').value;
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordCount < 2) {
        document.getElementById('wordCountErr').style.display = 'block';
        return;
    }

    window.dbSaveMessage(currentTaskType, text);
    window.dbRunTransaction(currentTaskReward);
    closeModal('inputModal');
    fireConfetti();
    alert(`Sent to Christopher! +${currentTaskReward} Coins added to the treasury. ✨`);
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// --- UPGRADED GALLERY: GITHUB DYNAMIC LOADER ---

const githubUsername = "Christopher-Ssekyanzi"; 
const githubRepo = "My_trial";     
const folderName = "";                         

let galleryData = []; 
let currentTab = 'image';
let filteredGallery = [];
let currentIndex = 0; 
let slideInterval = null;

async function fetchGitHubMedia() {
    try {
        const apiUrl = folderName !== "" ? 
            `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents/${folderName}` :
            `https://api.github.com/repos/${githubUsername}/${githubRepo}/contents`;
        
        const response = await fetch(apiUrl);
        const files = await response.json();
        
        galleryData = files
            .filter(file => file.name.match(/\.(jpeg|jpg|png|gif|mp4|webm)$/i))
            .map(file => {
                return {
                    src: file.download_url, 
                    type: file.name.match(/\.(mp4|webm)$/i) ? 'video' : 'image'
                };
            });
        
        console.log("GitHub Sync Complete. Loaded " + galleryData.length + " files.");
        
        if (document.getElementById('memorySidebar').style.width !== "0px" && document.getElementById('memorySidebar').style.width !== "") {
            switchGalleryTab(currentTab);
        }
        
    } catch (error) {
        console.error("Failed to load GitHub files:", error);
        galleryData = [{"src": "Gloria_1.jpeg", "type": "image"}];
    }
}

fetchGitHubMedia();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}

function openNav() { 
    const panelWidth = window.innerWidth > 768 ? "450px" : "100%";
    document.getElementById('memorySidebar').style.width = panelWidth; 
    document.getElementById('themeToggler').classList.add('hidden'); 
    switchGalleryTab('image'); 
}

function closeNav() { 
    stopSlideshow(); 
    
    const container = document.getElementById('gallery-media-container');
    const existingVideo = container.querySelector('video');
    if(existingVideo) existingVideo.pause();

    document.getElementById('memorySidebar').style.width = "0"; 
    document.getElementById('themeToggler').classList.remove('hidden'); 
}

function switchGalleryTab(type) {
    currentTab = type;
    currentIndex = 0; 
    filteredGallery = galleryData.filter(item => item.type === currentTab);
    
    document.getElementById('tabImages').classList.toggle('active', type === 'image');
    document.getElementById('tabVideos').classList.toggle('active', type === 'video');
    
    const slideBtn = document.getElementById('slideBtn');
    
    if(type === 'video') {
        stopSlideshow(); 
        slideBtn.style.display = 'none'; 
    } else {
        slideBtn.style.display = 'inline-block'; 
    }
    
    updateGallery();
}

function updateGallery() {
    const container = document.getElementById('gallery-media-container'); 
    
    const existingVideo = container.querySelector('video');
    if(existingVideo) existingVideo.pause();

    container.innerHTML = '';
    
    if (filteredGallery.length === 0) {
        container.innerHTML = '<p class="text-muted mt-5">Loading from GitHub, or no files found... ⏳</p>';
        return;
    }

    const item = filteredGallery[currentIndex];
    if(item.type === 'video') { 
        let vid = document.createElement('video'); 
        vid.src = item.src; 
        vid.controls = true; 
        vid.autoplay = true; 
        vid.style.width = '100%'; 
        vid.style.maxHeight = '60vh'; 
        vid.style.borderRadius = '10px';
        container.appendChild(vid); 
        
        vid.play().catch(e => console.log("Browser blocked autoplay:", e));
        
    } else { 
        let img = document.createElement('img'); 
        img.src = item.src; img.style.width = '100%'; img.style.maxHeight = '60vh'; img.style.objectFit = 'contain'; img.classList.add('rounded', 'shadow'); 
        container.appendChild(img); 
    }
}

function nextMedia() { stopSlideshow(); if(filteredGallery.length > 0) { currentIndex = (currentIndex + 1) % filteredGallery.length; updateGallery(); } }
function prevMedia() { stopSlideshow(); if(filteredGallery.length > 0) { currentIndex = (currentIndex - 1 + filteredGallery.length) % filteredGallery.length; updateGallery(); } }

function toggleSlideshow() {
    const btn = document.getElementById('slideBtn');
    const bgMusic = document.getElementById('slideshowAudio');

    if (slideInterval) { 
        stopSlideshow(); 
    } else { 
        btn.innerHTML = "⏸ Pause Slideshow"; 
        btn.className = 'btn btn-warning fw-bold';
        
        bgMusic.volume = 1.0; 
        let playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio failed to start:", error);
            });
        }

        slideInterval = setInterval(() => { currentIndex = (currentIndex + 1) % filteredGallery.length; updateGallery(); }, 3500);
    }
}

function stopSlideshow() { 
    const bgMusic = document.getElementById('slideshowAudio');
    if (slideInterval) { 
        clearInterval(slideInterval); slideInterval = null; 
        const btn = document.getElementById('slideBtn');
        btn.innerHTML = "▶ Play Slideshow"; btn.className = 'btn btn-primary fw-bold';
        bgMusic.pause();
    } 
}

// --- REMAINING INTERACTIVITY ---
function toggleVideoFlip(card) { const v = document.getElementById('reelVideo'); card.classList.toggle('flipped'); if(card.classList.contains('flipped')) { v.play(); } else { v.pause(); } }
function moveButton() {
    const btn = document.getElementById('noBtn'); const section = document.getElementById('loveSection');
    btn.style.position = 'absolute';
    btn.style.left = Math.floor(Math.random() * (section.clientWidth - btn.offsetWidth - 20)) + 'px';
    btn.style.top = Math.floor(Math.random() * (section.clientHeight - btn.offsetHeight - 20)) + 'px';
}
function sendWhatsApp() { window.open(`https://wa.me/256761417053?text=${encodeURIComponent("THANK YOU FOR THE SUPRISE MY ENGINEER❤️")}`, '_blank'); }

const affirmations = [ "You are my greatest adventure.", "Senior Engineer😅🫶.", "Proud of you always.", "You look like an animal😅" ];
const praises = [ "Breathtakingly beautiful.", "Stunning taste!", "You chose the best man. 😉" ];
function handleAffirmationClick(card) { if (!card.classList.contains('flipped')) document.getElementById('affirmationText').innerText = affirmations[Math.floor(Math.random() * affirmations.length)]; card.classList.toggle('flipped'); }
function handlePraiseClick(card) { if (!card.classList.contains('flipped')) document.getElementById('praiseText').innerText = praises[Math.floor(Math.random() * praises.length)]; card.classList.toggle('flipped'); }

let caratAttempts = 0;
function playCarat() {
    const feedback = document.getElementById('gameFeedback'); caratAttempts++;
    if(caratAttempts < 4) feedback.innerText = "Come on Gloriana😅, dont you deserve better! 😉"; 
    else { feedback.innerHTML = "BINGO! That's what i thought, i dont mind a Billion though❤️"; caratAttempts = 0; }
}
