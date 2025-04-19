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
    cb(null, 'uploads/'); // Store uploaded files in the 'uploads/' directory
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
    const bills = await Bill.find();
    res.json(bills);
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
  try {
    const jsonData = req.body; // The JSON object
    const pdfFile = req.file; // The uploaded PDF file

    if (!pdfFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    // Step 2: Extract text from the PDF using an API
    const pdfText = await extractTextFromPdf(pdfFile.path); // Implement this function

    if (!pdfText) {
      return res.status(500).json({ error: 'Failed to extract text from PDF' });
    }

    // Step 3: Send a query to Gemini
    const geminiResponse = await sendQueryToGemini(jsonData, pdfText); // Implement this

    // Delete the temporary PDF file
    fs.unlink(pdfFile.path, (err) => {
      if (err) {
        console.error('Error deleting temporary file:', err);
      }
    });

    // Step 4: Save to MongoDB using Mongoose
    const newBill = new Bill({
      /* Populate the Bill model with data from jsonData and/or the extracted PDF text.
          This is an example - adjust it based on the fields in your billSchema and the
          structure of your jsonData and pdfText. */
      title: jsonData.title, // Example:  assuming jsonData has a title field
      description: pdfText,     //  Store the extracted text
      amount: jsonData.amount,
      date: new Date(),
      //  ... any other fields
    });

    await newBill.save(); // Save the new bill to the database

    res.json({
      message: 'Bill processed and saved successfully',
      data: jsonData,
      pdfText: pdfText,
      geminiResponse: geminiResponse,
      billId: newBill._id, //  Return the ID of the saved bill
    });
  } catch (error) {
    console.error('Error processing bill:', error);
    res.status(500).json({ error: 'Failed to process bill', details: error.message });
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
