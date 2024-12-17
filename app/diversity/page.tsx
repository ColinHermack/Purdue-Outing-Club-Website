import React from 'react';

import { getLeaderDataByPosition } from '@/utils/leadership';

import { Divider } from '@nextui-org/divider';
import { Link } from '@nextui-org/link';
import {Image} from "@nextui-org/image";

export default async function DiversityPage() {
    let diversityOfficerData = await getLeaderDataByPosition("Diversity & Community Outreach");
    console.log(diversityOfficerData);

    return (
        <div className='flex flex-col items-center justify-center gap-4 md:py-10'>
            <h1 className='text-5xl text-amber-400 font-bold text-center'>Diversity in the POC</h1>
            <p className='text-center w-3/4'>
                The Purdue Outing Club is a welcoming environment for everyone to learn about and participate in
                outdoor activities. We welcome people from all backgrounds and experiences to be a part of our trips.
            </p>

            <Divider className='my-5' />

            <h2 className='font-bold text-center text-xl'>What we are doing</h2>
            <p className='text-center w-3/4'>
                Connecting with cultural centers and the LGBTQ center to get more students into the outdoors.
            </p>
            <p className='text-center w-3/4'>
                Providing tailored trips for grad students, international students, and nonbinary students 
                throughout the academic year.
            </p>
            <p className='text-center w-3/4'>
                Providing a friendly and inexpensive way of getting outdoors by suppling equipment.
            </p>
            <p className='text-center w-3/4'>
                Offering trips for beginners.
            </p>

            <Divider className='my-5' />

            <h2 className='font-bold text-center text-xl'>Our Goals</h2>

            <p className='text-center w-3/4'>
                Continue to reach out to groups across campus.
            </p>
            <p className='text-center w-3/4'>
                Collaborate with more cultural clubs.
            </p>
            <p className='text-center w-3/4'>
                Continue trips aimed at diverse student groups.
            </p>
            <p className='text-center w-3/4'>
                Continue informational and learning sessions for beginners.
            </p>

            <Divider className='my-5' />

            <h2 className='font-bold text-center text-xl'>Learn More</h2>
            <p className='text-center w-3/4'>
                Contact our diversity and community outreach coordinator with questions or feedback for the club.
            </p>
            {(diversityOfficerData !== undefined) ? <Link href={`mailto:${diversityOfficerData.email}`} className='text-amber-400'>{diversityOfficerData.name}</Link> : <></>}
            {(diversityOfficerData !== undefined) ? 
                <Image
                    alt="NextUI hero Image"
                    src={`/leadership/${diversityOfficerData.officer_data.ImagePath}`}
                    width={300}
                /> : <></>}
        </div>
    )
}