# 🚀 GitHub Setup Guide for Scribble Advance

Follow these steps to get your project on GitHub and deployed!

## 📋 Step 1: Prepare Your Repository

Your project is now ready with all the necessary files:

```
scribble-advance/
├── 📄 README.md              ✅ Created
├── 🚫 .gitignore             ✅ Created  
├── 📜 LICENSE                ✅ Created
├── 🤝 CONTRIBUTING.md        ✅ Created
├── 📦 package.json           ✅ Created
├── 🚀 DEPLOYMENT.md          ✅ Created
├── 🐍 server.py              ✅ Created
├── 🏠 index.html             ✅ Existing
├── 🎮 game.html              ✅ Existing
├── ⚙️ app.js                 ✅ Existing
├── 🎨 landing.js             ✅ Existing
├── 📱 style.css              ✅ Existing
├── 🎨 landing.css            ✅ Existing
└── 🎮 game.css               ✅ Existing
```

## 🔧 Step 2: Initialize Git (if not already done)

```bash
# Navigate to your project directory
cd /Users/jamesfears/Desktop/skribblioadvanced

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "🎨 Initial commit: Scribble Advance with hand tracking"
```

## 🌐 Step 3: Create GitHub Repository

### Option A: Using GitHub Website
1. **Go to [github.com](https://github.com)**
2. **Click the "+" icon** in top right corner
3. **Select "New repository"**
4. **Fill in details**:
   - Repository name: `scribble-advance`
   - Description: `An advanced drawing game featuring hand gesture controls powered by MediaPipe`
   - Set to **Public** (for GitHub Pages)
   - **DON'T** initialize with README (you already have one)
5. **Click "Create repository"**

### Option B: Using GitHub CLI (if you have it)
```bash
# Install GitHub CLI first: https://cli.github.com/
gh repo create scribble-advance --public --description "An advanced drawing game featuring hand gesture controls powered by MediaPipe"
```

## 🔗 Step 4: Connect and Push

After creating the repository, GitHub will show you commands like this:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/scribble-advance.git

# Set the default branch
git branch -M main

# Push your code
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## 🌍 Step 5: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click "Settings"** tab
3. **Scroll to "Pages"** in the left sidebar
4. **Under "Source"**, select "Deploy from a branch"
5. **Choose "main"** branch and **"/ (root)"** folder
6. **Click "Save"**

🎉 **Your app will be live at**: `https://YOUR_USERNAME.github.io/scribble-advance`

*(It may take 5-10 minutes for the first deployment)*

## ✏️ Step 6: Update Personal Information

Edit these files to add your personal information:

### README.md
```markdown
# Update these lines:
**Live Demo**: [https://YOUR_USERNAME.github.io/scribble-advance](https://YOUR_USERNAME.github.io/scribble-advance)

# In the repository section, update:
git clone https://github.com/YOUR_USERNAME/scribble-advance.git
```

### package.json
```json
{
  "repository": {
    "url": "git+https://github.com/YOUR_USERNAME/scribble-advance.git"
  },
  "author": "Your Name <your-email@example.com>",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/scribble-advance/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/scribble-advance#readme"
}
```

## 🔧 Step 7: Test Your Deployment

1. **Wait 5-10 minutes** for GitHub Pages to deploy
2. **Visit your live site**: `https://YOUR_USERNAME.github.io/scribble-advance`
3. **Test camera permissions** and hand tracking
4. **Check browser console** for any errors

## 🎯 Quick Commands Reference

```bash
# See status of your files
git status

# Add new changes
git add .

# Commit changes
git commit -m "🐛 Fix: description of what you fixed"

# Push to GitHub
git push

# Pull latest changes (if working with others)
git pull
```

## 🚨 Common Issues & Solutions

### Issue: "Permission denied" when pushing
**Solution**: Make sure you're logged into GitHub and have push access
```bash
git remote set-url origin https://YOUR_USERNAME@github.com/YOUR_USERNAME/scribble-advance.git
```

### Issue: GitHub Pages not working
**Solutions**:
- Check that repository is public
- Verify Pages is enabled in Settings
- Wait 10-15 minutes for first deployment
- Check for any errors in the Actions tab

### Issue: Hand tracking not working on deployed site
**Solutions**:
- Make sure you're using HTTPS (GitHub Pages provides this automatically)
- Check browser console for MediaPipe loading errors
- Test in Chrome browser first

## 🎉 You're Done!

Congratulations! You now have:
- ✅ Professional GitHub repository
- ✅ Live demo site
- ✅ Automatic deployments
- ✅ Open source project ready for contributions

## 🔄 Next Steps

1. **Share your project**: Send the GitHub link to friends
2. **Add features**: Start working on multiplayer functionality
3. **Get feedback**: Share on social media or developer communities
4. **Contribute**: Help others by answering issues or adding features

---

**Need help?** Open an issue in your repository or reach out to the community! 