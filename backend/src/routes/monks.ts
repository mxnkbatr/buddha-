import { Router } from 'express';
import {
    getMonks,
    getMonkById,
    createMonk,
    updateMonk,
    deleteMonk,
} from '../controllers/monksController';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

/**
 * @route   GET /api/v1/monks
 * @desc    Get all monks with pagination and filtering
 * @access  Public
 * @cache   15 minutes
 */
router.get('/', cacheMiddleware(900), getMonks);

/**
 * @route   GET /api/v1/monks/:id
 * @desc    Get single monk by ID
 * @access  Public
 * @cache   15 minutes
 */
router.get('/:id', cacheMiddleware(900), getMonkById);

/**
 * @route   POST /api/v1/monks
 * @desc    Create new monk
 * @access  Private (Admin only - add auth middleware)
 */
router.post('/', createMonk);

/**
 * @route   PUT /api/v1/monks/:id
 * @desc    Update monk
 * @access  Private (Admin only - add auth middleware)
 */
router.put('/:id', updateMonk);

/**
 * @route   DELETE /api/v1/monks/:id
 * @desc    Delete monk
 * @access  Private (Admin only - add auth middleware)
 */
router.delete('/:id', deleteMonk);

export default router;
