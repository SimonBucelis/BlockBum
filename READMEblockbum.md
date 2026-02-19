```markdown
no make game  mobile css and html drag and drop for phone that is hostible on github page:https://github.com/SimonBucelis/BlockBum

# Block Bum - Mobile HTML Game

## 📱 Mobile-Optimized Block Blast Clone
Pure HTML/CSS/JavaScript with touch drag-and-drop, designed for GitHub Pages hosting.

## 🎮 Live Demo Structure
```
BlockBum/
├── index.html
├── styles/
│   ├── main.css
│   └── game.css
├── scripts/
│   ├── game.js
│   ├── grid.js
│   ├── pieces.js
│   └── levels.js
├── assets/
│   └── icons/
│       ├── gem.svg
│       ├── star.svg
│       ├── ice.svg
│       ├── cage.svg
│       ├── rock.svg
│       └── restart.svg
└── README.md
```

## 📐 Mobile-First Design Requirements
- Viewport meta with user-scalable=no
- CSS Grid layout with touch-optimized hit areas (min 44x44px)
- HTML5 touch events (touchstart, touchmove, touchend) for drag and drop
- Snap-to-grid collision detection
- System fonts only, rem-based sizing
- No hover states (mobile only)
- Prevent default touch behaviors to avoid page zoom/scroll during gameplay

## 🧩 Game Features

### Core Playfield
- 8x8 grid (boolean 2D array)
- Piece queue showing 3-5 random polyominoes
- Drag placement with visual feedback (ghost placement preview)
- Game over when no pieces can be placed
- Restart level button

### Line Clearing
- Auto-scan rows and columns after placement
- Clear full lines and shift remaining blocks
- Chain reactions from multiple clears
- Visual animation for cleared lines (flash then fade)

### Gem Collection System
**First Level (Tutorial):**
- Single gem type (💎 regular gems)
- 50 gems target
- Simple collection mechanics
- Introduction to line clearing

**Later Levels (4 Different Gem Types):**
- 💎 Regular gems (blue) - basic points
- 🔴 Fire gems (red) - double score when cleared
- 💚 Nature gems (green) - adds extra piece to queue
- 💜 Magic gems (purple) - clears adjacent blocks

### Obstacle Blocks (Phase in by level)
- 🪨 Rock blocks - cannot be placed on, must be cleared by lines around them
- ❄️ Ice blocks - require 2 line clears to break
- 🔒 Cage blocks - need line clear from specific direction (horizontal/vertical)
- 🧱 Iron blocks - indestructible, change board shape

## 📱 UI Layout (Mobile)
```
┌─────────────────────┐
│ ←  LEVEL 1  ⭐ 1234 │
├─────────────────────┤
│ 💎 47/50  🔥 x5     │
├─────────────────────┤
│                     │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│    □ □ □ □ □ □ □ □  │
│                     │
├─────────────────────┤
│ NEXT:               │
│  ┌──┐ ┌──┐ ┌──┐    │
│  │██│ │██│ │██│    │
│  │██│ │  │ │██│    │
│  └──┘ └──┘ └──┘    │
├─────────────────────┤
│       [RESTART]     │
└─────────────────────┘
```

## 🎯 MVP Scope
- First level only (50 regular gems)
- 8 core polyomino shapes
- Basic scoring
- Touch drag-and-drop only
- Local storage for high scores
- Restart functionality
- Win/loss screens

## 🚀 GitHub Pages Setup
1. Create repository at `https://github.com/SimonBucelis/BlockBum`
2. Clone locally and add all game files
3. Push to main branch
4. Go to Settings > Pages
5. Select "main" branch as source
6. Save - site live at `https://simonbucelis.github.io/BlockBum`

## 📦 File Descriptions

**index.html** - Entry point with viewport meta and container divs
- Game container structure
- UI header with counters
- Grid container
- Piece queue area
- Restart button

**styles/main.css** - Mobile layout, grid styling, touch-friendly sizing
- CSS Grid for 8x8 board
- Flexbox for queue
- Touch target sizing
- Dark theme variables

**styles/game.css** - Game-specific styling
- Different gem type colors
- Obstacle block textures
- Piece preview colors
- Animation keyframes
- Win/loss overlays

**scripts/grid.js** - 8x8 grid management and collision detection
- Grid state management
- Line detection algorithms
- Shift mechanics
- Obstacle block handling
- Collision checking

**scripts/pieces.js** - Polyomino shapes and touch drag handlers
- Shape library (8 base shapes)
- Touch event handlers
- Drag ghost preview
- Snap-to-grid calculation

