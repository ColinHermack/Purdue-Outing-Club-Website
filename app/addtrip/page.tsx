"use client";

import {Form, Input, Button, DatePicker} from "@heroui/react";
import {now, getLocalTimeZone} from "@internationalized/date";

export default function AddTripPage() {
    return (
        <div className="flex flex-col justify-top items-center">
            <h1 className="text-5xl text-amber-400 font-bold text-center">New Trip</h1>

            <Form>
                <Input placeholder='Trip Name' label="Trip Name" />
                <DatePicker 
                    label="Start Date and Time" 
                    defaultValue={now(getLocalTimeZone())}
                />
            </Form>
        </div>
    )
}