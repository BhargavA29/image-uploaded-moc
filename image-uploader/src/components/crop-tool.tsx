'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { AspectRatioType } from '@/types';
import AspectRatioToggle from './aspect-ratio-toggle';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import LoadingOverlay from './ui/loading-overlay';
import { isValidImageType } from '@/lib/utils';

interface CropToolProps {
    image: string;
    aspectRatio: AspectRatioType;
    onAspectRatioChange: (ratio: AspectRatioType) => void;
    onReset: () => void;
}

function getImageData(image: HTMLImageElement, crop: PixelCrop) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
    );

    return canvas;
}

export default function CropTool({
    image,
    aspectRatio,
    onAspectRatioChange,
    onReset
}: CropToolProps) {
    const getAspectRatioValue = (ratio: AspectRatioType) => {
        switch (ratio) {
            case '1:1': return 1;
            case '4:3': return 4 / 3;
            case '3:4': return 3 / 4;
            case 'free': return undefined;
        }
    };

    // Helper function to calculate crop
    const calculateCrop = (ratio: number | undefined): Crop => {
        if (!ratio || ratio === 1) {
            return {
                unit: '%',
                width: 50,
                height: 50,
                x: 25,
                y: 25
            };
        } else if (ratio > 1) {
            return {
                unit: '%',
                width: 60,
                height: 60 / ratio,
                x: 20,
                y: (100 - (60 / ratio)) / 2
            };
        } else {
            return {
                unit: '%',
                width: 60 * ratio,
                height: 60,
                x: (100 - (60 * ratio)) / 2,
                y: 20
            };
        }
    };

    const [crop, setCrop] = useState<Crop>(() => {
        const ratio = getAspectRatioValue(aspectRatio);
        return calculateCrop(ratio);
    });

    // Add this useEffect
    useEffect(() => {
        const ratio = getAspectRatioValue(aspectRatio);
        setCrop(calculateCrop(ratio));
    }, [aspectRatio]);

    const [isLoading, setIsLoading] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const { toast } = useToast();

    const handleSave = async () => {
        try {
            if (!imgRef.current || !crop) {
                toast({
                    title: "Error",
                    description: "No image or crop selection found.",
                    variant: "destructive",
                });
                return;
            }

            setIsLoading(true);

            // Get the cropped image data
            const cropData = getImageData(
                imgRef.current,
                crop as PixelCrop
            );

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                // Get the original image type from the src URL
                const imageType = imgRef.current?.src.split(';')[0].split(':')[1] || 'image/jpeg';

                // Validate image type
                if (!isValidImageType(imageType)) {
                    reject(new Error('Invalid image type'));
                    return;
                }

                cropData.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                }, imageType); // Use original image type instead of hardcoding jpeg
            });

            // Create form data
            const formData = new FormData();
            formData.append('image', blob);
            formData.append('aspectRatio', aspectRatio);

            // Upload to server
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            await response.json();

            toast({
                title: "Success!",
                description: "Image uploaded and processed successfully.",
                variant: "default",
                duration: 3000,
            });

            // Reset the upload form
            onReset();

        } catch (err) {
            console.error('Save error:', err);
            toast({
                title: "Upload Failed",
                description: err instanceof Error ? err.message : "Failed to process image. Please try again.",
                variant: "destructive",
                duration: 4000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <AspectRatioToggle
                value={aspectRatio}
                onChange={onAspectRatioChange}
            />

            <div className="relative w-full h-[600px] overflow-hidden">
                <div className="flex items-center justify-center w-full h-full">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={getAspectRatioValue(aspectRatio)}
                        minWidth={100}
                        minHeight={100}
                        circularCrop={false}
                        keepSelection={true}
                        ruleOfThirds={true}
                        className="max-w-fit relative"
                    >
                        <Image
                            ref={imgRef}
                            src={image}
                            alt="Crop preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '600px',
                                width: 'auto',
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                            width={800}
                            height={600}
                            unoptimized
                            priority
                            loading="eager"
                        />
                        {isLoading && <LoadingOverlay />}
                    </ReactCrop>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={onReset}
                    disabled={isLoading}
                >
                    Reset Image
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Save Image'}
                </Button>
            </div>
        </div>
    );
}