**scripts/levels.js** - Level JSON parser and progression
```javascript
{
  "level1": {
    "name": "Gem Basics",
    "gems": {
      "type": "regular",
      "target": 50,
      "spawnRate": 0.2
    },
    "obstacles": [],
    "scoreThreshold": 1000,
    "stars": {
      "1": 1000,
      "2": 2000,
      "3": 3000
    }
  },
  "level5": {
    "name": "Fire and Ice",
    "gems": {
      "types": ["regular", "fire"],
      "target": 80,
      "spawnRates": [0.15, 0.10]
    },
    "obstacles": ["ice"],
    "obstacleDensity": 0.1,
    "scoreThreshold": 3000
  },
  "level10": {
    "name": "Gem Fusion",
    "gems": {
      "types": ["regular", "fire", "nature", "magic"],
      "target": 150,
      "spawnRates": [0.1, 0.1, 0.05, 0.05]
    },
    "obstacles": ["rock", "ice", "cage"],
    "obstacleDensity": 0.2,
    "scoreThreshold": 8000
  }
}
```

**scripts/game.js** - Core loop, win/loss conditions, scoring
- Game state machine
- Score calculation
- Gem type effects
- Obstacle interactions
- Win/loss validation
- Local storage I/O

## ✅ Browser Compatibility
- Chrome for Android (latest)
- Safari iOS (latest)
- Samsung Internet (latest)
- Firefox Mobile (latest)

## 📱 Touch Gestures
- Tap to select piece
- Drag to move piece (with ghost preview)
- Release to snap to grid
- Double-tap to rotate (future enhancement)

## 🎨 Visual Style by Level Type

**Level 1 (Tutorial):**
- Blue theme
- Simple 💎 gems
- No obstacles
- Gentle learning curve

**Fire Levels (2-5):**
- Red/orange theme
- 🔴 Fire gems appear
- Ice obstacles introduced
- Combo focus

**Nature Levels (6-10):**
- Green theme
- 💚 Nature gems appear
- Rock obstacles introduced
- Queue management focus

**Magic Levels (11-15):**
- Purple theme
- 💜 Magic gems appear
- Cage obstacles introduced
- Chain reaction focus

**Master Levels (16-20):**
- Rainbow theme
- All 4 gem types
- All obstacles combined
- Maximum difficulty

## 🎯 Win Conditions
Level Complete When:
- Gems collected == target (exact match required)
- Score meets minimum threshold
- Grid still has valid moves

## 💎 Gem Type Effects

**Regular Gem (💎)** - Basic, 10 points each

**Fire Gem (🔴)** - 20 points each, 2x multiplier on line clear

**Nature Gem (💚)** - Adds one extra piece to queue when collected

**Magic Gem (💜)** - Clears all adjacent blocks (8-direction) when collected

## 🪨 Obstacle Blocks

**Rock (🪨)** - Cannot place pieces overlapping. Must be cleared by forming lines around them

**Ice (❄️)** - Requires 2 separate line clears to break. First clear cracks it, second destroys it

**Cage (🔒)** - Only breaks when line clear comes from correct direction (horizontal or vertical). Shows direction indicator

**Iron (🧱)** - Indestructible. Permanently blocks part of board. Creates unique level shapes

## ⭐ Star Ratings
- 1 Star: Clear level with exact gem target
- 2 Stars: Reach score threshold
- 3 Stars: Perfect efficiency (no wasted moves + high combo)

## 🔄 Future Enhancements (Post-MVP)
- Level select screen
- Gem type animations
- Obstacle destruction effects
- Sound effects
- Daily challenges
- More level themes

## 📝 Development Notes
- Start with Level 1 only (regular gems, no obstacles)
- Add gem types progressively
- Test obstacle interactions thoroughly
- Cache DOM queries for performance
- Use CSS transforms for drag movement
- Test on actual devices early

## 🚦 Release Checklist (MVP)
- [ ] Level 1 working (50 regular gems)
- [ ] Touch drag implemented
- [ ] Grid collision working
- [ ] Line clearing functional
- [ ] Gem tracking accurate
- [ ] Scoring system tested
- [ ] Win/loss conditions met
- [ ] Local storage saving
- [ ] Tested on iPhone
- [ ] Tested on Android
- [ ] GitHub Pages configured
- [ ] README complete

## 📱 Test Devices
- iPhone SE/12/13/14
- Google Pixel 6/7
- Samsung Galaxy S22
- iPad Mini

## 💾 Local Storage Schema
```javascript
{
  "highScore": 1234,
  "unlockedLevels": 1,
  "totalGems": 450,
  "gamesPlayed": 10,
  "bestCombo": 8,
  "gemsCollected": {
    "regular": 450,
    "fire": 0,
    "nature": 0,
    "magic": 0
  }
}
```

## 🎮 Level Progression Plan

**Levels 1:** Regular gems only (tutorial)

**Levels 2-4:** Regular + Fire gems, Ice blocks

**Levels 5-7:** All 3 gem types (regular, fire, nature), Rock blocks

**Levels 8-10:** All 4 gem types, Cage blocks introduced

**Levels 11-15:** All gems + all obstacles mixed

**Levels 16-20:** Iron blocks create unique board shapes
























































































