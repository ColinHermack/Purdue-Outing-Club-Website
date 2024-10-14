"use client"

import { Image } from "@nextui-org/image";
import { Divider } from "@nextui-org/divider";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-top">
      <div className="text-5xl text-amber-400 font-bold text-center">PURDUE OUTING CLUB</div>
      <div className='flex flex-col justify-top items-center mt-10 lg:flex-row lg:justify-center'>
        <Image
          height={200}
          src="/rocky_mountains.jpg"
          alt="A picture from the Outing Club trip to the rocky mountains"
          className="m-5"
        />
        <Image
          height={200}
          src="/trip_leaders.JPG"
          alt="A picture of the Outing Club trip leaders."
          className="m-5"
        />
        <Image
          alt="A picture from an Outing Club trip to Indiana Dunes."
          className="m-5"
          height={200}
          src="/beach.jpg"
        />
      </div>
      <p className="m-10 text-center">
        The Purdue Outing Club is involved with any activity that involves the outdoors. It is a place for people who 
        enjoy the outdoors to meet each other and have fun. The club is open to Purdue University students as members, 
        but we often communicate with alumni and outdoor professionals across the country.
      </p>
      <iframe
        src="https://www.youtube.com/embed/05dKVZUYwSY"
        width={350}
        height={200}
        className='mb-10 rounded-lg'
      />
      <Divider />
      <h2 className='text-4xl m-10 font-bold'>SPORTS</h2>
      <Accordion selectionMode='multiple'>
        <AccordionItem key={1} aria-label='Backpacking' title='Backpacking'>
          Backpacking is an outdoor activity wherein a participant packs all of his or her gear into a backpack. This gear
          may include food, water, and shelter, or the means to obtain them, and often little else. Since each item must 
          be carried, weight is a very important factor in equipment and supply choices and options.Backpacking trips may 
          consist of just an overnight stay, a weekend (one or two nights), or an extended length, as in long-distance 
          expeditions of a weeks or months, sometimes aided by planned food and supply drops. A backpacking trip without 
          an overnight stay is considered a day hike.
        </AccordionItem>
        <AccordionItem key={2} aria-label='Canoeing' title='Canoeing'>
          Canoeing is an activity which involves paddling a canoe with a single-bladed paddle.
          A few of the recreational forms of canoeing are canoe camping and canoe racing. Other forms include a wide 
          range of canoeing on lakes, rivers, oceans, ponds and streams.
          The Purdue Outing Club offers canoeing day trips and multi-day canoepacking trips.
        </AccordionItem>
        <AccordionItem key={3} aria-label='Caving' title='Caving'>
          Caving is the exploration of underground caverns. It can include walking, crawling, rappelling, and climbing. 
          The enjoyment comes from getting away from this wonder of concrete and red brick, challenging yourself physically 
          and mentally, seeing the beauty of the formations, and generally getting really dirty. You may have heard caving 
          referred to as spelunking. Many cavers prefer to say 'caving' instead of 'spelunking'; however, it's the same thing. 
        </AccordionItem>
        <AccordionItem key={4} aria-label='Climbing' title='Climbing'>
          Rock climbing is a sport in which participants climb up or across natural rock formations or artificial rock walls.
          The goal is to reach the summit of a formation or the endpoint of a pre-defined route without falling. Rock climbing 
          is a physically and mentally demanding sport, one that often tests a climber's strength, endurance, 
          agility and balance along with his mental control. It can be a dangerous sport and knowledge of proper climbing 
          techniques and usage of specialized climbing equipment is crucial for the safe completion of routes.
        </AccordionItem>
        <AccordionItem key={5} aria-label='Mountain Biking' title='Mountain Biking'>
          Mountain biking (abbr. MTB) is a sport of riding bicycles off-road, often over rough terrain, usually using 
          specially designed mountain bikes. Mountain bikes share similarities with other bikes but incorporate features 
          designed to enhance durability and performance in rough terrain, such as air or coil-sprung shocks used as 
          suspension, larger and wider wheels and tires, stronger frame materials, and mechanically or hydraulically 
          actuated disc brakes. The Purdue Outing Club offers indoor mountain biking trips during the winter.
        </AccordionItem>
        <AccordionItem key={6} aria-label='Whitewater' title='Whitewater'>
          This is the sport of paddling a kayak on a river with a good degree of water running through it. Whitewater 
          kayaking can range from simple, gently moving water, to demanding, dangerous whitewater. River rapids are graded 
          like ski runs according to the difficulty, danger, or severity of the rapid.
        </AccordionItem>
        <AccordionItem key={7} aria-label='Winter Sports' title='Winter Sports'>
          Winter sports can involve many of the above sports, but performed during the winter. This can present unique
          challenges that are not present during the rest of the year, like dealing with freezing water, heavy snow,
          or otherwise inclement weather. The Purdue Outing Club generally offers snowshoeing, cross-country skiing, and
          winter backpacking.
        </AccordionItem>
      </Accordion>
      <Divider className='m-10' />
      <h2 className='text-4xl font-bold'>FAQ</h2>
      <Accordion selectionMode='multiple'>
        <AccordionItem key={1} aria-label='do-need-experience' title='Do I need experience?'>
          Nope! The Purdue Outing Club is geared towards beginners discovering the outdoor world and learning from 
          others along the way. 
        </AccordionItem>
        <AccordionItem key={2} aria-label='how-much-cost' title='How much does it cost?'>
          The club dues are $25 for one semester or $30 for the entire year. With a paid membership, you can join any official Outing Club trip with gear rental included!
        </AccordionItem>
        <AccordionItem key={3} aria-label='where-meet' title='Where do we meet?'>
          Meetings are held Mondays at 7:00 PM in the Howard Taylor Conference Room of the CoRec. From the front 
          entrace, instead of swiping in at the front desk, turn left directly before the front desk and walk down the 
          hallway. The room will be on your left. Any changes to meeting times will be announced through Slack.
          There are no meetings during the summer.
        </AccordionItem>
      </Accordion>
      <Divider />
      <h2 className='text-4xl m-10 font-bold'>JOIN HERE</h2>
      <Button as={Link} className='bg-amber-400 text-amber-800 w-44 h-20 text-lg' href="/join" variant="flat">
            Join
      </Button>
      <Divider className='mt-10' />
    </section>
  );
}
