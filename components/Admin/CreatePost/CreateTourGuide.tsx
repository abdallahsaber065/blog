import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';

interface TourGuideProps {
    run: boolean;
    onFinish: () => void;
    setShowAIGenerator: (value: boolean) => void;
    setShowContentSettings: (value: boolean) => void;
}

const TourGuide: React.FC<TourGuideProps> = ({ run, onFinish, setShowContentSettings, setShowAIGenerator }) => {
    const handleBeforeStep = (data: CallBackProps) => {
        const { index } = data;
        
        // Always show AI Generator for steps 1-11 (AI-related steps)
        if (index >= 0 && index <= 10) {
            setShowAIGenerator(true);
            
            // Show Content Settings for steps 2-8 (settings-related steps)
            if (index >= 2 && index <= 8) {
                setShowContentSettings(true);
            } else {
                setShowContentSettings(false);
            }
        } else {
            // Hide both for other steps (post form related steps)
            setShowAIGenerator(false);
            setShowContentSettings(false);
        }
    };

    const steps: Step[] = [
        {
            target: '.ai-generator-toggle',
            content: 'Click here to toggle the AI Content Generator. This powerful tool helps you create content automatically!',
            disableBeacon: true,
        },
        {
            target: '.topic-input',
            content: 'Enter your post topic here. Be specific to get better AI-generated content.',
        },
        {
            target: '.outline-settings',
            content: 'Configure advanced settings for content generation, including the number of search terms and keywords.',
        },
        {
            target: '.outline-settings-terms',
            content: 'Set the number of search terms to be used for research during content generation.',
        },
        {
            target: '.include-search-terms-toggle',
            content: 'Enable or disable the use Internet search to gather information for your content.',
        },
        {
            target: '.outline-settings-keywords',
            content: 'Define how many keywords should be included in your generated content.',
        },
        {
            target: '.outline-settings-points',
            content: 'Specify the number of main points to be included in your outline.',
        },
        {
            target: '.outline-settings-points-toggle',
            content: 'Enable or disable the custom number of points in your outline.',
        },
        {
            target: '.outline-settings-instructions',
            content: 'Add custom instructions to guide the AI in generating your content.',
        },
        {
            target: '.generate-outline-btn',
            content: 'Generate an AI-powered outline for your post based on your topic and settings.',
        },
        {
            target: '.edit-outline-btn',
            content: 'Review and modify the generated outline using our JSON editor.',
        },
        {
            target: '.generate-content-btn',
            content: 'Once satisfied with the outline, generate the full content for your post.',
        },
        {
            target: '.post-form',
            content: 'Edit your post details here, including title, excerpt, and content.',
        },
        {
            target: '.post-title',
            content: 'Enter your post title here. Make it engaging and descriptive.',
        },
        {
            target: '.post-excerpt',
            content: 'Write a brief summary of your post. This will appear in post listings and search results.',
        },
        {
            target: '.post-content',
            content: 'This is your main content editor. You can write in Markdown format and see the preview in real-time.',
        },
        {
            target: '.editor-preview-editor-section',
            content: 'Write your content here using Markdown syntax. You can use formatting, links, images, and more.',
        },
        {
            target: '.editor-preview-preview-section',
            content: 'See how your content will look when published. The preview updates as you type.',
        },
        {
            target: '.editor-preview-toggle-container',
            content: 'On mobile, use this toggle to switch between editor and preview modes.',
        },
        {
            target: '.tags-select',
            content: 'Add relevant tags to your post. You can select existing tags or create new ones.',
        },
        {
            target: '.category-select',
            content: 'Choose or create a category for your post.',
        },
        {
            target: '.featured-image',
            content: 'Select a featured image for your post from the media library.',
        },
        {
            target: '.publish-buttons',
            content: 'Publish your post or save it as a draft to continue editing later.',
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress
            showSkipButton
            scrollOffset={150}
            scrollDuration={300}
            styles={{
                options: {
                    primaryColor: '#3B82F6',
                    textColor: '#1F2937',
                    backgroundColor: '#FFFFFF',
                },
            }}
            floaterProps={{
                offset: 20,
            }}
            callback={(data) => {
                handleBeforeStep(data);
                if (data.status === 'finished' || data.status === 'skipped') {
                    setShowContentSettings(false);
                    onFinish();
                }
            }}
        />
    );
};

export default TourGuide;
