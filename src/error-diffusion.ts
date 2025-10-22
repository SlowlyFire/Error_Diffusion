import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Find the nearest quantization level for a given pixel value.
 * 
 * @param value - The original pixel intensity (0-255)
 * @param levels - Array of allowed quantization levels
 * @returns The nearest level from the levels array
 * 
 * Example: If value=60 and levels=[0,51,102,153,204,255]
 * Distance to 51 = |60-51| = 9
 * Distance to 102 = |60-102| = 42
 * So it returns 51
 */
function findNearestLevel(value: number, levels: number[]): number {
    let nearest = levels[0];
    let minDistance = Math.abs(value - levels[0]);

    for (const level of levels) {
        const distance = Math.abs(value - level);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = level;
        }
    }

    return nearest;
}

/**
 * Apply Floyd-Steinberg error diffusion dithering.
 * 
 * Error diffusion algorithm:
 * 1. Process pixels left-to-right, top-to-bottom
 * 2. Quantize current pixel to nearest allowed level
 * 3. Calculate quantization error (old - new)
 * 4. Distribute error to neighboring unprocessed pixels:
 *    
 *           Current  →  7/16
 *    3/16 ←  5/16  →  1/16
 * 
 * This creates visual dithering that simulates more gray levels
 * than actually exist in the image.
 * 
 * @param imageData - Flat array of pixel values [pixel0, pixel1, ...]
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param levels - Array of allowed quantization levels
 * @returns New quantized image data
 */
function applyErrorDiffusion(
    imageData: number[],
    width: number,
    height: number,
    levels: number[]
): Uint8Array {
    // Create a working copy as floating point for precision
    // We need float because error fractions (7/16, 5/16, etc.) aren't integers
    const result = new Float64Array(imageData);

    // Process each pixel in order (left-to-right, top-to-bottom)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Calculate flat array index from 2D coordinates
            const index = y * width + x;

            // Get current pixel value
            const oldPixel = result[index];

            // Quantize to nearest allowed level
            const newPixel = findNearestLevel(oldPixel, levels);

            // Update pixel in result
            result[index] = newPixel;

            // Calculate quantization error
            const error = oldPixel - newPixel;

            // Distribute error to neighboring pixels using Floyd-Steinberg weights
            // These weights sum to 1: 7/16 + 5/16 + 3/16 + 1/16 = 16/16 = 1

            // Right pixel [x+1, y] gets 7/16 of error
            if (x + 1 < width) {
                const rightIndex = y * width + (x + 1);
                result[rightIndex] += error * (7 / 16);
            }

            // Bottom-left pixel [x-1, y+1] gets 3/16 of error
            if (x - 1 >= 0 && y + 1 < height) {
                const bottomLeftIndex = (y + 1) * width + (x - 1);
                result[bottomLeftIndex] += error * (3 / 16);
            }

            // Bottom pixel [x, y+1] gets 5/16 of error
            if (y + 1 < height) {
                const bottomIndex = (y + 1) * width + x;
                result[bottomIndex] += error * (5 / 16);
            }

            // Bottom-right pixel [x+1, y+1] gets 1/16 of error
            if (x + 1 < width && y + 1 < height) {
                const bottomRightIndex = (y + 1) * width + (x + 1);
                result[bottomRightIndex] += error * (1 / 16);
            }
        }
    }

    // Convert back to uint8 (0-255 integer values)
    // Clamp values to [0, 255] range in case error distribution pushed them outside
    return Uint8Array.from(result, value => Math.max(0, Math.min(255, Math.round(value))));
}

/**
 * Create a side-by-side comparison image
 * 
 * @param originalBuffer - Original image buffer
 * @param encodedBuffer - Encoded image buffer
 * @param width - Image width
 * @param height - Image height
 * @returns Buffer containing side-by-side comparison
 */
async function createSideBySideImage(
    originalBuffer: Buffer,
    encodedBuffer: Buffer,
    width: number,
    height: number
): Promise<Buffer> {
    const padding = 20;
    
    // Simply place images side by side using extend
    const composite = await sharp(originalBuffer)
        .extend({
            right: padding + width,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .composite([
            {
                input: encodedBuffer,
                left: width + padding,
                top: 0
            }
        ])
        .png()
        .toBuffer();
    
    return composite;
}

/**
 * Main program
 */
async function main() {
    try {
        // Define the 6 equally-spaced grayscale levels
        // These span from 0 to 255 with spacing of 51
        // This uses only 3 bits of information (2^3 = 8, but we use 6 values)
        const levels = [0, 51, 102, 153, 204, 255];

        console.log('=== Error Diffusion (Floyd-Steinberg) ===');
        console.log(`Using ${levels.length} grayscale levels: ${levels.join(', ')}\n`);

        // Get filename from command line argument
        const filename = process.argv[2];

        // Check if user entered any argument to command line after 'npm start'
        if (!filename) {
            console.error('Usage: npm start <image-filename>');
            console.error('Example: npm start test.jpg');
            process.exit(1);
        }

        // Check if file exists
        if (!fs.existsSync(filename)) {
            console.error(`Error: File '${filename}' not found.`);
            process.exit(1);
        }

        console.log(`\nLoading image: ${filename}`);

        // Load image and convert to grayscale
        const image = sharp(filename).grayscale();
        const metadata = await image.metadata();

        if (!metadata.width || !metadata.height) {
            throw new Error('Could not read image dimensions');
        }

        const width = metadata.width;
        const height = metadata.height;

        console.log(`Image size: ${width} x ${height} pixels`);
        console.log('Processing...\n');

        // Get raw pixel data as array
        const { data, info } = await image
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Convert Buffer to number array
        const pixelArray = Array.from(data);

        // Apply error diffusion
        const encodedData = applyErrorDiffusion(pixelArray, width, height, levels);

        // Verify that only the specified levels are used
        const uniqueValues = new Set(encodedData);
        console.log(`Unique pixel values in encoded image: ${Array.from(uniqueValues).sort((a, b) => a - b).join(', ')}`);
        console.log(`Number of unique values: ${uniqueValues.size}\n`);

        // Create original image buffer for display
        const originalBuffer = await sharp(data, {
            raw: {
                width: width,
                height: height,
                channels: 1
            }
        }).png().toBuffer();

        // Create encoded image buffer
        const encodedBuffer = await sharp(encodedData, {
            raw: {
                width: width,
                height: height,
                channels: 1
            }
        }).png().toBuffer();

        // Save the encoded image
        const outputFilename = 'error_diffusion_output.png';
        await sharp(encodedBuffer).toFile(outputFilename);
        console.log(`✓ Encoded image saved as: ${outputFilename}`);

        // Create and save side-by-side comparison
        const comparisonBuffer = await createSideBySideImage(
            originalBuffer,
            encodedBuffer,
            width,
            height
        );
        const comparisonFilename = 'comparison.png';
        await sharp(comparisonBuffer).toFile(comparisonFilename);
        console.log(`✓ Comparison image saved as: ${comparisonFilename}`);

        console.log('\nDone! You can now view the output images.');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Run the program
main();