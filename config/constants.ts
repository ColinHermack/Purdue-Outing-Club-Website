/**
 * Sitewide constant values that will be used in multiple locations.
 *
 * @author Colin Hermack
 */

export const BASE_URL = "https://purdueoutingclub.com";

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
  "Spring Break"
];

interface ITripDifficultyDescriptions {
  [key: string]: string[];
}

export const tripDifficultyDescriptions: ITripDifficultyDescriptions = {
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
