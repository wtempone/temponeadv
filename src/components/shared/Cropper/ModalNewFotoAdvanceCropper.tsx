import { Button, Center, Container, FileButton, Group, Stack, Text } from '@mantine/core';
import React, { useState, useCallback, useRef, useEffect, ReactEventHandler } from 'react';
import { render } from 'react-dom';
import { CropperRef, Cropper } from 'react-mobile-cropper';
import 'react-mobile-cropper/dist/style.css'
import classes from './ModalNewFoto.module.css';
import { on } from 'events';
const ASPECT_RATIO = 1;
const MIN_DIMENSION = 200;

export default function ModalNewFotoAdvanceCropper(props: { image: File, onClose: () => void, onConfirm: (image: String) => void }) {
    const [imgSrc, setImgSrc] = useState<string>();
    const [error, setError] = useState<string>();
    useEffect(() => {
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
                        return setImgSrc(undefined);;
                    }
                });
                setImgSrc(imageURL);
            };
            reader.readAsDataURL(props.image);
        }
    }, [props.image]);

    const cropperRef = useRef<CropperRef>(null);

    const onCrop = () => {
        if (cropperRef.current) {
            const result = cropperRef.current.getCanvas()?.toDataURL();
            props.onConfirm(result!);
        }
    };
    return (
        <>

                {error && <Text>{error}</Text>}
                {imgSrc && (
                    <Center>
                        <Stack>
                            <div style={{ width: '80vw', height: '80vh' }}>
                                <Cropper
                                    ref={cropperRef}
                                    src={imgSrc}
                                    className={'cropper'}
                                    stencilProps={{
                                        aspectRatio: 1 / 1,
                                    }}
                                />
                            </div>
                            <Group justify='end'>
                                <Button variant='default' onClick={props.onClose}>
                                    Cancelar
                                </Button>
                                <Button onClick={onCrop}>
                                    Confirmar
                                </Button>
                            </Group>
                        </Stack>
                    </Center>
                )}
        </>
    );
}