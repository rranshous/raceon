# Publishing RaceOn to Itch.io

## 📦 Ready Files

Your game is ready for itch.io! Here's what you have:

- ✅ `raceon-game-fixed.zip` - Complete game package with fixed asset paths
- ✅ `dist/` folder - All game files (alternative to ZIP)
- ✅ `ITCH_DESCRIPTION.md` - Game description and instructions

**Note**: The asset paths have been fixed to use relative paths (`./resources/...`) instead of absolute paths (`/resources/...`) to work properly on itch.io.

## 🚀 Step-by-Step Publishing Guide

### 1. Create Itch.io Account
- Go to [itch.io](https://itch.io)
- Create an account if you don't have one
- Verify your email

### 2. Create New Project
- Click "Upload New Project" in your dashboard
- Fill in the basic information:
  - **Title**: "RaceOn - Desert Bandit Racing"
  - **URL**: `your-username.itch.io/raceon` (or similar)
  - **Project Type**: HTML
  - **Classification**: Game

### 3. Upload Game Files
**Option A: Upload ZIP (Recommended)**
- Upload the `raceon-game-fixed.zip` file
- Check "This file will be played in the browser"
- Set the zip file as the main file

**Option B: Upload Individual Files**
- Upload all files from the `dist/` folder
- Make sure `index.html` is set as the main file
- Check "This file will be played in the browser"

### 4. Configure Game Settings
- **Embed Settings**:
  - Width: `800px` (or `Auto`)
  - Height: `600px` (or `Auto`)
  - Check "Mobile friendly" if desired
  - Check "Enable fullscreen button"
  
- **Viewport**: Set to `Fit to page` or `Manually set size`

### 5. Add Game Information
Use the content from `ITCH_DESCRIPTION.md`:
- **Short Description**: "Open-world desert racing game where you hunt water bandits!"
- **Tags**: `racing`, `action`, `pixel-art`, `browser`, `typescript`, `desert`, `combat`
- **Genre**: Action, Racing
- **Made with**: TypeScript, HTML5 Canvas

### 6. Add Screenshots (Optional but Recommended)
Take screenshots of your game by:
- Running `npm run preview` locally
- Taking screenshots of gameplay
- Upload 3-5 screenshots showing different aspects

### 7. Set Pricing and Access
- **Pricing**: Free (or set a price if you prefer)
- **Access**: Public (so people can find it)

### 8. Publish!
- Review all settings
- Click "Save & View Page" to preview
- When ready, set visibility to "Published"

## 🎯 Marketing Tips

- **Social Media**: Share on Twitter, Reddit (r/gamedev, r/IndieGaming)
- **Tags**: Use relevant tags like `pixel-art`, `racing`, `browser-game`
- **Community**: Engage with the itch.io community
- **Updates**: Add devlog entries about your development process

## 🔧 Post-Publishing

- **Analytics**: Check itch.io analytics to see how your game performs
- **Feedback**: Respond to comments and ratings
- **Updates**: Use `npm run build:itch` to create new builds for updates

## 📝 Game Controls Reminder

Make sure players know:
- Arrow Keys or WASD to drive
- Mouse to look around
- Goal: Ram blue bandits to stop water theft

---

**Your game is ready to go! Good luck with the launch! 🚗💨**
