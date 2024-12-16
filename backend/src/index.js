import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import fetch from 'node-fetch';
import sharp from 'sharp';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS configuration
app.use(cors());
app.use(express.json());

// Initialize OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

async function prepareImage(imageBuffer) {
  // Resize and convert to JPEG for consistency
  const processed = await sharp(imageBuffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
  
  return processed;
}

async function generateCaptionWithOpenAI(imageBuffer, holiday) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const messages = [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `Generate a creative and engaging social media caption${
              holiday ? ` for ${holiday}` : ''
            }. Make it casual and relatable.`
          }
        ],
      }
    ];

    // Only add image if it exists
    if (imageBuffer) {
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        },
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 150,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate caption with OpenAI');
  }
}

async function generateCaptionWithOllama(imageBuffer, holiday) {
  try {
    const endpoint = 'http://localhost:11434/api/generate';
    let requestBody = {
      model: imageBuffer ? 'llava' : 'llama2-uncensored',
      stream: true,  // Enable streaming for consistent handling
      options: {
        temperature: 0.8,    // Slightly higher for more creative responses
        top_k: 40,          // Reduced for more focused vocabulary
        top_p: 0.9,         // Increased for more natural language
        num_predict: 75,     // Increased slightly to allow for emojis
        stop: ["\n\n", "2.", "Note:"]  // Stop on new paragraphs or lists
      }
    };

    if (imageBuffer) {
      // Process the image first
      console.log('Processing image...');
      const processedImage = await prepareImage(imageBuffer);
      console.log('Image processed successfully');

      // Create a data URI for the image
      const dataUri = `data:image/jpeg;base64,${processedImage.toString('base64')}`;
      const prompt = `<image>${dataUri}</image>\nAnalyze this image${holiday ? ` in the context of ${holiday}` : ''}. You are a social media administrator for Church Corner Toy Library, now generate a short, engaging social media caption that describes what's in the image. Only include emojis that are relevant to the image. Maximum 1-2 relevant emojis. Keep it casual, fun, and under 50 words.`;
      requestBody.prompt = prompt;
    } else {
      const prompt = `You are a social media administrator for Church Corner Toy Library. Write a short, engaging social media post for ${holiday}. Only include emojis that are relevant to the image. Maximum 1-2 relevant emojis. Keep it casual, fun, and under 50 words.`;
      requestBody.prompt = prompt;
    }

    console.log('Making Ollama API request...');
    console.log('Using model:', requestBody.model);
    console.log('Using endpoint:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    // Handle streaming response
    let fullResponse = '';
    let buffer = '';

    await new Promise((resolve, reject) => {
      response.body.on('data', chunk => {
        const text = chunk.toString();
        buffer += text;

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              process.stdout.write(data.response); // Show progress
            }
            if (data.done) {
              process.stdout.write('\n');
            }
          } catch (error) {
            console.warn('Failed to parse JSON line:', line);
          }
        }
      });

      response.body.on('end', () => {
        // Process any remaining data in the buffer
        if (buffer.trim()) {
          try {
            const data = JSON.parse(buffer);
            if (data.response) {
              fullResponse += data.response;
            }
          } catch (error) {
            console.warn('Failed to parse final JSON:', buffer);
          }
        }
        console.log('\nStream ended');
        resolve();
      });

      response.body.on('error', error => {
        console.error('Stream error:', error);
        reject(error);
      });
    });

    if (!fullResponse) {
      throw new Error('No response from Ollama API');
    }

    // Clean up the response
    let caption = fullResponse
      .trim()
      .replace(/^["']|["']$/g, '')     // Remove quotes if present
      .replace(/\n+/g, ' ')            // Replace newlines with spaces
      .replace(/\s+/g, ' ')            // Normalize spaces
      .replace(/^(Here's|Here is|I see|In this image) /, '') // Remove common prefixes
      .trim();

    return caption;
  } catch (error) {
    console.error('Ollama error:', error);
    throw new Error(`Failed to generate caption with Ollama: ${error.message}`);
  }
}

app.post('/api/generate', upload.single('image'), async (req, res) => {
  try {
    const image = req.file;
    const { holiday } = req.body;

    if (!image && !holiday) {
      return res.status(400).json({ error: 'Either image or holiday must be provided' });
    }

    let caption;
    try {
      // Try Ollama first
      console.log('Attempting to generate caption with Ollama...');
      caption = await generateCaptionWithOllama(image?.buffer, holiday);
    } catch (error) {
      console.log('Ollama failed, attempting to fall back to OpenAI...');
      // Fall back to OpenAI if available
      caption = await generateCaptionWithOpenAI(image?.buffer, holiday);
    }

    res.json({ caption });
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
