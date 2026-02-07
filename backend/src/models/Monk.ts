import mongoose, { Document, Schema } from 'mongoose';

export interface IMonk extends Document {
    name: string;
    email: string;
    bio?: string;
    specialization?: string;
    availability: boolean;
    rating: number;
    imageUrl?: string;
    languages: string[];
    createdAt: Date;
    updatedAt: Date;
}

const monkSchema = new Schema<IMonk>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            index: true, // Index for faster searches
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        specialization: {
            type: String,
        },
        availability: {
            type: Boolean,
            default: true,
            index: true, // Index for filtering available monks
        },
        rating: {
            type: Number,
            default: 5.0,
            min: 0,
            max: 5,
            index: -1, // Descending index for top-rated queries
        },
        imageUrl: {
            type: String,
        },
        languages: [{
            type: String,
        }],
    },
    {
        timestamps: true, // Auto-manage createdAt and updatedAt
    }
);

// Compound index for common queries
monkSchema.index({ availability: 1, rating: -1 });
monkSchema.index({ name: 'text', bio: 'text' }); // Text search index

// Virtual for full profile URL
monkSchema.virtual('profileUrl').get(function () {
    return `/monks/${this._id}`;
});

// Serialize virtuals when converting to JSON
monkSchema.set('toJSON', { virtuals: true });
monkSchema.set('toObject', { virtuals: true });

export const Monk = mongoose.model<IMonk>('Monk', monkSchema);
