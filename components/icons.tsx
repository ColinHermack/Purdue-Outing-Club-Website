import * as React from "react";
import Image from 'next/image'

export const Logo = (): JSX.Element => {
  return (
    <div className='bg-amber-400 w-12 h-12 flex justify-center items-center rounded-full mr-2'>
      <Image
        src='/poc_logo.png'
        width={45}
        height={45}
        alt='The POC logo'
      />
    </div>
  )
}

export const LargeLogo = (): JSX.Element => {
  return (
    <div className='bg-amber-400 w-fit h-fit flex justify-center items-center rounded-full'>
      <Image
        src='/poc_logo.png'
        width={250}
        height={250}
        alt='The POC logo'
      />
    </div>
  )
}