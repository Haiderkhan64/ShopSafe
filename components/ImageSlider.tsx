import Image, { getImageProps } from "next/image";
import { ReactElement } from "react";

interface ImageSliderProps {
  id: number;
  srcDesktop: string;
  srcMobile: string;
}

const ImageSlider = ({
  id,
  srcDesktop,
  srcMobile,
}: ImageSliderProps): ReactElement => {
  const common = { alt: `Slider ${id}` };

  const {
    props: { srcSet: mobile },
  } = getImageProps({
    ...common,
    src: srcMobile,
    width: 800,
    height: 500,
    quality: 100,
  });

  const {
    props: { srcSet: desktop, ...rest },
  } = getImageProps({
    ...common,
    src: srcDesktop,
    width: 1980,
    height: 800,
    quality: 100,
  });

  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile} />
      <source media="(min-width: 768px)" srcSet={desktop} />
      <Image
        {...rest}
        className=" object-contain md:object-cover"
        alt={`Slider image ${id}`}
      />
    </picture>
  );
};

export default ImageSlider;
