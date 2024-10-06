import { ChevronRight } from 'lucide-react'

interface NextButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export default function NextButton({ onClick, disabled = false }: NextButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        relative overflow-hidden
        px-2 py-2 rounded-md
        bg-purple-400 hover:bg-purple-300
        text-white font-semibold
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <span className="flex items-center justify-center">
                <ChevronRight size={16} />
            </span>
        </button>
    );
}
