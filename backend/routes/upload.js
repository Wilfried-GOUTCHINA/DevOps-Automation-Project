const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

router.post('/', protect, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Erreur upload:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Erreur lors de l\'upload'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    res.json({
      success: true,
      imageUrl: req.file.path,
      imageId: req.file.filename
    });
  });
});

module.exports = router;
