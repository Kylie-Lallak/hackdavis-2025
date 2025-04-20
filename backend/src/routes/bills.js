const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Import Mongoose
const axios = require('axios');
const multer = require('multer'); // For handling file uploads (the PDF)
const fs = require('fs');
const path = require('path');



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
    console.log(scribe)

    console.log(scribe.default.extractText)
    const extractedText = await scribe.default.extractText([filePath])
  

    // 3. Clean up: Delete the uploaded PDF file (optional)
    fs.unlinkSync(filePath);

    // 4. Send the response with the extracted text
    res.json({
      message: 'File uploaded and OCR performed successfully.',
      filename: req.file.filename,
      extractedText: extractedText,
    });
  } catch (error) {
    // 5. Handle errors robustly
    console.error('Error during OCR or file processing:', error);
    next(error); // Pass the error to your error-handling middleware (recommended)
    // Or, if you don't have error-handling middleware:
    // res.status(500).json({ error: 'An error occurred during OCR or file processing.' });
  }

});

// Helper function to extract text from PDF (using an example API)
async function extractTextFromPdf(filePath) {
  //  Implement this function using a library like pdf-parse,  or an external API.
  //  This is a placeholder example.  Replace with actual implementation.
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(fs.readFileSync(filePath));
    return data.text;
  } catch (error) {
    console.error("Error extracting text: ", error);
    return null;
  }
}

// Helper function to send a query to Gemini (placeholder)
async function sendQueryToGemini(jsonData, pdfText) {
  //  Replace this with your actual Gemini API call.
  //  This is a placeholder example.
  try {
    const geminiQuery = {
      prompt: `Analyze the following data and PDF text: 
        JSON Data: ${JSON.stringify(jsonData)}
        PDF Text: ${pdfText}
        
        Provide a summary.
        `,
    };

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', // Replace with actual Gemini API endpoint
      {
        contents: [{
          parts: [{ text: geminiQuery.prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("Gemini response:", response.data);
    return response.data; // Or process the response as needed
  } catch (error) {
    console.error('Error sending query to Gemini:', error);
    return { error: 'Failed to query Gemini', details: error.message };
  }
}

module.exports = router;
