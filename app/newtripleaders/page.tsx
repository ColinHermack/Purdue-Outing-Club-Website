/**
 * A protected page which the Secretary of Sports will be able to use to add new trip leaders to the database.
 *
 * @author Colin Hermack
 */

"use client";

import React from "react";
import { useEffect, useState } from 'react';
import { Button } from "@heroui/button";
import {Input} from "@heroui/input";
import {Form} from "@heroui/form";
import {Select, SelectSection, SelectItem} from "@heroui/select";

import { MemberStatsT } from "@/utils/types";
import { IMember } from "@/utils/members";

interface ITripLeaderProps {
    email: string;
    sports: string[];
    process: {
        shadow: boolean;
        approved: boolean;
        certified: boolean;
    };
    gmail: string;
}

const sports = [
    {key: "backpacking", label: "Backpacking"},
    {key: "canoeing", label: "Canoeing"},
    {key: "caving", label: "Caving"},
    {key: "climbing", label: "Climbing"},
    {key: "fishing", label: "Fishing"},
    {key: "mountainbiking", label: "Mountain Biking"},
    {key: "whitewater", label: "Whitewater"},
    {key: "wintersports", label: "Winter Sports"},
]

const processSteps = [
    {key: "shadow", label: "This trip leader candidate has completed a shadow trip"},
    {key: "approved", label: "This trip leader candidate has been approved by the secretary of sports"},
    {key: "certified", label: "This trip leader candidate has completed trip leader and first aid training."},
]

async function fetchNameMatches(searchTerm: string): Promise<IMember[]> {
    const response = await fetch(`/api/protected/directory?search=${searchTerm.replaceAll(" ", "+")}`);
    const data = await response.json();
    return data;
}

export default function NewTripLeaderPage() {
    const [searchResults, setSearchResults] = useState<IMember[]>([]);
    const [tripLeader, setTripLeader] = useState<ITripLeaderProps | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        fetch("/api/protected/stats")
          .then((response) => response.json())
          .then((data) => {
            if (data.position !== "Secretary of Sports" && data.position !== "President" && data.position !== 'Vice President' && data.position !== 'Webmaster') {
                window.location.href = "/";
            }
          });
      }, []);

    return (
        <div className='flex flex-col items-center justify-top'>
            <h1 className="text-5xl text-amber-400 font-bold text-center">Add New Trip Leaders</h1>
            <div className='flex flex-col justify-top items-center'>
                <div className='flex flex-row justify-apart items-center p-2 mt-8'>
                    <Input label="Trip Leader Name" className='w-64 h-12' onChange={(e) => setSearchTerm(e.target.value)}/>
                    <Button className='ml-4 h-12' onPress={() => {
                        if (searchTerm.length > 1) {
                            fetchNameMatches(searchTerm).then((data) => {
                                setSearchResults(data);
                            });
                        }
                    }}>Search</Button>
                </div>
                <div className='flex flex-col justify-top items-center'>
                    {searchResults.map((result) => 
                        <Button className='w-[350px] my-1' variant='bordered' onPress={() => {
                            setTripLeader({
                                email: result.email,
                                sports: [],
                                process: {
                                    shadow: false,
                                    approved: false,
                                    certified: false
                                },
                                gmail: ''});
                        }}>
                            <p className='text-amber-400 text-sm'>{result.name}</p>
                            <p className='text-xs'>{result.email}</p>
                        </Button>
                    )}
                </div>

                <Form 
                    className="w-[600px] flex flex-col gap-4 mt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        let data = Object.fromEntries(new FormData(e.currentTarget));
                        console.log(data);

                }}
                >
                    <p><strong>Email:</strong> {tripLeader ? tripLeader.email : ""}</p>
                    <Select 
                        label='Sports'
                        placeholder='Select Sports'
                        selectionMode='multiple'
                        name='sports'
                        required
                    >
                        {sports.map((sport) => 
                            <SelectItem key={sport.key} value={sport.key}>
                                {sport.label}
                            </SelectItem>
                        )}
                    </Select>

                    <Select
                        label='Process'
                        placeholder='Select all that apply'
                        selectionMode='multiple'
                        name='process'
                        required
                    >
                        {processSteps.map((step) => <SelectItem key={step.key} value={step.key}>{step.label}</SelectItem>)}
                    </Select>

                    <Input label="Gmail" name='gmail' type='email' placeholder="Gmail" required/>

                    <Button type='submit' className='mt-4 bg-amber-400'>Submit</Button>
                </Form>
            </div>
        </div>
    )
}