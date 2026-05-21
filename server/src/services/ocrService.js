const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

/**
 * OCR Service — extracts text from images and PDFs
 * Uses Tesseract.js for images, pdf-parse for PDFs
 */

/**
 * Extract text from an image file using Tesseract.js
 */
const extractTextFromImage = async (filePath) => {
  try {
    const { createWorker } = require('tesseract.js');
    const worker = await createWorker('eng', 1, {
      logger: () => {}, // Suppress verbose logging
    });

    const {
      data: { text, confidence },
    } = await worker.recognize(filePath);

    await worker.terminate();

    return {
      text: text.trim(),
      confidence: Math.round(confidence),
      method: 'tesseract',
    };
  } catch (error) {
    logger.error(`Tesseract OCR error for ${filePath}: ${error.message}`);
    throw new Error(`Image OCR failed: ${error.message}`);
  }
};

/**
 * Extract text from a PDF file using pdf-parse
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text.trim(),
      confidence: 95, // PDFs are usually reliable
      method: 'pdf-parse',
      pages: data.numpages,
    };
  } catch (error) {
    logger.error(`PDF parse error for ${filePath}: ${error.message}`);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Main OCR extraction function — routes to appropriate method
 */
const extractText = async (filePath, mimeType) => {
  logger.info(`Starting OCR extraction for: ${path.basename(filePath)} [${mimeType}]`);

  const isPDF = mimeType === 'application/pdf';
  const isImage = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(mimeType);

  if (!isPDF && !isImage) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  try {
    const result = isPDF
      ? await extractTextFromPDF(filePath)
      : await extractTextFromImage(filePath);

    logger.info(
      `OCR completed for ${path.basename(filePath)}: ${result.text.length} chars, confidence: ${result.confidence}%`
    );

    return result;
  } catch (error) {
    logger.error(`OCR extraction failed for ${path.basename(filePath)}: ${error.message}`);
    return {
      text: '',
      confidence: 0,
      method: 'failed',
      error: error.message,
    };
  }
};

/**
 * Parse extracted text into structured travel data
 */
