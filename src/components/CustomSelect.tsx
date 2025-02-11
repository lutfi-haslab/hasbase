import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CustomSelect = ({
    value,
    onChange,
    options,
    className
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; }[];
    className?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showAbove, setShowAbove] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const updatePosition = () => {
        if (!selectRef.current || !dropdownRef.current) return;

        const selectRect = selectRef.current.getBoundingClientRect();
        const dropdownHeight = dropdownRef.current.offsetHeight;

        // Space available above and below
        const spaceAbove = selectRect.top;
        const spaceBelow = window.innerHeight - selectRect.bottom;

        // Add some padding for better appearance
        const PADDING = 8;

        // If there's not enough space below and more space above, show above
        setShowAbove(spaceBelow < dropdownHeight + PADDING && spaceAbove > spaceBelow);
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            // Update position on scroll or resize while open
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={selectRef}>
            <button
                type="button"
                className="w-full px-4 py-2 text-left bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm hover:border-gray-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{options.find(opt => opt.value === value)?.label || 'Select Topic'}</span>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={`absolute z-10 w-full ${showAbove
                            ? 'bottom-full mb-1'
                            : 'top-full mt-1'
                        } bg-white border border-gray-200 rounded-lg shadow-lg`}
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;