import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Link2, ScanFace, Search, Shield, ShoppingBag, Terminal } from "lucide-react";
import Link from "next/link";

import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Marquee from "@/components/magicui/marquee";
import { ShinyButton } from "@/components/magicui/shiny-button";
import { Button } from "@/components/ui/button";

const features = [
  {
    Icon: Shield,
    name: "Guild Spotlight",
    description: "Ravenwood Ronins are recruiting! Join a top-tier raiding family today.",
    href: "/guilds",
    cta: "Join Guild",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    Icon: ShoppingBag,
    name: "Market Watch",
    description: "Live: Piggle w/ Quint Damage sold for 50 Empowers.",
    href: "/marketplace",
    cta: "Trade Now",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-span-1 lg:row-span-2",
  },
  {
    Icon: ScanFace,
    name: "Wizard Scanner",
    description: "Who is that? Scan any wizard's gear and stats instantly.",
    href: "/scanner",
    cta: "Launch Scanner",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-span-1 lg:row-span-1",
  },
  {
    Icon: Search,
    name: "The Library",
    description: "Browse guides, cheetsheets, and lore.",
    href: "/scribe", // Placeholder route
    cta: "Read More",
    background: <div className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-span-1 lg:row-span-1",
  },
];

const reviews = [
  {
    name: "Valdus Hexbreaker",
    username: "@valdus",
    body: "Found my dream guild here. Finally cleared Darkmoor!",
    img: "https://avatar.vercel.sh/valdus",
  },
  {
    name: "Sierra Mist",
    username: "@sierra",
    body: "Sold my empowers in 5 minutes. Way better than the Commons.",
    img: "https://avatar.vercel.sh/sierra",
  },
  {
    name: "Wolf Storm",
    username: "@wolf",
    body: "The scanner is legit magic. How does it know??",
    img: "https://avatar.vercel.sh/wolf",
  },
  {
    name: "Esmee Fire",
    username: "@esmee",
    body: "Finally a place that remembers my pets.",
    img: "https://avatar.vercel.sh/esmee",
  },
];

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className="relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4
      border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]
      dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32">
        <div className="space-y-4">
          <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
            Alpha v0.2.0 - The Commons Update
          </div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
            The Pulse of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">
              The Spiral
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            The centralized home for Wizard101. Find your guild, trade your treasures, and immortalize your journey. 
            Stop scrolling Discord. Start building legacy.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/guilds">
            <ShinyButton className="bg-primary/10">Join a Guild</ShinyButton>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" size="lg">Explore Market</Button>
          </Link>
        </div>
        
        {/* Marquee Pulse */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background pt-8">
            <Marquee pauseOnHover className="[--duration:20s]">
                {reviews.map((review) => (
                <ReviewCard key={review.username} {...review} />
                ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
        </div>
      </section>

      {/* Bento Grid Hub */}
      <section className="container mx-auto px-4 pb-24">
        <h2 className="mb-8 text-3xl font-bold tracking-tight">The Commons</h2>
        <BentoGrid className="lg:grid-rows-2">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </section>
    </div>
  );
}
