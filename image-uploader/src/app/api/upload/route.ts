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
            quality: 90,
            fetch_format: 'auto',
            flags: 'preserve_transparency'
        };

        // Upload original image and get its dimensions
        const originalUpload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                transformation: [
                    { quality: 'auto:best' }
                ]
            }
        );

        const originalWidth = originalUpload.width;
        const originalHeight = originalUpload.height;

        // Calculate dimensions for 60% size
        const width60 = Math.round(originalWidth * 0.6);
        const height60 = Math.round(originalHeight * 0.6);

        // Calculate dimensions for 30% size
        const width30 = Math.round(originalWidth * 0.3);
        const height30 = Math.round(originalHeight * 0.3);

        // Upload 60% size version
        const size60Upload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                transformation: [
                    {
                        width: Math.round(originalWidth * 0.6),
                        height: Math.round(originalHeight * 0.6),
                        crop: 'scale',
                        quality: 'auto:good'
                    }
                ]
            }
        );

        // Upload 30% size version
        const size30Upload = await cloudinary.uploader.upload(
            `data:image/png;base64,${buffer.toString('base64')}`,
            {
                ...baseOptions,
                transformation: [
                    {
                        width: Math.round(originalWidth * 0.3),
                        height: Math.round(originalHeight * 0.3),
                        crop: 'scale',
                        quality: 'auto:eco'
                    }
                ]
            }
        );

        // Connect to MongoDB and save the image data with dimensions
        const db = await connectToDb();
        const result = await db.collection('images').insertOne({
            originalUrl: originalUpload.secure_url,
            compressedUrl60: size60Upload.secure_url,
            compressedUrl30: size30Upload.secure_url,
            dimensions: {
                original: {
                    width: originalWidth,
                    height: originalHeight
                },
                size60: {
                    width: width60,
                    height: height60
                },
                size30: {
                    width: width30,
                    height: height30
                }
            },
            aspectRatio,
            createdAt: new Date()
        });

        return NextResponse.json({
            _id: result.insertedId,
            originalUrl: originalUpload.secure_url,
            compressedUrl60: size60Upload.secure_url,
            compressedUrl30: size30Upload.secure_url,
            dimensions: {
                original: {
                    width: originalWidth,
                    height: originalHeight
                },
                size60: {
                    width: width60,
                    height: height60
                },
                size30: {
                    width: width30,
                    height: height30
                }
            },
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