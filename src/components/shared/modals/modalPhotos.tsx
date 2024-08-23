import { Carousel } from '@mantine/carousel';
import { Group, Image, Text, UnstyledButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MdZoomOutMap } from "react-icons/md";
import { TrackLog } from '~/lib/repositories/userTrackLogRepository';

export default function ModalPhotos(props: { Tracklog: TrackLog }) {

    const zoomFotos = (photosURL: any) => {
        modals.open({
            title: 'Fotos',
            withCloseButton: true,
            children: (
                <Carousel
                    loop
                    slideGap="xs"
                    controlsOffset="xs"
                    align="start"
                    withIndicators>
                    {photosURL.map((image: string, index: number) => (
                        <Carousel.Slide key={index} >
                            <Image src={image} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            ),
        });
    }

    return (
        <>
            <Group justify='space-between'>
                <Text fz="md" m='xs' fw={700} >
                    Fotos
                </Text>
                <UnstyledButton
                    onClick={() => zoomFotos(props.Tracklog.photosURL)}
                    variant="default"
                    size="xl"
                    aria-label="Ver fotos"
                    mr='xs'
                >
                    <MdZoomOutMap size={20} />
                </UnstyledButton>
            </Group>
            {props.Tracklog.photosURL && props.Tracklog.photosURL.length && (
                <Carousel
                    p={0}
                    m={0}
                    loop
                    slideSize="100"
                    height={100}
                    slideGap="xs"
                    controlsOffset="xs"
                    align="start"
                    withIndicators>

                    {props.Tracklog.photosURL.map((image: string | undefined, index: number) => (
                        <Carousel.Slide key={index} >
                            <Image src={image} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            )}

        </>
    );
}