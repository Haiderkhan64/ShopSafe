"use client";
import AutoPlay from "embla-carousel-autoplay";
import { ReactElement } from "react";
import ImageSlider from "./ImageSlider";
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

const ImagesSlider = [
  {
    id: 1,
    srcDesktop: "/slider/Desktop-1.jpg",
    srcMobile: "/slider/MOBILE-1.webp",
    alt: "Slider 1",
  },
  {
    id: 2,
    srcDesktop: "/slider/Desktop-2.jpg",
    srcMobile: "/slider/MOBILE-2.webp",
    alt: "Slider 2",
  },
  {
    id: 3,
    srcDesktop: "/slider/Desktop-1.jpg",
    srcMobile: "/slider/MOBILE-3.webp",
    alt: "Slider 3",
  },
];

const SliderImages = ({}): ReactElement => {
  return (
    <Carousel
      plugins={[
        AutoPlay({
          delay: 4000,
        }),
      ]}
    >
      <CarouselContent>
        {ImagesSlider.map(({ id, ...ImageSliderProps }) => (
          <CarouselItem
            key={`${id}-${ImageSliderProps.srcDesktop}`}
            className="relative w-full h-[360px] md:h-64 lg:h-72 xl:h-[420px]  2xl:h-[500px] "
          >
            <ImageSlider id={id} {...ImageSliderProps} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default SliderImages;
