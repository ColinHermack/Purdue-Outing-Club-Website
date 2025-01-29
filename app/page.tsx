"use client";

import { Image } from "@heroui/image";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useState, useEffect } from "react";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";

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
        <Image
          alt="A picture from the Outing Club trip to the rocky mountains"
          className="my-5 sm:m-5"
          height={200}
          src="/rocky_mountains.jpg"
        />
        <Image
          alt="A picture of the Outing Club trip leaders."
          className="my-5 sm:m-5"
          height={200}
          src="/trip_leaders.JPG"
        />
        <Image
          alt="A picture from an Outing Club trip to Indiana Dunes."
          className="my-5 sm:m-5"
          height={200}
          src="/beach.jpg"
        />
      </div>
      <p className="m-10 text-center">
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

      <Divider className="my-5" />

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
          <Spinner color="default" />
        )}
      </div>

      <Divider className="my-5" />

      <Accordion defaultExpandedKeys={[1]} selectionMode="multiple">
        <AccordionItem
          key={1}
          aria-label="what-is-the-poc"
          title="What is the Purdue Outing Club?"
        >
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
        </AccordionItem>
        <AccordionItem
          key={2}
          aria-label="do-need-experience"
          title="Do I need experience?"
        >
          Nope! The Purdue Outing Club is geared towards beginners discovering
          the outdoor world and learning from others along the way.
        </AccordionItem>
        <AccordionItem
          key={3}
          aria-label="do-need-gear"
          title="Do I need gear?"
        >
          Besides personal clothing and footwear, the club owns almost all of
          the gear that you would need for any club trip. See the gear closet
          page for more information.
        </AccordionItem>
        <AccordionItem
          key={4}
          aria-label="how-much-cost"
          title="How much does it cost?"
        >
          The club dues are $25 for one semester or $30 for the entire year.
          With a paid membership, you can join any official Outing Club trip
          with gear rental included! The only additional costs are for gas and
          sometimes park fees, as well as any food you may choose to purchase on
          the trip.
        </AccordionItem>
        <AccordionItem
          key={5}
          aria-label="where-meet"
          title="Where do we meet?"
        >
          Meetings are held Mondays at 7:00 PM in the Howard Taylor Conference
          Room of the CoRec. From the front entrace, instead of swiping in at
          the front desk, turn left directly before the front desk and walk down
          the hallway. The room will be on your left. Any changes to meeting
          times will be announced through Slack. There are no meetings during
          the summer.
        </AccordionItem>
      </Accordion>

      <h2 className="text-4xl m-10 font-bold">SPORTS</h2>
      <Accordion selectionMode="multiple">
        <AccordionItem key={1} aria-label="Backpacking" title="Backpacking">
          Backpacking is an outdoor activity wherein a participant packs all of
          his or her gear into a backpack. This gear may include food, water,
          and shelter, or the means to obtain them, and often little else. Since
          each item must be carried, weight is a very important factor in
          equipment and supply choices and options.Backpacking trips may consist
          of just an overnight stay, a weekend (one or two nights), or an
          extended length, as in long-distance expeditions of a weeks or months,
          sometimes aided by planned food and supply drops. A backpacking trip
          without an overnight stay is considered a day hike.
        </AccordionItem>
        <AccordionItem key={2} aria-label="Canoeing" title="Canoeing">
          Canoeing is an activity which involves paddling a canoe with a
          single-bladed paddle. A few of the recreational forms of canoeing are
          canoe camping and canoe racing. Other forms include a wide range of
          canoeing on lakes, rivers, oceans, ponds and streams. The Purdue
          Outing Club offers canoeing day trips and multi-day canoepacking
          trips.
        </AccordionItem>
        <AccordionItem key={3} aria-label="Caving" title="Caving">
          Caving is the exploration of underground caverns. It can include
          walking, crawling, rappelling, and climbing. The enjoyment comes from
          getting away from this wonder of concrete and red brick, challenging
          yourself physically and mentally, seeing the beauty of the formations,
          and generally getting really dirty. You may have heard caving referred
          to as spelunking. Many cavers prefer to say &#39;caving&#39; instead
          of &#39;spelunking&#39;; however, it&#39;s the same thing.
        </AccordionItem>
        <AccordionItem key={4} aria-label="Climbing" title="Climbing">
          Rock climbing is a sport in which participants climb up or across
          natural rock formations or artificial rock walls. The goal is to reach
          the summit of a formation or the endpoint of a pre-defined route
          without falling. Rock climbing is a physically and mentally demanding
          sport, one that often tests a climber&#39;s strength, endurance,
          agility and balance along with his mental control. It can be a
          dangerous sport and knowledge of proper climbing techniques and usage
          of specialized climbing equipment is crucial for the safe completion
          of routes.
        </AccordionItem>
        <AccordionItem
          key={5}
          aria-label="Mountain Biking"
          title="Mountain Biking"
        >
          Mountain biking (abbr. MTB) is a sport of riding bicycles off-road,
          often over rough terrain, usually using specially designed mountain
          bikes. Mountain bikes share similarities with other bikes but
          incorporate features designed to enhance durability and performance in
          rough terrain, such as air or coil-sprung shocks used as suspension,
          larger and wider wheels and tires, stronger frame materials, and
          mechanically or hydraulically actuated disc brakes. The Purdue Outing
          Club offers indoor mountain biking trips during the winter.
        </AccordionItem>
        <AccordionItem key={6} aria-label="Whitewater" title="Whitewater">
          This is the sport of paddling a kayak on a river with a good degree of
          water running through it. Whitewater kayaking can range from simple,
          gently moving water, to demanding, dangerous whitewater. River rapids
          are graded like ski runs according to the difficulty, danger, or
          severity of the rapid.
        </AccordionItem>
        <AccordionItem key={7} aria-label="Winter Sports" title="Winter Sports">
          Winter sports can involve many of the above sports, but performed
          during the winter. This can present unique challenges that are not
          present during the rest of the year, like dealing with freezing water,
          heavy snow, or otherwise inclement weather. The Purdue Outing Club
          generally offers snowshoeing, cross-country skiing, and winter
          backpacking.
        </AccordionItem>
      </Accordion>

      <Button
        as={Link}
        className="bg-amber-400 text-black w-44 h-20 text-lg m-12 rounded-3xl font-bold"
        href="/join"
        variant="flat"
      >
        Join
      </Button>
    </section>
  );
}
