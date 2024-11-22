import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/db';
import { UploadedImage } from '@/types';
import { ObjectId } from 'mongodb';
import sharp from 'sharp';

export async function GET() {
    try {
        const db = await connectToDb();
        const rawImages = await db
            .collection('images')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Transform the raw data to match our UploadedImage type
        const images: UploadedImage[] = rawImages.map(img => ({
            ...img,
            _id: img._id.toString(),
            createdAt: new Date(img.createdAt),
            originalUrl: img.originalUrl || '',
            compressedUrl60: img.compressedUrl60 || '',
            compressedUrl30: img.compressedUrl30 || '',
            aspectRatio: img.aspectRatio || 1,
            dimensions: {
                original: {
                    width: img.dimensions?.original?.width || 0,
                    height: img.dimensions?.original?.height || 0
                },
                size60: {
                    width: img.dimensions?.size60?.width || 0,
                    height: img.dimensions?.size60?.height || 0
                },
                size30: {
                    width: img.dimensions?.size30?.width || 0,
                    height: img.dimensions?.size30?.height || 0
                }
            }
        }));

        return NextResponse.json(images);
    } catch (error) {
        console.error('Failed to fetch images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { imageId } = await request.json();
        const db = await connectToDb();
        await db.collection('images').deleteOne({ _id: new ObjectId(imageId) });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Failed to delete image:', err);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { imageUrl, angle } = await request.json();
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const rotatedImage = await sharp(buffer)
            .rotate(angle)
            .toBuffer();

        return NextResponse.json({
            success: true,
            newUrl: 'path-to-new-image',
            buffer: rotatedImage
        });

    } catch (err) {
        console.error('Failed to rotate image:', err);
        return NextResponse.json({ error: 'Failed to rotate image' }, { status: 500 });
    }
} 