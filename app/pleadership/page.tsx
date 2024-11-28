import { title } from "@/components/primitives";
import { getLeaderData } from '@/utils/leadership';
import Image from 'next/image';

export default async function AboutPage() {
    const data = await getLeaderData();

    return (
        <div className='flex flex-col justify-top items-center'>
            <h1 className={title()}>Pleadership</h1>
            <p className='mt-4'>
                It takes a lot of people to keep one of the largest clubs on campus running! Click on anyone's picture
                below to contact them.
            </p>
            <div className='flex flex-col w-screen justify-top items-center text-xl'>
                {data.map((item) => {
                    return(<div>
                        <h2 className='m-12 text-2xl font-bold'>{item.label}</h2>
                        <div className='w-full flex flex-wrap justify-center items-center'>
                            {item.content.map(currOfficer => {
                                return (
                                    <div className='py-4 m-4 w-[250px] h-[350px] flex flex-col justify-between items-center'>
                                        <div className='pb-0 pt-2 px-4 flex-col items-start'>
                                            <p className="text-small uppercase font-bold">{currOfficer.name}</p>
                                            <small className="text-default-500 text-tiny">{currOfficer.pronouns}</small>
                                            <h4 className="font-bold text-large">{currOfficer.position}</h4>
                                        </div>
                                        <div className="relative w-[200px] h-[200px]">
                                            <Image
                                                alt={currOfficer.name}
                                                className="rounded-xl object-cover"
                                                src={`/leadership/${currOfficer.officer_data.ImagePath}`}
                                                fill={true}
                                                sizes='200px'
                                            />
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>)
                })}
            </div>
        </div>
    );
}
