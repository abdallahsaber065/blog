import React, { useEffect, useState } from 'react';
import { TbPlugConnectedX } from "react-icons/tb";
// loading icon from react-icons
import { FaSpinner } from "react-icons/fa";

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
    width = '100%',
    height = '350',
    className = '',
    ...props
}) => {
    const [isClient, setIsClient] = useState(false);
    if (height === 'auto' || height === '100%' || height === '') {
        height = '350';
    }
    const defWidth = (width === 'auto' || width === '100%' || width === '')

    useEffect(() => {
        setIsClient(true);
    }, []);

    const containerStyle = {
        width: defWidth ? '100%' : width,
        height: height,
        maxWidth: '100%',
    };

    // use regex to check if youtube link is valid embed and if nou construct the embed link
    if (src && src.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)/)) {
        src = src.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)/, "https://www.youtube.com/embed/$1");
    }

    // if google drive folder:convert to https://drive.google.com/embeddedfolderview?id=FOLDER-ID#list
    if (src && src.match(/(?:https?:\/\/)?(?:drive\.google\.com)\/(?:drive\/folders)\/([a-zA-Z0-9_-]+)/)) {
        src = src.replace(/(?:https?:\/\/)?(?:drive\.google\.com)\/(?:drive\/folders)\/([a-zA-Z0-9_-]+)/, "https://drive.google.com/embeddedfolderview?id=$1#list");
    }

    // if google drive file: convert to https://drive.google.com/file/d/FILE-ID/preview
    if (src && src.match(/(?:https?:\/\/)?(?:drive\.google\.com)\/(?:file)\/d\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?/)) {
        src = src.replace(/(?:https?:\/\/)?(?:drive\.google\.com)\/(?:file)\/d\/([a-zA-Z0-9_-]+)(?:\/[^?]*)?/, "https://drive.google.com/file/d/$1/preview");
    }

    if (!isClient) {
        return (
            <div className={`embed-container ${className}`} style={containerStyle}>
                    <FaSpinner
                        title={title}
                        width={width}
                        height={height}
                        style={{
                            width: defWidth ? '100%' : width,
                            maxWidth: '100%',
                        }}
                    />
            </div>

        )
    }

    if (!src) {
        return (
            <div className={`embed-container ${className}`} style={containerStyle}>
                <TbPlugConnectedX />
                <p>Please insert a valid src</p>
            </div>
        );
    }

    return (
        <div className={`embed-container ${className}`} style={containerStyle}>
            <iframe
                src={src}
                title={title}
                width={width}
                height={height}
                className="embed-iframe"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen;"
                allowFullScreen
                {...props}
                style={{
                    width: defWidth ? '100%' : width,
                    maxWidth: '100%',
                }}
            />
        </div>
    );
};

export default Embed;