# RaceOn - Desert Bandit Racing Game

A browser-based combat racing game, built with TypeScript and HTML5 Canvas.

## 🎮 Current State

**Desert Justice Mode**: Open-world desert with **water bandits** stealing from precious oases! Ram the blue bandits before they escape with the water. Righteous justice in the wasteland! 💧⚖️

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

### Phase 6: Water Bandits! 🚗💧
**Key Commit**: [Add water bandits! Blue cars stealing from oases](https://github.com/rranshous/raceon/commit/latest)
- **Water bandit AI**: Blue cars spawn near oases and try to escape to map edges
- **Justice system**: Ram bandits to destroy them and stop the theft!
- **Smart spawning**: Bandits appear every 8 seconds near different water holes
- **Collision detection**: Satisfying bandit destruction on impact

### Phase 7: Bandit Physics & Intelligence 🧠
**Key Commits**: [Improve bandit AI with realistic physics](https://github.com/rranshous/raceon/commit/latest)
- **Realistic physics**: Bandits follow same collision rules as player (no more cheating!)
- **Natural movement**: Wandering behavior with speed/turn variations for personality
- **Stuck detection**: Smart avoidance when bandits get trapped by obstacles
- **Water collision**: Bandits bounce off water holes realistically

### Phase 8: Debug Tools & Refinement 🛠️
**Key Commits**: [Add godly debug mode](https://github.com/rranshous/raceon/commit/latest) & [Refine bandit behavior](https://github.com/rranshous/raceon/commit/latest)
- **Godly debug mode**: Press 'D' for visual AI overlay (escape routes, collision boundaries, stuck detection)
- **Smart avoidance**: Strategic obstacle navigation prevents ping-ponging between water holes
- **Proper escapes**: Bandits must reach actual map edges, not escape prematurely
- **Clean HUD**: Streamlined interface showing only essential bandit count

### Phase 9: Immersion & Polish ✨
**Key Commits**: [Add immersive effects system](https://github.com/rranshous/raceon/commit/latest) & [Polish visual feedback](https://github.com/rranshous/raceon/commit/latest)
- **Screen shake system**: Satisfying camera shake on bandit destruction and water collisions
- **Particle effects**: Destruction debris, water splashes, and realistic dust trails behind vehicles
- **Tire track system**: Visual tracking for both player and bandits with natural fade-out
- **Optimized effects**: Faster track lifecycle eliminates jarring disappearances
- **Cinematic chases**: Both player and bandits leave dust trails for epic pursuit sequences

### Phase 10: Rich Terrain Interaction System 🏜️
**Key Commits**: [Enhanced terrain generation & collision system](https://github.com/rranshous/raceon/commit/latest)
- **Immersive terrain variety**: Clumped textured sand patches, natural cactus groves, scattered rock formations
- **Organic water oases**: Dense, realistic water holes with textured sand shorelines for depth
- **Rock collision detection**: Solid obstacles with bounce physics - rocks act like additional barriers
- **Friction-based terrain physics**: Realistic resistance instead of jarring speed changes
- **Textured sand slowdown**: 50% resistance in wet/muddy areas around oases
- **Cactus grove resistance**: 70% resistance in thorny terrain (spines slow you down!)
- **Minimum speed floor**: Never get completely stuck - maintain 20% forward, 10% reverse speed
- **Strategic navigation**: Terrain choice affects performance and route planning

### Phase 11: Configuration-Driven Architecture 🔧
**Key Commit**: [Config Integration Complete: All Effect & Physics Values Now Configurable](https://github.com/rranshous/raceon/commit/latest)
- **Complete config integration**: All hardcoded values replaced with centralized configuration
- **Effect system tuning**: Particle counts, screen shake intensities, tire track settings all configurable
- **Physics customization**: Collision radius multipliers, terrain effects, speed thresholds via config
- **Critical bug fix**: Screen shake blackout issue resolved (decay rate corrected)
- **Rapid iteration**: Easy gameplay balancing without code changes
- **Foundation for upgrades**: Config structure ready for vehicle progression systems

### Phase 12: Intelligent Obstacle Avoidance System 🧠
**Key Commits**: [Pre-computed spatial grid for AI optimization](https://github.com/rranshous/raceon/commit/latest)
- **Pre-computed avoidance grid**: 75x75 spatial grid with O(1) obstacle lookups for maximum performance
- **Smart terrain avoidance**: Enemies avoid water holes, rocks, wet sand patches, and cactus groves
- **Performance optimization**: 500ms sampling intervals enable scaling to hundreds of enemies
- **Multiple lookahead points**: 60-140 pixel forward scanning for early obstacle detection
- **Smooth behavior**: Balanced avoidance strength prevents erratic movement while maintaining effectiveness
- **Scalable architecture**: Foundation ready for different AI personality types and advanced behaviors
- **Ultra-efficient**: 83% reduction in collision calculations while improving avoidance quality

### Phase 13: Apocalyptic Bandit Transformation 🏴‍☠️💧
**Major Game Design Pivot**: [Experimental shift to post-apocalyptic bandit simulation](docs/apocalyptic_bandit_vision.md)
- **Role reversal**: From desert justice to becoming the water bandits ourselves
- **Economic simulation**: Towns, trade routes, and water scarcity drive gameplay
- **Predator-prey dynamics**: Hunt water convoys traveling between towns and oases
- **Emergent storytelling**: Player actions ripple through a living world economy
- **Modular expansion**: Foundation for full post-apocalyptic civilization simulator
- **Experimental gameplay**: Testing complex AI behaviors and systemic interactions
- **Long-term vision**: Multi-faction politics, dynamic world generation, player-driven narratives

### Phase 14: Hunter Motorcycle Experiment 🏍️🔴
**Key Commits**: [Initial hunter implementation](https://github.com/rranshous/raceon/commit/7750bbe) & [Working hunter system with clean console](https://github.com/rranshous/raceon/commit/latest)
- **Escalation mechanics**: Press 'H' to spawn red hunter motorcycles that pursue player
- **Chasing behavior**: New AI behavior that targets player instead of escaping to world edges  
- **Kill tracking system**: Console displays bandit elimination count for future automatic spawning
- **Entity system expansion**: Hunters registered as separate entity type with own configuration
- **Visual distinction**: Red car sprites (temporary) differentiate hunters from blue bandits
- **Console cleanup**: Removed spammy obstacle avoidance and collision messages for cleaner debugging
- **Behavioral analysis**: Hunters prioritize obstacle avoidance over aggressive pursuit, creating interesting but less threatening swarm behavior
- **Technical foundation**: Complete chasing AI, manual spawning, and target tracking ready for refinement or alternative approaches

## 🎯 What We've Built

- **Smooth vehicle physics** with realistic driving feel
- **Asset-based rendering** using pixel art sprite sheets  
- **Open desert world** with procedural terrain generation
- **Rich terrain interaction** - textured sand, cactus groves, and rock obstacles affect vehicle movement
- **Friction-based terrain physics** - realistic resistance through different ground types
- **Rock collision detection** - solid obstacles with bounce physics
- **Water obstacle collision** with bounce physics and organic shorelines
- **Camera system** for world exploration
- **Water bandit AI** - blue cars stealing from oases with intelligent escape behavior
- **Justice collision system** - ram bandits to stop water theft!
- **Intelligent obstacle avoidance** - enemies smoothly navigate around all terrain types using pre-computed spatial data
- **Performance-optimized AI** - O(1) avoidance lookups enable scaling to hundreds of enemies
- **Visual debug tools** - godly mode overlay for development and analysis
- **Realistic AI physics** - bandits follow same rules as player (no cheating!)
- **Immersive effects system** - screen shake, particles, dust trails, and tire tracks
- **Visual bandit tracking** - follow tire tracks to hunt down escaping water thieves
- **Cinematic feedback** - every collision and action has satisfying visual impact
- **Strategic terrain navigation** - route planning based on ground type resistance
- **Configuration-driven gameplay** - easy tuning of all effect, physics, and gameplay parameters
- **Modular architecture** ready for expansion

## 🛠️ Development Tools

**Godly Debug Mode** - Press 'D' to toggle comprehensive visual debugging:
- **AI Visualization**: See bandit escape routes, avoidance paths, and decision-making
- **Collision Boundaries**: Visual representation of water obstacles and collision radii
- **State Indicators**: Color-coded bandit states (normal/avoiding/stuck)
- **Performance Metrics**: Bandit counts, escape progress, and system stats
- **World Overview**: Camera-independent overlay perfect for development and analysis

## ️ Tech Stack

- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling and hot reload
- **HTML5 Canvas** - 2D rendering and animation
- **Pixel Art Assets** - Authentic retro aesthetic

## 🎨 Assets

Using the ["Mini Pixel Pack 2"](https://grafxkid.itch.io/mini-pixel-pack-2) by GrafxKid for authentic pixel art styling including cars, desert details, and environmental elements.

---

*This game represents experimental game development - exploring different mechanics, visual styles, and gameplay directions while maintaining a solid technical foundation.*
