# 🚀 Deployment Guide

This guide covers deploying Scribble Advance to various platforms.

## 📋 Pre-deployment Checklist

- [ ] All files are committed to your repository
- [ ] Camera permissions work properly
- [ ] Hand tracking functions correctly
- [ ] All external dependencies (MediaPipe) load properly
- [ ] README and documentation are up to date

## 🌐 GitHub Pages (Recommended)

**Best for**: Simple static deployment, free hosting

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** tab
   - Scroll to **Pages** section
   - Under **Source**, select **Deploy from a branch**
   - Choose **main** branch and **/ (root)** folder
   - Click **Save**

3. **Access your site**:
   - Your app will be available at: `https://your-username.github.io/scribble-advance`
   - It may take 5-10 minutes for the first deployment

### GitHub Pages Configuration:
```yaml
# .github/workflows/pages.yml (optional - for custom build process)
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

## ⚡ Vercel

**Best for**: Fast global CDN, easy deployment, automatic HTTPS

### Steps:
1. **Connect GitHub to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click **New Project**
   - Import your `scribble-advance` repository

2. **Configure deployment**:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty (static site)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

3. **Deploy**:
   - Click **Deploy**
   - Your app will be available at: `https://your-project.vercel.app`

### Custom Domain (Optional):
```bash
# Add custom domain in Vercel dashboard
# Update DNS records to point to Vercel
```

## 🎨 Netlify

**Best for**: Easy drag-and-drop deployment, form handling

### Method 1: Drag and Drop
1. **Zip your project** (exclude `.git` folder)
2. **Go to [netlify.com](https://netlify.com)**
3. **Drag your zip file** to the deployment area
4. **Your app is live** at a random Netlify URL

### Method 2: Git Integration
1. **Connect your GitHub repository**
2. **Configure build settings**:
   - **Build command**: Leave empty
   - **Publish directory**: `./`
3. **Deploy**

## 🐳 Docker (Advanced)

**Best for**: Containerized deployment, cloud services

### Dockerfile:
```dockerfile
FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Copy custom nginx config for SPA
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle hand tracking requirements
        add_header Cross-Origin-Embedder-Policy require-corp;
        add_header Cross-Origin-Opener-Policy same-origin;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### Deploy:
```bash
# Build image
docker build -t scribble-advance .

# Run container
docker run -p 8080:80 scribble-advance
```

## ☁️ Cloud Platforms

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Add buildpack for static sites
heroku buildpacks:set https://github.com/heroku/heroku-buildpack-static

# Create static.json
echo '{"root": "./"}' > static.json

# Deploy
git push heroku main
```

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

## 🔧 Custom Server Deployment

**For when you add multiplayer features**

### Railway
1. **Connect GitHub repository**
2. **Add environment variables** (if needed)
3. **Deploy automatically** on git push

### Render
1. **Connect GitHub repository**
2. **Configure as static site**
3. **Set build command**: (none needed)
4. **Deploy**

## 🚨 Common Issues

### HTTPS Requirements
**Problem**: MediaPipe requires HTTPS in production
**Solution**: All recommended platforms provide HTTPS automatically

### Camera Permissions
**Problem**: Camera doesn't work on deployed site
**Solution**: 
- Ensure you're using HTTPS
- Check browser permissions
- Test on different browsers

### MediaPipe Loading
**Problem**: MediaPipe fails to load
**Solution**:
- Check internet connection
- Verify CDN URLs are accessible
- Monitor browser console for errors

### Performance Issues
**Problem**: Slow hand tracking on deployed site
**Solution**:
- Use CDN for static assets
- Optimize images and resources
- Monitor browser performance tools

## 📊 Monitoring

### Analytics (Optional)
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking (Optional)
```javascript
// Add to app.js
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Optional: Send to error tracking service
});
```

## 🔄 Continuous Deployment

### Automatic Deployment Workflow:
1. **Push code** to GitHub main branch
2. **Platform detects** changes automatically
3. **Rebuilds and redeploys** your app
4. **New version is live** within minutes

### Best Practices:
- Test locally before pushing
- Use feature branches for development
- Tag releases for version tracking
- Monitor deployment status

---

**Need help with deployment?** Open an issue in the repository with your platform and error details! 