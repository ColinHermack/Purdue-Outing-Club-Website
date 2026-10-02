/**
 * Sitewide constant values that will be used in multiple locations.
 *
 * @author Colin Hermack
 */

export const BASE_URL = "https://purdueoutingclub.com";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export const DIFFICULTIES = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
] as const;

export const SPORTS = [
  "Backpacking",
  "Canoeing",
  "Caving",
  "Climbing",
  "Mountain Biking",
  "Whitewater",
  "Winter Sports",
  "Fishing",
  "Labor Day",
  "POCtoberfest",
  "Spring Break",
  "Aproberfest",
];

export const PSEUDO_SPORTS = [
  'Labor Day',
  'POCtoberfest',
  'Spring Break',
  'Aproberfest'
];

interface ITripDifficultyDescriptions {
  [key: string]: string[];
}

export const TRIP_DIFFICULTY_DESCRIPTIONS: ITripDifficultyDescriptions = {
  Backpacking: [
    "No previous experience required. May entail mostly flat trails, shorter distances, and instruction from trip leaders.",
    "Some previous experience recommended. May entail more elevation and more distance covered per day. Could be your first trip if you have camp skills and are physically fit enough.",
    "More suitable for someone who has been on several multi-night backpacking trips. May include steeper elevations and more technical trails.",
    "Suitable for people with significant backpacking experience. Could include significant elevation changes, high mileage, and extreme weather.",
  ],
  Canoeing: [
    "No previous experience needed.",
    "Some previous canoeing and camping experience recommended.",
  ],
  Caving: [
    "Easier caves with a few squeezes. There may be a size requirement. Cannot be claustrophobic.",
    "May include longer periods of crawling (two or more minutes in a confined space), and numerous technicaly manuevers. May have a size requirement. Can be a first trip for someone who is physically fit.",
    "Long, tight crawls (20 minutes or more). Technical manuevers with significant risk required. Previous caving experience is a must.",
    "Idk like cave diving or something",
  ],
  Climbing: ["Different walls and routes suitable for all skill levels."],
  Fishing: ["No previous experience needed."],
  "Mountain Biking": [
    "Wider trails with fewer obstacles available for beginners. Suitable for all skill levels.",
    "Trails may be narrower with more obstacles. Some mountain biking experience recommended.",
    "Many unavoidable obstacles that may need to be navigated at high speed. Mountain biking experience is essential.",
    "High chance of ending up in the back of an ambulance by the end of the day.",
  ],
  Whitewater: [
    "No previous experience with whitewater required. Must be able to roll for kayaking trips. Must also be able to swim.",
    "Rapids that may be more difficult to navigate. Expect to get wet.",
    "More turbulent water and restricted passages that require you to make quick and precise moves.",
    "Suitable only for very experienced rafters who are capable of self rescue in dangerous situations.",
  ],
  "Winter Sports": [
    "No previous experience required. May entail mostly flat trails, shorter distances, and instruction from trip leaders.",
    "Some previous experience recommended. May entail more elevation and more distance covered per day. Could be your first trip if you have camp skills and are physically fit enough.",
    "More suitable for someone who has been on several multi-night trips. May include steeper elevations and more technical trails.",
    "Suitable for people with significant experience. Could include significant elevation changes, high mileage, and extreme weather.",
  ],
  Hiking: [
    "No previous experience needed. Mostly flat trails and shorter distances.",
    "May include longer distances or more technical trails with elevation changes.",
    "Long distances and steeper elevation changes.",
    "Extreme distances, terrain, or weather.",
  ],
};

