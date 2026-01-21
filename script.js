// --- Config ---
// EXACTLY 8 words for the grid layout
const SENTENCE = "the surgeon repaired the artery during emergency surgery"; 
const WORDS = SENTENCE.split(" ");
const rangeElement = document.getElementById('firing-range');
const dockElement = document.getElementById('sentence-dock');
const timerElement = document.getElementById('timer');
const modalElement = document.getElementById('game-over-modal');

// --- State ---
let currentInput = [];
let startTime;
let timerInterval = null;
let isGameActive = false;

// --- Core Functions ---

function fullReset() {
    // 1. Stop any existing timer
    if (timerInterval) clearInterval(timerInterval);
    
    // 2. Hide Modal
    modalElement.classList.add('hidden');
    
    // 3. Reset State variables
    currentInput = [];
    isGameActive = true;
    startTime = Date.now();
    
    // 4. Reset DOM Elements
    dockElement.innerHTML = '';
    dockElement.classList.remove('shake');
    
    // 5. Start New Timer & Spawn
    timerElement.textContent = "00:00";
    timerInterval = setInterval(updateTimer, 1000);
    spawnTargets();
}

function spawnTargets() {
    rangeElement.innerHTML = ''; // Clear board
    
    // Shuffle words
    let shuffledWords = [...WORDS].sort(() => Math.random() - 0.5);

    shuffledWords.forEach(word => {
        const el = document.createElement('div');
        el.classList.add('target');
        el.textContent = word;
        
        // Click Event
        el.addEventListener('click', () => handleShot(word, el));
        
        rangeElement.appendChild(el);
    });
}

function handleShot(word, targetElement) {
    if (!isGameActive) return;

    // Visual: Mark target as shot
    targetElement.classList.add('shot');
    
    // Logic: Add to input
    currentInput.push(word);
    
    // Visual: Add to Dock
    const slot = document.createElement('div');
    slot.classList.add('dock-slot');
    slot.textContent = word;
    dockElement.appendChild(slot);

    // Check if sentence is full
    if (currentInput.length === WORDS.length) {
        validateSentence();
    }
}

function validateSentence() {
    const playerSentence = currentInput.join(" ");
    
    if (playerSentence === SENTENCE) {
        // WIN
        clearInterval(timerInterval);
        isGameActive = false;
        document.getElementById('final-time').textContent = timerElement.textContent;
        modalElement.classList.remove('hidden');
    } else {
        // FAIL - Trigger "Reload" logic
        
        // 1. Shake animation
        dockElement.classList.add('shake');
        
        // 2. Wait 0.8s then soft reset (keep timer running)
        setTimeout(() => {
            softResetRound(); 
        }, 800);
    }
}

function softResetRound() {
    // Keeps timer running, but clears progress
    currentInput = [];
    dockElement.innerHTML = '';
    dockElement.classList.remove('shake');
    
    // Restore targets
    const targets = document.querySelectorAll('.target');
    targets.forEach(t => t.classList.remove('shot'));
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// Start game immediately on load
fullReset();