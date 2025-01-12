import React from 'react';
import { Link } from '@nextui-org/link';
import { Button } from '@nextui-org/button';
import { Officer, getLeaderDataByPosition } from '@/utils/leadership';
import { Image } from "@nextui-org/image";

export default async function AlumniPage() {
    const alumniOfficer: Officer | undefined = await getLeaderDataByPosition("Fundraising, Sponsorship, & Alumni");

    return (
        <div className='flex flex-col justify-top items-center w-full min-h-screen'>
            <h1 className="text-5xl text-amber-400 font-bold text-center">Alumni</h1>
            <h2 className='text-2xl font-bold my-5'>Welcome!</h2>
            <p className='font-bold'>We are the Purdue Outing Club.</p>
            <p className='max-w-[800px] my-2'>Our mission is to make the outdoors accessible to all Purdue students.</p>
            <p className='max-w-[800px] my-2'>
                To this end, we have helped <strong>over 800 members</strong> reconnect with the outdoors. With your help, we aim to 
                increase our reach by creating a network of people passionate about the outdoors and the Purdue 
                community.
            </p>
            <p>Explore the links and view our newsletters below!</p>

            <div className='flex flex-col justify-top items-center gap-8 mt-12'>
                <Button
                    as={Link}
                    className="bg-amber-400 text-black font-bold"
                    href="/"
                    variant="flat"
                >
                    Donate Gear
                </Button>
                <Button
                    as={Link}
                    className="bg-amber-400 text-black font-bold"
                    href="/"
                    variant="flat"
                >
                    Offer up a Space
                </Button>
                <Button
                    as={Link}
                    className="bg-amber-400 text-black font-bold"
                    href="/"
                    variant="flat"
                >
                    Support our Endowment
                </Button>
            </div>

            <p className='my-12 font-bold'>Questions, comments, or concerns? Contact our alumni officer below.</p>
            
            {alumniOfficer === undefined ? (
                <p className='text-red-500 font-bold'>Alumni Officer not found.</p>
            ) : 
            (<div className="py-4 m-4 flex flex-col justify-top items-center">
                <div className="pb-0 pt-2 px-4 flex-col items-center max-w-[200px]">
                    <p className="text-small uppercase font-bold text-center">
                        {alumniOfficer.name}
                    </p>
                    <small className="text-default-500 text-tiny text-center">
                        {alumniOfficer.pronouns}
                    </small>
                    <h4 className="font-bold text-large text-center">
                        {alumniOfficer.position}
                    </h4>
                </div>
                <div className="relative w-[200px] h-[200px] mt-4">
                    <a href={`mailto:${alumniOfficer.email}`}>
                        <Image
                            alt={alumniOfficer.name}
                            className="rounded-xl object-cover"
                            sizes="200px"
                            src={`/leadership/${alumniOfficer.officer_data.ImagePath}`}
                        />
                    </a>
                </div>
                <Link href={`mailto:${alumniOfficer.email}`} className='mt-4 text-amber-400'>{alumniOfficer.email}</Link>
            </div>)}
        </div>
    )
}