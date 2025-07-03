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
        
        this.init();
    }
    
    init() {
        this.banana.addEventListener('click', () => this.startTimer());
        this.thumbs.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                const stage = parseInt(thumb.getAttribute('data-stage'));
                this.setStage(stage);
            });
        });
        this.setStage(1);
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
        
        // Add fade-away effect to everything except banana
        document.body.classList.add('banana-only-mode');
        
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.timer.textContent = this.timeLeft;
            this.updateBananaColor(this.getBrowningPercentage());
            if (this.timeLeft <= 0) {
                this.stopTimer();
            }
        }, 1000);
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
        
        // Remove the banana-only-mode class to show all elements again
        document.body.classList.remove('banana-only-mode');
    }
    

}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BananaTimer();
}); 