// --- Configuration ---
const SENTENCES = [
    "the cat sleeps on the sofa",
    "she placed the book on the table",
    "i locked the door before leaving",
    "rain fell softly during the night",
    "please turn off the kitchen light"
];

// --- Global Elements ---
const rangeElement = document.getElementById('firing-range');
const dockElement = document.getElementById('sentence-dock');
const timerElement = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const modalElement = document.getElementById('game-over-modal');
const placeholder = document.getElementById('placeholder-text');

// --- State Variables ---
let currentTargetSentence = "";
let targetWords = [];
let currentInput = [];
let startTime;
let timerInterval = null;
let isGameActive = false;

// --- 1. Game Flow Controls ---

function startGame() {
    startScreen.classList.add('hidden');
    initGame();
}

function initGame() {
    // 1. Reset Logic
    if (timerInterval) clearInterval(timerInterval);
    modalElement.classList.add('hidden');
    currentInput = [];
    isGameActive = true;
    
    // 2. Pick Random Sentence (Max 8 words logic applied if needed, but array is safe)
    const randomIndex = Math.floor(Math.random() * SENTENCES.length);
    currentTargetSentence = SENTENCES[randomIndex];
    targetWords = currentTargetSentence.split(" ");

    // 3. Reset UI
    dockElement.innerHTML = ''; // Clear dock
    dockElement.appendChild(placeholder); // Restore placeholder
    placeholder.style.display = 'block';
    
    // 4. Start Timer & Spawn
    startTime = Date.now();
    timerElement.textContent = "00:00";
    timerInterval = setInterval(updateTimer, 1000);
    
    spawnTargets();
}

// --- 2. Spawning Logic ---

function spawnTargets() {
    rangeElement.innerHTML = ''; // Clear firing range
    
    // Shuffle words for the targets
    let shuffledWords = [...targetWords].sort(() => Math.random() - 0.5);

    shuffledWords.forEach(word => {
        const el = document.createElement('div');
        el.classList.add('target');
        el.textContent = word;
        el.dataset.word = word; // Store word in data attribute
        
        // Click Event
        el.addEventListener('click', () => handleShot(word, el));
        
        rangeElement.appendChild(el);
    });
}

// --- 3. Gameplay Logic ---

function handleShot(word, targetElement) {
    if (!isGameActive) return;

    // Visual: Mark target as shot
    targetElement.classList.add('shot');
    
    // Remove placeholder if it's the first shot
    if (currentInput.length === 0) {
        placeholder.style.display = 'none';
    }

    // Logic: Add to input array
    currentInput.push(word);
    
    // Visual: Add text to dock (Natural Sentence Flow)
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('dock-word');
    wordSpan.textContent = word;
    dockElement.appendChild(wordSpan);

    // Check Win
    if (currentInput.length === targetWords.length) {
        validateSentence();
    }
}

// --- 4. The "Clear" Button Logic ---
function clearInput() {
    if (!isGameActive) return;

    // 1. Clear logic array
    currentInput = [];

    // 2. Clear Dock UI
    dockElement.innerHTML = '';
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';

    // 3. Restore Targets (Remove 'shot' class)
    const targets = document.querySelectorAll('.target');
    targets.forEach(t => t.classList.remove('shot'));

    // Note: Timer does NOT reset. That is the penalty.
}

// --- 5. Validation ---

function validateSentence() {
    const playerSentence = currentInput.join(" ");
    
    if (playerSentence === currentTargetSentence) {
        // WIN
        clearInterval(timerInterval);
        isGameActive = false;
        document.getElementById('final-time').textContent = timerElement.textContent;
        modalElement.classList.remove('hidden');
    } else {
        // FAIL - Trigger Shake & Auto Clear
        dockElement.classList.add('shake');
        
        setTimeout(() => {
            dockElement.classList.remove('shake');
            clearInput(); // Auto-clear if wrong
        }, 800);
    }
}

function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}