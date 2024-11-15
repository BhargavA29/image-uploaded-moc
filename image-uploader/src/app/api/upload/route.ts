import { NextResponse } from 'next/server';
import cloudinary from '@/types/cloudinary';
import { connectToDb } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const image = data.get('image') as File;
        const aspectRatio = data.get('aspectRatio') as string;

        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Convert File to buffer
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Base upload options
        const baseOptions = {
            folder: 'image-uploader',
            resource_type: 'image' as const,
        };

        // Upload original image
        const originalUpload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                quality: 100,
            }
        );

        // Upload 60% quality version
        const quality60Upload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                quality: 60,
            }
        );

        // Upload 30% quality version
        const quality30Upload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                quality: 30,
            }
        );

        // Connect to MongoDB and save the image data
        const db = await connectToDb();
        const result = await db.collection('images').insertOne({
            originalUrl: originalUpload.secure_url,
            compressedUrl60: quality60Upload.secure_url,
            compressedUrl30: quality30Upload.secure_url,
            aspectRatio,
            createdAt: new Date()
        });

        return NextResponse.json({
            _id: result.insertedId,
            originalUrl: originalUpload.secure_url,
            compressedUrl60: quality60Upload.secure_url,
            compressedUrl30: quality30Upload.secure_url,
            aspectRatio,
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}