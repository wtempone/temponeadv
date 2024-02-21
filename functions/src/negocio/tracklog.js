"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracklog = exports.getDaysActivities = void 0;
var storage_1 = require("firebase-admin/storage");
var firebase_admin_1 = require("firebase-admin");
var https_1 = require("firebase-functions/v2/https");
var logger = require("firebase-functions/logger");
var igc2kmz = require("./../lib/igc2kmz");
function getDataTrack(id) {
    return __awaiter(this, void 0, void 0, function () {
        var fileBucket, fligth, bucket, downloadResponse, igcFile, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileBucket = '/tracklogs';
                    fligth = id;
                    bucket = (0, storage_1.getStorage)().bucket(fileBucket);
                    return [4 /*yield*/, bucket.file(fligth).download()];
                case 1:
                    downloadResponse = _a.sent();
                    console.log('arquivo', downloadResponse[0]);
                    igcFile = downloadResponse[0].toString("utf-8");
                    if (igcFile) {
                        logger.log("IGC File downloaded!");
                        data = parseIgcToFly(igcFile);
                        return [2 /*return*/, data];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function parseIgcToFly(igcFile) {
    var data = igc2kmz.igc2Data(igcFile);
    logger.log("IGC File parsed!");
    return data;
}
exports.getDaysActivities = (0, https_1.onRequest)(function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var tracklogRef, userdataRef, tracklogSnapshot, tracklogData, listTracksDiario;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tracklogRef = (0, firebase_admin_1.firestore)().collection('tracklogs');
                userdataRef = (0, firebase_admin_1.firestore)().collection('userdata');
                return [4 /*yield*/, tracklogRef.orderBy('data', 'desc').get()];
            case 1:
                tracklogSnapshot = _a.sent();
                tracklogData = Array();
                tracklogSnapshot.docs.forEach(function (tracklog) {
                    tracklogData.push(tracklog.data());
                });
                if (tracklogData.length === 0) {
                    response.send({
                        status: "success",
                        data: []
                    });
                    return [2 /*return*/];
                }
                listTracksDiario = Array();
                tracklogData.forEach(function (tracklog) { return __awaiter(void 0, void 0, void 0, function () {
                    var userdataSnapshot, userdata, tracklogData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, userdataRef.doc(tracklog.userId).get()];
                            case 1:
                                userdataSnapshot = _a.sent();
                                userdata = userdataSnapshot.data();
                                return [4 /*yield*/, getDataTrack(tracklog.id)];
                            case 2:
                                tracklogData = _a.sent();
                                logger.log("Tracklog Data: ", tracklogData);
                                logger.log("User Data: ", userdata);
                                return [2 /*return*/];
                        }
                    });
                }); });
                response.send({
                    status: "success",
                    data: listTracksDiario
                });
                return [2 /*return*/];
        }
    });
}); });
exports.getTracklog = (0, https_1.onRequest)(function (request, response) { return __awaiter(void 0, void 0, void 0, function () {
    var errorMessage, data;
    return __generator(this, function (_a) {
        logger.log("Iniciando processamento do Tracklog!");
        errorMessage = '';
        data = getDataTrack(request.body.data.fligth);
        if (data) {
            response.send({
                status: "success",
                data: data
            });
            return [2 /*return*/];
        }
        response.send({
            status: "erro",
            data: { error: errorMessage }
        });
        return [2 /*return*/];
    });
}); });
