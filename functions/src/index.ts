
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import Gerencianet from 'gn-api-sdk-typescript';
import options from './credentials';
const chavePix = 'a8fbfdb0-2d78-4ecd-9dd9-687061e610b5';

export const pixPayment = onRequest(async (request, response) => {

    const payload = request.body.data.user;

    logger.debug("Recebendo Pix");

    const body = {
        calendario: {
            expiracao: 3600,
        },
        devedor: {
            cpf: '94271564656',
            nome: 'Gorbadock Oldbuck',
        },
        valor: {
            original: '123.45',
        },
        chave: chavePix,
        infoAdicionais: [
            {
                nome: 'Pagamento em',
                valor: 'NOME DO SEU ESTABELECIMENTO',
            },
            {
                nome: 'Pedido',
                valor: 'NUMERO DO PEDIDO DO CLIENTE',
            },
        ],
    };

    const gerencianet = new Gerencianet(options);
    try {
        const respostaPix = await gerencianet.pixCreateImmediateCharge([], body);
        logger.log('resposta Pix:',respostaPix);

        const qrCode = await gerencianet.pixGenerateQRCode({id: respostaPix.loc.id});
        logger.log('qrCode:',qrCode);

        response.send({
            status: "success",
            data: { payload: payload, resposta: respostaPix, qrCode: qrCode }
        });
    } catch (error) {
        logger.log('Erro no pagamento pix');
        response.send({
            status: "erro",
            data: error
        });
    }
});


