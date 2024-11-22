'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Info, Trash2, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './ui/loading-spinner';
import { UploadedImage } from '@/types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Image from 'next/image';

interface ImageContainerProps {
    src: string;
    alt: string;
    label: string;
}

function ImageContainer({ src, alt, label }: ImageContainerProps) {
    return (
        <div className="space-y-2 group relative">
            <div className="relative overflow-hidden rounded-lg aspect-video">
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a href={src} target="_blank" rel="noopener noreferrer">
                        <Button
                            variant="secondary"
                            className="bg-background/70 hover:bg-background/90 transition-colors"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Image
                        </Button>
                    </a>
                </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

export default function ImageGallery() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchImages = useCallback(async () => {
        try {
            const response = await fetch('/api/images');
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            const data = await response.json();
            setImages(data);
        } catch (error) {
            console.error('Error fetching images:', error);
            toast({
                title: "Error",
                description: "Failed to load images",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleDelete = async (imageId: string) => {
        try {
            const response = await fetch('/api/images', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete image');
            }

            setImages(prevImages => prevImages.filter(img => img._id !== imageId));

            toast({
                title: "Success",
                description: "Image deleted successfully",
                variant: "default",
                duration: 3000,
            });
        } catch (error) {
            console.error('Failed to delete image:', error);
            toast({
                title: "Error",
                description: "Failed to delete image",
                variant: "destructive",
                duration: 4000,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="text-center text-muted-foreground">
                No images uploaded yet.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {images.map((image) => (
                <Card key={image._id} className="overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {new Date(image.createdAt).toLocaleDateString()}
                                </span>
                                <Separator orientation="vertical" className="h-4" />
                                <span>Aspect Ratio: {image.aspectRatio}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <HoverCard>
                                    <HoverCardTrigger>
                                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-semibold">Image Details</h4>
                                            <div className="text-sm">
                                                <p>Original Size: {image.dimensions.original.width} x {image.dimensions.original.height}</p>
                                                <p>60% Size: {image.dimensions.size60.width} x {image.dimensions.size60.height}</p>
                                                <p>30% Size: {image.dimensions.size30.width} x {image.dimensions.size30.height}</p>
                                            </div>
                                        </div>
                                    </HoverCardContent>
                                </HoverCard>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this image? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(image._id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <ImageContainer
                                src={image.originalUrl}
                                alt="Original"
                                label="Original"
                            />
                            <ImageContainer
                                src={image.compressedUrl60}
                                alt="60% Size"
                                label="60% Size"
                            />
                            <ImageContainer
                                src={image.compressedUrl30}
                                alt="30% Size"
                                label="30% Size"
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
} 