export interface ITracklogDiario {
    id: string;
    data: Date;
    maior_altitude: number;
    maior_distancia: number;
    melhor_pontuacao: number;
    pilotos: [
        {
            id: string;
            nome: string;
            foto: string;
        }
    ]
}