export const LEADERSHIP_CATEGORIES = [
  {
    branch: "Executive",
    positions: ["President", "Vice President"],
  },
  {
    branch: "Administrative",
    positions: [
      "Secretary of Sports",
      "Secretary of Operations",
      "Secretary of Outreach",
      "Health & Safety Officer",
    ],
  },
  {
    branch: "Operations",
    // Treasurer temporarily hidden from the pleadership page.
    positions: ["Treasurer", "Webmaster", "Data Analyst"],
  },
  {
    branch: "Outreach",
    positions: [
      "Alumni Coordinator",
      "Fundraising & Sponsorship",
      "Diversity & Community Outreach",
      "Social Media Coordinator",
      "Social Events Coordinator",
      "Graduate & Nontraditional Member Coordinator",
      "Club Goober",
    ],
  },
  {
    branch: "Event Planning",
    positions: [
      "POCAR Race Coordinator",
      "POCAR Volunteer Coordinator",
      "POCAR Registration Coordinator",
      "POCtoberfest Coordinator",
    ],
  },
  {
    branch: "Backpacking",
    positions: ["Head Backpacking Officer", "Backpacking Officer"],
  },
  {
    branch: "Canoeing",
    positions: ["Head Canoeing Officer", "Canoeing Officer"],
  },
  {
    branch: "Caving",
    positions: ["Head Caving Officer", "Caving Officer"],
  },
  {
    branch: "Climbing",
    positions: [
      "Head Climbing Officer",
      "Climbing Team Captain",
      "Climbing Officer",
    ],
  },
  {
    branch: "Fishing",
    positions: ["Chief Angler"],
  },
  {
    branch: "Mountain Biking",
    positions: ["Head Mountain Biking Officer", "Mountain Biking Officer"],
  },
  {
    branch: "Whitewater",
    positions: ["Head Whitewater Officer", "Whitewater Officer"],
  },
  {
    branch: "Winter Sports",
    positions: ["Head Winter Sports Officer", "Winter Sports Officer"],
  },
  {
    branch: "Gear",
    positions: ["Gear Lord", "Gear Gremlin"],
  },
  {
    branch: "Advisors",
    positions: ["Primary Advisor", "Advisor Emeritus/Club Elder"],
  },
];

export const SPORT_DESCRIPTIONS: { [key: string]: string } = {
  Backpacking: `Backpacking is an outdoor activity wherein a participant packs all of
          his or her gear into a backpack. This gear may include food, water,
          and shelter, or the means to obtain them, and often little else. Since
          each item must be carried, weight is a very important factor in
          equipment and supply choices and options. Backpacking trips may consist
          of just an overnight stay, a weekend (one or two nights), or an
          extended length.`,
  Canoeing: `Canoeing is an activity which involves paddling a canoe with a
          single-bladed paddle. The Purdue Outing Club offers canoeing day trips 
          and multi-day canoepacking trips.`,
  Caving: `Caving is the exploration of underground caverns in search of cool rock formations
          or underground creatures. You may have heard caving referred
          to as spelunking. Many cavers prefer to say 'caving' instead
          of 'spelunking'; however, it's the same thing.`,
  Climbing: `Rock climbing is a sport in which participants climb up or across
          natural rock formations or artificial rock walls. The goal is to reach
          the summit of a formation or the endpoint of a pre-defined route.
          Rock climbing is a physically and mentally demanding
          sport, one that often tests a climber's strength, endurance,
          agility and balance along with his mental control.`,
  Biking: `Mountain biking is a sport of riding bicycles off-road,
          often over rough terrain, usually using specially designed mountain
          bikes. Mountain bikes share similarities with other bikes but
          incorporate features designed to enhance durability and performance in
          rough terrain, such as air or coil-sprung shocks used as suspension,
          larger and wider wheels and tires, stronger frame materials, and
          mechanically or hydraulically actuated disc brakes. The Purdue Outing
          Club offers indoor mountain biking trips during the winter.`,
  Whitewater: `This is the sport of paddling a kayak on a river with a good degree of
          water running through it. Whitewater kayaking can range from simple,
          gently moving water, to demanding, dangerous whitewater. River rapids
          are graded like ski runs according to the difficulty, danger, or
          severity of the rapid.`,
  WinterSports: `Winter sports can involve many of the above sports, but performed
          during the winter. This can present unique challenges that are not
          present during the rest of the year, like dealing with freezing water,
          heavy snow, or otherwise inclement weather. The Purdue Outing Club
          generally offers snowshoeing, cross-country skiing, and winter
          backpacking.`,
  Fishing: `Fishing is the practice of catching fish either for food or with the intent of releasing
            them back into the wild. The Purdue Outing Club offers catch-and-release fishing trips.`
};