const parseTravelData = (text) => {
  if (!text || text.trim().length < 10) {
    return {};
  }

  const parsed = {};
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const fullText = text.toUpperCase();

  // --- Flight detection ---
  const flightNumberPattern = /\b([A-Z]{2,3})\s*(\d{3,4})\b/g;
  const flightMatches = [...text.matchAll(flightNumberPattern)];
  if (flightMatches.length > 0) {
    parsed.flightNumber = flightMatches[0][0].replace(/\s+/, '');
    parsed.airline = flightMatches[0][1];
  }

  // --- Passenger name ---
  const namePatterns = [
    /(?:passenger|name|traveller|traveler|pax)[\s:]+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})/i,
    /(?:mr|mrs|ms|dr|miss)\.?\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})/i,
    /NAME\s*:?\s*([A-Z][A-Z\s]+)/,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      parsed.passengerName = match[1].trim();
      break;
    }
  }

  // --- Date patterns ---
  const datePattern =
    /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{2}[\/-]\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4})\b/gi;
  const dates = [...text.matchAll(datePattern)].map((m) => m[0]);

  // --- Time patterns ---
  const timePattern = /\b(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\b/gi;
  const times = [...text.matchAll(timePattern)].map((m) => m[0]);

  if (dates.length > 0) parsed.departureDateTime = `${dates[0]}${times[0] ? ' ' + times[0] : ''}`;
  if (dates.length > 1) parsed.arrivalDateTime = `${dates[1]}${times[1] ? ' ' + times[1] : ''}`;

  // --- Airport/City codes ---
  const airportPattern = /\b([A-Z]{3})\b/g;
  const airports = [...text.matchAll(airportPattern)]
    .map((m) => m[1])
    .filter((code) => !['PDF', 'OCR', 'THE', 'FOR', 'AND', 'NOT', 'MR', 'MRS'].includes(code));

  if (airports.length >= 2) {
    parsed.departureCity = airports[0];
    parsed.arrivalCity = airports[1];
  }

  // --- Hotel detection ---
  const hotelPattern =
    /(?:hotel|inn|resort|suites?|lodge|stay|accommodation)[\s:]*([A-Z][a-zA-Z\s&]+)/i;
  const hotelMatch = text.match(hotelPattern);
  if (hotelMatch) {
    parsed.hotelName = hotelMatch[1].trim();
  }

  // --- Check-in / Check-out ---
  const checkInPattern = /(?:check[\s-]?in|arrival)[\s:]*([^\n]+)/i;
  const checkOutPattern = /(?:check[\s-]?out|departure)[\s:]*([^\n]+)/i;
  const checkInMatch = text.match(checkInPattern);
  const checkOutMatch = text.match(checkOutPattern);
  if (checkInMatch) parsed.checkInDate = checkInMatch[1].trim().substring(0, 50);
  if (checkOutMatch) parsed.checkOutDate = checkOutMatch[1].trim().substring(0, 50);

  // --- Booking ID ---
  const bookingPattern =
    /(?:booking|reservation|confirmation|ref|reference|PNR)[\s#.:]*([A-Z0-9]{4,20})/i;
  const bookingMatch = text.match(bookingPattern);
  if (bookingMatch) {
    parsed.bookingId = bookingMatch[1].trim();
  }

  // --- PNR specifically ---
  const pnrPattern = /\bPNR[\s:]*([A-Z0-9]{5,8})\b/i;
  const pnrMatch = text.match(pnrPattern);
  if (pnrMatch) {
    parsed.ticketNumber = pnrMatch[1].trim();
  }

  // --- Seat number ---
  const seatPattern = /(?:seat|seat no|berth)[\s:]*([A-Z]?\d{1,3}[A-Z]?)/i;
  const seatMatch = text.match(seatPattern);
  if (seatMatch) parsed.seatNumber = seatMatch[1].trim();

  // --- Address ---
  const addressPattern = /(?:address|location|situated at)[\s:]*([^\n]+)/i;
  const addressMatch = text.match(addressPattern);
  if (addressMatch) parsed.hotelAddress = addressMatch[1].trim().substring(0, 200);

  // --- Document type detection ---
  let documentType = 'other';
  if (fullText.includes('FLIGHT') || fullText.includes('BOARDING') || fullText.includes('AIRLINE')) {
    documentType = 'flight';
  } else if (fullText.includes('HOTEL') || fullText.includes('RESERVATION') || fullText.includes('CHECK-IN')) {
    documentType = 'hotel';
  } else if (fullText.includes('TRAIN') || fullText.includes('RAILWAY') || fullText.includes('IRCTC')) {
    documentType = 'train';
  } else if (fullText.includes('BUS') || fullText.includes('COACH') || fullText.includes('REDBUS')) {
    documentType = 'bus';
  } else if (fullText.includes('VISA') || fullText.includes('PASSPORT')) {
    documentType = 'visa';
  }

  return { ...parsed, documentType };
};

/**
 * Consolidate parsed data from multiple documents
 */
const consolidateExtractedData = (documents) => {
  const consolidated = {
    passengers: [],
    flights: [],
    hotels: [],
    transport: [],
    visas: [],
    rawSummary: '',
  };

  const rawTexts = [];

  for (const doc of documents) {
    const data = doc.parsedData || {};

    // Passengers
    if (data.passengerName && !consolidated.passengers.includes(data.passengerName)) {
      consolidated.passengers.push(data.passengerName);
    }

    // Flights
    if (data.flightNumber || data.airline) {
      consolidated.flights.push({
        flightNumber: data.flightNumber || '',
        airline: data.airline || '',
        from: data.departureCity || '',
        to: data.arrivalCity || '',
        departure: data.departureDateTime || '',
        arrival: data.arrivalDateTime || '',
      });
    }

    // Hotels
    if (data.hotelName) {
      consolidated.hotels.push({
        name: data.hotelName,
        address: data.hotelAddress || '',
        checkIn: data.checkInDate || '',
        checkOut: data.checkOutDate || '',
      });
    }

    // Transport (train/bus)
    if (data.documentType === 'train' || data.documentType === 'bus') {
      consolidated.transport.push({
        type: data.documentType,
        details: data.trainNumber || data.busOperator || '',
        from: data.departureCity || '',
        to: data.arrivalCity || '',
        dateTime: data.departureDateTime || '',
      });
    }

    // Visas
    if (data.visaType || data.visaCountry) {
      consolidated.visas.push({
        country: data.visaCountry || '',
        type: data.visaType || '',
        valid: data.validFrom && data.validTo ? `${data.validFrom} - ${data.validTo}` : '',
      });
    }

    if (doc.extractedText) {
      rawTexts.push(doc.extractedText.substring(0, 500));
    }
  }

  consolidated.rawSummary = rawTexts.join('\n---\n').substring(0, 3000);

  return consolidated;
};

module.exports = { extractText, parseTravelData, consolidateExtractedData };
