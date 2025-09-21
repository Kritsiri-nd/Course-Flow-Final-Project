'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navbar';

export default function RegisterSuccess() {
  const router = useRouter();

  return (
    <>
      <Navbar />
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative Elements (same as register page) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[#F6F7FC]">
        {/* Orange semi-circle - left side */}
        <img 
          src="/assets/Vector 9.png" 
          alt="Orange semi-circle" 
          className="absolute w-[113px] h-[418px] opacity-100 top-[421px] left-[-20px]"
        />
        
        {/* Light blue circle - top left */}
        <img 
          src="/assets/Ellipse 5.png" 
          alt="Light blue circle" 
          className="absolute w-[73px] h-[73px] opacity-100 top-[169px] left-[87px] rotate-[75deg]"
        />
        
        {/* Green plus sign */}
        <img 
          src="/assets/Group 5.png" 
          alt="Green plus sign" 
          className="absolute w-[13.68px] h-[13.68px] opacity-100 top-[284px] left-[187px] rotate-[30deg]"
        />
        
        {/* Dark blue wave shape - top right */}
        <img 
          src="/assets/Vector 8.png" 
          alt="Dark blue wave shape" 
          className="absolute top-0 right-[0px] w-[172.64px] h-[617px] opacity-100 pointer-events-none select-none rotate-0"
        />
        
        {/* Orange circle outline - right side */}
        <img 
          src="/assets/Ellipse 4.png" 
          alt="Orange circle outline" 
          className="absolute w-[35px] h-[35px] opacity-100 top-[589px] right-[50px]"
        />
      </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-176px)] px-4 relative z-10">
          <div className="w-[739px] h-[354px] bg-white rounded-[8px] p-[24px] shadow-[4px_4px_24px_0px_#00000014] flex flex-col items-center justify-center text-center gap-[16px]">
            <img src="/assets/success.png" alt="Success Icon" className="w-[80px] h-[80px]" />
            <h1 className="font-inter font-semibold text-[24px] leading-[125%] tracking-[-0.02em] text-[#000000]">
              Registration successful!
            </h1>
            <p className="text-sm  text-[#646D89]">
              Your account has been created. You can now log in to continue.
            </p>
            <Button
              type="button"
              variant="cta"
              size="cta"
              className="w-[321.5px] h-[60px] rounded-[12px] px-[32px] py-[18px] mt-[24px]"
              onClick={() => router.push('/auth/login')}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}


