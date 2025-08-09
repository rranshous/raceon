# Apocalyptic Bandit Game Vision & Implementation Plan

## Vision Statement

Transform RaceOn from a simple racing game into an experimental post-apocalyptic bandit simulation where players intercept water trade routes between desert towns and oasis sources. This serves as a stepping stone toward a full simulation of post-apocalyptic economies, trade networks, and survival mechanics.

## Core Concept

**You are the bandit in a delicate ecosystem.** Towns across the desert have water reserves and send vehicles to collect water from oases. Each town has a water meter - when it hits zero, the town dies and stops sending vehicles forever. 

**The tension**: Steal enough water to survive, but not so much that you kill your sources. You can't collect water yourself - you can only steal from town vehicles returning with cargo. It's a sustainable parasitism game where you must balance greed with long-term survival.

## Game Pillars

### 1. Ecosystem Balance
- **Towns** have finite water reserves and send collection vehicles
- **Player** can only steal water, cannot collect it directly
- **Dead towns** stop sending vehicles forever
- **Sustainability** becomes core strategic concern

### 2. Resource Parasitism
- **Water** depletes over time for both player and towns
- **Collection vehicles** return from oases with cargo to steal
- **Interception timing** matters - steal from returning vehicles, not outgoing ones
- **Greed vs longevity** creates constant tension

### 3. Simple Escalation (Future)
- **Vehicle upgrades** for better interception capability
- **Town defenses** may adapt to persistent bandits
- **Multiple towns** create portfolio management gameplay

## Implementation Milestones

### MVP: Core Ecosystem Mechanics (Day 1-3)
**Goal:** Prove the ecosystem balance tension is engaging

#### Essential Features (The Absolute Minimum)
- **Towns on Map**: Static town entities with visible water meters
- **Water Collection Cycles**: Towns spawn vehicles that go to oases and return with water
- **Interception Window**: Only returning vehicles carry water to steal
- **Player Water Meter**: Player water depletes over time, game over at zero
- **Town Death**: Towns with zero water stop spawning vehicles forever

#### Technical Implementation
- Create simple `TownEntity` with water level property
- Modify existing spawn system: vehicles go oasis→return→town in cycles
- Add water cargo only to returning vehicles
- Simple HUD showing player water + town water levels
- Town "death" state stops vehicle spawning

**Success Criteria**: Is the balance tension engaging? Do you feel the ecosystem pressure?

### Expansion 1: Strategic Depth (Day 4-7)
**Goal:** Add meaningful choices to the ecosystem game

#### Core Additions
- **Multiple Towns**: 3-4 towns create portfolio management decisions
- **Variable Cargo**: Some vehicles carry more water (risk/reward timing)
- **Town Recovery**: Dead towns can slowly revive if left alone
- **Efficiency Metrics**: Track water stolen vs towns killed (sustainability score)

#### Technical Implementation
- Multiple town spawn points across the map
- Random cargo amounts on returning vehicles
- Slow water regeneration for "dead" towns over time
- Simple statistics tracking for player performance

**Success Criteria**: Do multiple towns create interesting strategic choices?

### Expansion 2: Escalation & Polish (Day 8-14)  
**Goal:** Add progression without breaking core ecosystem loop

#### Enhanced Systems
- **Vehicle Upgrades**: Better ramming, speed, water storage capacity
- **Town Adaptation**: Heavily raided towns send armored or faster vehicles
- **Visual Polish**: Better indicators for town health, vehicle cargo, danger levels
- **End Game**: Survive X days or achieve sustainability targets

#### Technical Implementation
- Simple upgrade system using existing config architecture
- Conditional vehicle variants based on town raid history
- Enhanced visual feedback using existing particle/effect systems
- Victory conditions and progression tracking

**Success Criteria**: Does progression enhance rather than complicate the core loop?

## Technical Architecture

### Exploratory Development Principles
- **Reuse First**: Leverage existing systems before building new ones
- **Validate Quickly**: Prove mechanics are fun before adding complexity
- **Iterative Growth**: Each expansion builds on validated foundations

### Minimal New Code Required
- **MVP**: ~50 lines of code (role reversal + water counter)
- **Expansion 1**: ~200 lines (fuel system + variants)  
- **Expansion 2**: ~400 lines (routes + escalation)

### Key Module Evolution
- Start: Modify existing `WaterBanditEntity` 
- Expand: Add `src/economy/` module only when needed
- Future: Full simulation architecture only if mechanics prove engaging

### Data Flow (MVP)
```
Towns Spawn Vehicles → Go to Oasis → Return with Water → Player Intercepts → 
Town Loses Water → Player Gains Water → Repeat (if town survives)
```

### Data Flow (Full)
```
Multiple Towns → Portfolio Management → Strategic Interception → 
Ecosystem Balance → Town Adaptation → Escalation → Long-term Survival
```

## Success Metrics

### MVP Success Criteria
- **Ecosystem Tension**: Do you feel the pressure of balancing greed vs sustainability?
- **Strategic Timing**: Is intercepting returning vehicles more engaging than random hunting?
- **Consequence Weight**: Does killing a town feel meaningfully bad?
- **Resource Anxiety**: Does your depleting water meter create urgency?

### Expansion Success Criteria  
- **Portfolio Strategy**: Do multiple towns create interesting management decisions?
- **Sustainable Play**: Can players develop long-term survival strategies?
- **Escalation Balance**: Do upgrades enhance without breaking ecosystem tension?

## Next Steps

1. **MVP Implementation** (Day 1): Towns with water meters + collection cycles
2. **Playtest Ecosystem** (Day 2): Is the balance tension compelling?
3. **Iterate Core Loop** (Day 3): Refine timing and feedback
4. **Expand Only If Addictive**: Build on proven ecosystem mechanics

## Long-term Vision (If MVP Succeeds)

This experimental ecosystem bandit game could evolve into:
- Multi-town portfolio management with complex trade-offs
- Vehicle progression and town adaptation arms race  
- Long-term survival simulation with seasonal/environmental factors
- Economic simulation where player choices ripple through town ecosystems

**But only if the core ecosystem balance tension proves genuinely addictive.**
