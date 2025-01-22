import React from 'react';
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Divider } from "@nextui-org/divider";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";

import { getLeaderDataByPosition } from "@/utils/leadership";

export default async function Page() {
    const presidentData = await getLeaderDataByPosition("President");
    const secretaryData = await getLeaderDataByPosition("Secretary of Outreach");

    return (
        <div className='flex flex-col justify-top items-center'>
            <h1 className="text-5xl text-amber-400 font-bold">Support Us</h1>
            <p className="my-4 text-center max-w-[800px]">
                Our goal as the Purdue Outing Club is and always has been to make outdoor recreeation 
                as <strong>accessible as possible</strong> for those who want to participate.
            </p>
            <p className='my-4 text-center max-w-[800px]'>
                To reflect this, our dues are $30 per academic year to gain access to over $100,000 worth of
                gear, and an amazing team of officers who plan our trips.
            </p>
            <p className='my-4 text-center max-w-[800px]'>
                To maintain our <strong>unparalleled equity to access</strong> we rely on student organization
                grants from Purdue.
            </p>
            <p className='my-4 text-center max-w-[800px]'>
                Unfortunately, we are beginning to see instability in these grants.
            </p>
            <p className='my-4 text-center font-bold'> 
                So we're doing something about it.
            </p>
            <p className='my-4 text-center max-w-[800px]'>
                This is where your impact can be felt. With the funds raised in this outreach we are hoping to <strong>establish
                an endowment.</strong> This will generate a stable source of income for the club to ensure future success.
            </p>
            <p className='my-4 text-center font-bold'>
                We just need a hand in getting it started.
            </p>

            <Button 
                as={Link}
                href='https://giving.purdue.edu/outingclub/?appealcode=18240'
                className='bg-amber-400 text-black font-bold my-10'
                isExternal={true}
            >
                Click Here to Support Us
            </Button>

            <Divider />

            <h2 className='font-bold text-center my-10 text-xl'>Want to help in other ways?</h2>
            <p className='my-4 text-center max-w-[800px]'>
                Whether you have connections, want to help us fundraise, or simply can spread word of we are and what
                we do, we need help from everyone!
            </p>

            <div className='flex flex-col justify-top items-center my-10 lg:flex-row md:justify-center md:items-top'>
                <div className='h-56 w-56 my-4 mx-8'>
                    <Button 
                        as={Link}
                        href='/docs/fundraising_package.pdf'
                        className='bg-amber-400 text-black font-bold my-5 w-full'
                    >
                        Fundraising Package
                    </Button>
                    <p className='w-full text-center w-full'>
                        Send this fundraising package to help educate about the club!
                    </p>
                </div>
                <div className='w-56 h-56 my-4 mx-8'>
                    <Button 
                        as={Link}
                        href='/'
                        className='bg-amber-400 text-black font-bold my-5 w-full'
                        isDisabled={true}
                    >
                        How to ask
                    </Button>
                    <p className='w-full text-center w-full'>
                        Follow this guide to ask those close to you to support our cause! <strong>(COMING SOON)</strong>
                    </p>
                </div>
                <div className='flex flex-col w-56 my-4 mx-8 justify-top h-56 w-56'>
                    <Button 
                        as={Link}
                        href='https://linktr.ee/purdue.outing.club'
                        className='bg-amber-400 text-black font-bold my-5 w-full'
                    >
                        Connect With Us
                    </Button>
                    <p className='w-full text-center w-full'>
                        Use this as a hub to get in touch with us!
                    </p>
                </div>
            </div>

            <Divider className='my-10'/>

            <h2 className='text-xl font-bold'>Interested in a brand partnership?</h2>
            <p className='my-4 text-center max-w-[800px]'>Contact our president and secretary of outreach to begin the process!</p>

            {presidentData != null && secretaryData != null ? (
                <div className='my-4 flex flex-col justify-top items-center md:flex-row md:justify-center'>
                    <Card className="m-4 py-2">
                        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                            <p className="text-tiny uppercase font-bold">{presidentData.name}</p>
                            <small className="text-default-500">{presidentData.pronouns}</small>
                            <Link 
                                href={`mailto:${presidentData.email}`}
                                className='text-amber-400 text-small'
                            >
                                {presidentData.email}
                            </Link>
                            <h4 className="font-bold text-large mt-2">{presidentData.position}</h4>
                        </CardHeader>
                        <CardBody className="overflow-visible py-2">
                            <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src={`/leadership/${presidentData.officer_data.ImagePath}`}
                            width={250}
                            height={250}
                            />
                        </CardBody>
                    </Card>
                    <Card className="m-4 py-2">
                        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                            <p className="text-tiny uppercase font-bold">{secretaryData.name}</p>
                            <small className="text-default-500">{secretaryData.pronouns}</small>
                            <Link 
                                href={`mailto:${secretaryData.email}`}
                                className='text-amber-400 text-small'
                            >
                                {secretaryData.email}
                            </Link>
                            <h4 className="font-bold text-large mt-2">{secretaryData.position}</h4>
                        </CardHeader>
                        <CardBody className="overflow-visible py-2">
                            <Image
                            alt="Card background"
                            className="object-cover rounded-xl"
                            src={`/leadership/${secretaryData.officer_data.ImagePath}`}
                            width={250}
                            height={250}
                            />
                        </CardBody>
                    </Card>
                </div>
            ): (
                <Link 
                    href='/leadership'
                    className='my-4 text-center font-bold'
                >
                    Find leadership contact info here! 
                </Link>
            )}
            
        </div>
    )
}