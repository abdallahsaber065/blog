import React from 'react';
import FileResource from './FileResource';

interface ResourcesSectionProps {
    files: { src: string; filename: string }[];
}

const ResourcesSection: React.FC<ResourcesSectionProps> = ({ files }) => {
    if (files.length === 0) {
        return null;
    }

    return (
        <div className="resources-section my-8">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="flex flex-wrap gap-4">
                {files.map((file, index) => (
                    <FileResource key={index} src={file.src} filename={file.filename} />
                ))}
            </div>
        </div>
    );
};

export default ResourcesSection;