# Hunter Motorcycles Implementation Plan

## Vision Statement

Add escalating danger through hunter motorcycles that spawn when the player becomes too successful at intercepting bandits. Creates layered gameplay where you must hunt bandits while being hunted yourself.

## Core Mechanics

### Escalation System
- **Trigger**: After player destroys X bandits, hunters spawn
- **Progressive threat**: More kills = more hunters + different types
- **Heat cooldown**: Hunters eventually give up if player lays low

### Hunter Behavior
- **Target**: Player vehicle (role reversal from existing bandit AI)
- **Speed advantage**: Faster than bandits but similar to player
- **Persistence**: Follow player across the map until eliminated or they give up
- **Collision**: Hunters try to ram the player (damage/slowdown)

## Implementation Milestones

### Milestone 1: Asset Integration (15-30 minutes)
**Goal**: Get motorcycle sprite ready for use

#### Tasks
- Extract motorcycle sprite from asset sheet
- Add to AssetManager configuration
- Test sprite loading and rendering

#### Files to Modify
- `src/assets/AssetManager.ts` - Add motorcycle image loading

#### Success Criteria
- Motorcycle sprite loads without errors
- Can render motorcycle sprite in test context

---

### Milestone 2: Kill Tracking (15-30 minutes)
**Goal**: Count bandit eliminations

#### Tasks
- Add kill counter to Game.ts
- Increment on bandit destruction
- Add simple console logging

#### Files to Modify
- `src/game/Game.ts` - Add banditKills property and increment logic

#### Success Criteria
- Console shows "Bandit kills: X" when ramming bandits
- Counter persists across game session

---

### Milestone 3: Hunter Entity Configuration (30-45 minutes)
**Goal**: Define hunter motorcycle as new entity type

#### Tasks
- Add HUNTER_MOTORCYCLE config to GameConfig.ts
- Register hunter entity in EntityRegistry
- Use existing WaterBanditEntity class for now

#### Files to Modify
- `src/config/GameConfig.ts` - Add hunter config
- `src/entities/EntityRegistry.ts` - Register hunter type

#### Success Criteria
- Hunter entity type exists in registry
- Can spawn hunter (will behave like bandit for now)

---

### Milestone 4: Chasing Behavior (45-60 minutes)
**Goal**: Create AI that follows player instead of escaping

#### Tasks
- Create ChasingBehavior.ts (copy/modify EscapingBehavior)
- Target player position instead of world edge
- Update target position each frame

#### Files to Create
- `src/entities/behaviors/ChasingBehavior.ts`

#### Files to Modify
- `src/entities/behaviors/BehaviorRegistry.ts` - Register chasing behavior

#### Success Criteria
- Hunter spawns and moves toward player
- Updates target as player moves
- Obstacle avoidance still works

---

### Milestone 5: Manual Hunter Spawning (30-45 minutes)
**Goal**: Spawn hunter on demand for testing

#### Tasks
- Add hunter spawning logic to EnemyManager
- Add keyboard shortcut for manual spawn ('H' key)
- Test hunter spawn near player

#### Files to Modify
- `src/game/EnemyManager.ts` - Add hunter spawn method
- `src/input/InputManager.ts` - Add hunter spawn key
- `src/game/Game.ts` - Handle hunter spawn input

#### Success Criteria
- Press 'H' to spawn hunter that chases player
- Hunter appears at reasonable distance from player
- Hunter uses motorcycle sprite

---

### Milestone 6: Automatic Hunter Spawning (30-45 minutes)
**Goal**: Spawn hunter after kill threshold

#### Tasks
- Integrate kill counter with hunter spawning
- Spawn hunter automatically after 3 bandit kills
- Limit to 1 active hunter initially

#### Files to Modify
- `src/game/Game.ts` - Connect kill tracking to hunter spawning

#### Success Criteria
- Hunter automatically spawns after 3rd bandit kill
- Only 1 hunter active at a time
- System handles respawning correctly

---

### Milestone 7: Player Death on Hunter Collision (45-60 minutes)
**Goal**: Hunter collision kills/resets player

#### Tasks
- Add hunter collision detection with player
- Implement player death/reset on collision
- Add death effects (screen shake, particles)

#### Files to Modify
- `src/game/Game.ts` - Add hunter-player collision logic
- `src/entities/Vehicle.ts` - Add reset/respawn functionality

#### Success Criteria
- Hunter collision triggers player death/reset
- Visual feedback on death (effects)
- Game resets cleanly (kill counter, hunters, etc.)

---

### Milestone 8: Multiple Hunters (30-45 minutes)
**Goal**: Allow multiple hunters simultaneously

#### Tasks
- Increase max active hunters to 2-3
- Spawn additional hunters at higher kill counts
- Test performance with multiple hunters

