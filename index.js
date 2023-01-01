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
        while (_) try {
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


var muxedUrl;
var lastTick = 0;
function tick() {
    lastTick = Date.now();
}
function tock(str) {
    console.log(str, "took", Date.now() - lastTick);
}
function decode(usm) {
    return __awaiter(this, void 0, void 0, function () {
        var crid, worker, demuxed, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tick();
                    crid = new CRID();
                    worker = FFmpeg.createFFmpeg({
                        // single-threaded version
                        mainName: 'main',
                        corePath: new URL("ffmpeg-core.js", document.baseURI).href,
                        log: true
                    });
                    return [4 /*yield*/, worker.load()];
                case 1:
                    _a.sent();
                    tock("load ffmpeg");
                    tick();
                    demuxed = crid.demux(usm.slice(0));
                    tock("demux");
                    tick();
                    worker.FS('writeFile', '/v.ivf', demuxed.video);
                    worker.FS('writeFile', '/a.adx', demuxed.audio);
                    tock("writeFile to MEMFS");
                    tick();
                    return [4 /*yield*/, worker.run('-i', '/v.ivf', '-i', '/a.adx', '-c:v', 'copy', '/o.mp4')];
                case 2:
                    _a.sent();
                    tock("run ffmpeg");
                    tick();
                    data = worker.FS('readFile', '/o.mp4');
                    tock("readFile from MEMFS");
                    worker.exit();
                    return [2 /*return*/, data];
            }
        });
    });
}
function play(usm) {
    return __awaiter(this, void 0, void 0, function () {
        var decoded, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, decode(usm)];
                case 1:
                    decoded = _a.sent();
                    video = document.getElementById("muxed");
                    if (muxedUrl != null)
                        URL.revokeObjectURL(muxedUrl);
                    muxedUrl = URL.createObjectURL(new Blob([decoded], { type: "video/mp4" }));
                    video === null || video === void 0 ? void 0 : video.setAttribute("src", muxedUrl);
                    return [2 /*return*/];
            }
        });
    });
}
window.addEventListener("load", function () {
    var _a, _b;
    (_a = document.getElementById("usmfile")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", function (ev) {
        var _a, _b, _c;
        var usmPromise = (_c = (_b = (_a = ev.target) === null || _a === void 0 ? void 0 : _a.files) === null || _b === void 0 ? void 0 : _b.item(0)) === null || _c === void 0 ? void 0 : _c.arrayBuffer();
        usmPromise === null || usmPromise === void 0 ? void 0 : usmPromise.then(function (usm) { return play(usm); });
    });
    (_b = document.getElementById("downloadbtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        var _a;
        var url = (_a = document.getElementById("usmurl")) === null || _a === void 0 ? void 0 : _a.getAttribute("value");
        if (url == null)
            return;
        tick();
        fetch(url)
            .then(function (resp) {
            if (resp.ok)
                return resp.arrayBuffer();
            else
                throw new Error("fetch failed, code=" + resp.status);
        })
            .then(function (usm) {
            tock("fetch");
            play(usm);
        });
    });
    window.addEventListener("dragover", function (ev) {
        ev.preventDefault();
    });
    window.addEventListener("drop", function (ev) {
        var _a, _b;
        ev.preventDefault();
        var file = null;
        var dtItems = (_a = ev.dataTransfer) === null || _a === void 0 ? void 0 : _a.items;
        var dtFiles = (_b = ev.dataTransfer) === null || _b === void 0 ? void 0 : _b.files;
        if (dtItems != null && dtItems.length == 1) {
            // Use DataTransferItemList interface to access the file(s)
            var item = dtItems[0];
            if (item.kind === "file") {
                file = item.getAsFile();
            }
        }
        else if (dtFiles != null && dtFiles.length == 1) {
            // Use DataTransfer interface to access the file(s)
            file = dtFiles[0];
        }
        if (file == null)
            return;
        file.arrayBuffer().then(function (usm) { return play(usm); });
    });
});
