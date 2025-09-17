import {Button, Link, Image} from '@heroui/react';

export default function DriverPage() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 md:py-10">
            <h1 className="text-5xl text-amber-400 font-bold text-center">Driver Certification Process</h1>
            <p className='text-center max-w-[600px]'>
                Do you have a valid US driver's license? Want to increase your chances of getting on trips? You can
                become a certified driver with Purdue risk management.
            </p>

            <h2 className='text-2xl font-bold text-center'>Step 1: Purdue Form</h2>
            <p className='max-w-[600px] text-center'>
                First, you should fill out the Purdue driver certification form with Samba Safety.
            </p>
            <p className='max-w-[600px] text-center'>
                On the second page of the form, you will be asked for additional information about the organization.
                Use this template as a guide to complete that part of the form. Be sure to include your respective campus
                (PWL or PUI).
            </p>
            <Image src={'/samba_example.png'} alt='' width={400} height={'auto'} className='my-8' />
            <Button 
                as={Link}
                isExternal={true}
                href={'https://enroll.sambasafety.com/index.html?Z3VpZD1iNzE0MGNjYmQwYjM0NGExYTU4ODE4MzU4OTQzZGNjOSZmbG93LWlkPWRkMGE5Mjg2LTE5YTUtNDE0My1hOGFkLWZhNDM4MjNlOGM2MiZ0ZW5hbnQtaWQ9ZmNiYWZlNTItMDYyNi00MDQ3LWE4YTMtN2RmYTZjYWU3MTVj'}
                className='bg-amber-400 text-black'
                >
                    Purdue Driver Certification Form
            </Button>

            <h2 className='text-2xl font-bold text-center mt-4'>Step 2: Purdue Outing Club Form</h2>
            <p className='text-center max-w-[600px]'>
                Once you receive an email like the one below notifying you that you are approved to drive a vehicle for 
                Purdue, submit the Outing Club driver registration form to let the data analyst know that you are driver
                certified.
            </p>
            <Image src={'/driver_email.png'} alt='' width={'auto'} height={400} className='my-8' />
            <Button 
                as={Link}
                isExternal={true}
                href={'https://forms.cloud.microsoft/r/4uJRfr4dRV'}
                className='bg-amber-400 text-black'
            >
                Outing Club Driver Registration Form
            </Button>

            <h2 className='text-2xl font-bold text-center mt-4'>Step 3: Become a certified driver</h2>
            <p className='text-center max-w-[600px]'>
                Once you've completed both steps above, you will receive an email within a few days indicating whether
                you were approved to drive on Outing Club trips or not. As long as you complete the above steps properly
                and have a valid US driver's license, you will be approved. Once you are an approved driver, you are more
                likely to be selected for trips since two certified drivers are needed in every car on all official club
                trips.
            </p>
        </div>
    )
}