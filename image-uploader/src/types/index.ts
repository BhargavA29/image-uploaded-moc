export interface ImageDimensions {
    width: number;
    height: number;
}

export interface UploadedImage {
    _id: string;
    originalUrl: string;
    compressedUrl60: string;
    compressedUrl30: string;
    dimensions: {
        original: ImageDimensions;
        size60: ImageDimensions;
        size30: ImageDimensions;
    };
    aspectRatio: string;
    createdAt: Date;
}

export type AspectRatioType = "1:1" | "4:3" | "3:4" | "free"; 