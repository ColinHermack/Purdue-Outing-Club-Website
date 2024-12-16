import React from 'react';

export default function pocarPage() {
    return (
        <div className="flex flex-col justify-top items-center">
            <h1 className="text-5xl text-amber-400 font-bold text-center">POCAR 2025</h1>
            <h2 className='font-bold text-center my-10 text-xl'>Race Information</h2>
            <p className='text-left w-1/2 my-2'><strong>Location:</strong> Morgan Monroe State Forest</p>
            <p className='text-left w-1/2 my-2'><strong>Date:</strong> January 18-20, 2025</p>
            <p className='text-left w-1/2 my-2'><strong>Start Time:</strong> 10:00 AM (Open Division), 10:30 AM (Collegiate Division)</p>
            <p className='text-left w-1/2 my-2'><strong>Race Fee:</strong> $400 (Open Division), $250 (Collegiate Division)</p>
        </div>
    )
}