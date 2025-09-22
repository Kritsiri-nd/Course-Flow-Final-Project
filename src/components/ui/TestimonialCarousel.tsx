'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import TestimonialCard from './testimonialCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TestimonialData {
  id: number;
  name: string;
  text: string;
  imageSrc: string;
}

const testimonials: TestimonialData[] = [
  {
    id: 1,
    name: "Saiful Islam",
    text: "Start with something simple and small, then expand over time. If people call it a 'toy' you're definitely onto something. If you're waiting for encouragement from others, you're doing it wrong. By the time people think an idea is good, it's probably too late.",
    imageSrc: "/images/man.png"
  },
  {
    id: 2,
    name: "Jane Doe",
    text: "This platform helped me kickstart my career in software development. Highly recommend for beginners!",
    imageSrc: "/images/woman.png"
  },
  {
    id: 3,
    name: "John Smith",
    text: "The courses are well-structured and the instructors are very knowledgeable. A great learning experience.",
    imageSrc: "/images/man.png"
  },
  {
    id: 4,
    name: "Emily White",
    text: "I learned so much in a short amount of time. The practical exercises were incredibly helpful.",
    imageSrc: "/images/woman.png"
  },
  {
    id: 5,
    name: "David Green",
    text: "A fantastic resource for anyone looking to break into tech. The community support is also a big plus!",
    imageSrc: "/images/man.png"
  },
];

export default function TestimonialCarousel() {
  return (
    <div className="w-full py-12 bg-white relative">
      <div className="w-full px-4 sm:px-6 lg:px-45">
        
        {/* Custom Navigation Buttons */}
        <button className="swiper-button-prev-custom absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border border-gray-100">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
          >
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button className="swiper-button-next-custom absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-14 h-14 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group border border-gray-100">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="text-gray-600 group-hover:text-blue-600 transition-colors duration-300"
          >
            <path 
              d="M9 18L15 12L9 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          pagination={{ clickable: true }}
          spaceBetween={0}
          slidesPerView={1}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 1,
              spaceBetween: 0,
              centeredSlides: true,
            },
            768: {
              slidesPerView: 1.2,
              spaceBetween: 0,
              centeredSlides: true,
            },
            1024: {
              slidesPerView: 1.4,
              spaceBetween: 0,
              centeredSlides: true,
            },
            1280: {
              slidesPerView: 1.6,
              spaceBetween: 0,
              centeredSlides: true,
            },
            1536: {
              slidesPerView: 1.8,
              spaceBetween: 0,
              centeredSlides: true,
            },
          }}
          className="mySwiper w-full"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="flex justify-center">
              <TestimonialCard
                name={testimonial.name}
                text={testimonial.text}
                imageSrc={testimonial.imageSrc}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
} 