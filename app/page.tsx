"use client";

import { Accordion, Link, Spinner, Separator, buttonVariants } from "@heroui/react";
import { useState, useEffect } from "react";

import { AccordionEntry } from "@/components/accordion-entry";
import { SPORT_DESCRIPTIONS } from "@/config/constants";

export default function Home() {
  const [recentNews, setRecentNews] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      const response = await fetch("/api/news/recent");
      const data = await response.json();

      setRecentNews(data);
    }
    fetchNews();
  }, []);

  return (
    <section className="flex flex-col items-center justify-top">
      <div className="text-5xl text-amber-400 font-bold text-center">
        PURDUE OUTING CLUB
      </div>
      <div className="flex flex-col justify-top items-center mt-10 lg:flex-row lg:justify-center">
        <img
          alt="A picture from the Outing Club trip to the rocky mountains"
          className="my-5 sm:m-5 rounded-lg h-[200px] w-auto"
          height={200}
          src="/rocky_mountains.jpg"
        />
        <img
          alt="A picture of the Outing Club trip leaders."
          className="my-5 sm:m-5 rounded-lg h-[200px] w-auto"
          height={200}
          src="/trip_leaders.JPG"
        />
        <img
          alt="A picture from an Outing Club trip to Indiana Dunes."
          className="my-5 sm:m-5 rounded-lg h-[200px] w-auto"
          height={200}
          src="/beach.jpg"
        />
      </div>
      <p className="m-10 text-center max-w-[600px]">
        The Purdue Outing Club is involved with any activity that takes place in
        the outdoors. It is a place for people who enjoy the outdoors to meet
        each other and have fun. The club is open to Purdue University students
        as members, but we often communicate with alumni and outdoor
        professionals across the country.
      </p>
      <iframe
        className="mb-10 rounded-lg"
        height={200}
        src="https://www.youtube.com/embed/05dKVZUYwSY"
        title="poctoberfest video"
        width={350}
      />

      <Separator className="my-5" />

      <h2 className="text-4xl m-10 font-bold">NEWS</h2>
      <div className="mb-10">
        {recentNews.length > 0 ? (
          recentNews.map((post: any) => {
            return (
              <Link
                key={post.slug}
                className="flex flex-col space-y-1 mb-4 text-black dark:text-white"
                href={`/news/${post.slug}`}
              >
                <div className="w-full flex flex-col rounded transition-all duration-300 pt-2 pb-2 hover:bg-neutral-300/25 hover:pl-2 hover:shadow dark:hover:bg-neutral-500/10">
                  <h2 className="font-semibold tracking-tight">{post.title}</h2>
                  <p className="max-w-[95%]">{post.summary}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <Spinner />
        )}
      </div>

      <Separator className="my-5" />

      <Accordion defaultExpandedKeys={["1"]} allowsMultipleExpanded>
        <AccordionEntry id="1" title="What is the Purdue Outing Club?">
          The Purdue Outing Club is pretty much involved with almost any
          activity that takes place in the outdoors. Rock climbing, whitewater
          kayaking, backpacking, hiking, mountaineering, and caving are our main
          activities, but trips are certainly not limited to that. The Outing
          Club functions as a place for people who enjoy the outdoors to meet
          each other and have fun. The club is very informal and anyone is
          welcome at anytime. At our meetings, we go over any business we need
          to take care of, then talk about past trips - usually ones that went
          out the previous weekend. We talk about new trips that are going to be
          going out during the coming weekend, or anytime in the future.
        </AccordionEntry>
        <AccordionEntry id="2" title="Do I need experience?">
          Nope! The Purdue Outing Club is geared towards beginners discovering
          the outdoor world and learning from others along the way.
        </AccordionEntry>
        <AccordionEntry id="3" title="Do I need gear?">
          Besides personal clothing and footwear, the club owns almost all of
          the gear that you would need for any club trip. See the gear closet
          page for more information.
        </AccordionEntry>
        <AccordionEntry id="4" title="How much does it cost?">
          The club dues are $25 for one semester or $30 for the entire year.
          With a paid membership, you can join any official Outing Club trip
          with gear rental included! The only additional costs are for gas and
          sometimes park fees, as well as any food you may choose to purchase on
          the trip.
        </AccordionEntry>
        <AccordionEntry id="5" title="Where do we meet?">
          Meetings are held Mondays at 7:00 PM in the Howard Taylor Conference
          Room of the CoRec. From the front entrace, instead of swiping in at
          the front desk, turn left directly before the front desk and walk down
          the hallway. The room will be on your left. Any changes to meeting
          times will be announced through Slack. There are no meetings during
          the summer.
        </AccordionEntry>
      </Accordion>

      <h2 className="text-4xl m-10 font-bold">SPORTS</h2>
      <Accordion allowsMultipleExpanded>
        <AccordionEntry id="backpacking" title="Backpacking">
          {SPORT_DESCRIPTIONS.Backpacking}
        </AccordionEntry>
        <AccordionEntry id="canoeing" title="Canoeing">
          {SPORT_DESCRIPTIONS.Canoeing}
        </AccordionEntry>
        <AccordionEntry id="caving" title="Caving">
          {SPORT_DESCRIPTIONS.Caving}
        </AccordionEntry>
        <AccordionEntry id="climbing" title="Climbing">
          {SPORT_DESCRIPTIONS.Climbing}
        </AccordionEntry>
        <AccordionEntry id="biking" title="Mountain Biking">
          {SPORT_DESCRIPTIONS.Biking}
        </AccordionEntry>
        <AccordionEntry id="whitewater" title="Whitewater">
          {SPORT_DESCRIPTIONS.Whitewater}
        </AccordionEntry>
        <AccordionEntry id="winter-sports" title="Winter Sports">
          {SPORT_DESCRIPTIONS.WinterSports}
        </AccordionEntry>
      </Accordion>

      <Separator className="mt-24 mb-12" />

      <Link
        className={buttonVariants({
          className: "w-44 h-20 text-lg m-12 rounded-3xl font-bold",
        })}
        href="/join"
      >
        Join
      </Link>
    </section>
  );
}
