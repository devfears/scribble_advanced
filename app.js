class HandDrawingApp {
    constructor() {
        // DOM elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.statusDiv = document.getElementById('status');
        this.errorDiv = document.getElementById('error');
        this.errorMessage = document.getElementById('error-message');
        this.clearBtn = document.getElementById('clearBtn');
        this.setupScreen = document.getElementById('setupScreen');
        this.gameContainer = document.getElementById('gameContainer');
        
        // New UI elements
        this.playersList = document.getElementById('playersList');
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.handStatus = document.getElementById('handStatus');
        this.canvasInstructions = document.getElementById('canvasInstructions');
        this.colorPalette = document.getElementById('colorPalette');

        // App state
        this.hands = null;
        this.stream = null;
        this.dominantHand = null;
        this.isSetupComplete = false;
        
        // Player data from landing page
        this.playerData = this.loadPlayerData();
        
        // Game state
        this.players = [];
        this.currentWord = '';
        this.isDrawing = false;
        this.gameTimer = 45;
        this.currentDrawer = null;
        
        // Drawing state
        this.lastDrawPoint = null;
        this.drawingPath = [];
        this.currentColor = '#FF0000';
        this.currentBrushSize = 3;
        this.lastColorChange = 0;
        this.lastSizeChange = 0;
        
        // Enhanced tracking state
        this.smoothingBuffer = [];
        this.maxSmoothingPoints = 3;
        this.handTrackingQuality = 0;
        this.consecutiveDetections = 0;
        
        // --- Accuracy helpers ---
        this.prevLandmarks = [];   // store smoothed landmarks per hand
        this.smoothFactor = 0.7;   // 0 raw, 1 frozen
        this.pinchCounter = 0;     // debounce drawing
        this.fistCounter  = 0;     // debounce clear
        // ------------------------

        // Colors palette
        this.colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFD700',
            '#FF4500', '#8A2BE2', '#00CED1', '#FF1493',
            '#32CD32', '#FF6347', '#4169E1', '#DA70D6',
            '#000000', '#FFFFFF', '#808080', '#FFA500'
        ];

        this.init();
    }

    loadPlayerData() {
        try {
            const data = localStorage.getItem('playerData');
            if (data) {
                const playerData = JSON.parse(data);
                return playerData;
            }
        } catch (error) {
            console.error('Error loading player data:', error);
        }
        
        // If no data found, redirect back to landing page
        this.redirectToLanding();
        return null;
    }

    redirectToLanding() {
        // Add transition effect
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }

    init() {
        this.setupEventListeners();
        this.initializeColorPalette();
        this.initializePlayers();
        this.updateBrushSizeDisplay();
        this.setupGameUI();
        this.showSetupScreen();
    }

    setupGameUI() {
        // Hide game container initially
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
        }
        
        // Initialize word and timer
        this.updateWordDisplay('HOUSE', 5);
        this.startGameTimer();
    }

    showSetupScreen() {
        // Show setup screen and hide game container
        if (this.setupScreen) {
            this.setupScreen.style.display = 'block';
        }
        if (this.gameContainer) {
            this.gameContainer.style.display = 'none';
        }
    }

    initializePlayers() {
        // Add current player and some demo players
        this.players = [
            {
                id: 1,
                name: this.playerData?.name || 'You',
                avatar: this.playerData?.character || '😊',
                score: 0,
                isHost: true,
                isCurrentPlayer: true
            },
            {
                id: 2,
                name: 'Alice',
                avatar: '😎',
                score: 150,
                isHost: false,
                isCurrentPlayer: false
            },
            {
                id: 3,
                name: 'Bob',
                avatar: '🤓',
                score: 120,
                isHost: false,
                isCurrentPlayer: false
            },
            {
                id: 4,
                name: 'Charlie',
                avatar: '🥳',
                score: 80,
                isHost: false,
                isCurrentPlayer: false
            }
        ];
        
        this.currentDrawer = this.players[0]; // Current player is drawing
        this.updatePlayersDisplay();
    }

    updatePlayersDisplay() {
        if (!this.playersList) return;
        
        // Sort players by score (descending)
        const sortedPlayers = [...this.players].sort((a, b) => b.score - a.score);
        
        this.playersList.innerHTML = sortedPlayers.map((player, index) => `
            <div class="player-item ${player.isCurrentPlayer ? 'current-player' : ''}">
                <div class="player-rank">#${index + 1}</div>
                <div class="player-avatar">${player.avatar}</div>
                <div class="player-details">
                    <div class="player-name">${player.name} ${player.isHost ? '👑' : ''}</div>
                    <div class="player-score">${player.score} points</div>
                </div>
            </div>
        `).join('');
    }

    initializeColorPalette() {
        if (!this.colorPalette) return;
        
        this.colorPalette.innerHTML = this.colors.map(color => `
            <div class="color-option ${color === this.currentColor ? 'selected' : ''}" 
                 style="background-color: ${color};" 
                 data-color="${color}"></div>
        `).join('');
        
        // Add click handlers for colors
        this.colorPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                this.setColor(e.target.dataset.color);
            }
        });
    }

    setColor(color) {
        this.currentColor = color;
        this.updateColorSelection();
    }

    updateColorSelection() {
        if (!this.colorPalette) return;
        
        this.colorPalette.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === this.currentColor);
        });
    }

    updateWordDisplay(word, length) {
        const wordHint = document.getElementById('wordHint');
        const wordLength = document.getElementById('wordLength');
        
        if (wordHint) wordHint.textContent = word;
        if (wordLength) wordLength.textContent = `${length} letters`;
    }

    startGameTimer() {
        this.gameTimer = 45;
        const timerElement = document.querySelector('.timer');
        
        const updateTimer = () => {
            if (timerElement) {
                timerElement.textContent = `⏱️ ${Math.floor(this.gameTimer / 60)}:${(this.gameTimer % 60).toString().padStart(2, '0')}`;
            }
            
            if (this.gameTimer > 0) {
                this.gameTimer--;
                setTimeout(updateTimer, 1000);
            } else {
                this.endRound();
            }
        };
        
        updateTimer();
    }

    endRound() {
        this.addChatMessage('system', '⏰ Time\'s up! Next round starting...');
    }

    addChatMessage(type, message, author = null) {
        if (!this.chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        
        if (type === 'system') {
            messageElement.textContent = message;
            messageElement.className = 'system-message';
        } else if (type === 'guess') {
            messageElement.innerHTML = `<strong>${author}:</strong> ${message}`;
        } else if (type === 'correct') {
            messageElement.innerHTML = `<strong>${author}:</strong> ${message} ✅`;
        }
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    setupEventListeners() {
        // Setup screen
        document.querySelectorAll('.hand-option').forEach(option => {
            option.addEventListener('click', (e) => this.selectHandDominance(e));
        });
        
        document.getElementById('startBtn').addEventListener('click', () => this.startDrawing());
        
        // Controls
        this.clearBtn?.addEventListener('click', () => this.clearDrawing());
        
        // Chat functionality
        this.sendBtn?.addEventListener('click', () => this.sendChatMessage());
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Brush size
        const brushSizeSlider = document.getElementById('brushSize');
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.currentBrushSize = parseInt(e.target.value);
                this.updateBrushSizeDisplay();
            });
        }
        
        // Back to lobby button
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to leave the game and return to the lobby?')) {
                    this.redirectToLanding();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'c' || e.key === 'C') {
                this.clearDrawing();
            }
            if (e.key === 'Escape') {
                if (confirm('Are you sure you want to leave the game and return to the lobby?')) {
                    this.redirectToLanding();
                }
            }
        });

        // Window resize - maintain canvas alignment
        window.addEventListener('resize', () => {
            if (this.video.videoWidth && this.video.videoHeight) {
                setTimeout(() => {
                    this.resizeCanvas();
                }, 100);
            }
        });

        // Cleanup
        window.addEventListener('beforeunload', () => {
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
        });
    }

    sendChatMessage() {
        if (!this.chatInput) return;
        
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add the message to chat
        this.addChatMessage('guess', message, this.playerData?.name || 'You');
        
        // Clear input
        this.chatInput.value = '';
        
        // Check if it's the correct word (demo logic)
        if (message.toLowerCase() === 'house') {
            setTimeout(() => {
                this.addChatMessage('correct', 'Correct! You guessed it!', this.playerData?.name || 'You');
                // Update score
                this.players[0].score += 50;
                this.updatePlayersDisplay();
            }, 500);
        }
    }

    updateBrushSizeDisplay() {
        const brushSizeValue = document.getElementById('brushSizeValue');
        if (brushSizeValue) {
            brushSizeValue.textContent = this.currentBrushSize;
        }
    }

    selectHandDominance(e) {
        // Remove previous selection
        document.querySelectorAll('.hand-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection to clicked option
        e.currentTarget.classList.add('selected');
        this.dominantHand = e.currentTarget.dataset.hand;
        
        // Enable start button
        document.getElementById('startBtn').disabled = false;
    }

    async startDrawing() {
        if (!this.dominantHand) return;
        
        this.setupScreen.style.display = 'none';
        this.gameContainer.style.display = 'grid';
        this.isSetupComplete = true;
        
        // Hide canvas instructions initially
        if (this.canvasInstructions) {
            this.canvasInstructions.style.display = 'block';
        }
        
        this.updateHandIndicator();
        await this.initializeMediaPipe();
    }

    updateHandIndicator() {
        const drawHand = this.dominantHand === 'right' ? 'Right' : 'Left';
        const controlHand = this.dominantHand === 'right' ? 'Left' : 'Right';
        
        // Update the controls display in the right panel
        const controlsDisplay = document.querySelector('.controls-help');
        if (controlsDisplay) {
            const handInfo = document.createElement('div');
            handInfo.className = 'hand-assignments';
            handInfo.innerHTML = `
                <div style="background: #e3f2fd; padding: 10px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #2196f3;">
                    <strong>Controls:</strong><br>
                    ${drawHand} hand: Draw<br>
                    ${controlHand} hand: Colors/Size
                </div>
            `;
            controlsDisplay.appendChild(handInfo);
        }
        
        // Hide canvas instructions since user is ready
        if (this.canvasInstructions) {
            this.canvasInstructions.style.display = 'none';
        }
    }

    resizeCanvas() {
        // Get the actual displayed video dimensions for proper alignment
        const videoRect = this.video.getBoundingClientRect();
        const container = document.querySelector('.camera-drawing-container');
        
        if (container && videoRect.width > 0 && videoRect.height > 0) {
            // Set canvas to match the displayed video size exactly (container size)
            this.canvas.width = videoRect.width;
            this.canvas.height = videoRect.height;
            
            // Compute scale and letterbox offsets when using object-fit: contain
            const scale = Math.min(videoRect.width / this.video.videoWidth, videoRect.height / this.video.videoHeight);
            this.scaledVideoWidth = this.video.videoWidth * scale;
            this.scaledVideoHeight = this.video.videoHeight * scale;
            this.offsetX = (videoRect.width - this.scaledVideoWidth) / 2;
            this.offsetY = (videoRect.height - this.scaledVideoHeight) / 2;
        } else {
            // Fallback dimensions
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.scaledVideoWidth = 800;
            this.scaledVideoHeight = 600;
            this.offsetX = 0;
            this.offsetY = 0;
        }
        
        // Force canvas style to match exactly
        this.canvas.style.width = this.canvas.width + 'px';
        this.canvas.style.height = this.canvas.height + 'px';
    }

    // Map normalized landmark -> canvas coordinates accounting for letterbox
    mapPointToCanvas(landmark){
        return {
            x: landmark.x * this.scaledVideoWidth + this.offsetX,
            y: landmark.y * this.scaledVideoHeight + this.offsetY
        };
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorDiv.style.display = 'block';
        this.statusDiv.style.display = 'none';
    }

    updateStatus(message) {
        // Update the camera overlay status (for loading states)
        if (this.statusDiv) this.statusDiv.textContent = message;
        
        // Update the hand status display in left panel (for hand tracking info)
        if (this.handStatus) {
            // Clean up the message for the hand status display
            const cleanMessage = message.replace(/\d+%\s*\|\s*/, '').replace(/\|\s*/g, '\n');
            this.handStatus.textContent = cleanMessage;
        }
    }

    // Simple and reliable pinch detection
    detectPointing(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = this.getDistance(thumbTip, indexTip);
        
        // Simple pinch threshold - much more reliable
        const isPinching = distance < 0.06;
        
        return { 
            isPointing: isPinching, 
            point: indexTip, 
            confidence: isPinching ? 1 : 0 
        };
    }

    // Simple drawing - no frame counting, immediate response
    drawWithFinger(landmarks) {
        const pointResult = this.detectPointing(landmarks);
        
        // Check if we're in the drawing area (above 70% of screen height)
        const mapped = this.mapPointToCanvas(pointResult.point);
        const isInDrawingArea = mapped.y < (this.canvas.height * 0.7);

        if (pointResult.isPointing && pointResult.point && isInDrawingArea) {
            const rawPoint = { x: mapped.x, y: mapped.y };
            const currentPoint = this.smoothPoint(rawPoint);

            if (!this.isDrawing) {
                this.pinchCounter++;
                if (this.pinchCounter >= 3) { // require 3 consecutive frames
                    this.isDrawing = true;
                    this.lastDrawPoint = currentPoint;
                    this.drawingPath.push({
                        type: 'move',
                        x: currentPoint.x,
                        y: currentPoint.y,
                        color: this.currentColor,
                        size: this.currentBrushSize
                    });
                }
            } else if (this.lastDrawPoint) {
                this.pinchCounter = 3; // keep filled
                const distance = Math.sqrt(
                    Math.pow(currentPoint.x - this.lastDrawPoint.x, 2) +
                    Math.pow(currentPoint.y - this.lastDrawPoint.y, 2)
                );

                if (distance > 2 && distance < 80) {
                    this.ctx.save();
                    this.ctx.strokeStyle = this.currentColor;
                    this.ctx.lineWidth = this.currentBrushSize;
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin = 'round';

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.lastDrawPoint.x, this.lastDrawPoint.y);
                    this.ctx.lineTo(currentPoint.x, currentPoint.y);
                    this.ctx.stroke();
                    this.ctx.restore();

                    this.drawingPath.push({
                        type: 'draw',
                        x: currentPoint.x,
                        y: currentPoint.y,
                        color: this.currentColor,
                        size: this.currentBrushSize
                    });
                    this.lastDrawPoint = currentPoint;
                }
            }
        } else {
            this.pinchCounter = 0;
            // Stop drawing
            if (this.isDrawing) {
                this.isDrawing = false;
                this.lastDrawPoint = null;
                this.smoothingBuffer = [];
            }
        }
    }

    handleControlGestures(landmarks) {
        const controlResult = this.detectControlGestures(landmarks);
        
        if (controlResult.gesture) {
            // Color cycling with point up gesture
            if (controlResult.gesture === 'point_up') {
                if (Date.now() - this.lastColorChange > 800) { // Reduced delay for better responsiveness
                    const currentIndex = this.colors.indexOf(this.currentColor);
                    const nextIndex = (currentIndex + 1) % this.colors.length;
                    this.currentColor = this.colors[nextIndex];
                    this.updateColorSelection();
                    this.lastColorChange = Date.now();
                    return { gestureDetected: true, gesture: 'color changed' };
                }
                return { gestureDetected: true, gesture: 'point up ☝️ for color' };
            }
            
            // Brush size control with peace gesture
            if (controlResult.gesture === 'peace') {
                if (Date.now() - this.lastSizeChange > 800) {
                    this.currentBrushSize = this.currentBrushSize >= 8 ? 1 : this.currentBrushSize + 1;
                    document.getElementById('brushSize').value = this.currentBrushSize;
                    document.getElementById('brushSizeValue').textContent = this.currentBrushSize;
                    this.lastSizeChange = Date.now();
                    return { gestureDetected: true, gesture: 'brush size changed' };
                }
                return { gestureDetected: true, gesture: 'peace ✌️ for brush size' };
            }
            
            // Clear drawing with fist gesture
            if (controlResult.gesture === 'fist') {
                if (Date.now() - this.lastColorChange > 1500) { // Longer delay to prevent accidental clearing
                    this.clearDrawing();
                    this.lastColorChange = Date.now(); // Reuse this for clear gesture timing
                    return { gestureDetected: true, gesture: 'drawing cleared!' };
                }
                return { gestureDetected: true, gesture: 'fist ✊ to clear' };
            }
            
            // Open hand - ready state
            if (controlResult.gesture === 'open_hand') {
                return { gestureDetected: true, gesture: 'ready for controls' };
            }
        }
        
        return { gestureDetected: false, gesture: null };
    }

    redrawPath() {
        this.ctx.save();
        
        let isInPath = false;
        let currentColor = this.currentColor;
        let currentSize = this.currentBrushSize;
        
        this.drawingPath.forEach(point => {
            if (point.type === 'move') {
                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);
                currentColor = point.color || currentColor;
                currentSize = point.size || currentSize;
                this.ctx.strokeStyle = currentColor;
                this.ctx.lineWidth = currentSize;
                this.ctx.lineCap = 'round';
                this.ctx.lineJoin = 'round';
                isInPath = true;
            } else if (point.type === 'draw' && isInPath) {
                // Update color/size if changed
                if (point.color && point.color !== currentColor) {
                    currentColor = point.color;
                    this.ctx.strokeStyle = currentColor;
                }
                if (point.size && point.size !== currentSize) {
                    currentSize = point.size;
                    this.ctx.lineWidth = currentSize;
                }
                
                this.ctx.lineTo(point.x, point.y);
                this.ctx.stroke();
            }
        });
        this.ctx.restore();
    }

    drawLandmarks(landmarks, handIndex = 0, handType = 'drawing') {
        this.ctx.save();
        
        const pinchResult = this.detectPinch(landmarks);
        const pointResult = this.detectPointing(landmarks);
        
        // Different color schemes for different hand types
        const drawingColors = {
            normal: 'rgba(255, 215, 0, 0.9)',
            pinch: 'rgba(255, 140, 0, 1.0)',
            connection: 'rgba(255, 215, 0, 0.7)'
        };
        
        const controlColors = {
            normal: 'rgba(0, 191, 255, 0.9)',
            pinch: 'rgba(255, 20, 147, 1.0)',
            connection: 'rgba(0, 191, 255, 0.7)'
        };
        
        const colors = handType === 'drawing' ? drawingColors : controlColors;
        
        // For drawing hand, show minimal skeleton when drawing
        if (handType === 'drawing' && pointResult.isPointing) {
            // Only show index finger tip when drawing
            const {x, y} = this.mapPointToCanvas(landmarks[8]);
            this.ctx.fillStyle = 'rgba(255, 0, 0, 1.0)'; // Bright red for drawing point
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Small text indicator
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText('DRAW', x + 15, y - 15);
            this.ctx.fillText('DRAW', x + 15, y - 15);
        } else {
            // Show full skeleton for control hand or when not drawing
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8],     // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
                [5, 9], [9, 13], [13, 17]            // Palm connections
            ];
            
            // Draw connections
            this.ctx.strokeStyle = colors.connection;
            this.ctx.lineWidth = 4;
            connections.forEach(([start, end]) => {
                const startPoint = this.mapPointToCanvas(landmarks[start]);
                const endPoint = this.mapPointToCanvas(landmarks[end]);
                this.ctx.beginPath();
                this.ctx.moveTo(startPoint.x, startPoint.y);
                this.ctx.lineTo(endPoint.x, endPoint.y);
                this.ctx.stroke();
            });

            // Draw landmarks
            landmarks.forEach((landmark, index) => {
                const {x, y} = this.mapPointToCanvas(landmark);
                let radius = 8;
                let color = colors.normal;
                
                if (handType === 'drawing') {
                    if (pinchResult.isPinching && (index === 4 || index === 8)) {
                        radius = 14;
                        color = colors.pinch;
                    }
                } else {
                    const controlResult = this.detectControlGestures(landmarks);
                    if (controlResult.gesture === 'point_up' && index === 8) {
                        radius = 14;
                        color = colors.pinch;
                    } else if (controlResult.gesture === 'peace' && (index === 8 || index === 12)) {
                        radius = 14;
                        color = colors.pinch;
                    }
                }
                
                if (index === 4 || index === 8 || index === 12 || index === 16 || index === 20) {
                    radius += 3;
                }
                
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
                this.ctx.fill();
                
                if ([0,4,8,12,16,20].includes(index)){
                    this.ctx.fillStyle='#FFFFFF';
                    this.ctx.font='bold 14px Arial';
                    this.ctx.strokeStyle='#000000';
                    this.ctx.lineWidth=3;
                    this.ctx.strokeText(index.toString(), x+12, y-12);
                    this.ctx.fillText(index.toString(), x+12, y-12);
                }
            });
        }
        
        // Draw the "do not draw below" line
        const lineY = this.canvas.height * 0.7;
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, lineY);
        this.ctx.lineTo(this.canvas.width, lineY);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset line dash
        
        // Add text warning
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        const warningText = 'Drawing disabled below this line';
        const textWidth = this.ctx.measureText(warningText).width;
        const textX = (this.canvas.width - textWidth) / 2;
        this.ctx.strokeText(warningText, textX, lineY + 20);
        this.ctx.fillText(warningText, textX, lineY + 20);

        this.ctx.restore();
    }

    onResults(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw the accumulated drawing path first
        this.redrawPath();

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.consecutiveDetections++;
            this.handTrackingQuality = Math.min(this.consecutiveDetections / 10, 1);
            
            const handCount = results.multiHandLandmarks.length;
            const qualityPercent = Math.round(this.handTrackingQuality * 100);
            
            let drawingHandInfo = '';
            let controlHandInfo = '';
            let drawingHandFound = false;
            let controlHandFound = false;
            
            // Improved hand detection logic
            results.multiHandLandmarks.forEach((landmarks, index) => {
                // Smooth landmarks for this hand
                landmarks = this.smoothLandmarks(landmarks, index);

                const handedness = results.multiHandedness ? results.multiHandedness[index] : null;
                let isDrawingHand = false;
                
                if (handCount === 1) {
                    // If only one hand, treat it as the drawing hand
                    isDrawingHand = true;
                } else if (handedness) {
                    // MediaPipe labels hands from camera perspective (mirrored)
                    // So "Right" in MediaPipe = user's left hand
                    const detectedHand = handedness.label === 'Right' ? 'left' : 'right';
                    isDrawingHand = (detectedHand === this.dominantHand);
                } else {
                    // Fallback: use hand position (leftmost vs rightmost on screen)
                    const handCenter = landmarks.reduce((sum, point) => ({
                        x: sum.x + point.x,
                        y: sum.y + point.y
                    }), { x: 0, y: 0 });
                    handCenter.x /= landmarks.length;
                    
                    if (this.dominantHand === 'right') {
                        // For right-hand dominant, leftmost hand on screen is drawing hand (mirrored)
                        isDrawingHand = handCenter.x < 0.5;
                    } else {
                        // For left-hand dominant, rightmost hand on screen is drawing hand (mirrored)
                        isDrawingHand = handCenter.x > 0.5;
                    }
                }
                
                if (isDrawingHand) {
                    // Drawing hand
                    drawingHandFound = true;
                    const pointResult = this.detectPointing(landmarks);
                    this.drawWithFinger(landmarks);
                    
                    if (pointResult.isPointing) {
                        drawingHandInfo = `✋ ${this.dominantHand.toUpperCase()} ready to draw`;
                    }
                    
                    // Draw landmarks with drawing hand styling
                    this.drawLandmarks(landmarks, index, 'drawing');
                } else {
                    // Control hand
                    controlHandFound = true;
                    const controlResult = this.handleControlGestures(landmarks);
                    
                    const otherHand = this.dominantHand === 'right' ? 'LEFT' : 'RIGHT';
                    if (controlResult && controlResult.gestureDetected) {
                        controlHandInfo = `🎛️ ${otherHand} controlling (${controlResult.gesture})`;
                    } else {
                        controlHandInfo = `🎛️ ${otherHand} controls ready`;
                    }
                    
                    // Draw landmarks with control hand styling
                    this.drawLandmarks(landmarks, index, 'control');
                }
            });
            
            // Enhanced status with clear hand roles
            let statusText = `${handCount} hand${handCount > 1 ? 's' : ''} (${qualityPercent}%)`;
            if (drawingHandFound) statusText += ` | ${drawingHandInfo}`;
            if (controlHandFound) statusText += ` | ${controlHandInfo}`;
            if (!drawingHandFound) statusText += ` | Show ${this.dominantHand} hand to draw`;
            
            this.updateStatus(statusText);
            
        } else {
            this.consecutiveDetections = Math.max(0, this.consecutiveDetections - 2);
            this.handTrackingQuality = this.consecutiveDetections / 10;
            
            this.updateStatus('No hands detected - show your hands to the camera');
            // Reset drawing state when no hands detected
            this.isDrawing = false;
            this.lastDrawPoint = null;
            this.smoothingBuffer = [];
        }
    }

    async processFrame() {
        if (this.video.readyState === 4 && this.hands) {
            try {
                await this.hands.send({ image: this.video });
            } catch (error) {
                console.error('Error processing frame:', error);
                // Don't show error UI, just log it, as this might be temporary
            }
        }
        requestAnimationFrame(() => this.processFrame());
    }

    async initializeMediaPipe() {
        try {
            this.updateStatus('Loading MediaPipe model...');
            
            // Check if MediaPipe is available
            if (typeof Hands === 'undefined') {
                throw new Error('MediaPipe Hands library not loaded. Please check your internet connection and try refreshing.');
            }
            
            console.log('MediaPipe Hands available, initializing...');
            
            this.hands = new Hands({
                locateFile: (file) => {
                    console.log('Loading MediaPipe file:', file);
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,           // Reduced from 2 for better performance
                minDetectionConfidence: 0.7,  // Reduced from 0.8 for easier detection
                minTrackingConfidence: 0.7,   // Reduced from 0.8 for easier detection
                staticImageMode: false,
            });

            this.hands.onResults((results) => this.onResults(results));

            console.log('MediaPipe hands configured successfully');
            this.updateStatus('MediaPipe loaded, requesting camera access...');
            await this.initializeCamera();

        } catch (error) {
            console.error('Error initializing MediaPipe:', error);
            this.showError('Failed to initialize MediaPipe: ' + error.message + 
                          '\n\nTroubleshooting:\n' +
                          '1. Make sure you have a stable internet connection\n' +
                          '2. Try refreshing the page\n' +
                          '3. Try using HTTPS instead of HTTP\n' +
                          '4. Check browser console for more details');
        }
    }

    async initializeCamera() {
        try {
            console.log('Requesting camera access...');
            
            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
            }

            // Check if we're on HTTPS or localhost
            const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
            if (!isSecure) {
                console.warn('Not running on HTTPS or localhost. MediaPipe may not work properly.');
                this.updateStatus('Warning: Not on HTTPS. Camera access may be limited.');
            }

            // First, let's check available cameras
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Available cameras:', videoDevices.length);

            if (videoDevices.length === 0) {
                throw new Error('No camera devices found. Please connect a camera and refresh the page.');
            }

            // Request camera access with more permissive settings
            const constraints = {
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, max: 60 }
                },
                audio: false
            };

            console.log('Requesting camera with constraints:', constraints);
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Camera access granted successfully');

            // Set video source
            this.video.srcObject = this.stream;

            // Wait for video to load
            this.video.addEventListener('loadedmetadata', () => {
                console.log('Video metadata loaded:', {
                    width: this.video.videoWidth,
                    height: this.video.videoHeight
                });
                
                // Hide camera overlay
                const overlay = document.querySelector('.camera-overlay');
                if (overlay) overlay.style.display = 'none';
                
                // Delay canvas resize to ensure video is fully rendered
                setTimeout(() => {
                    this.resizeCanvas();
                    this.updateStatus('Camera ready - show your hands to the camera!');
                    console.log('Canvas resized and ready for hand tracking');
                }, 100);
                
                // Start processing frames
                this.processFrame();
            });

            // Handle video play
            this.video.addEventListener('canplay', () => {
                console.log('Video can play, starting playback');
                this.video.play().catch(err => {
                    console.error('Error playing video:', err);
                    this.showError('Failed to start video playback: ' + err.message);
                });
            });

            // Add error handling for video
            this.video.addEventListener('error', (e) => {
                console.error('Video error:', e);
                this.showError('Video playback error. Please refresh and try again.');
            });

        } catch (error) {
            console.error('Error accessing camera:', error);
            
            let errorMessage = 'Failed to access camera: ' + error.message;
            let suggestions = '\n\nTroubleshooting steps:\n';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied by user or browser policy.';
                suggestions += '1. Click the camera icon in your browser address bar and allow camera access\n' +
                             '2. Check if another application is using your camera\n' +
                             '3. Refresh the page and try again\n' +
                             '4. Make sure you\'re on HTTPS or localhost';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found on this device.';
                suggestions += '1. Make sure your camera is connected and working\n' +
                             '2. Check if your camera is being used by another application\n' +
                             '3. Try restarting your browser';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application.';
                suggestions += '1. Close other applications that might be using your camera\n' +
                             '2. Restart your browser\n' +
                             '3. Try refreshing the page';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Camera constraints could not be satisfied.';
                suggestions += '1. Your camera might not support the requested resolution\n' +
                             '2. Try refreshing the page\n' +
                             '3. Check if your camera drivers are up to date';
            }
            
            this.showError(errorMessage + suggestions);
        }
    }

    clearDrawing() {
        this.drawingPath = [];
        this.isDrawing = false;
        this.lastDrawPoint = null;
        // The canvas will be cleared and redrawn on the next frame
    }

    // Enhanced pinch detection with adaptive thresholds (used for visual feedback only)
    detectPinch(landmarks) {
        const handSize = this.getDistance(landmarks[0], landmarks[12]);
        const threshold = handSize * 0.25; // 25% of hand size
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const distance = this.getDistance(thumbTip, indexTip);
        const isPinching = distance < threshold;
        return {
            isPinching,
            combination: 'thumb-index',
            point: indexTip,
            confidence: isPinching ? 1 - (distance / threshold) : 0
        };
    }

    // Control gesture detection (for non-dominant hand)
    detectControlGestures(landmarks) {
        const handSize = this.getDistance(landmarks[0], landmarks[12]);
        const indexTip = landmarks[8];
        const indexPip = landmarks[6];
        const middleTip = landmarks[12];
        const middlePip = landmarks[10];
        const ringTip = landmarks[16];
        const ringPip = landmarks[14];
        const pinkyTip = landmarks[20];
        const pinkyPip = landmarks[18];
        const wrist = landmarks[0];

        const extOffset = 0.03; // threshold offset
        const indexExtended = indexTip.y < indexPip.y - extOffset;
        const middleExtended = middleTip.y < middlePip.y - extOffset;
        const ringExtended = ringTip.y < ringPip.y - extOffset;
        const pinkyExtended = pinkyTip.y < pinkyPip.y - extOffset;

        const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;

        // Fist: all fingers close to palm within 5% hand size
        const avgTipY = (indexTip.y + middleTip.y + ringTip.y + pinkyTip.y) / 4;
        const palmY = (landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 4;
        const isFistNow = (avgTipY > palmY + handSize * 0.05);
        if (isFistNow) this.fistCounter++; else this.fistCounter = 0;
        if (this.fistCounter >= 3) return {gesture:'fist', point:wrist};

        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) return {gesture:'point_up',point:indexTip};
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) return {gesture:'peace', point:{x:(indexTip.x+middleTip.x)/2, y:(indexTip.y+middleTip.y)/2}};
        if (extendedCount>=3) return {gesture:'open_hand', point:{x:(indexTip.x+middleTip.x+ringTip.x)/3,y:(indexTip.y+middleTip.y+ringTip.y)/3}};
        return {gesture:null, point:null};
    }

    // Distance helper
    getDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // --- NEW: Exponential moving average smoothing for each landmark ---
    smoothLandmarks(landmarks, handIndex) {
        if (!this.prevLandmarks[handIndex]) {
            // Deep copy initial
            this.prevLandmarks[handIndex] = landmarks.map(lm => ({...lm}));
            return landmarks;
        }
        const alpha = 1 - this.smoothFactor;
        const smoothed = landmarks.map((lm, idx) => {
            const prev = this.prevLandmarks[handIndex][idx];
            const newLm = {
                x: lm.x * alpha + prev.x * this.smoothFactor,
                y: lm.y * alpha + prev.y * this.smoothFactor,
                z: lm.z * alpha + prev.z * this.smoothFactor
            };
            return newLm;
        });
        this.prevLandmarks[handIndex] = smoothed;
        return smoothed;
    }

    // Simple smoothing of points for steadier lines
    smoothPoint(newPoint) {
        this.smoothingBuffer.push(newPoint);
        if (this.smoothingBuffer.length > this.maxSmoothingPoints) {
            this.smoothingBuffer.shift();
        }
        let totalWeight = 0, sx = 0, sy = 0;
        this.smoothingBuffer.forEach((pt, i) => {
            const w = i + 1;
            sx += pt.x * w;
            sy += pt.y * w;
            totalWeight += w;
        });
        return { x: sx / totalWeight, y: sy / totalWeight };
    }
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new HandDrawingApp();
}); 