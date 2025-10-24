/**
 * This file contains the site configuration for the Purdue Outing Club website.
 *
 * @author Colin Hermack
 */

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Purdue Outing Club",
  description: "The official website of the Purdue Outing Club",
  navItems: [
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Trips",
      href: "/trips",
    },
    {
      label: "Pleadership",
      href: "/pleadership",
    },
    {
      label: "FAQ",
      href: "/faq",
    },
    {
      label: "Gear Closet",
      href: "/gearcloset",
    },
    {
      label: "Climbing Team",
      href: "/climbingteam",
    },
    {
      label: "POCAR",
      href: "/pocar",
    },
    {
      label: "Support Us",
      href: "/supportus",
    },
  ],
  footerItems: [
    {
      label: "Constitution",
      href: "/docs/poc_constitution.pdf",
    },
    {
      label: "News",
      href: "/news",
    },
    {
      label: "Diversity and Inclusion",
      href: "/diversity",
    },
    {
      label: "Trip Leaders",
      href: "/tripleaders",
    },
    {
      label: "Merch",
      href: "https://www.toocoolpurdue.com/TooCOOLPurdueWL/vECItemCatalogOrganizationItems/OrganizationItemsGallery.aspx?Organization=1231",
    },
    {
      label: "Alumni",
      href: "https://sites.google.com/view/purdueoutingclub-alumni/Welcome",
    },
    {
      label: "Sponsorship",
      href: "/sponsorship",
    },
    {
      label: "Request Reimbursement",
      href: "https://docs.google.com/forms/d/e/1FAIpQLSc_w1PuFjQ-N3QhX6uVUwwywuJ8HhHmjLUh40VyisTqj25hiA/viewform",
    },
  ],
  links: [
    {
      label: "instagram",
      href: "https://www.instagram.com/purdue.outing.club/",
    },
    {
      label: "youtube",
      href: "https://www.youtube.com/@TheOutingClub",
    },
    {
      label: "facebook",
      href: "https://www.facebook.com/groups/PurdueOutingClub/",
    },
    {
      label: "slack",
      href: "https://join.slack.com/t/purdueouting/shared_invite/zt-2tpkpjw5z-aSz~8H_6YWb5mYjn85xYZA",
    },
    {
      label: "linkedin",
      href: "https://www.linkedin.com/company/purdueoutingclub/about/",
    },
    {
      label: "boilerlink",
      href: "https://boilerlink.purdue.edu/organization/outingclub",
    },
  ],
};
