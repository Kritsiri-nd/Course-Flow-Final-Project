export interface Testimonial {
  id: number;
  name: string;
  text: string;
  imageSrc: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Saiful Islam",
    text: "Start with something simple and small, then expand over time. If people call it a 'toy' you're definitely onto something. If you're waiting for encouragement from others, you're doing it wrong. By the time people think an idea is good, it's probably too late.",
    imageSrc: "/images/carosel1.png"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    text: "The course structure is excellent and the instructors are very knowledgeable. I learned so much in such a short time. The practical exercises really helped me understand the concepts better.",
    imageSrc: "/images/carosel2.png"
  },
  {
    id: 3,
    name: "Michael Chen",
    text: "This platform has transformed my learning experience. The interactive features and real-time feedback make studying much more engaging and effective.",
    imageSrc: "/images/carosel3.png"
  }
]; 