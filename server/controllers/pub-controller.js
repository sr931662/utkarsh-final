const Publication = require('../db/pubSchema');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Helper function to handle file uploads
const saveFile = async (file) => {
  const uploadDir = path.join(__dirname, '../uploads/publications');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${file.originalname}`;
  const filePath = path.join(uploadDir, fileName);
  
  await fs.promises.writeFile(filePath, file.buffer);
  return `/uploads/publications/${fileName}`;
};

// Remove the file handling code and modify createPublication:
exports.createPublication = async (req, res) => {
  try {
    const { title, authors, type, year, journalOrConference, 
            tags, doi, url, abstract, isFeatured } = req.body;
    
    // No file handling needed now, just use the URL
    const publication = await Publication.create({
      title,
      authors: Array.isArray(authors) ? authors : [authors],
      type,
      year,
      journalOrConference,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      doi,
      url, // Store the provided URL
      abstract,
      isFeatured: isFeatured === 'true'
    });

    res.status(201).json({
      status: 'success',
      data: {
        publication
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get all publications
exports.getAllPublications = async (req, res) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    req.headers['cache-control'] = 'no-cache';
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Publication.find(JSON.parse(queryStr));

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const publications = await query;
    const total = await Publication.countDocuments(JSON.parse(queryStr));

    res.status(200).json({
      status: 'success',
      results: publications.length,
      total,
      data: {
        publications
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get single publication
exports.getPublication = async (req, res) => {
  try {
    const publication = await Publication.findById(req.params.id);
    if (!publication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Publication not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        publication
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update publication
exports.updatePublication = async (req, res) => {
  try {
    const publication = await Publication.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!publication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Publication not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        publication
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Delete publication
exports.deletePublication = async (req, res) => {
  try {
    const publication = await Publication.findByIdAndDelete(req.params.id);
    
    if (!publication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Publication not found'
      });
    }

    // Delete associated file if exists
    if (publication.mediaUrl) {
      const filePath = path.join(__dirname, '../', publication.mediaUrl);
      if (fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
      }
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get publication statistics
exports.getPublicationStats = async (req, res) => {
  try {
    const stats = await Publication.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgCitations: { $avg: '$citations' },
          minYear: { $min: '$year' },
          maxYear: { $max: '$year' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};