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

// --- State Variables ---
let currentTargetSentence = "";
let targetWords = [];
let currentInput = [];

// Timer State
let startTime;
let accumulatedTime = 0; // Stores time from previous rounds
let timerInterval = null;

// Game State
let isGameActive = false;
let currentStreak = 0;
let bestStreak = 0;
let mistakeMadeInRound = false;

// --- 1. Game Flow Controls ---

// Called from Main Menu (Resets EVERYTHING)
function startGame() {
    startScreen.classList.add('hidden');
    
    // Reset Timer totals
    accumulatedTime = 0;
    
    // Reset Streaks for new session
    currentStreak = 0;
    updateStreakUI();
    
    initRound();
}

// Called from "Next Mission" Button (Keeps time & streak)
function nextMission() {
    modalElement.classList.add('hidden');
    initRound();
}

// Called from "Restart" Button (Quits to Title)
function goToTitle() {
    if (timerInterval) clearInterval(timerInterval);
    isGameActive = false;
    
    // Clear UI
    rangeElement.innerHTML = ''; 
    dockElement.innerHTML = '';
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    timerElement.textContent = "00:00";
    
    modalElement.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Internal function to set up the board
function initRound() {
    // Stop any existing timer logic
    if (timerInterval) clearInterval(timerInterval);
    
    currentInput = [];
    isGameActive = true;
    mistakeMadeInRound = false; // Reset mistake tracker
    
    // Pick Random Sentence
    const randomIndex = Math.floor(Math.random() * SENTENCES.length);
    currentTargetSentence = SENTENCES[randomIndex];
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

    // Visual: Mark target as shot
    targetElement.classList.add('shot');
    
    // Remove placeholder on first shot
    if (currentInput.length === 0) {
        placeholder.style.display = 'none';
    }

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
    // 1. Pause Timer
    clearInterval(timerInterval);
    isGameActive = false;

    // 2. Save Time for next round
    const now = Date.now();
    accumulatedTime += (now - startTime);

    // 3. Handle Streak
    if (!mistakeMadeInRound) {
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        document.getElementById('streak-msg').textContent = "Perfect Run! Streak Increased!";
        document.getElementById('streak-msg').style.color = "#4CAF50";
    } else {
        currentStreak = 0;
        document.getElementById('streak-msg').textContent = "Completed (with errors). Streak Reset.";
        document.getElementById('streak-msg').style.color = "#ff9800";
    }
    updateStreakUI();

    // 4. Update Modal Stats
    document.getElementById('final-time').textContent = formatTime(accumulatedTime / 1000);
    document.getElementById('modal-streak').textContent = currentStreak;
    document.getElementById('modal-best').textContent = bestStreak;

    // 5. Show Modal
    modalElement.classList.remove('hidden');
}

function handleMistake() {
    mistakeMadeInRound = true;
    
    // Shake animation
    dockElement.classList.add('shake');
    
    setTimeout(() => {
        dockElement.classList.remove('shake');
        clearInput(); // Force clear on mistake
    }, 800);
}

// --- 5. Utilities ---

function clearInput() {
    if (!isGameActive) return;
    
    // Penalize streak if cleared manually
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
    // Current round duration + previously accumulated time
    const currentRoundDuration = Date.now() - startTime;
    const totalDuration = accumulatedTime + currentRoundDuration;
    
    timerElement.textContent = formatTime(totalDuration / 1000);
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}