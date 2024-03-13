
import { ActionIcon, Avatar, Button, Center, CloseButton, ColorInput, Container, FileButton, Group, HoverCard, Paper, ScrollArea, SegmentedControl, SimpleGrid, Stack, Table, Text, Title, Tooltip, UnstyledButton, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronUp } from '@tabler/icons-react';
import { Cartesian3, Cartographic, Viewer as CesiumViewer, JulianDate, Timeline } from 'cesium';
import { useEffect, useState } from 'react';
import GaugeComponent from 'react-gauge-component';
import { IoCloseOutline, IoColorPaletteOutline, IoPauseOutline, IoPlay, IoPlayBackOutline, IoPlayForwardOutline, IoPlayOutline, IoPlaySkipBackOutline, IoPlaySkipForwardOutline } from "react-icons/io5";
import { MdQueryStats } from "react-icons/md";
import { PiUsersThree } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import { CesiumComponentRef } from 'resium';
import { TrackLog } from '~/lib/repositories/userTrackLogRepository';
import classes from './SceneControls.module.css';
import { Notification } from '@mantine/core';
import { UserData } from '~/lib/repositories/userDataRepository';
import { TimeFormated, millisecondsToTime, tsFBToDate, tsToTime } from '~/components/shared/helpers';
import { FaRegPaperPlane } from 'react-icons/fa';

