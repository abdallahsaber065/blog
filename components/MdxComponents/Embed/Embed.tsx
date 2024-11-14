import React, { useEffect, useState } from 'react';

// Accept any additional props using a generic type
interface EmbedProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
    src: string;
    title?: string;
    width?: string | number;
    height?: string | number;
    className?: string;
}

const Embed: React.FC<EmbedProps> = ({
    src,
    title = 'Embedded content',
    width = '400',
    height = '500',
    className = '',
    ...props // Spread operator to collect all other props
}) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <div className={`embed-container ${className}`}>Loading...</div>;
    }

    return (
        <div className={`embed-container ${className}`}>
            <iframe
                src={src}
                title={title}
                width={width}
                height={height}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                {...props} // Spread all additional props to the iframe element
            />
        </div>
    );
};

export default Embed;
