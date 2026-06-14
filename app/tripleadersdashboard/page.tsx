"use client"

/**
 * A dashboard page which will be accessible to authorized users and allow management of existing trip leaders
 * and addition of new trip leaders.
 *
 * @author Colin Hermack
 */

import { useState, useEffect } from "react";
import TripLeaderDTO from "@/dtos/tripLeaderDto"
import { redirect } from 'next/navigation';

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, TextField, Input } from '@heroui/react';

export default function TripLeaderDashboardPage() {
    const [tripLeaders, setTripLeaders] = useState<TripLeaderDTO[] | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        fetch("/api/protected/tripleaders")
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    redirect('/');
                }
                return response.json()
            })
            .then(data => {
                setTripLeaders(data);
            })
    }, [])

    return (
    <div className="flex flex-col justify-top items-center">
        <title>Trip Leader Dashboard - Purdue Outing Club</title>
        <h1 className="text-5xl text-amber-400 font-bold text-center">Trip Leaders Dashboard</h1>
        <div className='flex flex-row justify-apart align-center mt-12 w-full'>
            <TextField onChange={setSearchTerm}>
                <Input placeholder='search' />
            </TextField>
        </div>
        <Table aria-label="Trip leaders" className='w-full mt-4'>
            <TableHeader>
                <TableColumn isRowHeader>Name</TableColumn>
                <TableColumn>Sports</TableColumn>
                <TableColumn>Gmail</TableColumn>
                <TableColumn>Shadowed trip?</TableColumn>
                <TableColumn>Approved?</TableColumn>
                <TableColumn>Certified?</TableColumn>
            </TableHeader>
            <TableBody>
                {tripLeaders != null ? tripLeaders.map((tripLeader: TripLeaderDTO) => {
                    let tripLeaderName: string | undefined = tripLeader.member?.name;

                    if (tripLeaderName === undefined) {
                        return <></>
                    }

                    if (searchTerm === '' || tripLeaderName.toLowerCase().includes(searchTerm) || tripLeader.sport?.some((s: string) => s.toLowerCase().includes(searchTerm)) || tripLeader.gmail?.toLowerCase().includes(searchTerm)) {
                        return (
                        <TableRow>
                            <TableCell>{tripLeader.member?.name}</TableCell>
                            <TableCell>{tripLeader.sport}</TableCell>
                            <TableCell>{tripLeader.gmail}</TableCell>
                            <TableCell>{tripLeader.process?.shadow ? <>🟢</> : <>🛑</>}</TableCell>
                            <TableCell>{tripLeader.process?.approved ? <>🟢</> : <>🛑</>}</TableCell>
                            <TableCell>{tripLeader.process?.certified ? <>🟢</> : <>🛑</>}</TableCell>
                        </TableRow>
                        )
                    }
                    return <></>
                }) : <></>}
            </TableBody>
        </Table>
    </div>
    )
}