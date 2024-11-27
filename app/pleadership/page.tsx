import { title } from "@/components/primitives";
import { getLeaderData } from '@/utils/leadership';
import Image from 'next/image';

export default async function AboutPage() {
    const data = await getLeaderData();

    return (
        <div>
            <h1 className={title()}>Pleadership</h1>
            <div className='flex flex-col justify-top items-center text-xl'>
                {data.map((item) => {
                    return(<div>
                        <h2 className='mt-4'>{item.label}</h2>
                        <div className='flex flex-wrap'>
                            {item.content.map(currOfficer => {
                                return (
                                    <div className='py-4'>
                                        <div className='pb-0 pt-2 px-4 flex-col items-start'>
                                            <p className="text-tiny uppercase font-bold">{currOfficer.name}</p>
                                            <small className="text-default-500">{currOfficer.pronouns}</small>
                                            <h4 className="font-bold text-large">{currOfficer.position}</h4>
                                        </div>
                                        <div className="overflow-visible py-2">
                                        <Image
                                            alt={currOfficer.name}
                                            className="rounded-xl"
                                            src={`/leadership/${currOfficer.officer_data.ImagePath}`}
                                            width={200}
                                            height={200}
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
