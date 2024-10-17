import React from 'react'

interface CyberTronLogoProps {
    size?: number
    className?: string
}

const CyberTronLogo: React.FC<CyberTronLogoProps> = ({ size = 100, className = '' }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="cyberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00FFFF" />
                    <stop offset="50%" stopColor="#FF00FF" />
                    <stop offset="100%" stopColor="#FF1493" />
                </linearGradient>
                <filter id="cyberGlow">
                    <feGaussianBlur stdDeviation="2" result="glow" />
                    <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Outer hexagon */}
            <path
                d="M50 5L87.3013 25V75L50 95L12.6987 75V25L50 5Z"
                stroke="url(#cyberGradient)"
                strokeWidth="2"
                filter="url(#cyberGlow)"
            />

            {/* Inner mechanical details */}
            <path
                d="M50 20L75 35V65L50 80L25 65V35L50 20Z"
                stroke="url(#cyberGradient)"
                strokeWidth="1.5"
                filter="url(#cyberGlow)"
            />

            {/* Central "CT" shape (updated and smaller) */}
            <text
                x="50%"
                y="52%"
                textAnchor="middle"
                fontSize="24"
                fontWeight="bold"
                fill="url(#cyberGradient)"
                filter="url(#cyberGlow)"
                dominantBaseline="middle"
            >
                CT
            </text>

            {/* Circuit-like details */}
            <circle cx="20" cy="50" r="3" fill="url(#cyberGradient)" filter="url(#cyberGlow)" />
            <circle cx="80" cy="50" r="3" fill="url(#cyberGradient)" filter="url(#cyberGlow)" />
            <path d="M23 50H35" stroke="url(#cyberGradient)" strokeWidth="1.5" filter="url(#cyberGlow)" />
            <path d="M65 50H77" stroke="url(#cyberGradient)" strokeWidth="1.5" filter="url(#cyberGlow)" />

            {/* Animated pulse effect */}
            <circle
                cx="50"
                cy="50"
                r="45"
                stroke="url(#cyberGradient)"
                strokeWidth="1"
                opacity="0.5"
                fill="none"
            >
                <animate
                    attributeName="r"
                    values="45;48;45"
                    dur="3s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="opacity"
                    values="0.5;0.2;0.5"
                    dur="3s"
                    repeatCount="indefinite"
                />
            </circle>
        </svg>
    )
}

export default CyberTronLogo
