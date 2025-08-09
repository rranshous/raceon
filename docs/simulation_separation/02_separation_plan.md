# RaceOn: Simulation/Presentation Separation Plan

*Date: August 9, 2025*

## Vision

Create a clean separation between the simulation (game rules, physics, AI) and presentation (rendering, input, effects) layers to enable:

- **Headless simulation testing** - Run game logic without graphics
- **Deterministic simulation** - Reproducible game states for testing
- **Multiple presentation layers** - Different renderers, input methods, or platforms
- **Performance optimization** - Simulation and presentation can run at different frequencies
- **AI training** - Train agents without rendering overhead

## Separation Strategy

### Phase 1: Simulation Core Extraction (Low Risk, High Value)

**Goal**: Create a `SimulationCore` class that can run the game logic independently.

**Components to Extract**:
```typescript
// New core simulation class
class SimulationCore {
  private world: SimulationWorld;
  private entities: Map<string, SimulationEntity>;
  private physics: PhysicsSystem;
  private time: number;
  
  step(deltaTime: number, inputs: SimulationInputs): SimulationState;
  getState(): SimulationState;
  setState(state: SimulationState): void;
}
```

**Benefits**:
- ✅ No breaking changes to existing code
- ✅ Can be implemented alongside current system
- ✅ Immediate testing benefits
- ✅ Foundation for further separation

**Implementation Steps**:
1. Create `SimulationCore` class
2. Create `SimulationState` interface
3. Create `SimulationInputs` interface  
4. Extract pure simulation from `Game.ts`
5. Add deterministic step function

### Phase 2: Game Loop Separation (Medium Risk, High Value)

**Goal**: Split the unified game loop into separate simulation and presentation loops.

**New Architecture**:
```typescript
class Game {
  private simulation: SimulationCore;
  private presentation: PresentationLayer;
  private scheduler: GameScheduler;
  
  // Simulation can run at different frequency than rendering
  start(): void {
    this.scheduler.startLoops({
      simulationHz: 60,    // Fixed timestep for determinism
      presentationHz: 60   // Can be variable or different
    });
  }
}
```

**Benefits**:
- 🎯 Deterministic simulation with fixed timestep
- 🎯 Presentation can interpolate between simulation states
- 🎯 Can run simulation faster than real-time for testing
- 🎯 Foundation for networking/replay systems

### Phase 3: Input Abstraction (Higher Risk, Medium Value)

**Goal**: Abstract input system so simulation doesn't depend on keyboard/DOM events.

**New Input Architecture**:
```typescript
interface SimulationInputs {
  accelerate: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  timestamp: number;
}

interface InputProvider {
  getInputs(timestamp: number): SimulationInputs;
}

class KeyboardInputProvider implements InputProvider {
  getInputs(timestamp: number): SimulationInputs {
    // Convert keyboard state to simulation inputs
  }
}

class ScriptedInputProvider implements InputProvider {
  // For testing, replay, or AI
  getInputs(timestamp: number): SimulationInputs {
    // Return pre-programmed inputs
  }
}
```

**Benefits**:
- 🧪 Scriptable inputs for testing
- 🧪 Replay system capability
- 🧪 AI training inputs
- 🧪 Network input handling

### Phase 4: Entity/Rendering Separation (Higher Risk, High Value)

**Goal**: Separate entity data from visual representation.

**New Entity Architecture**:
```typescript
interface SimulationEntity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  angle: number;
  // Pure data, no rendering
}

interface PresentationEntity {
  id: string;
  sprite: CarSprite;
  effects: VisualEffect[];
  // Pure rendering, no simulation
}

class PresentationLayer {
  private entities = new Map<string, PresentationEntity>();
  
  syncWithSimulation(state: SimulationState): void {
    // Update presentation entities from simulation state
  }
}
```

**Benefits**:
- 🎨 Multiple visual representations of same simulation
- 🎨 Entity simulation without graphics dependencies
- 🎨 Cleaner entity lifecycle management
- 🎨 Better testing of entity logic

## Implementation Phases Detail

### Phase 1 Implementation Plan

**Week 1: Core Simulation Foundation**
1. Create `SimulationCore` class structure
2. Define `SimulationState` interface
3. Define `SimulationInputs` interface
4. Create basic step function

**Week 2: Entity System Integration**
1. Create simulation-only entity representations
2. Integrate with existing physics system
3. Port enemy AI to simulation core
4. Add deterministic random number generation

**Week 3: Testing and Validation**
1. Create headless simulation tests
2. Validate deterministic behavior
3. Performance benchmarking
4. Create demo showing simulation without rendering

### Phase 2 Implementation Plan

**Week 1: Loop Architecture**
1. Create `GameScheduler` class
2. Implement fixed timestep simulation
3. Add presentation interpolation
4. Migrate existing game loop

**Week 2: State Synchronization**
1. Create state sync mechanism
2. Handle simulation/presentation timing
3. Add performance monitoring
4. Validate smooth rendering

### Phase 3 Implementation Plan

**Week 1: Input Abstraction**
1. Create `InputProvider` interface
2. Implement `KeyboardInputProvider`
3. Create `ScriptedInputProvider` for testing
4. Migrate vehicle input handling

**Week 2: Testing Framework**
1. Create input recording/replay system
2. Add deterministic input testing
3. Create AI input provider foundation
4. Performance validation

### Phase 4 Implementation Plan

**Week 1: Entity Separation**
1. Create pure simulation entities
2. Create presentation entity system
3. Implement state synchronization
4. Migrate existing entities

**Week 2: Rendering Pipeline**
1. Create presentation layer architecture
2. Implement sprite/entity mapping
3. Add visual effect separation
4. Full system integration testing

## Success Metrics

### Phase 1 Success Criteria
- [ ] Simulation can run completely headless
- [ ] Deterministic reproduction of game states
- [ ] Performance: Simulation runs 10x faster without rendering
- [ ] Test coverage: 90% of simulation logic unit tested

### Phase 2 Success Criteria
- [ ] Simulation and presentation loops run independently
- [ ] Smooth 60fps rendering with variable simulation rates
- [ ] Can run simulation at 2x, 5x, 10x real-time speed
- [ ] Visual interpolation maintains smooth appearance

### Phase 3 Success Criteria
- [ ] Zero DOM/input dependencies in simulation
- [ ] Recorded input playback system working
- [ ] Scriptable AI input providers functional
- [ ] Network input architecture ready

### Phase 4 Success Criteria
- [ ] Entities can exist in simulation without sprites
- [ ] Multiple presentation layers possible
- [ ] Clean entity lifecycle management
- [ ] Performance improvement from separation

## Risk Mitigation

### Technical Risks
- **State synchronization complexity**: Implement incremental migration
- **Performance regression**: Continuous benchmarking
- **Breaking existing features**: Comprehensive test suite
- **Complex debugging**: Enhanced logging and debug tools

### Mitigation Strategies
- **Gradual migration**: Keep old and new systems running in parallel
- **Extensive testing**: Unit tests, integration tests, visual validation
- **Performance monitoring**: Before/after benchmarks
- **Rollback plan**: Each phase can be reverted independently

## Next Steps

1. Review and validate this plan
2. Set up development environment for parallel implementation
3. Create branch for Phase 1 development
4. Begin implementation of `SimulationCore` foundation

The modular approach ensures we can deliver value incrementally while minimizing risk to the existing, working game.
