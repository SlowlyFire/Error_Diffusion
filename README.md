# Error Diffusion - Image Processing

Image dithering using error diffusion algorithm (Floyd-Steinberg).

## Description

This program converts grayscale or color images to black and white using the Floyd-Steinberg error diffusion algorithm. The algorithm distributes quantization errors to neighboring pixels, creating a dithered effect that preserves image details.

## Features

- Converts images to binary (black & white)
- Uses Floyd-Steinberg error diffusion
- Supports PNG, JPEG, and other common formats
- Preserves image details through intelligent dithering

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation
```bash
# Clone the repository
git clone https://github.com/SlowlyFire/Error_Diffusion.git
cd Error_Diffusion

# Install dependencies
npm install
```

## Usage
```bash
# Compile and run
npm start
```

Or step by step:
```bash
# Compile TypeScript
npm run build

# Run the program
node dist/errorDiffusion.js
```

## Project Structure
```
error-diffusion/
├── src/
│   └── errorDiffusion.ts    # Main implementation
├── dist/                      # Compiled JavaScript (generated)
├── node_modules/              # Dependencies (generated)
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## How It Works

### Floyd-Steinberg Error Diffusion Algorithm

1. **Process pixels left-to-right, top-to-bottom**
2. **Quantize each pixel** to black (0) or white (255)
3. **Calculate error**: `error = original_value - quantized_value`
4. **Distribute error** to neighboring pixels:
```
   Current pixel: X
   
           X    7/16
      3/16 5/16 1/16
```

### Error Distribution:
- Right pixel: 7/16 of error
- Bottom-left pixel: 3/16 of error
- Bottom pixel: 5/16 of error
- Bottom-right pixel: 1/16 of error

## Algorithm Pseudocode
```
for each pixel (x, y):
    oldpixel = pixel[x, y]
    newpixel = (oldpixel < 128) ? 0 : 255
    pixel[x, y] = newpixel
    error = oldpixel - newpixel
    
    pixel[x+1, y  ] += error × 7/16
    pixel[x-1, y+1] += error × 3/16
    pixel[x  , y+1] += error × 5/16
    pixel[x+1, y+1] += error × 1/16
```

## Example

**Input:** Grayscale image  
**Output:** Black and white dithered image

The algorithm preserves details and gradients through strategic error distribution.

## Dependencies

- `jimp` - Image processing library
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions

## Configuration Files

### tsconfig.json
TypeScript compiler configuration
- Compiles from `src/` to `dist/`
- Target: ES2020
- Module: CommonJS

### package.json
Project dependencies and scripts
- `npm start` - Compile and run
- `npm run build` - Compile only

## Notes

- The algorithm works best on grayscale images
- Color images are automatically converted to grayscale first
- Output is always binary (pure black and white)

## References

- Floyd, R. W., & Steinberg, L. (1976). "An adaptive algorithm for spatial gray scale"
- Digital halftoning and dithering techniques

## License

MIT

## Author

Gal Giladi

---

**Course:** Image Processing  
**Assignment:** Error Diffusion Implementation
