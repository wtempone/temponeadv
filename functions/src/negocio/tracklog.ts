import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";
import * as igc2kmz from "./../lib/igc2kmz";

function parseIgcToFly(igcFile: any) {
    var data = igc2kmz.igc2Data(igcFile);
    logger.log("IGC File parsed!");
    return data;
}

export const convertIgcToKml = onRequest(async (request, response) => {
    const igcFile = Buffer.from(request.body.data.igcFile.toString(), 'utf-8').toString();
    logger.log("Converting IGC to KML", igcFile);
    const kml = parseIgcToFly(igcFile)
    if (kml) {
        logger.log("IGC File converted to KML!",kml);
        response.send({
            status: "success",
            data: kml
        });
        return;
    }
    response.send({
        status: "erro",
        data: { error: 'Erro na conversao' }
    });
});
