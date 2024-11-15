export interface UploadedImage {
    originalUrl: string;
    compressedUrl30: string;
    compressedUrl60: string;
    aspectRatio: string;
    createdAt: Date;
}

export type AspectRatioType = "1:1" | "4:3" | "3:4" | "free"; 