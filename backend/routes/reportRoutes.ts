import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Report from '../models/Report';
import upload from '../middleware/upload';
import { reportSchema, nearReportsSchema } from '../utils/zodSchemas';
import sanitize from 'sanitize-html';

const router = express.Router();

// Rate limiting for report creation
const createReportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many reports created from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/reports
router.post(
  '/',
  createReportLimiter,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = reportSchema.parse({
        type: req.body.type,
        severity: req.body.severity,
        description: req.body.description,
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude)
      });

      // Sanitize description
      const sanitizedDescription = sanitize(validatedData.description);

      // Create report object
      const reportData: any = {
        type: validatedData.type,
        severity: validatedData.severity,
        description: sanitizedDescription,
        location: {
          type: 'Point',
          coordinates: [validatedData.longitude, validatedData.latitude]
        }
      };

      // Add image URL if file was uploaded
      if (req.file) {
        reportData.imageUrl = (req.file as any).path;
      }

      // Save to database
      const report = new Report(reportData);
      await report.save();

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        reportId: report._id
      });
    } catch (error: any) {
      console.error('Error creating report:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// GET /api/reports/near?lat=...&lng=...&radius=...
router.get('/near', async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validatedQuery = nearReportsSchema.parse({
      lat: parseFloat(req.query.lat as string),
      lng: parseFloat(req.query.lng as string),
      radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined
    });

    // Set default radius to 5000 meters if not provided
    const radius = validatedQuery.radius || 5000;

    // Find reports near the given location
    const reports = await Report.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [validatedQuery.lng, validatedQuery.lat]
          },
          $maxDistance: radius
        }
      }
    })
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit to 50 results

    res.json({
      success: true,
      reports
    });
  } catch (error: any) {
    console.error('Error fetching nearby reports:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;