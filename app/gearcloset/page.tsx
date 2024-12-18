'use client';

import React from 'react';
import {Divider} from "@nextui-org/divider";
import { useEffect, useState } from 'react';

import { Table,  TableHeader,  TableBody,  TableColumn,  TableRow,  TableCell, getKeyValue } from "@nextui-org/table";

interface IGearHoursData {
    name: string;
    hours: string;
}

const columns = [
    {
        key: 'name',
        label: 'Officer'
    },
    {
        key: 'hours',
        label: 'Gear Hours'
    }
]

export default function GearClosetPage() {
    const [gearHours, setGearHours] = useState<IGearHoursData[]>([]);

    useEffect(() => {
        try {
            fetch('/api/gear/hours')
            .then(response => response.json())
            .then((data) => {
                setGearHours(data);
            })
        } catch (error) {
            console.error(error);
        }
        
    }, []);

    return (
        <div className="flex flex-col justify-top items-center">
            <h1 className="text-5xl text-amber-400 font-bold text-center">Gear Closet</h1>
            <h2 className='font-bold text-center my-10 w-3/4'>
                The Gear Closet is a one-stop-shop for all of your outdoor needs. It has everything from mountain bikes
                to climbing gear. Gear can be checked out for official Purdue Outing Club trips.
            </h2>
            <p className='text-center w-3/4'> 
                Before going to the gear closet, check the #announcements channel in the Slack. Gear hours may be
                cancelled if nobody expresses interest. Additional gear hours may be posted there as well.
            </p>

            <Divider className='mt-10'/>
            <h2 className='font-bold text-center w-3/4 my-10 text-xl'>Gear Hours</h2>
            <Table aria-label='gear hours table' removeWrapper className='w-3/4'>
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody items={gearHours} emptyContent={"Loading..."}>
                    {(item) => (
                        <TableRow key={item.name}>
                            {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <Divider className='mt-10'/>
            <h2 className='font-bold text-center w-3/4 my-10 text-xl'>Where is the gear closet?</h2>
            <p className='text-center w-3/4'>
                The gear closet is located on the bottom floor of the Corec. After swiping in, go down the main stairs
                to the lowest level. Keep walking through the weight room past the treadmills and rowing machines until
                the room narrows from a hallway. The gear closet is the first door on the right, across from the 
                gaming lounge.
            </p>
            <p className='text-center w-3/4 my-5'>
                Check out the video below for more detailed instructions on how to
                find the gear closet.
            </p>
            <iframe className='w-1/2 h-96 mt-5 mb-10 rounded-large'
                src="https://www.youtube.com/embed/CpTz2dSFf90">
            </iframe>
        </div>
    )
}