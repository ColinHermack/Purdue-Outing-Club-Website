import React from 'react';
import { NewsArticles } from './postUtils';

export const metadata = {
  title: 'News',
  description: 'Read the latest news and updates from the Purdue Outing Club.',
}

export default function NewsPage() {

  return (
    <div className='flex flex-col justify-top items-center'>
      <h1 className="text-5xl text-amber-400 font-bold text-center">News</h1>
      <NewsArticles />
    </div>
  );
}
  