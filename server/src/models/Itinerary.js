const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const dayPlanSchema = new mongoose.Schema({
  day: Number,
  date: String,
  title: String,
  morning: [String],
  afternoon: [String],
  evening: [String],
  accommodation: String,
  meals: {
    breakfast: String,
    lunch: String,
    dinner: String,
  },
  tips: [String],
  estimatedCost: Number,
});

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Itinerary title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    destination: {
      type: String,
      trim: true,
      index: true,
    },
    tripDates: {
      start: String,
      end: String,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    extractedData: {
      // Consolidated from all documents
      passengers: [String],
      flights: [
        {
          flightNumber: String,
          airline: String,
          from: String,
          to: String,
          departure: String,
          arrival: String,
        },
      ],
      hotels: [
        {
          name: String,
          address: String,
          checkIn: String,
          checkOut: String,
        },
      ],
      transport: [
        {
          type: String,
          details: String,
          from: String,
          to: String,
          dateTime: String,
        },
      ],
      visas: [
        {
          country: String,
          type: String,
          valid: String,
        },
      ],
      rawSummary: String,
    },
    aiItinerary: {
      // Full AI-generated text
      rawContent: {
        type: String,
        default: '',
      },
      // Structured day-by-day plan
      dayPlans: [dayPlanSchema],
      // Summary sections
      overview: String,
      flightDetails: String,
      accommodationDetails: String,
      localTransport: String,
      attractions: [String],
      foodRecommendations: [String],
      weatherTips: String,
      packingList: [String],
      budgetSummary: {
        flights: Number,
        hotels: Number,
        food: Number,
        activities: Number,
        transport: Number,
        total: Number,
        currency: { type: String, default: 'USD' },
      },
      travelChecklist: [String],
      emergencyNotes: String,
      generatedAt: Date,
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    shareViews: {
      type: Number,
      default: 0,
    },
    tags: [String],
    aiPromptUsed: String,
    generationError: String,
  },
  {
    timestamps: true,
  }
);

itinerarySchema.index({ userId: 1, createdAt: -1 });
itinerarySchema.index({ userId: 1, isFavorite: 1 });
itinerarySchema.index({ destination: 'text', title: 'text' });
itinerarySchema.index({ shareToken: 1, isPublic: 1 });

// Generate a unique share token before saving
itinerarySchema.methods.generateShareToken = function () {
  this.shareToken = uuidv4().replace(/-/g, '').substring(0, 16);
  this.isPublic = true;
  return this.shareToken;
};

const Itinerary = mongoose.model('Itinerary', itinerarySchema);

module.exports = Itinerary;
