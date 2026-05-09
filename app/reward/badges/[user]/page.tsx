'use client'
import { useRef } from 'react';

export default function Home({ params }: { params: { user: string} }){
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            // Using html2canvas library (you'll need to install it)
            const html2canvas = (await import('html2canvas')).default;
            
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher quality
                useCORS: true, // Allow cross-origin images
                backgroundColor: '#ffffff'
            });

            // Convert to blob and download
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `badge-${params.user}.pdf`;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            });
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-gray-100 p-4">
            {/* Fixed aspect ratio container - adjust based on your certificate dimensions */}
            <div ref={certificateRef} className="relative w-full max-w-[1200px] aspect-[1.414/1]">
                <img 
                    src="/1st-var3.png" 
                    alt="Certificate"
                    className="absolute inset-0 w-full h-full object-fill"
                />
                
                {/* All text positioned with percentage of container */}
                <div className="absolute inset-0">
                    {/* User name */}
                    <p 
                        className="absolute text-center whitespace-nowrap text-gray-600 font-serif"
                        style={{
                            top: '25%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 'clamp(1.9rem, 4vw, 5rem)'
                        }}
                    >
                        {params.user.replaceAll("%20", " ")}
                    </p>
                    
                    {/* Competence text */}
                    <p 
                        className="absolute text-center text-gray-300 font-bold"
                        style={{
                            top: '43%',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 'clamp(2rem, 6vw, 6rem)'
                        }}
                    >
                        COMPETENCE
                    </p>
                </div>
            </div>

            <button
                onClick={handleDownload}
                className="absolute right-20 bottom-20 bg-pes hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-colors duration-200"
            >
                Download Badge
            </button>
        </div>
    )
}


