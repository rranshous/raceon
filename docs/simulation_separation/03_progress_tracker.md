# RaceOn: Simulation/Presentation Separation - Progress Tracker

*Started: August 9, 2025*

## Overview

This document tracks the progress of separating the simulation layer from the presentation layer in the RaceOn game. Each phase represents a milestone toward a clean, testable, and flexible architecture.

## Phase 1: Simulation Core Extraction ⏳

**Status**: Planning  
**Target Completion**: TBD  
**Risk Level**: Low  
**Value**: High  

### Goals
- [x] Analyze current architecture coupling
- [x] Design SimulationCore interface  
- [ ] Implement basic SimulationCore class
- [ ] Create SimulationState interface
- [ ] Create SimulationInputs interface
- [ ] Port core game logic to simulation
- [ ] Achieve headless simulation capability
- [ ] Create deterministic step function
- [ ] Add comprehensive unit tests

### Implementation Tasks

#### Week 1: Foundation
- [ ] Create `/src/simulation/` directory structure
- [ ] Implement `SimulationCore` class skeleton
- [ ] Define `SimulationState` data structures
- [ ] Define `SimulationInputs` interface
- [ ] Create basic `step()` function

#### Week 2: Entity Integration  
- [ ] Create simulation entity representations
- [ ] Port physics system integration
- [ ] Migrate enemy AI systems
- [ ] Implement deterministic RNG
- [ ] Add world state management

#### Week 3: Testing & Validation
- [ ] Create headless test suite
- [ ] Validate deterministic behavior
- [ ] Performance benchmarking
- [ ] Demo: simulation without rendering
- [ ] Integration with existing game loop

### Success Metrics
- [ ] Simulation runs completely headless
- [ ] 100% deterministic state reproduction
- [ ] 10x+ performance improvement without rendering
- [ ] 90%+ test coverage of simulation logic
- [ ] Zero breaking changes to existing game

### Blockers & Issues
*None identified yet*

### Notes & Learnings
*To be filled as we progress*

---

## Phase 2: Game Loop Separation ⏸️

**Status**: Not Started  
**Dependencies**: Phase 1 Complete  
**Risk Level**: Medium  
**Value**: High  

### Goals
- [ ] Separate simulation and presentation loops
- [ ] Implement fixed timestep simulation
- [ ] Add presentation interpolation
- [ ] Enable variable simulation speeds
- [ ] Create GameScheduler system

### Tasks
*Detailed tasks will be added when Phase 1 is complete*

---

## Phase 3: Input Abstraction ⏸️

**Status**: Not Started  
**Dependencies**: Phase 2 Complete  
**Risk Level**: Higher  
**Value**: Medium  

### Goals
- [ ] Abstract input system from DOM events
- [ ] Enable scriptable inputs
- [ ] Create replay system foundation
- [ ] Support AI input providers

### Tasks
*Detailed tasks will be added when Phase 2 is complete*

---

## Phase 4: Entity/Rendering Separation ⏸️

**Status**: Not Started  
**Dependencies**: Phase 3 Complete  
**Risk Level**: Higher  
**Value**: High  

### Goals
- [ ] Separate entity data from visual representation
- [ ] Enable multiple presentation layers
- [ ] Clean entity lifecycle management
- [ ] Performance optimization through separation

### Tasks
*Detailed tasks will be added when Phase 3 is complete*

---

## Overall Progress

### Completed Milestones
- ✅ **Architecture Analysis**: Comprehensive analysis of current coupling (August 9, 2025)
- ✅ **Separation Plan**: Detailed phased approach designed (August 9, 2025)

### Current Focus
🎯 **Phase 1 Planning**: Designing the simulation core foundation

### Key Decisions Made
1. **Gradual approach**: Implement phases incrementally to minimize risk
2. **Non-breaking**: Keep existing game functional throughout migration
3. **Test-driven**: Comprehensive testing at each phase
4. **Performance-first**: Monitor performance impact continuously

### Architecture Evolution

```
Current:  [Game.ts] -> [Canvas + Input + Physics + AI + ...]

Phase 1:  [Game.ts] -> [Canvas + Input + ...]
          [SimulationCore] -> [Physics + AI + State]

Phase 2:  [GameScheduler] -> [SimulationCore] + [PresentationLayer]

Phase 3:  [GameScheduler] -> [SimulationCore(InputProvider)] + [PresentationLayer]

Phase 4:  [GameScheduler] -> [SimulationCore(Pure)] + [PresentationLayer(Sprites)]
```

### Next Actions
1. Begin Phase 1 implementation
2. Create `/src/simulation/` directory structure
3. Design and implement `SimulationCore` class
4. Set up testing framework for headless simulation

### Questions to Resolve
- Should we maintain backward compatibility or allow breaking changes?
- What's the target performance improvement threshold?
- How detailed should deterministic reproduction be?
- Should we implement save/load state functionality?

---

*This document will be updated as progress is made. Last updated: August 9, 2025*
