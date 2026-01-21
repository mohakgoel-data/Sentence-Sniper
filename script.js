// --- Configuration ---
const SENTENCE = "The quick brown fox jumps over the lazy dog";
const WORDS = SENTENCE.split(" ");
const rangeElement = document.getElementById('firing-range');
const dockElement = document.getElementById('sentence-dock');
const timerElement = document.getElementById('timer');
const msgElement = document.getElementById('message-display');

// --- State ---
let currentInput = []; // Words shot so far
let startTime;
let timerInterval;
let isGameActive = false;

// --- Initialization ---
function initGame() {
    isGameActive = true;
    currentInput = [];
    startTime = Date.now();
    
    // Start Timer
    timerInterval = setInterval(updateTimer, 1000);
    
    // Create Targets
    spawnTargets();
}

// --- Spawning Logic (With Overlap Prevention) ---
function spawnTargets() {
    rangeElement.innerHTML = ''; // Clear board
    
    // 1. Create a shuffled copy of words to spawn
    // We map them to objects so we can track their original index if needed, 
    // but for now we just need the text.
    let shuffledWords = [...WORDS].sort(() => Math.random() - 0.5);

    // 2. Place them safely
    const placedRects = []; // Store coordinates of placed items to check overlap

    shuffledWords.forEach(word => {
        const el = document.createElement('div');
        el.classList.add('target');
        el.textContent = word;
        
        // Add click listener immediately
        el.addEventListener('click', () => handleShot(word, el));
        
        rangeElement.appendChild(el);

        // Calculate Random Position
        let safe = false;
        let attempts = 0;
        
        while (!safe && attempts < 50) {
            // Random % positions (Keep padding from edges: 5% to 85%)
            const left = 5 + Math.random() * 85;
            const top = 5 + Math.random() * 80;
            
            // Temporarily apply to check collision
            el.style.left = `${left}%`;
            el.style.top = `${top}%`;
            
            const rect = el.getBoundingClientRect();
            
            // Check collision with other placed rects
            let collision = false;
            for (let r of placedRects) {
                // Simple AABB Collision Check
                if (
                    rect.left < r.right + 10 &&
                    rect.right > r.left - 10 &&
                    rect.top < r.bottom + 10 &&
                    rect.bottom > r.top - 10
                ) {
                    collision = true;
                    break;
                }
            }
            
            if (!collision) {
                safe = true;
                placedRects.push(rect);
            }
            attempts++;
        }
    });
}

// --- Gameplay Logic ---
function handleShot(word, targetElement) {
    if (!isGameActive) return;

    // 1. Visual: Mark target as shot
    targetElement.classList.add('shot');
    
    // 2. Logic: Add to input
    currentInput.push(word);
    
    // 3. Visual: Add to Dock
    const dockWord = document.createElement('div');
    dockWord.classList.add('dock-word');
    dockWord.textContent = word;
    dockElement.appendChild(dockWord);

    // 4. Check Win/Loss
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
        document.getElementById('game-over-modal').classList.remove('hidden');
    } else {
        // FAIL
        msgElement.textContent = "Incorrect! Reloading targets...";
        msgElement.style.color = "#ff4444";
        
        // Visual shake effect on dock
        dockElement.classList.add('shake');
        
        setTimeout(() => {
            resetRound();
        }, 1000); // 1 second delay to realize mistake
    }
}

function resetRound() {
    // 1. Clear Data
    currentInput = [];
    
    // 2. Clear Dock
    dockElement.innerHTML = '';
    dockElement.classList.remove('shake');
    
    // 3. Restore Targets (Remove .shot class)
    const targets = document.querySelectorAll('.target');
    targets.forEach(t => t.classList.remove('shot'));
    
    // 4. Reset Message
    msgElement.textContent = "Keep shooting! Timer is running!";
    msgElement.style.color = "#ffd700";
}

// --- Timer Utility ---
function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerElement.textContent = `${minutes}:${seconds}`;
}

// Start Game on Load
initGame();