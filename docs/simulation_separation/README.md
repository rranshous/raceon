# RaceOn: Simulation/Presentation Separation Documentation

This folder contains the documentation for separating the simulation logic from the presentation layer in the RaceOn racing game.

## Documents

### [01_architecture_analysis.md](./01_architecture_analysis.md)
Comprehensive analysis of the current RaceOn architecture, identifying coupling points between simulation and presentation layers. Assesses feasibility and risk levels for different separation approaches.

**Key Findings:**
- Event-driven design already provides good decoupling foundation
- Entity system and physics are well-modularized
- Main coupling is in Game.ts (monolithic game loop)
- Entity rendering and input handling need abstraction

### [02_separation_plan.md](./02_separation_plan.md)
Detailed 4-phase plan for gradually separating simulation from presentation while maintaining system stability and functionality.

**Phases:**
1. **Simulation Core Extraction** (Low risk, high value)
2. **Game Loop Separation** (Medium risk, high value)  
3. **Input Abstraction** (Higher risk, medium value)
4. **Entity/Rendering Separation** (Higher risk, high value)

### [03_progress_tracker.md](./03_progress_tracker.md)
Live document tracking progress, blockers, decisions, and learnings throughout the separation implementation.

**Current Status:** Phase 1 Planning

## Goals

The separation will enable:

- **Headless simulation testing** - Run game logic without graphics for unit testing
- **Deterministic simulation** - Reproducible game states for debugging and testing
- **Multiple presentation layers** - Different renderers, input methods, or platforms
- **Performance optimization** - Simulation and presentation at different frequencies
- **AI training capability** - Train agents without rendering overhead

## Architecture Vision

```
Current Architecture:
[Game.ts] ──> [Canvas + Input + Physics + AI + Entities + ...]

Target Architecture:
[GameScheduler] ──> [SimulationCore] ──> [Pure Game Logic]
                └─> [PresentationLayer] ──> [Rendering + Input + Effects]
```

## Implementation Approach

- **Gradual migration**: Keep existing game functional throughout
- **Non-breaking changes**: Implement alongside current system
- **Test-driven**: Comprehensive testing at each phase
- **Performance monitoring**: Validate improvements continuously

## Contributing

When working on the simulation separation:

1. Update progress in `03_progress_tracker.md`
2. Document key decisions and learnings
3. Maintain backward compatibility during migration
4. Add comprehensive tests for separated components
5. Monitor performance impact of changes

---

*Last updated: August 9, 2025*
