# Church Corner Toy Library - Caption Generator

A modern web application that generates social media captions for toy library posts using AI. This tool helps streamline the process of creating engaging social media content by automatically generating captions based on uploaded images and selected holidays.

## Features

- 🖼️ Image Upload: Upload images of toys or library events
- 🎯 Holiday Selection: Choose specific holidays for themed captions
- 🤖 AI-Powered: Uses Ollama locally (falls back to OpenAI if Ollama is not available)
- 📋 Easy Copy: One-click copy of generated captions
- 🎨 Modern UI: Clean and responsive design

## Project Structure

```
caption_generator/
├── frontend/         # React + TypeScript frontend
└── backend/          # Node.js backend
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Ollama installed locally (recommended) OR OpenAI API key

### AI Setup Options

#### Option 1: Ollama (Recommended)
1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull the required model:
```bash
ollama pull llama2
```

#### Option 2: OpenAI (Fallback)
If Ollama is not available, the application will use OpenAI. In this case:
1. Create a `.env` file in the backend directory
2. Add your OpenAI API key:
```env
OPENAI_API_KEY=your_api_key_here
```

### AI Models Used

#### Ollama Models
- **Vision Analysis**:
  - `llava` - For local image analysis and understanding
  - Command to pull: `ollama pull llava`
- **Text Generation**: 
  - Primary: `llama2` - For generating captions
  - Alternative options: `mistral`, `neural-chat`
  - Command to pull: `ollama pull llama2`

#### OpenAI Models (Fallback)
- **Vision Analysis**: 
  - `gpt-4-vision-preview` - For image analysis and caption generation with image input
- **Text Generation**:
  - `gpt-4-1106-preview` - For caption generation without image
  - `gpt-3.5-turbo-1106` - Fallback option for faster response

Note: When using OpenAI, the model selection is automatic based on whether an image is provided.

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_api_key_here
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will start on http://localhost:3000

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend application will be available at http://localhost:5173

## Development

### Backend Stack
- Node.js
- Express
- OpenAI API
- Multer for file uploads

### Frontend Stack
- React
- TypeScript
- Tailwind CSS
- Vite
- Radix UI Components

## Usage

1. Start both backend and frontend servers using the commands above
2. Open http://localhost:5173 or maybe other port number assigned in your browser
3. Upload an image or select a holiday (or both)
4. Click "Generate Caption" to create a new caption
5. Use the copy button to copy the generated caption

## Contributing

Feel free to submit issues and enhancement requests!