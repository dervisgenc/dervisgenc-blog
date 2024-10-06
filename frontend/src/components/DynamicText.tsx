import React, { useState, useEffect } from 'react';

const DynamicText: React.FC<{ text: string }> = ({ text }) => {
    const [colors, setColors] = useState(['#8B5CF6', '#EC4899', '#EF4444']);

    useEffect(() => {
        const interval = setInterval(() => {
            setColors((prevColors) => {
                const newColors = [...prevColors];
                newColors.unshift(newColors.pop() as string);
                return newColors;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <span className="relative">
            {text.split('').map((char, index) => (
                <span key={index} className="transition-colors duration-2000" style={{ color: colors[index % colors.length] }}>
                    {char}
                </span>
            ))}
        </span>
    );
};

export default DynamicText;
