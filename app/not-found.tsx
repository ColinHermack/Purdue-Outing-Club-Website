import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import {Image} from "@nextui-org/image";
 
export default function NotFound() {
  return (
    <div className='flex flex-col justify-top items-center'>
      <h1 className='text-5xl text-amber-400 font-bold'>Error 404</h1>
      <Image
        width={400}
        alt='Obi-Wan Kenobi'
        src='/archives.png'
        className='my-12'
      />
      <p className='my-10'>Looks like you've lost track of the trail. </p>
      <Button as={Link} className='bg-amber-400 text-amber-800 my-10' href="/" variant="flat">
            Return To Base Camp
      </Button>
    </div>
  )
}