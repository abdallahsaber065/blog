import React from 'react';
import Joyride, { Step } from 'react-joyride';

interface EditTourGuideProps {
    run: boolean;
    onFinish: () => void;
}

const EditTourGuide: React.FC<EditTourGuideProps> = ({ run, onFinish }) => {
    const steps: Step[] = [
        // Main Post Editor Container
        {
            target: '#post-editor-container',
            content: 'Welcome to the Post Editor! Here you can create and edit your blog posts.',
            placement: 'center',
            disableBeacon: true,
        },
        // Title Section
        {
            target: '.post-editor-title-section',
            content: 'Enter your post title here. This will be displayed as the main heading of your blog post.',
            placement: 'bottom',
        },
        // Editor Section
        {
            target: '.editor-preview-editor-section',
            content: 'This is your markdown editor. You can write your content using markdown syntax here.',
            placement: 'left',
        },
        // Markdown Editor
        {
            target: '.markdown-editor-main',
            content: 'Use the toolbar above to format your text, add links, images, and more.',
            placement: 'top',
        },
        // Preview Section
        {
            target: '.editor-preview-preview-section',
            content: 'See how your post will look in real-time with this preview panel.',
            placement: 'right',
        },
        // Preview Toggle (Mobile)
        {
            target: '.editor-preview-toggle-container',
            content: 'On mobile devices, use this toggle to switch between editor and preview modes.',
            placement: 'bottom',
        },
        // Render MDX Preview
        {
            target: '.render-mdx-container',
            content: 'Your content is rendered here with full MDX support, including custom components.',
            placement: 'left',
        },
        // MDX Toolbar
        {
            target: '.render-mdx-toolbar',
            content: 'Use these controls to sync scrolling or enter fullscreen preview mode.',
            placement: 'bottom',
        },
        // Tags Section
        {
            target: '.post-editor-tags-section',
            content: 'Add tags to categorize your post. You can select existing tags or create new ones.',
            placement: 'top',
        },
        // Category Section
        {
            target: '.post-editor-category-section',
            content: 'Select or create a category for your post.',
            placement: 'top',
        },
        // Action Buttons
        {
            target: '.post-editor-actions',
            content: 'Publish your post or save it as a draft using these buttons.',
            placement: 'top',
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            styles={{
                options: {
                    primaryColor: '#2563eb', // Tailwind blue-600
                    zIndex: 1000,
                }
            }}
            callback={(data) => {
                if (data.status === 'finished' || data.status === 'skipped') {
                    onFinish();
                }
            }}
        />
    );
};

export default EditTourGuide;