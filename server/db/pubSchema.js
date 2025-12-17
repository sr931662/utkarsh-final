const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  // Required fields
  title: {
    type: String,
    required: [true, 'Publication title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  authors: {
    type: [String],
    required: [true, 'At least one author is required'],
    validate: {
      validator: authors => authors.length > 0,
      message: 'At least one author is required'
    }
  },
  type: {
    type: String,
    required: [true, 'Publication type is required'],
    enum: {
      values: ['journal', 'conference', 'book-chapter', 'preprint', 'thesis'],
      message: 'Invalid publication type'
    }
  },
  year: {
    type: Number,
    required: [true, 'Publication year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  journalOrConference: {
    type: String,
    required: [true, 'Journal/Conference name is required'],
    trim: true
  },

  // Optional fields
  tags: {
    type: [String],
    validate: {
      validator: tags => !tags || tags.length <= 10,
      message: 'Maximum 10 tags allowed'
    }
  },
  citations: {
    type: Number,
    default: 0,
    min: 0
  },
  doi: {
    type: String,
    trim: true,
    match: [/^10.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, 'Invalid DOI format']
  },
  url: {
    type: String,
    trim: true
  },
  abstract: {
    type: String,
    trim: true,
    maxlength: [2000, 'Abstract cannot exceed 2000 characters']
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
publicationSchema.index({ title: 'text', authors: 'text', journalOrConference: 'text' });
publicationSchema.index({ year: -1 }); // Sort by most recent
publicationSchema.index({ type: 1 }); // Filter by type
publicationSchema.index({ isFeatured: 1 }); // Filter featured publications

// Middleware to update the 'updatedAt' field before saving
publicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get publication counts by type
publicationSchema.statics.getCountsByType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance method to format authors for display
publicationSchema.methods.formatAuthors = function() {
  if (this.authors.length <= 3) {
    return this.authors.join(', ');
  }
  return `${this.authors[0]}, et al.`;
};

// Virtual for formatted type (maps to your frontend labels)
publicationSchema.virtual('formattedType').get(function() {
  const typeMap = {
    'journal': 'Journal Article',
    'conference': 'Conference Paper',
    'book-chapter': 'Book Chapter',
    'preprint': 'Preprint',
    'thesis': 'Thesis'
  };
  return typeMap[this.type] || this.type;
});

module.exports = mongoose.model('Publication', publicationSchema);