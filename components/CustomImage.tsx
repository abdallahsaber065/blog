// components/CustomImage.js
import Image from 'next/image';

const CustomImage = (props: any) => {
    console.log(props);
    return (
        <Image
            src={props.src}
            alt={props.alt}
            width={props.width || 800}  // Provide a default width
            height={props.height || 600} // Provide a default height
            {...props}  // Pass any other props like className
        />
    );
};

export default CustomImage;
