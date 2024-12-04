import React from 'react';
import { Projects } from './postUtils';


export default function NewsPage() {

  return (
    <div className='flex flex-col justify-top items-center'>
      <h1 className="text-5xl text-amber-400 font-bold text-center">News</h1>
      <Projects />
    </div>
  );
}
  