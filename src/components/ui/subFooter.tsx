import Image from "next/image";
import Link from "next/link";

function SubFooter() {
  const footerStyle = {
    background: "linear-gradient(271deg, #5697ff 7.78%, #2558dd 73.86%)",
  };

  return (
    <>
      <div
        className='flex flex-row justify-center h-[500px] relative'
        style={footerStyle}>
        <footer className=' w-[80vw] flex flex-row justify-between relative '>
          <div className='w-[40vw] flex flex-col justify-evenly items-start '>
            <p className='text-4xl font-bold text-white w-[70%]'>
            Want to start learning?
            </p>
            <Link href='/public/courses'>
              <button
                className='bg-white text-[#F47E20] border-[#F47E20] border rounded-xl font-semibold hover:scale-105 transition-transform duration-200 -translate-y-17'
                style={{
                  width: '169px',
                  height: '60px',
                  paddingTop: '18px',
                  paddingRight: '32px',
                  paddingBottom: '18px',
                  paddingLeft: '32px',
                  gap: '10px'
                }}>
                Register here
              </button>
            </Link>
          </div>

          <svg
            width='27'
            height='27'
            viewBox='0 0 27 27'
            fill='none'
            className='absolute top-[403px] left-[406px]'>
            <circle
              cx='13.1741'
              cy='13.1741'
              r='11.6741'
              stroke='#2FAC8E'
              strokeWidth='3'
            />
          </svg>
          <div className='w-[40vw] self-end relative'>
            <Link href='/public/courses'>
              <Image
                src='/images/subfooter.png'
                alt='Learning'
                width={576}
                height={390.0567932128906}
                className='max-w-full h-auto object-contain hover:scale-105 transition-transform duration-300 cursor-pointer'
              />
            </Link>
            <svg
              width='37'
              height='37'
              viewBox='0 0 37 37'
              fill='none'
              className='absolute top-[128px] right-[-55px]'>
              <path
                d='M34.9135 34.9134L2.46871 26.2199L26.22 2.4686L34.9135 34.9134Z'
                stroke='white'
                strokeWidth='2'
              />
            </svg>
          </div>
        </footer>
      </div>
    </>
  );
}
export default SubFooter;
