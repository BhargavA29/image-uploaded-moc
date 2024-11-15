'use client';

import { useState, useRef, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { AspectRatioType } from '@/types';
import AspectRatioToggle from './aspect-ratio-toggle';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface CropToolProps {
    image: string;
    aspectRatio: AspectRatioType;
    onAspectRatioChange: (ratio: AspectRatioType) => void;
}

function getImageData(image: HTMLImageElement, crop: PixelCrop) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width;
    canvas.height = crop.height;

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
    );

    return canvas;
}

export default function CropTool({
    image,
    aspectRatio,
    onAspectRatioChange
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
            if (!imgRef.current || !crop) return;

            setIsLoading(true);

            // Get the cropped image data
            const cropData = getImageData(
                imgRef.current,
                crop as PixelCrop
            );

            // Convert canvas to blob
            const blob = await new Promise<Blob>((resolve) => {
                cropData.toBlob((blob) => {
                    resolve(blob!);
                }, 'image/jpeg');
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
                throw new Error('Upload failed');
            }

            const data = await response.json();

            toast({
                title: "Success!",
                description: "Image uploaded and processed successfully.",
            });

            // You can handle the response URLs here
            console.log('Upload successful:', data);

        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: "Error",
                description: "Failed to process image. Please try again.",
                variant: "destructive",
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

            <div className="max-h-[600px] overflow-auto">
                <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={getAspectRatioValue(aspectRatio)}
                    minWidth={100}
                    minHeight={100}
                    circularCrop={false}
                    keepSelection={true}
                    ruleOfThirds={true}
                >
                    <Image
                        ref={imgRef}
                        src={image}
                        alt="Crop preview"
                        style={{ maxWidth: '100%' }}
                        width={800}
                        height={600}
                        unoptimized
                    />
                </ReactCrop>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Save Image'}
                </Button>
            </div>
        </div>
    );
}