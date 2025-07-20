# RaceOn - Desert Bandit Racing Game

A browser-based combat racing game inspired by Rock 'n Roll Racing, built with TypeScript and HTML5 Canvas.

## 🎮 Current State

**Desert Bandit Mode**: Open-world exploration across a vast desert landscape with water obstacles, scattered details, and smooth physics-based driving.

## 🚗 Development Journey

### Phase 1: Racing Foundations
**Commits**: 
- [Add Canvas directive to technical guidelines](https://github.com/rranshous/raceon/commit/87b1d15) - Technical direction
- [Initial racing game implementation with assets](https://github.com/rranshous/raceon/commit/641bc72) - Core game structure

- Established TypeScript + Vite development environment
- Created core game design documents and technical guidelines
- Added Canvas as preferred rendering technology
- Built realistic vehicle physics (acceleration, braking, steering)
- Added HTML5 Canvas rendering with proper game loop
- Created oval track with visual boundaries and center line
- Implemented keyboard input handling (arrow keys)

### Phase 2: Visual Polish with Sprites
**Commits**:
- [Add sprite system with car graphics](https://github.com/rranshous/raceon/commit/81af1e7) - Initial sprite loading
- [Implement sprite rendering system with smooth rotation](https://github.com/rranshous/raceon/commit/11b3f1a) - Smooth rotation

- Replaced rectangle car with pixel art sprites from asset pack
- Implemented sprite loading and asset management system
- Added smooth car rotation using single sprite + canvas transforms
- Enhanced visual appeal while maintaining physics realism

### Phase 3: Track Boundaries & Collision
**Commits**: 
- [Add track boundaries and collision system](https://github.com/rranshous/raceon/commit/25ee183) - Traffic cone boundaries
- [Improve track boundaries and collision system](https://github.com/rranshous/raceon/commit/140f083) - Better collision physics

- Added traffic cone sprites as visual track boundaries
- Implemented collision detection with realistic bounce/skid physics
- Dense cone placement creating wall-like track limits
- Eliminated jarring hard stops - cars now bounce and slide off boundaries

### Phase 4: Desert Transformation
**Commit**: [Transform to desert bandit open-world game](https://github.com/rranshous/raceon/commit/44e7dba)
- **Major pivot**: Removed closed track, created massive open world (2400x1800)
- Replaced cone boundaries with water oasis obstacles
- Added camera system for world exploration
- Generated procedural desert terrain with scattered details
- Transformed from track racing to open-world exploration

### Phase 5: Desert Polish
**Commit**: [Fix desert world rendering issues](https://github.com/rranshous/raceon/commit/09c3a87)
- Used actual sand sprites instead of yellow rectangles
- Eliminated black lines between background tiles
- Improved tile coverage for seamless world appearance
- Added layered rendering (sand → details → water)

## 🎯 What We've Built

- **Smooth vehicle physics** with realistic driving feel
- **Asset-based rendering** using pixel art sprite sheets  
- **Open desert world** with procedural terrain generation
- **Water obstacle collision** with bounce physics
- **Camera system** for world exploration
- **Modular architecture** ready for expansion

## 🚀 Next Steps

The foundation is solid for either direction:
- **Racing Focus**: Add AI opponents, lap systems, multiple tracks
- **Combat Focus**: Implement weapons, health/damage systems  
- **Exploration Focus**: Add missions, collectibles, NPCs

## 🛠️ Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling and hot reload
- **HTML5 Canvas** - 2D rendering and animation
- **Pixel Art Assets** - Authentic retro aesthetic

## 🎨 Assets

Using the "Mini Pixel Pack 2" for authentic pixel art styling including cars, desert details, and environmental elements.

---

*This game represents experimental game development - exploring different mechanics, visual styles, and gameplay directions while maintaining a solid technical foundation.*
