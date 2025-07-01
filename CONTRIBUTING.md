# Contributing to Scribble Advance

Thank you for your interest in contributing to Scribble Advance! 🎨

## How to Contribute

### 🐛 Reporting Bugs

1. **Check existing issues** to see if the bug has already been reported
2. **Create a new issue** with the following information:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and device information
   - Screenshots/videos if applicable

### 💡 Suggesting Features

1. **Open a discussion** in the repository discussions section
2. **Describe the feature** in detail:
   - What problem does it solve?
   - How would it work?
   - Any design mockups or examples?

### 🔧 Code Contributions

#### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/scribble-advance.git
   cd scribble-advance
   ```
3. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Start the development server**:
   ```bash
   python3 server.py
   ```

#### Code Guidelines

- **JavaScript**: Use ES6+ features, async/await for promises
- **CSS**: Use CSS custom properties for theming
- **HTML**: Semantic markup with accessibility in mind
- **Comments**: Document complex hand tracking logic and gesture detection

#### Testing Your Changes

- Test with multiple hand positions and lighting conditions
- Verify performance on different browsers
- Check responsive design on various screen sizes
- Ensure accessibility features work properly

#### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```

2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**:
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots/demos if applicable

## 🎯 Priority Areas

### High Priority
- [ ] **Multiplayer functionality** - WebSocket implementation
- [ ] **Mobile optimization** - Touch-friendly interface
- [ ] **Performance improvements** - Reduce CPU usage
- [ ] **Accessibility** - Screen reader support, keyboard navigation

### Medium Priority
- [ ] **Additional gestures** - More hand controls
- [ ] **UI/UX improvements** - Better visual feedback
- [ ] **Error handling** - Graceful failure recovery
- [ ] **Documentation** - Video tutorials, better guides

### Low Priority
- [ ] **Themes** - Dark mode, custom colors
- [ ] **Drawing tools** - Shapes, stamps, effects
- [ ] **Social features** - Sharing, galleries
- [ ] **Localization** - Multiple languages

## 📋 Coding Standards

### JavaScript
```javascript
// Use descriptive variable names
const handLandmarks = results.multiHandLandmarks;

// Document complex functions
/**
 * Detects pointing gesture based on finger positions
 * @param {Array} landmarks - Hand landmark coordinates
 * @returns {Object} Pointing detection result
 */
function detectPointing(landmarks) {
    // Implementation
}

// Use consistent error handling
try {
    await processHandGestures();
} catch (error) {
    console.error('Gesture processing failed:', error);
    showUserFriendlyError();
}
```

### CSS
```css
/* Use CSS custom properties */
:root {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    --text-color: #333;
}

/* Semantic class names */
.hand-tracking-indicator {
    /* Styles */
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
    /* Desktop styles */
}
```

### HTML
```html
<!-- Semantic markup -->
<main role="main">
    <section aria-label="Drawing canvas">
        <canvas id="canvas" aria-describedby="canvas-instructions"></canvas>
        <div id="canvas-instructions">Use hand gestures to draw</div>
    </section>
</main>

<!-- Accessibility attributes -->
<button aria-label="Clear drawing canvas" onclick="clearCanvas()">
    🗑️
</button>
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Hand tracking works in various lighting conditions
- [ ] All gestures are recognized consistently
- [ ] Performance is smooth (30+ FPS)
- [ ] UI is responsive on different screen sizes
- [ ] Camera permissions flow works correctly
- [ ] Error messages are helpful and clear

### Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 📞 Getting Help

- **Stuck on implementation?** Open a discussion
- **Need design feedback?** Share screenshots in issues
- **Performance concerns?** Profile your changes and share results
- **MediaPipe questions?** Check the [MediaPipe documentation](https://mediapipe.dev/)

## 🎉 Recognition

Contributors will be:
- Added to the README acknowledgments
- Mentioned in release notes for significant contributions
- Invited to join the core team for outstanding contributions

Thank you for helping make Scribble Advance awesome! 🚀 