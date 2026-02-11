/**
 * OpenAI Image Generation API Integration (gpt-image-1.5)
 * Server-side only (used by Node.js script, not browser)
 */

import OpenAI, { toFile } from 'openai';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Generate image using gpt-image-1.5
   * @param prompt - The text prompt for image generation
   * @param size - Image size (1024x1024 supported)
   * @returns URL to generated image (temporary, expires in 1 hour)
   */
  async generateImage(
    prompt: string,
    size: '1024x1024' = '1024x1024'
  ): Promise<string> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    try {
      // Use OpenAI SDK for image generation with gpt-image-1.5
      // Note: gpt-image-1.5 doesn't support 'quality' or 'response_format' parameters
      const response = await this.client.images.generate({
        model: 'gpt-image-1.5',
        prompt: prompt.trim(),
        n: 1,
        size,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from OpenAI');
      }

      // gpt-image-1.5 may return URL or b64_json depending on API defaults
      const imageData = response.data[0];
      if (!imageData) {
        throw new Error('No image data in response');
      }

      if (imageData.url) {
        return imageData.url;
      } else if (imageData.b64_json) {
        // Return base64 data with prefix for identification
        return `data:image/png;base64,${imageData.b64_json}`;
      } else {
        throw new Error('No URL or base64 data in response');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Download image from temporary URL or base64 data to local file
   * @param urlOrData - Temporary URL or base64 data URL from OpenAI API
   * @param outputPath - Local file path to save image
   */
  async downloadImage(urlOrData: string, outputPath: string): Promise<void> {
    try {
      // Dynamically import fs/promises (Node.js only)
      const fs = await import('fs/promises');

      // Check if it's a base64 data URL
      if (urlOrData.startsWith('data:image/png;base64,')) {
        // Extract base64 data and convert to buffer
        const base64Data = urlOrData.replace('data:image/png;base64,', '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(outputPath, buffer);
        return;
      }

      // Otherwise, it's a URL - fetch it
      const response = await fetch(urlOrData);

      if (!response.ok) {
        throw new Error(`Failed to download image: HTTP ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(outputPath, buffer);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to download image: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Edit/modify an existing image using DALL-E 2
   * Uses image-to-image generation for consistent style
   * @param imagePath - Path to template image (PNG, must be square, <4MB)
   * @param prompt - Text prompt describing desired modifications
   * @param size - Image size (DALL-E 2 supports 256x256, 512x512, 1024x1024)
   * @returns URL to generated image (temporary, expires in 1 hour)
   */
  async editImage(
    imagePath: string,
    prompt: string,
    size: '1024x1024' | '512x512' | '256x256' = '1024x1024'
  ): Promise<string> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    try {
      // Dynamically import Node.js modules
      const fs = await import('fs/promises');
      const path = await import('path');

      // Read image as buffer and convert to File using toFile helper
      const imageBuffer = await fs.readFile(imagePath);
      const filename = path.basename(imagePath);

      // Use OpenAI SDK for image editing (handles multipart properly)
      // Explicitly specify MIME type as image/png
      const response = await this.client.images.edit({
        model: 'dall-e-2',
        image: await toFile(imageBuffer, filename, { type: 'image/png' }),
        prompt: prompt.trim(),
        n: 1,
        size,
        response_format: 'url',
      });

      if (!response.data || response.data.length === 0) {
        throw new Error('No image data returned from OpenAI');
      }

      return response.data[0].url!;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to edit image: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if API key is valid by making a test request
   * @returns true if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Use SDK to list models (lightweight API call)
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