#### Files to Modify
- `src/config/GameConfig.ts` - Update hunter limits
- `src/game/Game.ts` - Adjust spawning logic

#### Success Criteria
- Multiple hunters can chase player simultaneously
- Spawn escalation works (more kills = more hunters)
- Game maintains smooth performance

## Asset Integration

### Motorcycle Sprites
**Source**: New vehicle asset sheet (5th grouping, top row)
- **Scout motorcycle**: Smaller, lean profile (fast visual)
- **Enforcer motorcycle**: Bulkier profile (tough visual)
- **Extraction method**: Manually crop or use sprite coordinates

### Visual Design
- **Hunter trails**: Red tire tracks vs blue bandit tracks
- **Pursuit indicators**: Arrow pointing toward closest hunter
- **Heat level HUD**: Color-coded threat meter (green → yellow → red)

## Technical Architecture

### Behavior System Reuse
```typescript
// ChasingBehavior extends existing patterns
interface ChasingBehaviorState {
  target: Vector2D;           // Player position (updated each frame)
  pursuitStartTime: number;   // When chase began
  giveUpTime: number;         // When to abandon pursuit
  lastPlayerPosition: Vector2D; // For prediction
}
```

### Heat System Integration
```typescript
class HeatSystem {
  private banditKills: number = 0;
  private heatLevel: number = 0;
  private lastSpawnTime: number = 0;
  private activeHunters: HunterEntity[] = [];
  
  onBanditKilled(): void // Increment kills, check spawn
  getHeatLevel(): number // Current threat level  
  shouldSpawnHunter(): boolean // Timing logic
  update(deltaTime: number): void // Manage existing hunters
}
```

## Success Metrics

### Phase 1 Success
- **Escalation tension**: Does hunter spawn create immediate gameplay shift?
- **Chase quality**: Do hunters effectively pursue across terrain?
- **Balance**: Can player eliminate hunters without trivializing threat?

### Phase 2 Success  
- **Sustained pressure**: Do multiple hunters create ongoing tension?
- **Meaningful choices**: Do different hunter types require different strategies?
- **Progression feel**: Does escalation enhance rather than frustrate?

### Phase 3 Success
- **Strategic depth**: Can players develop heat management strategies?
- **Risk/reward**: Do players willingly take higher heat for better rewards?
- **Long-term engagement**: Does system stay interesting over extended play?

## Implementation Order

1. **Asset extraction**: Get motorcycle sprites from sheet
2. **Basic chasing behavior**: Modify existing AI for player pursuit  
3. **Kill tracking**: Simple counter in Game.ts
4. **Spawn system**: Basic hunter spawning after threshold
5. **Test core loop**: Ensure basic chase/elimination works
6. **Expand**: Multiple hunters, types, heat system
7. **Polish**: Visual indicators, damage system, terrain interaction

## Risk Mitigation

### Technical Risks
- **Performance**: Multiple hunters + bandits may impact framerate
- **AI conflicts**: Hunters might interfere with bandit AI
- **Balance**: Hunters could be too easy or impossibly hard

### Mitigation Strategies
- **Incremental testing**: Test with 1 hunter before scaling up
- **Separate AI updates**: Stagger hunter vs bandit AI calculations
- **Configurable difficulty**: Make all timings/speeds easily tunable

## Future Feature Ideas

*These features can be explored after the core hunter system is proven engaging:*

### Visual & Polish Features
- **Red tire tracks** for hunters vs blue for bandits
- **Hunter count HUD** display
- **Heat level indicator** (visual threat meter)
- **Hunter variants** - Scout (fast) vs Enforcer (tough) types
- **Different motorcycle sprites** for each hunter type

### Escalation Features  
- **Heat cooldown system** - reduce threat over time if player lays low
- **Progressive spawning** - more kills = faster/more hunter spawns
- **Hunter damage system** - hunters slow/damage player on collision
- **Territory tactics** - use terrain to lose hunters
- **Risk/reward scaling** - higher heat = better bandit rewards

### Advanced Mechanics
- **Hunter communication** - coordinate to surround player
- **Hunter variants** with different behaviors and capabilities
- **Escape vehicles** - special getaway sequences
- **Hunter factions** - different groups with unique motivations
- **Dynamic heat zones** - some areas have permanent hunter presence

### Integration with Apocalyptic Vision
- **Town-sponsored hunters** - specific towns send enforcement
- **Water convoy escorts** - hunters protecting valuable shipments  
- **Faction warfare** - player caught between competing hunter groups
- **Economic simulation** - hunter activity affects town behavior

**Implementation Principle**: Only add these if the core "hunt bandits while being hunted" loop proves genuinely engaging!
