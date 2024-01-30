
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import puppeteer from 'puppeteer';

export const helloWorld = onRequest((request, response) => {
    logger.debug("Hello logs!", { structuredData: true });
    response.send({
        status: "success",
        data: "Hello William"
    });
});

export const checkLoginCBVL = onRequest(async (request, response) => {

    logger.debug("Iniciando verificacao de senha");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    logger.debug("1 - Abrindo pagina CBVL");
    await page.goto('https://sistema.cbvl.com.br/user/login');
    const inputIdentity = '#identity';
    logger.debug("2 - Procurando campo usuario");
    await page.waitForSelector(inputIdentity);
    logger.debug("3 - Campo usuario encontrado");
    const inputCredential = '#credential';
    if (request.body.data) {
        const identity = request.body.data.user;
        const passsword = request.body.data.password;
        logger.debug("4 - Preenchendo campos de login para usuario ", identity);
        if (identity) {
            await page.type(inputIdentity, identity);
            await page.type(inputCredential, passsword);
            logger.info("5 - Enviando informações");
            await page.click('#LoginSubmit');
            logger.info("6 - Aguardando resposta");
            const textSelector = await page.waitForSelector('.infoNome');
            logger.info("7 - Resposta obtida");
            if (textSelector) {
                logger.info("8 - Fim do processamento com sucesso na validação do usuario");
                const nome = await textSelector?.evaluate(el => el.textContent);

                response.send({
                    status: "success",
                    data: nome
                });
            } else {
                logger.info("8 - Fim do processamento com erro na validação do usuario");
                response.send({
                    status: "erro",
                    data: 'Erro no processo de validação do usuário'
                });
            }
        }
    } else {
        logger.error('Dados não informados')
        response.send({
            status: "erro",
            data: 'Dados não informados'
        });
    }

});
