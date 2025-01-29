import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Image } from "@heroui/image";

export default function NotFound() {
  return (
    <div className="flex flex-col justify-top items-center">
      <h1 className="text-5xl text-amber-400 font-bold">Error 404</h1>
      <Image
        alt="Obi-Wan Kenobi"
        className="my-12"
        src="/archives.png"
        width={400}
      />
      <p className="my-10">Looks like you&#39;ve lost track of the trail. </p>
      <Button
        as={Link}
        className="bg-amber-400 text-amber-800 my-10"
        href="/"
        variant="flat"
      >
        Return To Base Camp
      </Button>
    </div>
  );
}
