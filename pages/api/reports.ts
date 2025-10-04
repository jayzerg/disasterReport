// Next.js API routes for disaster reports
import { NextApiRequest, NextApiResponse } from 'next';
import Report from '../../backend/models/Report';
import { reportSchema, nearReportsSchema } from '../../backend/utils/zodSchemas';
import sanitize from 'sanitize-html';

// POST /api/reports
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
  } else if (req.method === 'GET' && req.query.lat && req.query.lng) {
    // GET /api/reports/near?lat=...&lng=...&radius=...
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
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}