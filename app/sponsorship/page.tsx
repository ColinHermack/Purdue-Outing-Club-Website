import React from 'react';

import { Divider } from '@nextui-org/divider';
import { Image } from '@nextui-org/image';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';

import { getLeaderDataByPosition } from '@/utils/leadership';

const sponsors = [
    {
        name: 'Celsius',
        image: '/sponsors/celsius_logo.png',
        website: 'https://www.celsius.com'
    },
    {
        name: 'Subaru',
        image: '/sponsors/subaru_logo.png',
        website: 'https://www.subaru.com'
    }
]

export default async function SponsorshipPage() {
    const officerData = await getLeaderDataByPosition('Fundraising, Sponsorship, & Alumni');

    return (
        <div className='flex flex-col justify-top items-center'>
            <h1 className='text-5xl text-amber-400 font-bold text-center'>Sponsorship</h1>
            <h2 className='font-bold text-center my-10 text-xl'>Welcome to all new and returning sponsors!</h2>

            <p className='text-center w-3/4'>
                The Purdue Outing Club holds events like POCAR every year that connect us to other colleges and
                outdoor enthusiasts. We lead trips across the nation, and currently have over 700 active members.
            </p>

            <Divider className='my-5' />

            <h2 className='font-bold text-center mb-5 text-xl'>Our Past Partners</h2>
            <div className='w-full flex flex-wrap justify-center items-center space-x-24'>
                {sponsors.map((item) => {
                    return (
                        <Link
                            href={item.website}
                            target='_blank'
                            key={item.name}
                        >
                            <Image
                                rel='noopener noreferrer'
                                alt={`${item.name} logo`}
                                src={item.image}
                                width={200}
                                className='rounded-none my-12'
                            />
                        </Link>
                    )
                })}
            </div>

            <Divider className='my-5' />
            <h2 className='font-bold text-center mb-5 text-xl'>Our Goals in Partnership</h2>

            <p className='text-center w-3/4 my-2'>Financial support for club gear and trip opportunities</p>
            <p className='text-center w-3/4 my-2'>Brand exposure</p>
            <p className='text-center w-3/4 my-2'>Community connections</p>
            <p className='text-center w-3/4 my-2'>Mutual benefits</p>

            <Image 
                src='/pocar_celsius_group.jpg' 
                width={400} 
                className='mt-5 max-w-full' 
            />

            <h2 className='font-bold text-center mt-10 mb-5 text-xl'>Types of Sponsorship</h2>

            <Button
                as={Link}
                href='https://www.rei.com/lists/418038518'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-amber-400 text-black font-bold m-5'
            >
                Purchase Items from the Wishlist
            </Button>
            <Button
                as={Link}
                href='https://connect.purdue.edu/s/givenow?_ga=2.241255040.340950724.1694472480-995752346.1694186482&appealcode=10091&dids=004657&sort=1'
                target='_blank'
                rel='noopener noreferrer'
                className='bg-amber-400 text-black font-bold m-5'
            >
                Donate to the Club
            </Button>
            {officerData !== undefined ? 
            <Button
                as={Link}
                href={`mailto:${officerData.email}`}
                className='bg-amber-400 text-black font-bold m-5'
            >
                Partner with us for an event
            </Button> : <></>}

            <Divider className='my-5' />

            <h2 className='font-bold text-center text-xl'>Want to Learn More?</h2>
            <p className='text-center w-3/4 my-2'>Contact our fundraising, sponsorship, & alumni officer with questions.</p>

            {(officerData !== undefined) ? <Link href={`mailto:${officerData.email}`} className='text-amber-400 font-bold'>{officerData.name}</Link> : <></>}
            {(officerData !== undefined) ? 
                <Image
                    alt="POC Fundraising, Sponsorship, & Alumni Officer"
                    src={`/leadership/${officerData.officer_data.ImagePath}`}
                    width={300}
                    className='mt-5 max-w-full'
                /> : <></>}
        </div>
    )
}