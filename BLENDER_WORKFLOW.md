# 🎨 Blender Workflow for WaifuVerse 3D Models

## Overview
Your custom waifu creator generates combinations that need corresponding 3D models. Here's how to create and export them from Blender for the web app.

## 📁 File Structure

```
public/models/
├── base_waifu.glb                    # Default fallback model
├── hair_styles/
│   ├── twin_tails_blonde.glb
│   ├── long_straight_brown.glb
│   └── ...
├── outfits/
│   ├── school_uniform.glb
│   ├── maid_outfit.glb
│   └── ...
└── animation_sets/
    ├── cute_animations.glb
    ├── elegant_animations.glb
    └── ...
```

## 🎯 Model Requirements

### Character Specs:
- **Poly Count**: 10,000-15,000 triangles (mobile optimized)
- **Textures**: 1024x1024 or 512x512 for mobile
- **Rig**: Standard humanoid armature with named bones
- **Height**: ~1.7 units in Blender (fits the 1.5 scale in Three.js)

### Required Bone Names (for animation compatibility):
```
- Root
- Hips
- Spine
- Chest  
- Neck
- Head
- Shoulder.L/R
- UpperArm.L/R
- Forearm.L/R
- Hand.L/R
- Thigh.L/R
- Shin.L/R
- Foot.L/R
```

## 🎬 Animation Sets

### Standard Animations (all sets need these):
- **idle**: Default standing pose (2-4 sec loop)
- **wave**: Friendly wave gesture (2 sec)
- **nod**: Agreement nod (1 sec)
- **shake_head**: Disagreement shake (1 sec)  
- **thinking**: Hand to chin pose (3 sec)

### Cute Animation Set:
- **idle_cute**: Bouncy, kawaii idle
- **bounce**: Happy jumping motion
- **twirl**: Spinning around happily
- **heart_hands**: Making heart shape with hands
- **wink**: Cute wink with head tilt

### Elegant Animation Set:
- **idle_graceful**: Refined standing pose
- **bow**: Formal bow
- **curtsy**: Elegant curtsy
- **hand_gesture**: Graceful hand movement
- **smile**: Subtle smile animation

### Energetic Animation Set:
- **idle_excited**: Dynamic, bouncy idle
- **jump**: Excited jump
- **dance**: Simple dance moves
- **cheer**: Victory pose
- **run_place**: Running in place

## 🎨 Material & Color Setup

### Material Names (for automatic color changing):
- **Hair_Material**: For hair color changes
- **Eye_Material**: For eye color changes  
- **Skin_Material**: For skin tone changes
- **Clothing_Material**: For outfit colors

### Mesh Names (for identification):
- **Hair**: All hair geometry
- **Eyes**: Eye geometry
- **Skin** or **Body**: Skin/face geometry
- **Outfit_[type]**: Clothing pieces

## 📤 Export Settings

### GLB Export from Blender:
1. Select all relevant objects
2. File → Export → glTF 2.0 (.glb)
3. **Settings**:
   - Format: GLB
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers ✓
   - Animation: ✓ (include all actions)
   - Optimize for Size: ✓

## 🔧 Animation Implementation

### In Blender:
```python
# Example action naming convention
actions = [
    "cute_idle",      # Maps to 'idle' for cute animation set
    "cute_bounce",    # Maps to 'bounce' for cute animation set
    "elegant_bow",    # Maps to 'bow' for elegant animation set
    # etc...
]
```

### In Code (automatic mapping):
The Avatar3D component automatically maps generic animations to specific sets:
- `animation="idle"` + `animationSet="cute"` → plays "cute_idle"
- `animation="wave"` + `animationSet="elegant"` → plays "elegant_wave"

## 🎪 Dynamic Model Loading

### Current Path Structure:
```typescript
// In getModelPath() function
const modelPath = `/models/waifu_${hairStyle}_${outfit}_${animationSet}.glb`;

// Examples:
// /models/waifu_twin_tails_school_uniform_cute.glb  
// /models/waifu_long_straight_maid_outfit_elegant.glb
```

### Alternative Modular Approach:
```typescript
// Load base model + swap materials/textures
const basePath = `/models/base_${animationSet}.glb`;
const hairTexture = `/textures/hair_${hairStyle}_${hairColor}.png`;
const outfitTexture = `/textures/outfit_${outfit}.png`;
```

## 🚀 Production Workflow

### 1. Create Base Models:
- One base model per animation set (cute, elegant, energetic, etc.)
- Include all animations for that personality type
- Neutral colors (will be changed dynamically)

### 2. Texture Variations:
- Create texture atlases for different combinations
- Hair: style + color combinations
- Outfits: different clothing options
- Skin: various skin tones

### 3. Testing:
```bash
# Test model loading
curl -I https://your-domain.com/models/base_waifu.glb

# Should return 200 OK with correct content-type
```

## 🎯 Next Steps for Implementation:

1. **Create Base Model**: Start with one base waifu in Blender
2. **Add Animation Set**: Implement cute animations first  
3. **Export & Test**: Put in `/public/models/base_waifu.glb`
4. **Integrate**: Test with the custom waifu creator
5. **Expand**: Add more variations and animation sets

## 💡 Pro Tips:

- **Performance**: Use texture atlases to reduce draw calls
- **Animations**: Keep animations under 5 seconds for responsiveness  
- **Mobile**: Test on actual mobile devices for performance
- **Fallbacks**: Always have a simple geometric fallback
- **Optimization**: Use Blender's Decimator for LOD versions

The app is ready for your Blender models! Just export your first model as `/public/models/base_waifu.glb` and it will automatically load in the 3D scene. 🎉