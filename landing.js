class LandingPage {
    constructor() {
        this.currentCharacterIndex = 0;
        this.characters = ['😊', '😎', '🥳', '🤓', '😇', '🤪', '🥸', '🦄', '🐸', '🦊', '🐱', '🐶', '🐼', '🦁', '🐯', '🐰'];
        this.playerName = '';
        this.roomCode = '';
        
        this.init();
    }

    init() {
        this.updateCharacterDisplay();
        this.setupEventListeners();
        this.validateForm();
    }

    setupEventListeners() {
        // Character navigation
        document.getElementById('charLeft').addEventListener('click', () => {
            this.currentCharacterIndex = (this.currentCharacterIndex - 1 + this.characters.length) % this.characters.length;
            this.updateCharacterDisplay();
        });

        document.getElementById('charRight').addEventListener('click', () => {
            this.currentCharacterIndex = (this.currentCharacterIndex + 1) % this.characters.length;
            this.updateCharacterDisplay();
        });

        // Player name input
        document.getElementById('playerName').addEventListener('input', (e) => {
            this.playerName = e.target.value.trim();
            this.validateForm();
        });

        // Buttons
        document.getElementById('createRoomBtn').addEventListener('click', () => {
            if (this.playerName) {
                this.createRoom();
            }
        });

        document.getElementById('joinRoomBtn').addEventListener('click', () => {
            if (this.playerName) {
                this.showJoinRoomModal();
            }
        });

        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal('roomModal');
        });

        // Camera permission
        document.getElementById('allowCameraBtn').addEventListener('click', () => {
            this.requestCameraPermission();
        });

        document.getElementById('cancelCameraBtn').addEventListener('click', () => {
            this.closeModal('cameraModal');
        });

        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Enter key handling
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.playerName) {
                this.createRoom();
            }
        });
    }

    updateCharacterDisplay() {
        const display = document.getElementById('characterDisplay');
        display.textContent = this.characters[this.currentCharacterIndex];
        
        // Add a little animation
        display.style.transform = 'scale(0.8)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 150);
    }

    validateForm() {
        const createBtn = document.getElementById('createRoomBtn');
        const joinBtn = document.getElementById('joinRoomBtn');
        const isValid = this.playerName.length >= 2;
        
        createBtn.disabled = !isValid;
        joinBtn.disabled = !isValid;
        
        createBtn.style.opacity = isValid ? '1' : '0.6';
        joinBtn.style.opacity = isValid ? '1' : '0.6';
        createBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        joinBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
    }

    generateRoomCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    createRoom() {
        this.roomCode = this.generateRoomCode();
        this.showRoomModal('create');
    }

    showJoinRoomModal() {
        this.showRoomModal('join');
    }

    showRoomModal(type) {
        const modal = document.getElementById('roomModal');
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        if (type === 'create') {
            title.textContent = '🎉 Room Created!';
            body.innerHTML = `
                <div class="room-info">
                    <p>Share this code with your friends:</p>
                    <div class="room-code">
                        <h4>Room Code</h4>
                        <div class="code-display">${this.roomCode}</div>
                        <button class="copy-btn" onclick="landingPage.copyRoomCode()">📋 Copy Code</button>
                    </div>
                    <p>Waiting for players to join...</p>
                    <div style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="landingPage.startGame()">🚀 Start Game</button>
                    </div>
                </div>
            `;
        } else {
            title.textContent = '🚪 Join Room';
            body.innerHTML = `
                <div class="join-room">
                    <p>Enter the room code to join:</p>
                    <div class="join-input">
                        <input type="text" id="joinCode" placeholder="Room Code" maxlength="6" style="text-transform: uppercase;">
                        <button onclick="landingPage.joinRoom()">Join</button>
                    </div>
                    <p style="color: #666; font-size: 0.9rem; margin-top: 15px;">
                        Ask your friend for the 6-character room code
                    </p>
                </div>
            `;
            
            // Focus the input and add enter key handler
            setTimeout(() => {
                const joinInput = document.getElementById('joinCode');
                joinInput.focus();
                joinInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.joinRoom();
                    }
                });
                // Auto-uppercase
                joinInput.addEventListener('input', (e) => {
                    e.target.value = e.target.value.toUpperCase();
                });
            }, 100);
        }

        this.showModal('roomModal');
    }

    copyRoomCode() {
        navigator.clipboard.writeText(this.roomCode).then(() => {
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.style.background = 'rgba(46, 213, 115, 0.3)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.roomCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const copyBtn = document.querySelector('.copy-btn');
            copyBtn.innerHTML = '✅ Copied!';
        });
    }

    joinRoom() {
        const joinCode = document.getElementById('joinCode').value.trim().toUpperCase();
        
        if (joinCode.length !== 6) {
            this.showError('Please enter a valid 6-character room code');
            return;
        }

        // Simulate joining room (in real app, this would be a server call)
        this.roomCode = joinCode;
        this.closeModal('roomModal');
        
        // Show success message
        setTimeout(() => {
            this.showRoomModal('joined');
        }, 300);
    }

    showError(message) {
        const joinInput = document.querySelector('.join-input');
        
        // Remove any existing error
        const existingError = joinInput.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = 'color: #ff6b6b; font-size: 0.9rem; margin-top: 10px; font-weight: 600;';
        errorDiv.textContent = message;
        joinInput.appendChild(errorDiv);
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 3000);
    }

    startGame() {
        // Store player data in localStorage for the game
        const playerData = {
            name: this.playerName,
            character: this.characters[this.currentCharacterIndex],
            roomCode: this.roomCode,
            isHost: true
        };
        
        localStorage.setItem('playerData', JSON.stringify(playerData));
        
        // Show camera permission modal
        this.closeModal('roomModal');
        setTimeout(() => {
            this.showModal('cameraModal');
        }, 300);
    }

    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } 
            });
            
            // Stop the stream immediately (we just needed permission)
            stream.getTracks().forEach(track => track.stop());
            
            // Camera permission granted, redirect to game
            this.closeModal('cameraModal');
            this.redirectToGame();
            
        } catch (error) {
            console.error('Camera permission denied:', error);
            this.handleCameraError(error);
        }
    }

    handleCameraError(error) {
        let errorMessage = 'Unable to access camera. ';
        
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Please allow camera permissions and try again.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'No camera found. Please connect a camera and try again.';
        } else {
            errorMessage += 'Please check your camera settings and try again.';
        }
        
        const modalBody = document.querySelector('#cameraModal .modal-body');
        modalBody.innerHTML = `
            <div class="camera-info">
                <div class="camera-icon" style="color: #ff6b6b;">❌</div>
                <h3 style="color: #ff6b6b; margin-bottom: 15px;">Camera Access Failed</h3>
                <p>${errorMessage}</p>
                <div class="modal-buttons" style="margin-top: 25px;">
                    <button class="btn btn-primary" onclick="landingPage.requestCameraPermission()">Try Again</button>
                    <button class="btn btn-outline" onclick="landingPage.closeModal('cameraModal')">Cancel</button>
                </div>
            </div>
        `;
    }

    redirectToGame() {
        // Add a nice transition effect
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 500);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Initialize the landing page
const landingPage = new LandingPage(); 