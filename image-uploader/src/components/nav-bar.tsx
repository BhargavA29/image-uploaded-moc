'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="border-b">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center space-x-8">
                    <Link
                        href="/"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/" ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        Upload
                    </Link>
                    <Link
                        href="/gallery"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/gallery" ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        Gallery
                    </Link>
                </div>
            </div>
        </nav>
    );
} 