interface Stats {
    GpsAltitute: string;
    VelocidadeStr: string;
    Velocidade: number;
    AscencaoStr: string;
    Ascencao: number;
    DistanciaAccStr: string;
    DistanciaAcc: number;
    DistanciaDecStr: string;
    DistanciaDec: number;
}
export function SceneControls(props: {
    viewer: React.RefObject<CesiumComponentRef<CesiumViewer>>,
    tracklogs: Array<TrackLog>
}) {

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [indexVelocityPlayback, setIndexVelocityPlayback] = useState(7);

    const velocities = [-64, -32, -16, -8, -4, -2, 1, 2, 4, 8, 16, 32, 64];
    function changeVelocity(forward: boolean) {
        let indexVelocitides = velocities.indexOf(props.viewer.current!.cesiumElement!.clock.multiplier);
        if (forward) {
            if (indexVelocitides < velocities.length - 1) {
                indexVelocitides++;
                setIndexVelocityPlayback(indexVelocitides);
            }
        } else {
            if (indexVelocityPlayback > 0) {
                indexVelocitides--;
                setIndexVelocityPlayback(indexVelocitides);
            }
        }
        props.viewer.current!.cesiumElement!.clock.multiplier = velocities[indexVelocitides];
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
        updateStats();
    }
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(true);
    const [statsOpened, { toggle: toggleStats, close: closeStats }] = useDisclosure(true);
    const [selectedTracklog, setSelectedTracklog] = useState<TrackLog>(props.tracklogs[0]);
    const [started, setStarted] = useState<boolean>(false);
    const [stats, setStats] = useState<Stats>({
        GpsAltitute: '',
        VelocidadeStr: '0 Km/h',
        Velocidade: 0,
        AscencaoStr: '0 m/s',
        Ascencao: 0,
        DistanciaAcc: 0,
        DistanciaAccStr: '0 m',
        DistanciaDec: 0,
        DistanciaDecStr: '0 m',

    });

    const [usersInFlight, setUsersInFlight] = useState<Array<UserData> | undefined>(undefined)
    //const [tickInterval, setTickInterval] = useState<NodeJS.Timer>();


    useEffect(() => {
        if (props.viewer.current!.cesiumElement) {
            props.viewer.current?.cesiumElement!.clock.onTick.addEventListener(updateStats);
        }
    }, [])
    function startIntro() {
        changeTrackEntity(selectedTracklog);
    }
    function changeTrackEntity(tracklog: TrackLog) {
        if (props.viewer!.current?.cesiumElement!.dataSources.length == 0) return;
        const trackEntity = props.viewer!.current?.cesiumElement!.dataSources.get(0).entities.getById(tracklog.id);

        if (trackEntity) {
            if (trackEntity.isAvailable(props.viewer!.current!.cesiumElement!.clock.currentTime)) {
                closeDrawer();
                props.viewer!.current!.cesiumElement!.trackedEntity = trackEntity;
                props.viewer!.current!.cesiumElement!.trackedEntity!.viewFrom = new Cartesian3(0, -100, 100);
                setSelectedTracklog(tracklog);
            } else {
                console.log('Piloto não esta em voo');
            }
        } else {
            console.log('Tracklog não encontrado');
        }

    }
    function orbit() {
        props.viewer!.current!.cesiumElement!.scene.camera.rotateRight(0.001);
    }
    function updateStats() {
        if (!props.viewer!.current!.cesiumElement) return;
        if (props.viewer!.current?.cesiumElement!.dataSources.length == 0) return;
        if (!props.viewer.current!.cesiumElement!.clock.shouldAnimate) {
            setIsPlaying(false);
        }
        const users: Array<UserData> = [];
        for (let i = 0; i < props.tracklogs.length; i++) {
            const e = props.viewer!.current?.cesiumElement!.dataSources.get(0).entities.getById(props.tracklogs![i].id);
            if (e && e.isAvailable(props.viewer!.current!.cesiumElement!.clock.currentTime)) {
                users.push(props.tracklogs[i].userData!);
            }
            setUsersInFlight(users);
        }
        if (props.viewer!.current!.cesiumElement!.trackedEntity) {
            const position = Cartographic.fromCartesian(props.viewer.current?.cesiumElement?.trackedEntity?.position?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!);
            const velocidade = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.velocidade?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
            const ascencao = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.ascencao?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
            const distanceAcc = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.distanceAcc?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
            const distanceDec = props.viewer.current?.cesiumElement?.trackedEntity?.properties?.distanceDec?.getValue(props.viewer.current?.cesiumElement?.clock.currentTime)!;
            setStats(
                {
                    GpsAltitute: `${position.height.toFixed()} m`,
                    VelocidadeStr: `${velocidade.toFixed()} km/h`,
                    Velocidade: velocidade,
                    AscencaoStr: `${ascencao.toFixed()} m/s`,
                    Ascencao: ascencao,
                    DistanciaAccStr: `${distanceAcc.toFixed(0)} m`,
                    DistanciaAcc: distanceAcc,
                    DistanciaDecStr: `${distanceDec.toFixed(0)} m`,
                    DistanciaDec: distanceDec,
                }
            )
        } else {
            setStats({
                GpsAltitute: `- m`,
                VelocidadeStr: `- km/h`,
                Velocidade: 0,
                AscencaoStr: `- m/s`,
                Ascencao: 0,
                DistanciaAccStr: `- m`,
                DistanciaAcc: 0,
                DistanciaDecStr: `- m`,
                DistanciaDec: 0
            })
        }
    }
    const selectUsers = props.tracklogs.map((item, index) => (
        <Paper
            className={item.id === selectedTracklog.id ? classes.tracklog_selected : ''}
            key={index}
            p='xs'
            onClick={() => changeTrackEntity(item)}>
            <Group align="flex-start" >
                <Group wrap="nowrap" justify="initial">
                    <Avatar
                        src={item.userData?.photoURL}
                        size={40}
                        style={{ borderRadius: '50%' }}
                    />
                    <Stack gap={0} align="flex-start">
                        <Text size="sm" fw={500}>
                            {item.userData?.nome}
                        </Text>
                        <Text size="xs">
                            Decolagem: <strong>{TimeFormated(tsFBToDate(item.takeoff)!)}</strong>
                        </Text>
                    </Stack>
                    <ActionIcon
                        radius={50}
                        size={40}
                        variant='default'
                        onClick={() => {
                            changeTrackEntity(item);
                            props.viewer.current!.cesiumElement!.clock!.currentTime =  JulianDate.fromDate(tsFBToDate(item.takeoff)!)
                        }} >
                        <FaRegPaperPlane  style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    ))

    const rowsUsers = props.tracklogs.map((item, index) => (
        <Table.Tr key={index}>
            <Table.Td>
                <Group gap="sm" wrap='nowrap'>
                    <Avatar size='sm' src={item.userData?.photoURL} radius={40} />
                    <div>
                        <Text fz="sm" fw={500}>
                            {item.userData?.nome}
                        </Text>
                        <Text fz="xs" c="dimmed">
                            {item.userData?.email}
                        </Text>
                    </div>
                </Group>
            </Table.Td>
            <Table.Td>{TimeFormated(tsFBToDate(item.takeoff)!)}</Table.Td>
            <Table.Td>{TimeFormated(tsFBToDate(item.landing)!)}</Table.Td>
            <Table.Td>{millisecondsToTime(item.duration!)}</Table.Td>
        </Table.Tr>
    ));




    const navigate = useNavigate();
    function closeScene() {
        navigate(-1);
    }

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
            {drawerOpened && rowsUsers.length > 1 && (
                <Paper p='xs' className={classes.stats_intro} withBorder>
                    <Center>
                        <Title size='h4'>
                            Atividades do dia
                        </Title>
                    </Center>
                    <Center>
                        <Title size='h6' c='dimmed'>
                            {JulianDate.toDate(props.viewer.current!.cesiumElement!.clock.currentTime).toLocaleDateString()}
                        </Title>
                    </Center>
                    <ScrollArea h='83%'>
                        <Table.ScrollContainer minWidth={80}>
                            <Table verticalSpacing="xs">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Piloto</Table.Th>
                                        <Table.Th>Decolagem</Table.Th>
                                        <Table.Th>Pouso</Table.Th>
                                        <Table.Th>Duração</Table.Th>
                                        <Table.Th>Distância <br /> Linha reta</Table.Th>
                                        <Table.Th>Distância <br /> Acumulada</Table.Th>
                                        <Table.Th>Máximo <br /> Ganho Alt.</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rowsUsers}</Table.Tbody>
                            </Table>
                        </Table.ScrollContainer>
                    </ScrollArea>
                    <Center mt={10}>
                        <Button
                            radius={50}
                            rightSection={<IoPlay />}
                            onClick={() => {
                                setIsPlaying(!isPlaying);
                                props.viewer.current!.cesiumElement!.clock.shouldAnimate = !isPlaying;
                                changeTrackEntity(selectedTracklog);
                                toggleDrawer();

                            }} >
                            Reproduzir
                        </Button>
                    </Center>
                </Paper>
            )}
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
            <Paper className={classes.panel_time} withBorder>
                <Stack gap={0}>
                    <Text size="xs" c="primary">
                        Hora local
                    </Text>
                    <Text size="sm" className={classes.title_time}>
                        {JulianDate.toDate(props.viewer.current!.cesiumElement!.clock.currentTime).toLocaleTimeString()}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {JulianDate.toDate(props.viewer.current!.cesiumElement!.clock.currentTime).toLocaleDateString()}
                    </Text>
                </Stack>
            </Paper>

            {usersInFlight && statsOpened && stats && (
                <>
                    <Paper className={classes.stats_player_info} withBorder radius="md" p="xs" >
                        <Group wrap="nowrap" justify="space-between">
                            <Group wrap="nowrap">
                                <Avatar
                                    src={selectedTracklog!.userData?.photoURL}
                                    size='md'
                                    style={{ borderRadius: '50%' }}
                                    top='0'
                                />
                                <Text size="md" className={classes.name}>
                                    {selectedTracklog!.userData?.nome}
                                </Text>
                            </Group>
                        </Group>
                        <Group justify="center" >
                            {selectUsers.length > 1 && (
                                <Group gap={0} >
                                    <Tooltip.Group openDelay={300} closeDelay={100}>
                                        <Avatar.Group spacing="sm">
                                            {usersInFlight && usersInFlight.map((user, index) =>
                                            (
                                                <Tooltip
                                                    key={index}
                                                    label={user.nome}
                                                    withArrow
                                                >
                                                    <Avatar
                                                        src={user.photoURL}
                                                        radius="xl"
                                                        size='sm'
                                                    />
                                                </Tooltip>
                                            ))
                                            }
                                        </Avatar.Group>
                                    </Tooltip.Group>
                                </Group>
                            )}
                        </Group>
                    </Paper>

                    <Paper className={classes.stats_left} withBorder >
                        <div>
                            {stats?.VelocidadeStr && (
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
                            {stats?.AscencaoStr && (
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
                        </div>
                    </Paper>

                    <Paper className={classes.stats_right} withBorder radius="md" p="xs" >
                        <Stack gap={0}>
                            {stats?.GpsAltitute && (
                                <Stack gap={0} justify='end' ta='end'>
                                    <Text c="dimmed" size="xs">
                                        Altitude
                                    </Text>
                                    <Text fw={700} size="sm">
                                        {stats!.GpsAltitute}
                                    </Text>
                                </Stack>
                            )}
                            {stats?.DistanciaDecStr && (
                                <Stack gap={0} justify='end' ta='end'>
                                    <Text c="dimmed" size="xs" >
                                        Dist. Decolagem
                                    </Text>
                                    <Text fw={700} size="sm">
                                        {stats!.DistanciaDecStr}
                                    </Text>
                                </Stack>
                            )}
                            {stats?.DistanciaAccStr && (
                                <Stack gap={0} justify='end' ta='end'>
                                    <Text c="dimmed" size="xs">
                                        Dist. Acumulada
                                    </Text>
                                    <Text fw={700} size="sm">
                                        {stats!.DistanciaAccStr}
                                    </Text>
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </>

            )}

            <div className={classes.wrapper}>
                <Group justify='space-between'>
                    <ActionIcon
                        radius={50}
                        variant='default'
                        onClick={() => goToBoundsTimeLine(true)} >
                        <IoPlaySkipBackOutline style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                    <ActionIcon
                        radius={50}
                        variant='default'
                        onClick={() => changeVelocity(false)} >
                        <IoPlayBackOutline style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                    <ActionIcon
                        radius={50}
                        variant='default'
                        onClick={() => {
                            setIsPlaying(!isPlaying);
                            props.viewer.current!.cesiumElement!.clock.shouldAnimate = !isPlaying;
                            changeTrackEntity(selectedTracklog);
                        }} >
                        <>
                            {
                                isPlaying &&
                                (<IoPauseOutline style={{ width: rem(22), height: rem(22) }} />)
                            }
                            {
                                !isPlaying &&
                                (<IoPlayOutline style={{ width: rem(22), height: rem(22) }} />)
                            }
                        </>
                    </ActionIcon>
                    <ActionIcon
                        radius={50}
                        variant='default'>
                        <div className={classes.pill_icon}>{`${velocities[indexVelocityPlayback]}x`}</div>
                    </ActionIcon>

                    <ActionIcon
                        radius={50}
                        variant='default'
                        onClick={() => changeVelocity(true)} >
                        <IoPlayForwardOutline style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                    <ActionIcon
                        radius={50}
                        variant='default'
                        onClick={() => goToBoundsTimeLine(false)} >
                        <IoPlaySkipForwardOutline style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                    {selectUsers.length > 1 && (
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
                                    {selectUsers}
                                </SimpleGrid>
                            </HoverCard.Dropdown>
                        </HoverCard>
                    )}
                    <ActionIcon
                        className={classes.subLink}
                        onClick={toggleStats}
                        radius={50}

                        variant={statsOpened ? 'filled' : 'default'}
                    >
                        <MdQueryStats style={{ width: rem(22), height: rem(22) }} />
                    </ActionIcon>
                </Group>
            </div>
        </>

    );
}
