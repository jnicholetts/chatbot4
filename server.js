// File: server.js

// Import required modules
const express = require('express'); // Express framework for setting up the server
const path = require('path');       // Node module to manage file paths
const bodyParser = require('body-parser'); // Middleware for parsing JSON in requests

// Import OpenAI API client modules
const { Configuration, OpenAIApi } = require('openai');

// Create an instance of Express
const app = express();

// Define the port for the server to listen on, use environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Serve static files (like our HTML front-end) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Retrieve the specific assistant ID from the environment variables on Render
const ASSISTANT_ID = process.env.ASSISTANT_ID || 'default-assistant-id';

// Initialize and configure OpenAI using the API key from environment variables
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure to set this in your environment variables
});
const openai = new OpenAIApi(configuration);

// API Endpoint to handle chat requests and send them to the specified assistant
app.post('/api/chat', async (req, res) => {
  try {
    // Extract user input from request body
    const userInput = req.body.input;

    // Validate user input
    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: "Input cannot be empty." });
    }

    /* 
      Using the OpenAI Chat Completion API:
      - The 'system' message establishes context tying this conversation to the specific assistant.
      - The 'user' message is the user's input.
    */
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Chat-based model
      messages: [
        {
          role: "system", 
          content: `You are assistant ${ASSISTANT_ID}. Please respond as you normally would.`
        },
        {
          role: "user", 
          content: userInput
        }
      ],
      max_tokens: 150,    // Maximum tokens for the assistant's answer
      temperature: 0.7,   // Controls randomness in the response
    });

    // Extract the generated chat message from the response data
    const chatOutput = response.data.choices[0].message.content.trim();

    // Send the generated response back to the client
    res.json({ response: chatOutput });
  } catch (error) {
    console.error("Error processing the chat request:", error.message);
    res.status(500).json({ error: "An error occurred processing your request." });
  }
});

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
