import { Grid, Group, Paper, Title, Image } from '@mantine/core';
import anac from "../../../assets/images/anac.png";
import cab from "../../../assets/images/cab.png";
import cbvl from "../../../assets/images/cbvl.svg";
import decea from "../../../assets/images/decea.png";
import fai from "../../../assets/images/fai.png";

const data = [
    { image: cbvl },
    { image: anac },
    { image: decea },
    { image: cab },
    { image: fai },
];

const cols = data.map((item, index) => (
    <Grid.Col span={{ base: 1, xs: 1 }} key={index}>
        <Paper
            p="xl"
            style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                height: '100px'
            }}
        ></Paper>
    </Grid.Col>
));

export function Partners() {
    return (
        <>
            <Title py="xl" size="h2">
                Parceiros
            </Title>

            <Grid columns={5}>
                {cols}
            </Grid>
        </>
    );
}