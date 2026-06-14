/**
 * This page contains information on the officers and leadership of the Purdue Outing Club. Note that this is a server
 * component, so it will only be rendered when the site is built.
 *
 * @author Colin Hermack
 */

import { Separator, Card, Link, buttonVariants } from "@heroui/react";
import { MdEmail } from "react-icons/md";

import { getLeaderData} from "@/miniservices/officerMiniService";
import { BranchData, Officer } from "@/utils/leadership";

export const metadata = {
  title: "Pleadership",
  description: "Officers and leadership of the Purdue Outing Club.",
};

function LeaderCard(props: { officer: Officer }) {
  return (
    <Card
      key={props.officer.name}
      className="py-4 m-4 w-[250px] h-48 flex flex-col justify-between items-center"
    >
      {/*}
      TODO: Uncomment images at the end of the summer
      <div className="relative w-[200px] h-[200px]">
        {
          props.officer.officerData.ImagePath != null ? 
          <Image
            alt={props.officer.name}
            className="rounded-xl object-cover w-[200px] h-[200px]"
            fill={true}
            sizes="200px"
            src={`/leadership/${props.officer.officerData.ImagePath}`}
          />
          : null
        }
      </div>
      {*/}
      <div className="pb-0 pt-2 px-4 flex-col justify-top items-center text-center">
        <p className="font-bold text-xl text-center">{props.officer.name}</p>
        <p className="text-default-500 text-tiny text-center">
          {props.officer.pronouns}
        </p>
        <p className="text-sm font-bold text-center pt-2 uppercase text-amber-400">
          {props.officer.position}
        </p>
        <Link
          className={buttonVariants({
            isIconOnly: true,
            size: "sm",
            className: "text-xl mt-4",
          })}
          href={`mailto:${props.officer.email}`}
        >
          <MdEmail />
        </Link>
      </div>
    </Card>
  );
}

export default async function Pleadership() {
  const data: BranchData[] = await getLeaderData();

  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold text-center">
        Pleadership
      </h1>
      <Separator className="mt-8 mb-4 w-[90vw]" />
      <div className="w-full flex-row justify-center items-center" />
      <div className="flex flex-col w-screen justify-top items-center text-xl">
        {data.map((item) => {
          return (
            <div
              key={item.label}
              className="flex flex-col justify-top items-center"
            >
              <h2 className="m-12 text-2xl font-bold text-amber-400">
                {item.label}
              </h2>
              <div className="w-full flex flex-wrap justify-center items-center">
                {item.content.map((currOfficer) => {
                  return (
                    <LeaderCard key={`${currOfficer.position}: ${currOfficer.name}`} officer={currOfficer} />
                  );
                })}
              </div>
              <Separator className="w-[90vw] mt-8 mb-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
