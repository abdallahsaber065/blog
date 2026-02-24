'use client';
import React, { useState } from 'react';
import {
    Button as ToolbarButton,
    usePublisher,
    insertJsx$,
    insertMarkdown$,
} from '@mdxeditor/editor';
import { IoImage } from 'react-icons/io5';
import { BsFileEarmarkRichtextFill } from 'react-icons/bs';
import { FaFileInvoice } from 'react-icons/fa6';
import { PiPlugsConnectedFill } from 'react-icons/pi';
import { TbLayoutSidebarRightCollapseFilled } from 'react-icons/tb';
import ImageSelector from '../ImageSelector';
import FileSelector from '../FileSelector';
import { FILE_EXTENSIONS } from '../FileIcons';

/** Insert a custom <Image /> JSX block via ImageSelector modal */
export const InsertCustomImage: React.FC = () => {
    const insertJsx = usePublisher(insertJsx$);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (image: any) => {
        insertJsx({
            name: 'Image',
            kind: 'flow',
            props: {
                src: image.file_url,
                alt: image.file_name,
            },
        });
        setIsOpen(false);
    };

    return (
        <>
            <ToolbarButton title="Insert Custom Image" onClick={() => setIsOpen(true)}>
                <IoImage style={{ width: 18, height: 18 }} />
            </ToolbarButton>
            {isOpen && (
                <ImageSelector
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSelect={handleSelect}
                />
            )}
        </>
    );
};

/** Insert a <File /> JSX block via FileSelector modal */
export const InsertCustomFile: React.FC = () => {
    const insertJsx = usePublisher(insertJsx$);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (file: any) => {
        insertJsx({
            name: 'File',
            kind: 'flow',
            props: {
                src: file.file_url,
                filename: file.file_name,
                alt: file.file_name,
            },
        });
        setIsOpen(false);
    };

    return (
        <>
            <ToolbarButton title="Insert File Block" onClick={() => setIsOpen(true)}>
                <BsFileEarmarkRichtextFill style={{ width: 18, height: 18 }} />
            </ToolbarButton>
            {isOpen && (
                <FileSelector
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSelect={handleSelect}
                    allowedTypes={FILE_EXTENSIONS}
                />
            )}
        </>
    );
};

/** Insert an <InlineFile /> JSX element via FileSelector modal */
export const InsertInlineFile: React.FC = () => {
    const insertJsx = usePublisher(insertJsx$);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (file: any) => {
        insertJsx({
            name: 'InlineFile',
            kind: 'text',
            props: {
                src: file.file_url,
                filename: file.file_name,
                alt: file.file_name,
            },
        });
        setIsOpen(false);
    };

    return (
        <>
            <ToolbarButton title="Insert Inline File" onClick={() => setIsOpen(true)}>
                <FaFileInvoice style={{ width: 18, height: 18 }} />
            </ToolbarButton>
            {isOpen && (
                <FileSelector
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    onSelect={handleSelect}
                    allowedTypes={FILE_EXTENSIONS}
                />
            )}
        </>
    );
};

/** Insert an <Embed /> JSX block with placeholder props */
export const InsertEmbed: React.FC = () => {
    const insertJsx = usePublisher(insertJsx$);

    return (
        <ToolbarButton
            title="Insert Embed (YouTube, GDrive, etc.)"
            onClick={() =>
                insertJsx({
                    name: 'Embed',
                    kind: 'flow',
                    props: {
                        src: '',
                        alt: '',
                        height: 'auto',
                        width: 'auto',
                    },
                })
            }
        >
            <PiPlugsConnectedFill style={{ width: 18, height: 18 }} />
        </ToolbarButton>
    );
};

/** Insert a <details>/<summary> collapsible section via raw markdown */
export const InsertSection: React.FC = () => {
    const insertMarkdown = usePublisher(insertMarkdown$);

    return (
        <ToolbarButton
            title="Insert Collapsible Section"
            onClick={() =>
                insertMarkdown(
                    '<details>\n\t<summary>Put your title here</summary>\n\tAnything you want to put here\n</details>'
                )
            }
        >
            <TbLayoutSidebarRightCollapseFilled style={{ width: 18, height: 18 }} />
        </ToolbarButton>
    );
};
