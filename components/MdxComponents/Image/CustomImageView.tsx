// components/CustomImage.js
import Image from 'next/image';
import { resolvePublicUrl } from '@/lib/storage';

const CustomImage = (props: any) => {
    return (
        <Image
            src={resolvePublicUrl(props.src)}
            alt={props.alt}
            width={props.width || 800}  // Provide a default width
            height={props.height || 600} // Provide a default height
            {...props}  // Pass any other props like className
        />
    );
};

export default CustomImage;
