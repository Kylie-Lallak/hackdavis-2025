const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import Mongoose
const axios = require('axios');
const multer = require('multer'); // For handling file uploads (the PDF)
const fs = require('fs');
const path = require('path');

const { GoogleGenAI } = require('@google/genai');


require('dotenv').config()



// Define Mongoose schema for a Bill
const billSchema = new mongoose.Schema({
  /* Define the structure of your Bill data here.  For example: */
  title: { type: String, required: true },
  description: String,
  amount: Number,
  date: Date,
  // Add other fields as necessary to store the bill's data
});

// Create a Mongoose model from the schema
const Bill = mongoose.model('Bill', billSchema);

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); // Rename the file
  },
});
const upload = multer({ storage: storage });

// GET /bills
// Returns something from the database
router.get('/', async (req, res) => {
  try {
    // Use Mongoose to fetch data from the database (example: fetching all bills)
    // const bills = await Bill.find();
    // res.json(bills);

    res.status(200).send("ts not done yet")
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// POST /bills
// 1. Takes a JSON object and a PDF
// 2. Extracts text from the PDF using an API
// 3. Sends a query to Gemini
router.post('/', upload.single('pdf'), async (req, res) => {
     
  const filePath = path.join('uploads', req.file.filename); // Full path to the uploaded file

  try {

    const scribe = await import('scribe.js-ocr'); // Dynamic import
    const extractedText = await scribe.default.extractText([filePath]);
    // extractedText = "Band Aid: $500, Kool Aid: Free, MRI: $10000"

    const response = await sendQueryToGemini(extractedText)
  
    fs.unlinkSync(filePath);

    res.json({
      extractedText: response
    });

    // Gemini Gemini
  } catch (error) {
    // 5. Handle errors robustly
    console.error('Error during OCR or file processing:', error);
    fs.unlinkSync(filePath);
    // next(error); // Pass the error to your error-handling middleware (recommended)
    // Or, if you don't have error-handling middleware:
    res.status(500).json({ error: 'An error occurred during OCR or file processing.' });
  }

});

// Helper function to send a query to Gemini 
async function sendQueryToGemini(pdfText) {
  try {

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const geminiQuery = 
      `This is a hospital bill:
      ${pdfText}
      I want you to respond in a json in the following format:
      {
      items: [{name, cost}],
      problem_items: [{index, description}]
      }
      go through each item in the bill and if it can be disputed, 
      add it's index and a description of how it can be disputed to the problem_items array. 
      Only dispute charges if it would help the user.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: geminiQuery,
    });
      
    return response.text; // Or process the response as needed.
  } catch (error) {
    console.error('Error sending query to Gemini:', error);
    throw error; // Re-throw the error to be handled in the main function
  }
}


module.exports = router;
