const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itineraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Itinerary',
      default: null,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
    },
    size: {
      type: Number,
      required: true,
    },
    documentType: {
      type: String,
      enum: ['flight', 'hotel', 'train', 'bus', 'visa', 'other'],
      default: 'other',
    },
    extractedText: {
      type: String,
      default: '',
    },
    parsedData: {
      // Flight info
      passengerName: String,
      flightNumber: String,
      airline: String,
      departureCity: String,
      arrivalCity: String,
      departureDateTime: String,
      arrivalDateTime: String,
      // Hotel info
      hotelName: String,
      hotelAddress: String,
      checkInDate: String,
      checkOutDate: String,
      // General
      bookingId: String,
      ticketNumber: String,
      // Transportation
      trainNumber: String,
      busOperator: String,
      seatNumber: String,
      // Visa
      visaType: String,
      visaCountry: String,
      validFrom: String,
      validTo: String,
      // Raw fields (user can edit)
      customFields: {
        type: Map,
        of: String,
        default: {},
      },
    },
    ocrStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    ocrError: {
      type: String,
      default: null,
    },
    ocrConfidence: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ itineraryId: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
