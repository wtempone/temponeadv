
import { ActionIcon, Avatar, Button, CloseButton, ColorInput, Group, HoverCard, Paper, SegmentedControl, SimpleGrid, Text, Title, UnstyledButton, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronUp } from '@tabler/icons-react';
import { Cartographic, Viewer as CesiumViewer, JulianDate } from 'cesium';
import { useEffect, useState } from 'react';
import GaugeComponent from 'react-gauge-component';
import { IoCloseOutline, IoColorPaletteOutline, IoPauseOutline, IoPlayBackOutline, IoPlayForwardOutline, IoPlayOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline } from "react-icons/io5";
import { MdQueryStats } from "react-icons/md";
import { PiUsersThree } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import { CesiumComponentRef } from 'resium';
import { TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './SceneControls.module.css';

interface Stats {
    GpsAltitute: string;
    VelocidadeStr: string;
    Velocidade: number;
    AscencaoStr: string;
    Ascencao: number;
}
export function SceneControls(props: {
    viewer: React.RefObject<CesiumComponentRef<CesiumViewer>>,
    tracklogs: Array<TrackLog>
}) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [indexVelocityPlayback, setIndexVelocityPlayback] = useState(7);

    const velocities = [-64, -32, -16, -8, -4, -2, 1, 2, 4, 8, 16, 32, 64];
    function changeVelocity(forward: boolean) {
        if (forward) {
            if (indexVelocityPlayback < velocities.length - 1) {
                setIndexVelocityPlayback(indexVelocityPlayback + 1);
            }
        } else {
            if (indexVelocityPlayback > 0) {
                setIndexVelocityPlayback(indexVelocityPlayback - 1);
            }
        }
        props.viewer.current!.cesiumElement!.clock.multiplier = velocities[indexVelocityPlayback];
    }
    const contTracklog = props.tracklogs.length;
    const lastPoints = props.tracklogs[props.tracklogs.length - 1].trackLogData!.flightPoints.length;
    const initialDateScene = JulianDate.fromDate(new Date(props.tracklogs[0].trackLogData?.flightPoints[0].timestamp!));
    const endDateScene = JulianDate.fromDate(
        new Date(props.tracklogs[contTracklog - 1].trackLogData?.flightPoints[lastPoints - 1].timestamp!),
    );

    function goToBoundsTimeLine(start: boolean) {
        const startOrEnd = start ? initialDateScene : endDateScene;
        props.viewer.current!.cesiumElement!.clock.currentTime = startOrEnd;
        setIsPlaying(false);
        props.viewer.current!.cesiumElement!.clock.shouldAnimate = false;
    }
    const actions = [
        {
            icon: () => (<IoPlaySkipBackOutline style={{ width: rem(22), height: rem(22) }} />),
            action: () => goToBoundsTimeLine(true)
        },
        {
            icon: () => (<IoPlayBackOutline style={{ width: rem(22), height: rem(22) }} />),
            action: () => changeVelocity(false)

        },
        {
            icon: () => (<>
                {
                    isPlaying &&
                    (<IoPauseOutline style={{ width: rem(22), height: rem(22) }} />)
                }
                {
                    !isPlaying &&
                    (<IoPlayOutline style={{ width: rem(22), height: rem(22) }} />)
                }
            </>),
            action: () => {
                setIsPlaying(!isPlaying);
                props.viewer.current!.cesiumElement!.clock.shouldAnimate = !isPlaying;
                console.log('play', isPlaying);
            }
        },
        {
            icon: () => (<div className={classes.pill_icon}>{`${velocities[indexVelocityPlayback]}x`}</div>),
            action: () => { console.log('velocity') }
        },
        {
            icon: () => (<IoPlayForwardOutline style={{ width: rem(22), height: rem(22) }} />),
            action: () => changeVelocity(true)
        },
        {
            icon: () => (<IoPlaySkipForwardOutline style={{ width: rem(22), height: rem(22) }} />),
            action: () => goToBoundsTimeLine(false)
        }
    ]

    const controls = actions.map((icon, index) => (
        <UnstyledButton key={index} onClick={() => icon.action()} >
            <icon.icon />
        </UnstyledButton>
    ))

    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [statsOpened, { toggle: toggleStats, close: closeStats }] = useDisclosure(true);
    const [selectedTracklog, setSelectedTracklog] = useState<TrackLog>(props.tracklogs[0]);

    const [stats, setStats] = useState<Stats>({
        GpsAltitute: '',
        VelocidadeStr: '0 Km/h',
        Velocidade: 0,
        AscencaoStr: '0 m/s',
        Ascencao: 0,
    });
    const [tickInterval, setTickInterval] = useState<NodeJS.Timer>();

    useEffect(() => {
        if (isPlaying) {
            const tick = setInterval(() => {
                console.log('Tick', isPlaying);
                updateStats();
            }, 300);
            setTickInterval(tick);
        } else {
            if (tickInterval) {
                clearInterval(tickInterval);
            }
        }
    }, [isPlaying])

    function updateStats() {
        if (props.viewer!.current!.cesiumElement) {
            console.log('Adicionando Listener');
            console.log('tick');
            if (props.viewer!.current!.cesiumElement!.trackedEntity) {
                const position = Cartographic.fromCartesian(props.viewer.current?.cesiumElement?.trackedEntity?.position?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!);
                const velocidade = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.velocidade?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
                const ascencao = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.ascencao?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
                setStats(
                    {
                        GpsAltitute: `${position.height.toFixed()} m`,
                        VelocidadeStr: `${velocidade.toFixed()} km/h`,
                        Velocidade: velocidade,
                        AscencaoStr: `${ascencao.toFixed()} m/s`,
                        Ascencao: ascencao
                    }
                )
            }
        }
    }
    const users = props.tracklogs.map((item) => (
        <UnstyledButton
            className={classes.subLink}
            key={item.userData?.id}
            onClick={closeDrawer}>
            <Group align="flex-start">
                <Group wrap="nowrap" justify="initial">
                    <Avatar
                        src={item.userData?.photoURL}
                        size={40}
                        style={{ borderRadius: '50%' }}
                        top='0'
                    />
                    <Text size="sm">
                        {item.userData?.nome}
                    </Text>
                </Group>
            </Group>
        </UnstyledButton>
    ))
    const navigate = useNavigate();
    function closeScene() {
        navigate(-1);
    }
    // function setCorAsa(value: string) {
    //     const trackEntity = props.viewer.current?.cesiumElement!.dataSources.get(0).entities.getById(props.tracklogs![0].id);
    //     if (trackEntity) {
    //         trackEntity!.model!.color = Color.fromCssColorString(value);
    //         props.viewer.current?.cesiumElement!.zoomTo(trackEntity);
    //         props.viewer.current!.cesiumElement!.trackedEntity = trackEntity;
    //         console.log(value);
    //     }

    // }
    function setCorContorno(value: string) {
        console.log(value);
    }
    function setCorRastro(value: string) {
        console.log(value);
    }
    function setTipoRastro(value: string) {
        console.log(value);
    }
    function converteAcensaoParaPorcentagem(valor: number): number {
        const valorLimitado = Math.min(Math.max(valor, -12), 12);
        const valorNormalizado = valorLimitado + 12;
        const porcentagem = (valorNormalizado / 24) * 100;
        return porcentagem;
    }

    function convertePorcentagemParaAcensao(porcentagem: number): number {
        const porcentagemLimitada = Math.min(Math.max(porcentagem, 0), 100);
        const valorNormalizado = (porcentagemLimitada / 100) * 24;
        const valor = valorNormalizado - 12;
        return valor;
    }
    return (
        <>
            <ActionIcon
                component="a"
                size="lg"
                aria-label="Sair"
                variant='default'
                className={classes.button_close}
                onClick={() => closeScene()}
            >
                <IoCloseOutline />
            </ActionIcon>
            {selectedTracklog && statsOpened && stats && (
                <Paper className={classes.stats} withBorder radius="md" p="xs" >
                    <Group wrap="nowrap" justify="space-between">
                        <Group wrap="nowrap">
                            <Avatar
                                src={selectedTracklog!.userData?.photoURL}
                                size={20}
                                style={{ borderRadius: '50%' }}
                                top='0'
                            />
                            <Text size="sm" className={classes.name}>
                                {selectedTracklog!.userData?.nome}
                            </Text>
                        </Group>
                        <CloseButton size='xs' onClick={toggleStats} />
                    </Group>
                    <Group>
                        <Group wrap='nowrap' gap={0}>
                            {stats?.Velocidade && (
                                <GaugeComponent
                                    id='velocidade'
                                    type='radial'
                                    className={classes.gauge}
                                    arc={{
                                        nbSubArcs: 60,
                                        colorArray: ['#F5CD19', '#EA4228'],
                                        width: 0.2,
                                        padding: 0.03,
                                        subArcs: [
                                            { limit: 2 },
                                        ]
                                    }}
                                    pointer={{
                                        color: 'var(--mantine-color-text)',
                                        length: 0.90,
                                        width: 20,
                                        baseColor: 'var(--mantine-color-text)',
                                        elastic: true,

                                    }}
                                    labels={{
                                        valueLabel: {
                                            style: {
                                                color: 'var(--mantine-color-text)',
                                                fill: 'var(--mantine-color-text)',
                                                textShadow: 'var(--mantine-color-text)',
                                                fontWeight: 700,
                                                fontSize: '50rem'
                                            },
                                            formatTextValue: (value: number) => value.toFixed() + ' Km/h'
                                        },
                                        tickLabels: {
                                            type: 'inner',
                                            ticks: [
                                                { value: 15 },
                                                { value: 30 },
                                                { value: 45 },
                                                { value: 60 },
                                            ],
                                            defaultTickValueConfig: {
                                                hide: false,
                                                style: {
                                                    color: 'var(--mantine-color-dimmed)',
                                                    fill: 'var(--mantine-color-dimmed)',
                                                    fontSize: '8px'
                                                }

                                            },
                                            defaultTickLineConfig: {
                                                hide: false,
                                                width: 1,
                                                length: 1,
                                                distanceFromArc: 3,
                                                color: 'rgba(var(--mantine-color-body),0)',
                                            }
                                        }
                                    }}
                                    value={stats!.Velocidade}
                                    maxValue={60}
                                />
                            )}
                            {stats?.Ascencao && (
                                <GaugeComponent
                                    id='ascencao'
                                    type='radial'
                                    className={classes.gauge}
                                    arc={{
                                        nbSubArcs: 100,
                                        colorArray: ['#d4efee', '#EEEEEE', '#EA4228'],
                                        width: 0.3,
                                        padding: 0.02
                                    }}
                                    pointer={{
                                        color: 'var(--mantine-color-text)',
                                        length: 0.90,
                                        width: 20,
                                        baseColor: 'var(--mantine-color-text)',
                                        elastic: true,

                                    }}
                                    labels={{
                                        valueLabel: {
                                            style: {
                                                color: 'var(--mantine-color-text)',
                                                fill: 'var(--mantine-color-text)',
                                                textShadow: 'var(--mantine-color-text)',
                                                fontWeight: 700,
                                                fontSize: '60rem'
                                            },
                                            formatTextValue: (value: number) => convertePorcentagemParaAcensao(value).toFixed(1) + ' m/s'
                                        },
                                        tickLabels: {
                                            type: 'outer',
                                            ticks: [
                                                { value: 0 },
                                                { value: 25 },
                                                { value: 50 },
                                                { value: 75 },
                                                { value: 100 },
                                            ],
                                            defaultTickValueConfig: {
                                                hide: true
                                            },
                                            defaultTickLineConfig: {
                                                hide: true
                                            }
                                        }
                                    }}
                                    value={converteAcensaoParaPorcentagem(stats!.Ascencao)}
                                    maxValue={100}
                                />
                            )}

                        </Group>
                        {stats?.GpsAltitute && (
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                    Altitude
                                </Text>
                                <Text fw={700} size="sm">
                                    {stats!.GpsAltitute}
                                </Text>
                            </div>
                        )}
                    </Group>
                </Paper>

            )}

            <div className={classes.wrapper}>
                <Group justify='space-between'>
                    {controls}
                    {users.length > 1 && (
                        <HoverCard position="top" radius="xs" shadow="md" withinPortal>
                            <HoverCard.Target>
                                <UnstyledButton >
                                    <PiUsersThree style={{ width: rem(22), height: rem(22) }} />
                                    <IconChevronUp
                                        style={{ width: rem(16), height: rem(16) }}
                                    />
                                </UnstyledButton>
                            </HoverCard.Target>
                            <HoverCard.Dropdown>
                                <SimpleGrid cols={1} spacing={0} py="xs">
                                    {users}
                                </SimpleGrid>
                            </HoverCard.Dropdown>
                        </HoverCard>
                    )}
                    <UnstyledButton
                        className={classes.subLink}
                        onClick={toggleStats}>
                        <MdQueryStats style={{ width: rem(22), height: rem(22) }} />
                    </UnstyledButton>
                    <HoverCard position="top" radius="xs" shadow="md" withinPortal>
                        <HoverCard.Target>
                            <UnstyledButton >
                                <IoColorPaletteOutline style={{ width: rem(22), height: rem(22) }} />
                                <IconChevronUp
                                    style={{ width: rem(16), height: rem(16) }}
                                />
                            </UnstyledButton>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <SimpleGrid cols={1} spacing={0} py="xs">
                                <Title size='h5'> Defina suas cores</Title>
                                <ColorInput label="Cor da asa" onChange={(value) => console.log('setColor')} disallowInput />
                                <ColorInput label="Cor da contorno" onChange={(value) => setCorContorno(value)} disallowInput />
                                <ColorInput label="Cor do rastro" onChange={(value) => setCorRastro(value)} disallowInput />
                                <SegmentedControl onChange={(value) => setTipoRastro(value)}
                                    data={[
                                        { label: 'Sem rastro', value: 'sem' },
                                        { label: 'Rastro continuo', value: 'continuo' },
                                        { label: 'Rastro  simples', value: 'simples' },
                                    ]}
                                />
                                <Button fullWidth>Salvar</Button>
                            </SimpleGrid>

                        </HoverCard.Dropdown>
                    </HoverCard>
                </Group>
            </div>
        </>

    );
}
