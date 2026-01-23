const SENTENCES = [
    "Variables Store Data For Later Use",
    "JavaScript Controls The Web Page Behavior",
    "The Cat Sleeps On The Sofa",
    "She Placed The Book On The Table",
    "I Locked The Door Before Leaving",
    "Rain Fell Softly During The Night",
    "Please Turn Off The Kitchen Light"
];


const rangeElement = document.getElementById('firing-range');
const dockElement = document.getElementById('sentence-dock');
const timerElement = document.getElementById('timer');
const startScreen = document.getElementById('start-screen');
const modalElement = document.getElementById('game-over-modal');
const placeholder = document.getElementById('placeholder-text');
const currStreakEl = document.getElementById('curr-streak');
const bestStreakEl = document.getElementById('best-streak');
const gunElement = document.getElementById('handgun');
const flashElement = document.getElementById('muzzle-flash');
const shotSound = document.getElementById('gunshot-sound');


let availableSentences = []; 
let currentTargetSentence = "";
let targetWords = [];
let currentInput = [];

let startTime;
let accumulatedTime = 0;
let timerInterval = null;

let isGameActive = false;
let currentStreak = 0;
let bestStreak = 0;
let mistakeMadeInRound = false;


function startGame() {
    startScreen.classList.add('hidden');
    availableSentences = [...SENTENCES];
    accumulatedTime = 0;
    currentStreak = 0;
    updateStreakUI();
    initRound();
}

function nextMission() {
    if (availableSentences.length === 0) {
        goToTitle(); 
    } else {
        modalElement.classList.add('hidden');
        initRound();
    }
}

function goToTitle() {
    if (timerInterval) clearInterval(timerInterval);
    isGameActive = false;
    
    rangeElement.innerHTML = ''; 
    dockElement.innerHTML = '';
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    timerElement.textContent = "00:00";
    
    currentStreak = 0;
    updateStreakUI();

    modalElement.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function initRound() {
    if (timerInterval) clearInterval(timerInterval);
    
    currentInput = [];
    isGameActive = true;
    mistakeMadeInRound = false;
    
    const randomIndex = Math.floor(Math.random() * availableSentences.length);
    currentTargetSentence = availableSentences[randomIndex];
    availableSentences.splice(randomIndex, 1);
    targetWords = currentTargetSentence.split(" ");

    dockElement.innerHTML = ''; 
    dockElement.appendChild(placeholder);
    placeholder.style.display = 'block';
    
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    spawnTargets();
}


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


function handleShot(word, targetElement) {
    if (!isGameActive) return;

    triggerGunRecoil();

    targetElement.classList.add('shot');
    if (currentInput.length === 0) placeholder.style.display = 'none';

    currentInput.push(word);
    
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('dock-word');
    wordSpan.textContent = word;
    dockElement.appendChild(wordSpan);

    if (currentInput.length === targetWords.length) {
        validateSentence();
    }
}

function triggerGunRecoil() {
    shotSound.currentTime = 0;
    shotSound.play();

    gunElement.classList.remove('recoil');
    flashElement.classList.remove('flash-active');
    
    void gunElement.offsetWidth; 
    
    gunElement.classList.add('recoil');
    flashElement.classList.add('flash-active');
}


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

    const now = Date.now();
    accumulatedTime += (now - startTime);

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

    document.getElementById('final-time').textContent = formatTime(accumulatedTime / 1000);
    document.getElementById('modal-streak').textContent = currentStreak;
    document.getElementById('modal-best').textContent = bestStreak;
    
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