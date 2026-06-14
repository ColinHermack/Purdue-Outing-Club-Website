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

import { Table, TextField, Input } from '@heroui/react';

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
    <div className="flex flex-col justify-top items-center w-full">
        <title>Trip Leader Dashboard - Purdue Outing Club</title>
        <h1 className="text-5xl text-amber-400 font-bold text-center">Trip Leaders Dashboard</h1>
        <div className='flex flex-row justify-apart align-center mt-12 w-7/8'>
            <TextField aria-label="Search trip leaders" onChange={setSearchTerm} className='w-full'>
                <Input placeholder='Search' />
            </TextField>
        </div>
        <div className="w-7/8 mt-4 overflow-x-auto">
        <Table>
            <Table.Content aria-label="Trip leaders" className="table-fixed min-w-[58rem] w-full">
                <Table.Header>
                    <Table.Column isRowHeader className="w-44 whitespace-nowrap">Name</Table.Column>
                    <Table.Column>Sports</Table.Column>
                    <Table.Column className="w-56 whitespace-nowrap">Gmail</Table.Column>
                    <Table.Column className="w-36 whitespace-nowrap">Shadowed trip?</Table.Column>
                    <Table.Column className="w-28 whitespace-nowrap">Approved?</Table.Column>
                    <Table.Column className="w-28 whitespace-nowrap">Certified?</Table.Column>
                </Table.Header>
                <Table.Body>
                    {(tripLeaders ?? [])
                        .filter((tripLeader: TripLeaderDTO) => {
                            const name = tripLeader.member?.name;

                            if (!name) return false;

                            return (
                                searchTerm === '' ||
                                name.toLowerCase().includes(searchTerm) ||
                                tripLeader.sport?.toLowerCase().includes(searchTerm) ||
                                tripLeader.gmail?.toLowerCase().includes(searchTerm)
                            );
                        })
                        .map((tripLeader: TripLeaderDTO) => (
                            <Table.Row key={tripLeader.member?.name} aria-label={`Trip leader: ${tripLeader.member?.name}`}>
                                <Table.Cell>{tripLeader.member?.name}</Table.Cell>
                                <Table.Cell>{tripLeader.sport}</Table.Cell>
                                <Table.Cell>{tripLeader.gmail}</Table.Cell>
                                <Table.Cell><span role="img" aria-label={tripLeader.process?.shadow ? "Yes" : "No"}>{tripLeader.process?.shadow ? "🟢" : "🛑"}</span></Table.Cell>
                                <Table.Cell><span role="img" aria-label={tripLeader.process?.approved ? "Yes" : "No"}>{tripLeader.process?.approved ? "🟢" : "🛑"}</span></Table.Cell>
                                <Table.Cell><span role="img" aria-label={tripLeader.process?.certified ? "Yes" : "No"}>{tripLeader.process?.certified ? "🟢" : "🛑"}</span></Table.Cell>
                            </Table.Row>
                        ))
                    }
                </Table.Body>
            </Table.Content>
        </Table>
        </div>
    </div>
    )
}