# Purdue Outing Club Website

This is a full-stack web application used for the management of Purdue Outing Club trip and member data. Some of the functions of this website are the following:

## Features
- Homepage with pictures and videos of club events, club news, frequently asked questions, and information on club sports
- Calendar of events (powered by Google Calendar)
- Trip pages with signups
- Leadership page with contact information for all officers
- FAQ page with answers to the questions that we get asked most commonly on Slack and by email
- Gear closet page with gear hours listed
- POCAR page with general information and signup information
- Join page with detailed instructions for joining the club
- Club constitution
- Information on becoming a trip leader
- Links to the merch store and alumni newsletter
- Sponsorship page to hopefully attract more sponsors

## Future Features
- Trip recaps linked directly to trip pages
- An interactive map with markers indicating all of the trip destinations

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Google Calendar](calendar.google.com)

## Documentation
Each subdirectory of the main project directory has its own README explaining what it contains. Code files whose purpose
is not immediately obvious have a block comment explaining what they do.
[NextJS Documentation](https://nextjs.org/docs/getting-started) for an in-depth explanation of NextJS and how it works.

## How to Contribute

### Clone the GitHub repository

Begin by cloning the GitHub repository into a local directory.

```bash
git clone https://github.com/ColinHermack/Outing-Club-Website-Prototype
```

### Install dependencies

Run the following command to install NPM packages:

```bash
npm install --legacy-peer-deps
```

### Run the development server

```bash
npm run dev
```

### Create a feature branch
```git
git branch myfeaturebranch
```

### Create a pull request on GitHub
Create a pull request to merge your feature branch with main. It will have to successfully deploy and be reviewed
by the webmaster before merging.

## Deployment Information
This app is deployed on Vercel and deploys automatically whenever a pull request is accepted.

## Contributors
* Colin Hermack (Webmaster Fall 2024 - Present)
    * Designed/developed all frontend and backend software
    * Deployed the site
    * Currently maintains the site
    * Coordinated website development
* Arjun Khandelwal (Data Analyst Fall 2024/Secretary of Operations Spring 2025 - Present)
    * Designed/developed the database portion of the backend
    * Designed various forms for backend data handling
* Colin Newton (Treasurer Fall 2023/Spring 2024/Fall 2024)
    * Oversaw all development activities
    * Designed and built backend forms, macros, and data pipelines.
* Ainsley Yates (Data Analyst Spring 2025 - Present)
    * Maintains the database portion of the backend
