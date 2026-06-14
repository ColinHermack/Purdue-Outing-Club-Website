import { Link, buttonVariants } from "@heroui/react";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold">Error 404</h1>
      <img
        alt="Obi-Wan Kenobi"
        className="my-12 rounded-large"
        src="/archives.png"
        width={400}
      />
      <p className="my-10">Looks like you&#39;ve lost track of the trail. </p>
      <Link className={buttonVariants({ className: "my-10" })} href="/">
        Return To Base Camp
      </Link>
    </div>
  );
}
