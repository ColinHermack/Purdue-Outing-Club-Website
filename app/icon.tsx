import { ImageResponse } from 'next/og';
import Image from 'next/image';

export const size = {
    width: 32,
    height: 32
}

export default function Icon() {
    return new ImageResponse( 
        (
            <Image src='/poc_logo.png' width={size.width} height={size.height} alt=''/>
        ),
        {
            ...size
        }
    );
}