// File: server.js

// Import required modules
const express = require('express'); // Express framework for server
const path = require('path'); // Node module to handle file paths
const bodyParser = require('body-parser'); // Middleware for parsing incoming request bodies

// Import OpenAI API client modules
const { Configuration, OpenAIApi } = require('openai');

// Create an instance of Express
const app = express();

// Port for the server to listen on, use environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Set up middleware to serve static files (e.g., our HTML front-end)
app.use(express.static(path.join(__dirname, 'public')));

// Use bodyParser middleware to parse JSON bodies from incoming requests
app.use(bodyParser.json());

// Initialize and configure OpenAI API key (ensure you set this in your environment variables on Render)
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Do not hardcode API keys for production
});
const openai = new OpenAIApi(configuration);

// API Endpoint to handle chat requests
app.post('/api/chat', async (req, res) => {
  try {
    // Extract the user input from request body
    const userInput = req.body.input;

    // Basic input validation - ensure input is not empty
    if (!userInput || !userInput.trim()) {
      return res.status(400).json({ error: "Input cannot be empty." });
    }

    // Call OpenAI API to get chat response based on the input
    const response = await openai.createCompletion({
      model: "text-davinci-003", // Specify your model (update as needed)
      prompt: userInput,
      max_tokens: 150, // Limit the response length
      temperature: 0.7, // Control randomness of output
    });

    // Extract the generated text from the OpenAI API response
    const chatOutput = response.data.choices[0].text.trim();

    // Respond with the generated text
    res.json({ response: chatOutput });
  } catch (error) {
    console.error("Error processing the chat request: ", error.message);
    res.status(500).json({ error: "An error occurred processing your request." });
  }
});

// Start the server and listen on the specified PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
