// components/CustomImage.js
import Image from 'next/image';
import { resolvePublicUrl, isCloudProvider, isExternalUrl } from '@/lib/storage';

const CustomImage = (props: any) => {
    const src = resolvePublicUrl(props.src);
    return (
        <Image
            src={src}
            alt={props.alt}
            width={props.width || 800}  // Provide a default width
            height={props.height || 600} // Provide a default height
            unoptimized={isCloudProvider() || isExternalUrl(src)}
            {...props}  // Pass any other props like className
        />
    );
};

export default CustomImage;
