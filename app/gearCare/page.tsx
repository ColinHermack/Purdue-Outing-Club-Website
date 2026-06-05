/**
 * This page provides gear care information.
 *
 * @author Eli
 */

import { Divider } from "@heroui/divider";

export default function GearCarePage() {
  return (
    <div className="flex flex-col justify-top items-center">
      <title>Gear Care - Purdue Outing Club</title>
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Gear Care Information
      </h1>

      <Divider className="mt-10" />
      <h2 className="font-bold text-center w-3/4 my-10 text-xl">Tents</h2>
      <p className="text-center w-3/4">
        If your tent gets wet on the trip (which it most likely will due to
        condensation after you sleep inside of it), take it out of its stuff
        sack and lay it out to dry before returning it. If you aren&apos;t able
        to do this due to space constraints, talk to the gear gremlins or gear
        lord. Tents can usually be left out to dry in the gear closet if needed.
        If the tent was damaged on the trip (broken pole, broken stake, torn
        fabric, etc) it is important to report this when you return it so that
        the next person who checks it out isn&apos;t stranded with a broken
        tent.
      </p>

      <Divider className="mt-10" />
      <h2 className="font-bold text-center w-3/4 my-10 text-xl">
        Sleeping Bags
      </h2>
      <p className="text-center w-3/4">
        Similarly to tents, your sleeping bag will likely get damp from
        condensation and needs to be dried out before returning it to the
        closet. Hang it up for a day with the zipper opened before returning it
        so that it can dry out.
      </p>

      <Divider className="mt-10" />
      <h2 className="font-bold text-center w-3/4 my-10 text-xl">Backpacks</h2>
      <p className="text-center w-3/4">
        Make sure to check your backpack for any trash or personal belongings
        before returning it to the closet. If your backpack gets dirty, you can
        wipe it down with a damp rag.
      </p>

      <Divider className="mt-10" />
      <h2 className="font-bold text-center w-3/4 my-10 text-xl">Stoves</h2>
      <p className="text-center w-3/4">
        Trip leaders will typically check out stoves for everyone on their trip
        to share, but it doesn&apos;t hurt to know how to use one. Check out the
        video below.
      </p>
      <iframe
        className="w-3/4 md:w-1/3 h-[300px] mt-10 rounded-lg"
        src="https://www.youtube.com/embed/i5o27F8bJ-c"
        title="how to use a camp stove video"
      />
    </div>
  );
}
