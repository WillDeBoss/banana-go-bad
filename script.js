class BananaTimer {
    constructor() {
        this.banana = document.getElementById('banana');
        this.timer = document.getElementById('timer');
        this.selector = document.querySelector('.banana-selector');
        this.thumbs = document.querySelectorAll('.banana-thumb');
        
        this.timeLeft = 950400; // 11 days in seconds (11 * 24 * 60 * 60)
        this.isRunning = false;
        this.interval = null;
        this.currentStage = 1;
        this.startTime = null;
        this.holdTimer = null;
        this.isHolding = false;
        this.holdStartTime = null; // Track when hold started
        
        this.loadFromCookies(); // Load first before init
        this.init();
    }
    
    init() {
        this.banana.addEventListener('click', (e) => {
            // Prevent click if we just completed a long hold (potential reset)
            if (this.holdStartTime) {
                const holdDuration = Date.now() - this.holdStartTime;
                if (holdDuration > 1000) { // If held for more than 1 second, ignore the click
                    return;
                }
            }
            this.startTimer();
        });
        
        // Add click and hold functionality for reset
        this.banana.addEventListener('mousedown', () => this.startHold());
        this.banana.addEventListener('mouseup', () => this.stopHold());
        this.banana.addEventListener('mouseleave', () => this.stopHold());
        
        // Touch events for mobile - handle both tap and hold
        let touchStartTime = 0;
        
        this.banana.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartTime = Date.now();
            this.startHold();
        });
        
        this.banana.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchDuration = Date.now() - touchStartTime;
            
            this.stopHold();
            
            // If touch was less than 500ms, treat it as a tap to start timer
            if (touchDuration < 500) {
                this.startTimer();
            }
        });
        
        // Handle touch cancel (when user drags finger away)
        this.banana.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            this.stopHold();
        });
        
        this.thumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const stage = parseInt(thumb.getAttribute('data-stage'));
                this.setStage(stage);
            });
            
            // Add touch support for thumbnails too
            thumb.addEventListener('touchend', (e) => {
                e.preventDefault();
                const stage = parseInt(thumb.getAttribute('data-stage'));
                this.setStage(stage);
            });
        });
        
        // Only set stage to 1 if we didn't load from cookies
        if (!this.loadedFromCookies) {
            this.setStage(1);
        }
    }

    startHold() {
        if (!this.isRunning) return; // Only allow reset when timer is running
        this.isHolding = true;
        this.holdStartTime = Date.now(); // Record when hold started
        this.holdTimer = setTimeout(() => {
            this.resetToSelection();
        }, 5000); // 5 seconds
    }

    stopHold() {
        this.isHolding = false;
        if (this.holdTimer) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
        
        // Clear hold start time after a small delay to allow click event to check it
        setTimeout(() => {
            this.holdStartTime = null;
        }, 100);
    }

    resetToSelection() {
        this.stopTimer();
        this.setStage(1); // Reset to first stage
        this.saveToCookies();
    }

    saveToCookies() {
        const data = {
            timeLeft: this.timeLeft,
            isRunning: this.isRunning,
            currentStage: this.currentStage,
            startTime: this.startTime
        };
        document.cookie = `bananaTimer=${JSON.stringify(data)}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        console.log('Saved to cookies:', data); // Debug log
    }

    loadFromCookies() {
        console.log('Loading from cookies...'); // Debug log
        console.log('All cookies:', document.cookie); // Debug log
        
        const cookies = document.cookie.split(';');
        this.loadedFromCookies = false;
        
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            console.log('Checking cookie:', name, '=', value); // Debug log
            
            if (name === 'bananaTimer') {
                try {
                    const decodedValue = decodeURIComponent(value);
                    console.log('Decoded cookie value:', decodedValue); // Debug log
                    
                    const data = JSON.parse(decodedValue);
                    console.log('Parsed cookie data:', data); // Debug log
                    
                    this.timeLeft = data.timeLeft || 950400;
                    this.isRunning = data.isRunning || false;
                    this.currentStage = data.currentStage || 1;
                    this.startTime = data.startTime || null;
                    this.loadedFromCookies = true;
                    
                    console.log('Loaded state:', {
                        timeLeft: this.timeLeft,
                        isRunning: this.isRunning,
                        currentStage: this.currentStage,
                        startTime: this.startTime
                    }); // Debug log
                    
                    // If timer was running, calculate elapsed time and continue
                    if (this.isRunning && this.startTime) {
                        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                        console.log('Elapsed time:', elapsed, 'seconds'); // Debug log
                        this.timeLeft = Math.max(0, this.timeLeft - elapsed);
                        
                        if (this.timeLeft <= 0) {
                            console.log('Timer expired while away'); // Debug log
                            this.timeLeft = 0;
                            this.isRunning = false;
                            this.startTime = null;
                            // Update to final stage
                            this.currentStage = 11;
                        } else {
                            console.log('Continuing timer with', this.timeLeft, 'seconds left'); // Debug log
                            // Continue the timer - don't call startTimer() as it resets startTime
                            this.continueTimer();
                        }
                    }
                    
                    // Update display
                    this.updateTimerDisplay();
                    this.showBananaStage(this.currentStage);
                    this.updateThumbnailSelection();
                    
                    console.log('Cookie loading complete'); // Debug log
                    break;
                } catch (e) {
                    console.error('Error parsing cookie data:', e);
                    console.error('Raw cookie value:', value);
                }
            }
        }
        
        if (!this.loadedFromCookies) {
            console.log('No valid cookie data found, starting fresh'); // Debug log
        }
    }

    continueTimer() {
        // Continue an existing timer without resetting startTime
        if (this.isRunning && this.timeLeft > 0) {
            // Add fade-away effect to everything except banana
            document.body.classList.add('banana-only-mode');
            
            this.interval = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();
                this.updateBananaColor(this.getBrowningPercentage());
                this.saveToCookies();
                if (this.timeLeft <= 0) {
                    this.stopTimer();
                }
            }, 1000);
        }
    }

    updateTimerDisplay() {
        const days = Math.floor(this.timeLeft / (24 * 60 * 60));
        const hours = Math.floor((this.timeLeft % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((this.timeLeft % (60 * 60)) / 60);
        
        if (days > 0) {
            this.timer.textContent = `${days}d ${hours}h`;
        } else if (hours > 0) {
            this.timer.textContent = `${hours}h ${minutes}m`;
        } else {
            this.timer.textContent = `${minutes}m`;
        }
    }

    updateThumbnailSelection() {
        // Update thumbnail selection based on current stage
        this.thumbs.forEach(thumb => thumb.classList.remove('selected'));
        const selectedThumb = document.querySelector('.banana-thumb[data-stage="' + this.currentStage + '"]');
        if (selectedThumb) selectedThumb.classList.add('selected');
    }

    setStage(stage) {
        this.currentStage = stage;
        // Set timer based on stage - each stage represents 1 day less
        // Stage 1 = 11 days, Stage 2 = 10 days, ..., Stage 11 = 0 days
        const daysLeft = 11 - stage;
        this.timeLeft = daysLeft * 24 * 60 * 60; // Convert days to seconds
        this.updateTimerDisplay();
        
        // Directly show the selected stage instead of calculating from percentage
        this.showBananaStage(stage);
        
        // Highlight selected thumb
        this.updateThumbnailSelection();
        
        // If timer is running, reset interval and continue
        if (this.isRunning) {
            clearInterval(this.interval);
            this.startTimer();
        }
        this.saveToCookies();
    }

    getBrowningPercentage() {
        // Calculate percentage based on 11 days total
        return Math.floor(((950400 - this.timeLeft) / 950400) * 100);
    }
    
    showBananaStage(stage) {
        // Hide all images
        const images = this.banana.querySelectorAll('.banana-image');
        images.forEach(img => img.classList.remove('active'));
        // Show the specific stage
        const activeImage = this.banana.querySelector(`[data-stage="${stage}"]`);
        if (activeImage) {
            activeImage.classList.add('active');
        }
    }
    
    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();
        
        // Add fade-away effect to everything except banana
        document.body.classList.add('banana-only-mode');
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            this.updateBananaColor(this.getBrowningPercentage());
            this.saveToCookies();
            if (this.timeLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
        
        this.saveToCookies();
    }
    
    updateBananaColor(percentage) {
        // Calculate which stage to show (1-11) based on days elapsed
        // Each stage represents approximately 9.09% of the total time (100% / 11 stages)
        let stage = 1;
        if (percentage >= 9.09) stage = 2;
        if (percentage >= 18.18) stage = 3;
        if (percentage >= 27.27) stage = 4;
        if (percentage >= 36.36) stage = 5;
        if (percentage >= 45.45) stage = 6;
        if (percentage >= 54.54) stage = 7;
        if (percentage >= 63.63) stage = 8;
        if (percentage >= 72.72) stage = 9;
        if (percentage >= 81.81) stage = 10;
        if (percentage >= 90.90) stage = 11;
        
        // Update current stage
        this.currentStage = stage;
        
        // Hide all images
        const images = this.banana.querySelectorAll('.banana-image');
        images.forEach(img => img.classList.remove('active'));
        // Show the appropriate stage
        const activeImage = this.banana.querySelector(`[data-stage="${stage}"]`);
        if (activeImage) {
            activeImage.classList.add('active');
        }
        // Also update selector highlight
        this.updateThumbnailSelection();
    }
    
    stopTimer() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.startTime = null;
        
        // Remove the banana-only-mode class to show all elements again
        document.body.classList.remove('banana-only-mode');
        this.saveToCookies();
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BananaTimer();
}); 