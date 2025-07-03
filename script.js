class BananaTimer {
    constructor() {
        this.banana = document.getElementById('banana');
        this.timer = document.getElementById('timer');
        this.selector = document.querySelector('.banana-selector');
        this.thumbs = document.querySelectorAll('.banana-thumb');
        
        this.timeLeft = 10;
        this.isRunning = false;
        this.interval = null;
        this.currentStage = 1;
        this.startTime = null;
        this.holdTimer = null;
        this.isHolding = false;
        
        this.init();
        this.loadFromCookies();
    }
    
    init() {
        this.banana.addEventListener('click', () => this.startTimer());
        
        // Add click and hold functionality for reset
        this.banana.addEventListener('mousedown', () => this.startHold());
        this.banana.addEventListener('mouseup', () => this.stopHold());
        this.banana.addEventListener('mouseleave', () => this.stopHold());
        
        // Touch events for mobile
        this.banana.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startHold();
        });
        this.banana.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopHold();
        });
        
        this.thumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const stage = parseInt(thumb.getAttribute('data-stage'));
                this.setStage(stage);
            });
        });
        this.setStage(1);
    }

    startHold() {
        if (!this.isRunning) return; // Only allow reset when timer is running
        this.isHolding = true;
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
    }

    loadFromCookies() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'bananaTimer') {
                try {
                    const data = JSON.parse(value);
                    this.timeLeft = data.timeLeft || 10;
                    this.isRunning = data.isRunning || false;
                    this.currentStage = data.currentStage || 1;
                    this.startTime = data.startTime || null;
                    
                    // If timer was running, calculate elapsed time and continue
                    if (this.isRunning && this.startTime) {
                        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                        this.timeLeft = Math.max(0, this.timeLeft - elapsed);
                        
                        if (this.timeLeft <= 0) {
                            this.timeLeft = 0;
                            this.isRunning = false;
                            this.startTime = null;
                        } else {
                            // Continue the timer
                            this.startTimer();
                        }
                    }
                    
                    this.timer.textContent = this.timeLeft;
                    this.setStage(this.currentStage);
                    break;
                } catch (e) {
                    console.error('Error parsing cookie data:', e);
                }
            }
        }
    }

    setStage(stage) {
        this.currentStage = stage;
        // Set timer based on stage (distribute 1-10 evenly over 10s)
        // Stage 1 = 10s, Stage 10 = 0s
        this.timeLeft = 10 - Math.round((stage - 1) * (10 / 9));
        this.timer.textContent = this.timeLeft;
        
        // Directly show the selected stage instead of calculating from percentage
        this.showBananaStage(stage);
        
        // Highlight selected thumb
        this.thumbs.forEach(thumb => thumb.classList.remove('selected'));
        const selectedThumb = document.querySelector('.banana-thumb[data-stage="' + stage + '"]');
        if (selectedThumb) selectedThumb.classList.add('selected');
        // If timer is running, reset interval and continue
        if (this.isRunning) {
            clearInterval(this.interval);
            this.startTimer();
        }
        this.saveToCookies();
    }

    getBrowningPercentage() {
        return Math.floor(((10 - this.timeLeft) / 10) * 100);
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
            this.timer.textContent = this.timeLeft;
            this.updateBananaColor(this.getBrowningPercentage());
            this.saveToCookies();
            if (this.timeLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
        
        this.saveToCookies();
    }
    
    updateBananaColor(percentage) {
        // Calculate which stage to show (1-11)
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
        // Hide all images
        const images = this.banana.querySelectorAll('.banana-image');
        images.forEach(img => img.classList.remove('active'));
        // Show the appropriate stage
        const activeImage = this.banana.querySelector(`[data-stage="${stage}"]`);
        if (activeImage) {
            activeImage.classList.add('active');
        }
        // Also update selector highlight
        this.thumbs.forEach(thumb => thumb.classList.remove('selected'));
        const selectedThumb = document.querySelector('.banana-thumb[data-stage="' + stage + '"]');
        if (selectedThumb) selectedThumb.classList.add('selected');
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