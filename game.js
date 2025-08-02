class BubbleBuddy {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.soundToggle = document.getElementById('soundToggle');
        this.soundEnabled = true;
        this.bubbles = [];
        this.bubbleInterval = null;
        
        // Sea creatures and surprises that appear when bubbles pop
        this.surprises = [
            '🐠', '🐟', '🦈', '🐙', '🦑', '🐡', '🦞', '🦀', '🐚', '⭐',
            '🌟', '✨', '💎', '👑', '🎩', '🎭', '🎪', '🎈', '🌈', '🦋',
            '🌺', '🌸', '🌼', '🍄', '🎁', '🧸', '🎀', '💝', '🎊', '🎉'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startBubbleGeneration();
        this.createAudioContext();
    }
    
    setupEventListeners() {
        // Sound toggle
        this.soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            this.soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
            this.soundToggle.classList.toggle('bg-gray-300', !this.soundEnabled);
        });
        
        // Prevent context menu on long press
        this.gameArea.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    createAudioContext() {
        // Create Web Audio API context for bubble pop sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }
    }
    
    playPopSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Create a pleasant pop sound
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Could not play sound');
        }
    }
    
    createBubble() {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        
        // Random size between 60px and 120px
        const size = Math.random() * 60 + 60;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        
        // Random horizontal position
        const maxX = window.innerWidth - size;
        const x = Math.random() * maxX;
        bubble.style.left = x + 'px';
        
        // Random animation duration (speed)
        const duration = Math.random() * 3 + 4; // 4-7 seconds
        bubble.style.animationDuration = duration + 's';
        
        // Random bubble color tint
        const colors = [
            'rgba(147, 197, 253, 0.3)', // blue
            'rgba(196, 181, 253, 0.3)', // purple
            'rgba(252, 165, 165, 0.3)', // red
            'rgba(134, 239, 172, 0.3)', // green
            'rgba(253, 224, 71, 0.3)',  // yellow
            'rgba(251, 207, 232, 0.3)'  // pink
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        bubble.style.background = `linear-gradient(135deg, ${randomColor}, rgba(255,255,255,0.1))`;
        
        // Add click/touch event
        bubble.addEventListener('click', (e) => this.popBubble(e, bubble));
        bubble.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.popBubble(e, bubble);
        });
        
        this.gameArea.appendChild(bubble);
        this.bubbles.push(bubble);
        
        // Remove bubble after animation completes
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
                this.bubbles = this.bubbles.filter(b => b !== bubble);
            }
        }, duration * 1000);
    }
    
    popBubble(event, bubble) {
        event.stopPropagation();
        
        // Play pop sound
        this.playPopSound();
        
        // Get bubble position for surprise placement
        const rect = bubble.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Add pop animation
        bubble.classList.add('pop-animation');
        
        // Create surprise element
        this.createSurprise(centerX, centerY);
        
        // Remove bubble from array and DOM
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
                this.bubbles = this.bubbles.filter(b => b !== bubble);
            }
        }, 300);
    }
    
    createSurprise(x, y) {
        const surprise = document.createElement('div');
        const randomSurprise = this.surprises[Math.floor(Math.random() * this.surprises.length)];
        
        surprise.textContent = randomSurprise;
        surprise.className = 'absolute text-6xl z-20 reveal-animation';
        surprise.style.left = (x - 30) + 'px';
        surprise.style.top = (y - 30) + 'px';
        surprise.style.pointerEvents = 'none';
        
        this.gameArea.appendChild(surprise);
        
        // Fade out after 2.5 seconds
        setTimeout(() => {
            surprise.classList.remove('reveal-animation');
            surprise.classList.add('fade-out-animation');
            
            setTimeout(() => {
                if (surprise.parentNode) {
                    surprise.parentNode.removeChild(surprise);
                }
            }, 1000);
        }, 2500);
    }
    
    startBubbleGeneration() {
        // Generate a new bubble every 1.5-3 seconds
        const generateBubble = () => {
            this.createBubble();
            const nextInterval = Math.random() * 1500 + 1500; // 1.5-3 seconds
            setTimeout(generateBubble, nextInterval);
        };
        
        // Start generating bubbles after a short delay
        setTimeout(generateBubble, 1000);
    }
    
    // Handle window resize
    handleResize() {
        // Remove bubbles that are outside the new viewport
        this.bubbles.forEach(bubble => {
            const rect = bubble.getBoundingClientRect();
            if (rect.left > window.innerWidth) {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            }
        });
        this.bubbles = this.bubbles.filter(bubble => bubble.parentNode);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new BubbleBuddy();
    
    // Handle window resize
    window.addEventListener('resize', () => game.handleResize());
    
    // Resume audio context on first user interaction (required by browsers)
    document.addEventListener('click', () => {
        if (game.audioContext && game.audioContext.state === 'suspended') {
            game.audioContext.resume();
        }
    }, { once: true });
});
