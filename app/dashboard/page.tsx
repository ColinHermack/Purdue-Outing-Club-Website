'use client';

import React from "react";
import { useState, useEffect } from 'react';

export default function DashBoardPage() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        fetch('/api/protected/example')
        .then((response) => response.json())
        .then((data) => {
            setUser(data.user);
        })
    }, []);

    

    return (
        <div className="flex flex-col justify-top items-center">
            <title>My Dashboard - Purdue Outing Club</title>
            <div>{user}</div>
        </div>
    );
}