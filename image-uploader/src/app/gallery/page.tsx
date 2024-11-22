import { Metadata } from "next";
import ImageGallery from "@/components/image-gallery";

export const metadata: Metadata = {
    title: "Gallery | Image Uploader",
    description: "View your uploaded images with different compression levels",
};

export default function GalleryPage() {
    return (
        <main className="container mx-auto py-10 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Image Gallery</h1>
                <p className="text-muted-foreground">
                    Compare your uploaded images across different compression levels
                </p>
            </div>
            <ImageGallery />
        </main>
    );
} 