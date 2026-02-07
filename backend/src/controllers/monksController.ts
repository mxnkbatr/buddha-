import { Request, Response } from 'express';
import { Monk } from '../models/Monk';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { invalidatePattern } from '../config/redis';

/**
 * Get all monks with pagination and filtering
 * @route GET /api/v1/monks
 */
export const getMonks = asyncHandler(async (req: Request, res: Response) => {
    const {
        page = 1,
        limit = 20,
        availability,
        sort = '-rating',
        search,
    } = req.query;

    const query: any = {};

    // Filter by availability
    if (availability !== undefined) {
        query.availability = availability === 'true';
    }

    // Text search
    if (search) {
        query.$text = { $search: search as string };
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const [monks, total] = await Promise.all([
        Monk.find(query)
            .sort(sort as string)
            .skip(skip)
            .limit(limitNum)
            .select('-__v')
            .lean(), // Use lean() for better performance (returns plain objects)
        Monk.countDocuments(query),
    ]);

    res.json({
        success: true,
        data: {
            monks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        },
    });
});

/**
 * Get single monk by ID
 * @route GET /api/v1/monks/:id
 */
export const getMonkById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const monk = await Monk.findById(id).select('-__v').lean();

    if (!monk) {
        throw new AppError('Monk not found', 404);
    }

    res.json({
        success: true,
        data: { monk },
    });
});

/**
 * Create new monk
 * @route POST /api/v1/monks
 */
export const createMonk = asyncHandler(async (req: Request, res: Response) => {
    const monk = await Monk.create(req.body);

    // Invalidate cache
    await invalidatePattern('cache:/api/v1/monks*');

    res.status(201).json({
        success: true,
        data: { monk },
    });
});

/**
 * Update monk
 * @route PUT /api/v1/monks/:id
 */
export const updateMonk = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const monk = await Monk.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    ).select('-__v');

    if (!monk) {
        throw new AppError('Monk not found', 404);
    }

    // Invalidate cache
    await invalidatePattern('cache:/api/v1/monks*');

    res.json({
        success: true,
        data: { monk },
    });
});

/**
 * Delete monk
 * @route DELETE /api/v1/monks/:id
 */
export const deleteMonk = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const monk = await Monk.findByIdAndDelete(id);

    if (!monk) {
        throw new AppError('Monk not found', 404);
    }

    // Invalidate cache
    await invalidatePattern('cache:/api/v1/monks*');

    res.json({
        success: true,
        data: { message: 'Monk deleted successfully' },
    });
});
