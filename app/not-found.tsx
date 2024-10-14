import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import {Image} from "@nextui-org/image";
 
export default function NotFound() {
  return (
    <div className='flex flex-col justify-top items-center'>
      <div className="text-5xl text-amber-400 font-bold text-center">ERROR 404</div>
      <Image
        width={400}
        alt='Obi-Wan Kenobi'
        src='/archives.png'
        className='mt-10'
      />
      <p className='m-10'>Could not find requested resource</p>
      <Button as={Link} className='bg-amber-400 text-amber-800' href="/" variant="flat">
            Return Home
      </Button>
    </div>
  )
}