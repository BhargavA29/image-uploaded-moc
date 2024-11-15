'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AspectRatioType } from '@/types';
import CropTool from '@/components/crop-tool';

export default function ImageUpload() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // Set default aspect ratio to '1:1'
    const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('1:1');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card className="w-full max-w-3xl mx-auto p-6 space-y-6">
            {!selectedImage ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-600 rounded-lg p-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-gray-400">Upload Image</h2>
                        <p className="text-gray-500">Click to select or drag and drop your image here</p>
                        <Button onClick={handleUploadClick} size="lg">
                            Select Image
                        </Button>
                    </div>
                </div>
            ) : (
                <CropTool
                    image={selectedImage}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={setAspectRatio}
                />
            )}
        </Card>
    );
}