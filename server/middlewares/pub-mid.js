exports.checkPublicationOwnership = async (req, res, next) => {
  try {
    const publication = await Publication.findById(req.params.id);
    
    // Only allow updates by admin or original creator
    if (publication.createdBy && !req.user._id.equals(publication.createdBy) && 
        !['superadmin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action'
      });
    }
    
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.validatePublicationData = (req, res, next) => {
  const requiredFields = ['title', 'authors', 'type', 'year', 'journalOrConference'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({
      status: 'fail',
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  next();
};