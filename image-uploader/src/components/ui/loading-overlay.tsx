export default function LoadingOverlay() {
    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4 text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="text-sm font-medium">Processing image...</p>
            </div>
        </div>
    );
}