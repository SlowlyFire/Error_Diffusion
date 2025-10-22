# Error Diffusion - 6 Grayscale Levels

Convert images from 256 grayscale levels to 6 levels using Floyd-Steinberg error diffusion algorithm.

## Description

This program reduces a grayscale image from 256 levels to only 6 grayscale levels `[0, 51, 102, 153, 204, 255]` while preserving visual quality through error diffusion dithering.

## Algorithm

Uses **Floyd-Steinberg error diffusion** to distribute quantization errors to neighboring pixels, creating a smooth dithered appearance despite using only 6 gray values.

### The 6 Grayscale Levels
```
0   - Black
51  - Very dark gray
102 - Dark gray
153 - Medium gray
204 - Light gray
255 - White
```

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
npm start <image_filename>
```

### Examples
```bash
# Process bird.png
npm start bird.png

# Process portrait.jpg
npm start portrait.jpg

# Process landscape.png
npm start landscape.png
```

The output will be saved as `error_diffusion_output.png` in the same directory, and also as `comparison.png`.

### Manual Steps
```bash
# Compile TypeScript
npm run build

# Run with custom image
node dist/errorDiffusion.js input.png
```

## How It Works

### 1. Quantization
Each pixel is mapped to the nearest of 6 grayscale levels:
```
Input:  0-25   → 0
Input:  26-76  → 51
Input:  77-127 → 102
Input:  128-178 → 153
Input:  179-229 → 204
Input:  230-255 → 255
```

### 2. Error Diffusion
The quantization error is distributed to neighboring pixels using Floyd-Steinberg weights:
```
        Current    7/16
3/16     5/16      1/16
```

- **Right pixel**: Gets 7/16 of the error
- **Bottom-left**: Gets 3/16 of the error
- **Bottom**: Gets 5/16 of the error
- **Bottom-right**: Gets 1/16 of the error

### 3. Process Flow
```
For each pixel (left to right, top to bottom):
  1. Read current pixel value
  2. Find nearest grayscale level
  3. Calculate error = original - quantized
  4. Set pixel to quantized value
  5. Distribute error to neighbors
```

## Example

**Input:** Grayscale image with 256 levels (0-255)  
**Output:** Grayscale image with only 6 levels (0, 51, 102, 153, 204, 255)

Despite having only 6 levels, the output maintains good visual quality through intelligent error distribution.

## Project Structure
```
error-diffusion/
├── src/
│   └── errorDiffusion.ts    # Main implementation
├── dist/                      # Compiled JavaScript (generated)
├── node_modules/              # Dependencies (generated)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── <image_filename>           # 256 grayscale photo input
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## Configuration Files

### package.json
```json
{
  "scripts": {
    "build": "tsc",
    "start": "tsc && node dist/errorDiffusion.js"
  }
}
```

### tsconfig.json
TypeScript configuration that compiles from `src/` to `dist/`

## Algorithm Pseudocode
```
levels = [0, 51, 102, 153, 204, 255]

for y in 0 to height:
    for x in 0 to width:
        oldPixel = pixel[x, y]
        newPixel = findNearest(oldPixel, levels)
        pixel[x, y] = newPixel
        error = oldPixel - newPixel
        
        pixel[x+1, y  ] += error × 7/16
        pixel[x-1, y+1] += error × 3/16
        pixel[x  , y+1] += error × 5/16
        pixel[x+1, y+1] += error × 1/16
```

## Technical Details

- **Input format**: PNG, JPEG, or any format supported by jimp
- **Output format**: 8-bit PNG (but only uses 6 values)
- **Color handling**: Color images are automatically converted to grayscale
- **Error distribution**: Floyd-Steinberg coefficients (7/16, 3/16, 5/16, 1/16)

## Dependencies

- `jimp` (^1.6.0) - Image processing library
- `typescript` (^5.7.3) - TypeScript compiler
- `@types/node` (^22.10.2) - Node.js type definitions

## Why Only 6 Levels?

This assignment demonstrates:
1. **Quantization** - Reducing color depth
2. **Error diffusion** - Preserving visual quality despite quantization
3. **Perceptual dithering** - How our eyes blend nearby pixels

The result shows that with smart error distribution, 6 levels can look almost as good as 256!

## Troubleshooting

### Error: Cannot find image file
- Make sure the image file exists in the current directory
- Check the filename and extension

### Error: Cannot find module 'jimp'
- Run `npm install`

### Output looks too dark/bright
- The algorithm automatically finds the nearest level
- Try different input images for best results

## References

- Floyd, R. W., & Steinberg, L. (1976). "An adaptive algorithm for spatial gray scale"
- Digital halftoning techniques
- Error diffusion algorithms in image processing

## Course Information

**Course:** Image Processing  
**Assignment:** Question 3 (25%)  
**Topic:** Error Diffusion with 6 Grayscale Levels

## Author

Gal Giladi

## License

MIT
