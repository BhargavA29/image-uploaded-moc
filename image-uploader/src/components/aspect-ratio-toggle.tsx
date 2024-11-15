'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AspectRatioType } from '@/types';

interface AspectRatioToggleProps {
    value: AspectRatioType;
    onChange: (value: AspectRatioType) => void;
}

export default function AspectRatioToggle({
    value,
    onChange
}: AspectRatioToggleProps) {
    const ratios: AspectRatioType[] = ['1:1', '4:3', '3:4', 'free'];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Aspect Ratio: {value}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {ratios.map((ratio) => (
                    <DropdownMenuItem
                        key={ratio}
                        onClick={() => onChange(ratio)}
                    >
                        {ratio}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}