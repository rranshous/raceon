# RaceOn - Desert Bandit Racing Game

A browser-based combat racing game inspired by Rock 'n Roll Racing, built with TypeScript and HTML5 Canvas.

## 🎮 Current State

**Desert Bandit Mode**: Open-world exploration across a vast desert landscape with water obstacles, scattered details, and smooth physics-based driving.

## 🚗 Development Journey

### Phase 1: Racing Foundations
**Key Commit**: [Initial racing game implementation](https://github.com/rranshous/raceon/commit/641bc72)
- Built vehicle physics, track system, and canvas rendering
- Established TypeScript + Vite development environment
- Created oval track with keyboard controls

### Phase 2: Visual Polish  
**Key Commit**: [Implement sprite rendering with smooth rotation](https://github.com/rranshous/raceon/commit/11b3f1a)
- Replaced rectangles with pixel art car sprites
- Added smooth rotation and asset management system

### Phase 3: Collision System
**Key Commit**: [Improve track boundaries and collision](https://github.com/rranshous/raceon/commit/140f083)
- Added traffic cone boundaries with realistic bounce physics
- Eliminated hard stops for smoother gameplay

### Phase 4: Desert Transformation
**Key Commit**: [Transform to desert bandit open-world game](https://github.com/rranshous/raceon/commit/44e7dba)
- **Major pivot**: Removed closed track → massive open world (2400x1800)
- Added camera system, water obstacles, procedural desert terrain

### Phase 5: Desert Polish
**Key Commit**: [Fix desert world rendering issues](https://github.com/rranshous/raceon/commit/09c3a87)
- Used actual sand sprites, eliminated tile gaps
- Added layered rendering for seamless desert appearance

## 🎯 What We've Built

- **Smooth vehicle physics** with realistic driving feel
- **Asset-based rendering** using pixel art sprite sheets  
- **Open desert world** with procedural terrain generation
- **Water obstacle collision** with bounce physics
- **Camera system** for world exploration
- **Modular architecture** ready for expansion

## ️ Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling and hot reload
- **HTML5 Canvas** - 2D rendering and animation
- **Pixel Art Assets** - Authentic retro aesthetic

## 🎨 Assets

Using the ["Mini Pixel Pack 2"](https://grafxkid.itch.io/mini-pixel-pack-2) by GrafxKid for authentic pixel art styling including cars, desert details, and environmental elements.

---

*This game represents experimental game development - exploring different mechanics, visual styles, and gameplay directions while maintaining a solid technical foundation.*
