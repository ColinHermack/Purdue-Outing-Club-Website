import React from 'react';
import { getTripData } from '@/utils/trips';
import { redirect } from 'next/navigation'
 
export default async function TripPage({ params }: any) {
    const id = params.id;
    const tripData = await getTripData(id);

    if (tripData === undefined) {
        redirect('/404');
    }

    return (
        <div className='flex flex-col justify-top items-center'>
            <h1 className="text-5xl text-amber-400 font-bold text-center">{tripData.name}</h1>
        </div>
    );
}