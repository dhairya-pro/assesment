const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build a structured prompt for itinerary generation
 */
const buildItineraryPrompt = (extractedData, additionalContext = '') => {
  const { passengers, flights, hotels, transport, visas, rawSummary } = extractedData;

  const sections = [];

  // Passenger info
  if (passengers && passengers.length > 0) {
    sections.push(`**Traveler(s):** ${passengers.join(', ')}`);
  }

  // Flights
  if (flights && flights.length > 0) {
    const flightInfo = flights
      .map(
        (f) =>
          `- Flight ${f.flightNumber || 'N/A'} (${f.airline || 'Unknown Airline'}): ${f.from || '?'} → ${f.to || '?'}, Departure: ${f.departure || 'TBD'}, Arrival: ${f.arrival || 'TBD'}`
      )
      .join('\n');
    sections.push(`**Flights:**\n${flightInfo}`);
  }

  // Hotels
  if (hotels && hotels.length > 0) {
    const hotelInfo = hotels
      .map(
        (h) =>
          `- ${h.name || 'Hotel'}: ${h.address || 'Address TBD'}, Check-in: ${h.checkIn || 'TBD'}, Check-out: ${h.checkOut || 'TBD'}`
      )
      .join('\n');
    sections.push(`**Accommodations:**\n${hotelInfo}`);
  }

  // Transport
  if (transport && transport.length > 0) {
    const transportInfo = transport
      .map(
        (t) =>
          `- ${t.type?.toUpperCase() || 'Transport'}: ${t.from || '?'} → ${t.to || '?'} on ${t.dateTime || 'TBD'}`
      )
      .join('\n');
    sections.push(`**Additional Transport:**\n${transportInfo}`);
  }

  // Additional context from user
  if (additionalContext) {
    sections.push(`**Additional Trip Notes from Traveler:** ${additionalContext}`);
  }

  // Raw OCR summary (for fallback context)
  if (rawSummary && sections.length < 2) {
    sections.push(`**Extracted Document Information:**\n${rawSummary.substring(0, 1500)}`);
  }

  const travelInfo = sections.join('\n\n');

  return `You are an expert AI travel planner. Based on the following travel booking information, create a comprehensive, professional, and highly detailed travel itinerary.

## BOOKING INFORMATION:
${travelInfo || 'General travel documents provided — create a sample itinerary for an international trip.'}

## ITINERARY REQUIREMENTS:

Please generate a complete travel itinerary in the following JSON structure. Be creative, practical, and include real-world recommendations. Return ONLY valid JSON, no markdown fences.

{
  "overview": "Brief 2-3 sentence trip summary",
  "destination": "Primary destination city/country",
  "tripDuration": "e.g. 5 days, 4 nights",
  "flightDetails": "Detailed flight information summary",
  "accommodationDetails": "Hotel/accommodation summary with tips",
  "dayPlans": [
    {
      "day": 1,
      "date": "Date string or Day 1",
      "title": "Arrival & First Impressions",
      "morning": ["Activity 1", "Activity 2"],
      "afternoon": ["Activity 3", "Activity 4"],
      "evening": ["Activity 5", "Restaurant recommendation"],
      "accommodation": "Hotel name and area",
      "meals": {
        "breakfast": "Recommendation",
        "lunch": "Recommendation with location",
        "dinner": "Recommendation with cuisine type"
      },
      "tips": ["Local tip 1", "Transportation tip"],
      "estimatedCost": 150
    }
  ],
  "localTransport": "Transportation options at the destination",
  "attractions": ["Top attraction 1", "Top attraction 2", "Top attraction 3", "Top attraction 4", "Top attraction 5"],
  "foodRecommendations": ["Local dish 1", "Restaurant type 1", "Street food tip", "Food market"],
  "weatherTips": "Weather advice and what to expect during the trip period",
  "packingList": ["Essential item 1", "Essential item 2", "Important document", "Tech item", "Clothing item"],
  "budgetSummary": {
    "flights": 500,
    "hotels": 300,
    "food": 150,
    "activities": 100,
    "transport": 80,
    "total": 1130,
    "currency": "USD"
  },
  "travelChecklist": ["Check passport validity", "Get travel insurance", "Book airport transfers", "Download offline maps", "Notify bank of travel"],
  "emergencyNotes": "Embassy contact, emergency numbers, travel insurance tip, nearest hospital area"
}

Make the itinerary rich, detailed, and genuinely useful. Include specific restaurant names, landmark names, and practical local tips. If trip dates are vague, create a realistic multi-day plan.`;
};

/**
 * Generate travel itinerary using Gemini AI
 */
const generateItinerary = async (extractedData, additionalContext = '') => {
  logger.info('Starting AI itinerary generation with Gemini...');

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const prompt = buildItineraryPrompt(extractedData, additionalContext);

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    logger.info(`Gemini response received: ${text.length} characters`);

    // Parse the JSON response
    let parsedItinerary;
    try {
      // Clean up any potential markdown code fences
      const cleanText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      parsedItinerary = JSON.parse(cleanText);
    } catch (parseError) {
      logger.warn(`JSON parse failed, returning raw content: ${parseError.message}`);
      // Return structured fallback with raw content
      parsedItinerary = {
        overview: 'AI-generated travel itinerary based on your documents.',
        rawContent: text,
        destination: extractDestinationFromText(text),
        dayPlans: [],
        attractions: [],
        foodRecommendations: [],
        packingList: [],
        travelChecklist: [],
        budgetSummary: { total: 0, currency: 'USD' },
        emergencyNotes: 'Please consult local authorities for emergency contacts.',
      };
    }

    return {
      success: true,
      rawContent: text,
      structured: parsedItinerary,
    };
  } catch (error) {
    logger.error(`Gemini AI error: ${error.message}`);

    // Check for API key issues
    if (error.message.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your configuration.');
    }

    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('AI quota exceeded. Please try again later.');
    }

    throw new Error(`AI generation failed: ${error.message}`);
  }
};

/**
 * Generate a short AI trip summary
 */
const generateTripSummary = async (itineraryData) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Based on this travel itinerary, write a compelling 2-sentence trip summary that captures the essence of the journey. Make it sound exciting and professional.

Trip overview: ${itineraryData.overview || 'A travel adventure'}
Destination: ${itineraryData.destination || 'International destination'}
Duration: ${itineraryData.tripDuration || 'Multiple days'}

Return ONLY the 2-sentence summary, nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    logger.error(`Trip summary generation failed: ${error.message}`);
    return `An exciting journey to ${itineraryData.destination || 'your destination'} awaits. Your AI-crafted itinerary is ready to guide your adventure.`;
  }
};

/**
 * Generate chatbot response for travel questions
 */
const generateChatResponse = async (question, itineraryContext = '') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a friendly AI travel assistant. Answer the following travel question helpfully and concisely.

${itineraryContext ? `Context - Current Trip: ${itineraryContext.substring(0, 500)}` : ''}

Question: ${question}

Provide a helpful, friendly response in 2-4 sentences.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    logger.error(`Chat response failed: ${error.message}`);
    return "I'm sorry, I couldn't process your question right now. Please try again.";
  }
};

const extractDestinationFromText = (text) => {
  const destinations = text.match(/(?:to|visiting|destination|arrive in|arriving in)\s+([A-Z][a-zA-Z\s]+?)(?:[,\.\n]|$)/);
  return destinations ? destinations[1].trim() : 'Your Destination';
};

module.exports = { generateItinerary, generateTripSummary, generateChatResponse };
