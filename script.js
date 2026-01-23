// --- Configuration ---
const SENTENCES = [
    "Variables Store Data For Later Use",
    "JavaScript Controls The Web Page Behavior",
    "The Cat Sleeps On The Sofa",
    "She Placed The Book On The Table",
    "I Locked The Door Before Leaving",
    "Rain Fell Softly During The Night",
    "Please Turn Off The Kitchen Light"
];

// --- Global Elements ---
const rangeElement = document.getElementById('firing-range');
const dockElement = document.getElementById('sentence-dock');
const timerElement = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const modalElement = document.getElementById('game-over-modal');
const placeholder = document.getElementById('placeholder-text');
const currStreakEl = document.getElementById('curr-streak');
const bestStreakEl = document.getElementById('best-streak');
const gunElement = document.getElementById('handgun');

// --- State Variables ---
let availableSentences = []; // Copy of master list
let currentTargetSentence = "";
let targetWords = [];
let currentInput = [];

// Timer State
let startTime;
let accumulatedTime = 0;
let timerInterval = null;

// Game State
let isGameActive = false;
let currentStreak = 0;
let bestStreak = 0;
let mistakeMadeInRound = false;

// --- 1. Game Flow Controls ---

// Start New Session (Reset everything except Best Streak)
function startGame() {
    startScreen.classList.add('hidden');
    
    // 1. Refill the pool of sentences
    availableSentences = [...SENTENCES];
    
    // 2. Reset Session Stats
    accumulatedTime = 0;
    currentStreak = 0;
    updateStreakUI();
    
    // 3. Start Level
    initRound();
}

// Next Level Logic
function nextMission() {
    // Check if any sentences are left
    if (availableSentences.length === 0) {
        // ALL CLEARED - Go back to Title
        goToTitle(); 
    } else {
        // KEEP GOING
        modalElement.classList.add('hidden');
        initRound();
    }
}

// Abort / Finish / Restart Logic
function goToTitle() {
    if (timerInterval) clearInterval(timerInterval);
    isGameActive = false;
    
    // Clear UI
    rangeElement.innerHTML = ''; 
    dockElement.innerHTML = '';
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    timerElement.textContent = "00:00";
    
    // Reset Current Streak (Best Streak stays)
    currentStreak = 0;
    updateStreakUI();

    modalElement.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Internal function to set up the board
function initRound() {
    if (timerInterval) clearInterval(timerInterval);
    
    currentInput = [];
    isGameActive = true;
    mistakeMadeInRound = false;
    
    // --- PICK UNIQUE SENTENCE ---
    // Pick random index from AVAILABLE pool
    const randomIndex = Math.floor(Math.random() * availableSentences.length);
    
    // Extract it
    currentTargetSentence = availableSentences[randomIndex];
    
    // Remove it from the pool so it doesn't repeat this session
    availableSentences.splice(randomIndex, 1);
    
    targetWords = currentTargetSentence.split(" ");

    // Reset Dock UI
    dockElement.innerHTML = ''; 
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    
    // Start Timer (Resume from accumulated)
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    spawnTargets();
}

// --- 2. Spawning Logic ---

function spawnTargets() {
    rangeElement.innerHTML = ''; 
    let shuffledWords = [...targetWords].sort(() => Math.random() - 0.5);

    shuffledWords.forEach(word => {
        const el = document.createElement('div');
        el.classList.add('target');
        el.textContent = word;
        el.addEventListener('click', () => handleShot(word, el));
        rangeElement.appendChild(el);
    });
}

// --- 3. Gameplay Logic ---

function handleShot(word, targetElement) {
    if (!isGameActive) return;

    // --- GUN ANIMATION ---
    triggerGunRecoil();

    // Visual: Mark target as shot
    targetElement.classList.add('shot');
    
    if (currentInput.length === 0) placeholder.style.display = 'none';

    // Logic: Add to input
    currentInput.push(word);
    
    // Visual: Add to Dock
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('dock-word');
    wordSpan.textContent = word;
    dockElement.appendChild(wordSpan);

    // Check Win
    if (currentInput.length === targetWords.length) {
        validateSentence();
    }
}

function triggerGunRecoil() {
    // Remove class if it exists to reset animation
    gunElement.classList.remove('recoil');
    // Force reflow (magic browser hack to restart animation)
    void gunElement.offsetWidth; 
    // Add class back
    gunElement.classList.add('recoil');
}

// --- 4. Validation & Win/Loss ---

function validateSentence() {
    const playerSentence = currentInput.join(" ");
    
    if (playerSentence === currentTargetSentence) {
        handleWin();
    } else {
        handleMistake();
    }
}

function handleWin() {
    clearInterval(timerInterval);
    isGameActive = false;

    // Save Time
    const now = Date.now();
    accumulatedTime += (now - startTime);

    // Streak Logic
    if (!mistakeMadeInRound) {
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        document.getElementById('streak-msg').textContent = "Perfect! Streak +1";
        document.getElementById('streak-msg').style.color = "#4CAF50";
    } else {
        currentStreak = 0;
        document.getElementById('streak-msg').textContent = "Mistakes made. Streak reset.";
        document.getElementById('streak-msg').style.color = "#ff9800";
    }
    updateStreakUI();

    // Update Modal
    document.getElementById('final-time').textContent = formatTime(accumulatedTime / 1000);
    document.getElementById('modal-streak').textContent = currentStreak;
    document.getElementById('modal-best').textContent = bestStreak;
    
    // Logic: Was this the last sentence?
    const nextBtn = document.getElementById('next-btn');
    const msg = document.getElementById('remaining-msg');
    
    if (availableSentences.length === 0) {
        document.getElementById('modal-title').textContent = "SESSION COMPLETE!";
        msg.textContent = "All sentences cleared! Returning to menu...";
        nextBtn.textContent = "Finish Session";
    } else {
        document.getElementById('modal-title').textContent = "Mission Complete!";
        msg.textContent = `${availableSentences.length} missions remaining.`;
        nextBtn.textContent = "Next Mission";
    }

    modalElement.classList.remove('hidden');
}

function handleMistake() {
    mistakeMadeInRound = true;
    dockElement.classList.add('shake');
    setTimeout(() => {
        dockElement.classList.remove('shake');
        clearInput(); 
    }, 800);
}

// --- 5. Utilities ---

function clearInput() {
    if (!isGameActive) return;
    mistakeMadeInRound = true;
    currentInput = [];
    dockElement.innerHTML = '';
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    const targets = document.querySelectorAll('.target');
    targets.forEach(t => t.classList.remove('shot'));
}

function updateStreakUI() {
    currStreakEl.textContent = currentStreak;
    bestStreakEl.textContent = bestStreak;
}

function updateTimer() {
    const currentRoundDuration = Date.now() - startTime;
    const totalDuration = accumulatedTime + currentRoundDuration;
    timerElement.textContent = formatTime(totalDuration / 1000);
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}