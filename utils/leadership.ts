"use server";

const { Pool, QueryResult } = require("pg"); //PostgreSQL

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

interface OfficerData {
  ImagePath: string;
  GearHours?: string;
}

export interface Officer {
  position: string;
  officer_data: OfficerData;
  name: string;
  email: string;
  pronouns: string;
  phone: string;
}

const leadershipCategories = [
  {
    branch: "Executive",
    positions: ["President", "Vice President"],
  },
  {
    branch: "Administrative",
    positions: [
      "Secretary of Sports",
      "Secretary of Treasury",
      "Secretary of Outreach",
      "Treasurer",
      "Health & Safety",
    ],
  },
  {
    branch: "Public Relations",
    positions: [
      "Alumni Coordinator",
      "Fundraising & Sponsorship",
      "Diversity & Community Outreach",
      "Social Media Coordinator",
      "Social Events Coordinator",
      "Webmaster",
      "Data Analyst",
      "Club Goober",
      "Cheese Consultant"
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

export async function getLeaderDataByPosition(
  position: string,
): Promise<Officer | undefined> {
  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT officer.position, 
                officer.officer_data,
                member.name, 
                member.email, 
                member.pronouns, 
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id
            WHERE officer.position = $1;`,
      [position],
    );
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }

  if (result === null || result.rows.length === 0) {
    return undefined;
  } else {
    return result.rows[0];
  }
}

export async function getLeaderData() {
  interface BranchData {
    label: string;
    content: Officer[];
  }

  let allData: BranchData[] = [
    {
      label: "Executive",
      content: [],
    },
    {
      label: "Administrative",
      content: [],
    },
    {
      label: "Public Relations",
      content: [],
    },
    {
      label: "Event Planning",
      content: [],
    },
    {
      label: "Backpacking",
      content: [],
    },
    {
      label: "Canoeing",
      content: [],
    },
    {
      label: "Caving",
      content: [],
    },
    {
      label: "Climbing",
      content: [],
    },
    {
      label: "Fishing",
      content: [],
    },
    {
      label: "Mountain Biking",
      content: [],
    },
    {
      label: "Whitewater",
      content: [],
    },
    {
      label: "Winter Sports",
      content: [],
    },
    {
      label: "Gear",
      content: [],
    },
    {
      label: "Advisors",
      content: [],
    },
  ];

  let result: typeof QueryResult = null;
  const client = await pool.connect();

  try {
    result = await client.query(
      `SELECT officer.position, 
                officer.officer_data,
                member.name, 
                member.email, 
                member.pronouns, 
                member.phone
            FROM officer
            JOIN member ON officer.member_id = member.member_id`,
    );
  } catch (error: any) {
    //Intentionally left blank
  } finally {
    client.release();
  }

  for (let i = 0; i < leadershipCategories.length; i++) {
    for (let j = 0; j < leadershipCategories[i].positions.length; j++) {
      for (let k = 0; k < result.rows.length; k++) {
        if (result.rows[k].position === leadershipCategories[i].positions[j]) {
          allData[i].content.push(result.rows[k]);
        }
      }
    }
  }

  return allData;
}
