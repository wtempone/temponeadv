import { Button, Container, FileButton, Text } from '@mantine/core';
import React, { useState, useCallback, useRef, useEffect, ReactEventHandler } from 'react';
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import classes from './ModalNewFoto.module.css';
const ASPECT_RATIO = 1;
const MIN_DIMENSION = 200;

export default function ModalNewFotoImageCropper(props: { image: File }) {
  const [imgSrc, setImgSrc] = useState<string>();
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState<string>();
  useEffect(() => {
    console.log('loading');
    if (props.image) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageURL = reader.result?.toString()!;
        const image = new Image();
        image.src = imageURL;
        if (error) setError(undefined);
        image.addEventListener('load', (e) => {
          const { width, height } = e.target as HTMLImageElement;
          if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
            setError('Imagem muito pequena, tente outra imagem!');
            return setImgSrc(undefined);
          }
        });
        setImgSrc(imageURL);
      };
      reader.readAsDataURL(props.image);
    }
  }, [props.image]);

  const onImageLoaded: ReactEventHandler<HTMLImageElement> = useCallback((event) => {
    const image = event.target as HTMLImageElement;
    const { width, height, naturalWidth, naturalHeight } = image;
    const crop = makeAspectCrop(
      {
        unit: '%',
        width: 100,
      },
      ASPECT_RATIO,
      width,
      height,
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  }, []);

  return (
    <>
      {error && <Text>{error}</Text>}
      {imgSrc && (
        <ReactCrop
          crop={crop}
          keepSelection
          aspect={ASPECT_RATIO}
          minWidth={MIN_DIMENSION}
          onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
        >
          <img src={imgSrc} className={classes.image_crop} onLoad={onImageLoaded} />
        </ReactCrop>
      )}
    </>
  );
}
