'use client';

import { Autoplay, EffectFade } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

type SlideItem = {
  src: string;
  title?: string;
  href?: string;
};

const slides: SlideItem[] = [
  { src: '/image/slides/slide1.png', title: '슬라이드 1' },
  { src: '/image/slides/slide2.png', title: '슬라이드 2' },
  { src: '/image/slides/slide3.png', title: '슬라이드 3' },
];

export default function Slider({ loading }: { loading?: boolean }) {
  return (
    <div className="w-full h-[400px] relative overflow-hidden ">
      <Swiper
        modules={[Autoplay, EffectFade]}
        slidesPerView={1}
        rewind
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          waitForTransition: false,
        }}
        speed={600}
        className="w-full h-full"
      >
        {slides.map((s, idx) => {
          const slideInner = (
            <div className="w-full h-[400px] relative ">
              <img
                src={s.src}
                alt={s.title ?? `slide-${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );

          return (
            <SwiperSlide key={idx}>
              {s.href ? (
                <a href={s.href} className="block w-full h-full">
                  {slideInner}
                </a>
              ) : (
                slideInner
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {loading && (
        <div className="absolute inset-0 animate-pulse bg-neutral-800/40 backdrop-blur-[1px]" />
      )}
    </div>
  );
}
