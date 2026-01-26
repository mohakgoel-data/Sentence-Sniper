# 🎯 Sentence Sniper

**Sentence Sniper** is a browser-based interactive game that gamifies language learning. Players must "shoot" scrambled words in the correct order to reconstruct sentences against a timer. It combines reflex-based arcade mechanics with educational syntax practice.

## ❓ Problem Statement

Traditional syntax exercises (reordering words to form sentences) are often static and unengaging for students. This project solves that by transforming a standard assessment task into a high-energy **"Shooting Gallery" experience**, utilizing visual feedback, audio cues, and streak mechanics to increase user retention and engagement.

## ✨ Features Implemented

* **Interactive Shooting Gallery:** Words appear as targets that react visually (bullet holes) when clicked.
* **Visual Gun Mechanics:** A center-screen gun with dynamic **recoil** and **muzzle flash** animations upon every shot.
* **Campaign Mode:** A session-based system where sentences are removed from the pool as they are solved; the game ends when all sentences are cleared.
* **Streak System:** Tracks current and best streaks. Streaks reset immediately upon a mistake or manual clear.
* **Accumulative Timer:** The timer pauses between levels and resumes, tracking the total time taken for the full session.
* **Audio Feedback:** Realistic firing sound effects synced with animations.
* **Responsive UI:** Flexbox-based layout that adapts target sizes to the screen.

## ⚡ DOM Concepts Used

This project is built with Vanilla JavaScript and relies heavily on DOM manipulation:

* **Dynamic Element Creation:** Using `document.createElement()` to spawn target words and build the sentence dock.
* **Event Handling:** Extensive use of `addEventListener` for game loop logic (clicks) and UI controls.
* **Class Manipulation:** Toggling CSS classes (e.g., `.shot`, `.shake`, `.recoil`) to trigger CSS3 animations.
* **Audio API:** Controlling `HTMLAudioElement` playback and resetting `currentTime` for rapid firing.
* **State Management:** Tracking arrays for `currentInput` vs `targetWords` and updating the DOM to reflect game state (Start/Win/Fail screens).

## 🚀 Steps to Play

The game is live and hosted online! You do not need to install anything.

1. **Visit the Website:** [Insert Your Hosted Link Here]
2. **Start:** Click the **"START CAMPAIGN"** button on the home screen to initialize the game session.

## ⚠️ Known Limitations & Notes

* **Mobile Experience:** While responsive, the game is optimized for larger screens. If you are playing on a mobile phone, **please enable "Desktop Site"** mode in your browser settings to ensure targets are sized correctly and do not overlap.
* **Local Storage:** High scores and streaks are session-based. If you refresh the browser page, your progress and "Best Streak" will reset.
