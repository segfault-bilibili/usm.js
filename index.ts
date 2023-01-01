import { createFFmpeg } from "@ffmpeg/ffmpeg";

var muxedUrl: string | undefined;

let lastTick = 0;
function tick(): void {
    lastTick = Date.now();
}
function tock(str: string): void {
    console.log(str, "took", Date.now() - lastTick);
}

async function decode(usm: ArrayBuffer): Promise<Uint8Array> {
    tick();
    const crid = new CRID();
    const worker = createFFmpeg({
        // single-threaded version
        mainName: 'main',
        corePath: new URL("ffmpeg-core.js", document.baseURI).href,
        log: true
    });
    await worker.load();
    tock("load ffmpeg");

    tick();
    const demuxed = await crid.demuxAsync(usm);
    tock("demux");

    tick();
    worker.FS('writeFile', '/v.ivf', demuxed.video);
    worker.FS('writeFile', '/a.adx', demuxed.audio);
    tock("writeFile to MEMFS");

    tick();
    await worker.run('-i', '/v.ivf', '-i', '/a.adx', '-c:v', 'copy', '/o.mp4');
    tock("run ffmpeg");

    tick();
    const data = worker.FS('readFile', '/o.mp4');
    tock("readFile from MEMFS");

    worker.exit();
    return data;
}

async function play(usm: ArrayBuffer): Promise<void> {
    const decoded = await decode(usm);
    const video = document.getElementById("muxed");
    if (muxedUrl != null) URL.revokeObjectURL(muxedUrl);
    muxedUrl = URL.createObjectURL(new Blob([decoded], { type: "video/mp4" }));
    video?.setAttribute("src", muxedUrl);
}

window.addEventListener("load", () => {
    document.getElementById("usmfile")?.addEventListener("change", (ev) => {
        const usmPromise = (ev.target as HTMLInputElement)?.files?.item(0)?.arrayBuffer();
        usmPromise?.then(usm => play(usm));
    });

    document.getElementById("downloadbtn")?.addEventListener("click", () => {
        const url = document.getElementById("usmurl")?.getAttribute("value");
        if (url == null) return;
        tick();
        fetch(url)
            .then((resp) => {
                if (resp.ok) return resp.arrayBuffer();
                else throw new Error(`fetch failed, code=${resp.status}`);
            })
            .then((usm) => {
                tock("fetch");
                play(usm);
            });
    });

    window.addEventListener("dragover", (ev) => {
        ev.preventDefault();
    });
    window.addEventListener("drop", (ev) => {
        ev.preventDefault();
        let file: File | null = null;
        const dtItems = ev.dataTransfer?.items;
        const dtFiles = ev.dataTransfer?.files;
        if (dtItems != null && dtItems.length == 1) {
            // Use DataTransferItemList interface to access the file(s)
            const item = dtItems[0];
            if (item.kind === "file") {
                file = item.getAsFile();
            }
        } else if (dtFiles != null && dtFiles.length == 1) {
            // Use DataTransfer interface to access the file(s)
            file = dtFiles[0];
        }
        if (file == null) return;
        file.arrayBuffer().then((usm) => play(usm));
    });
});