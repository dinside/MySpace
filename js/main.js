const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function drawDot(x, y) {
    const dot = document.createElementNS("https://www.w3.org/2000/svg", "circle");
    dot.setAttributeNS(null, "cx", x);
    dot.setAttributeNS(null, "cy", y);
    dot.setAttributeNS(null, "r", 2);
    dot.setAttributeNS(null, "fill", "#ff0000");
    svg.appendChild(dot);
}

function blastOut(pieces, factor = 3) {
    pieces.forEach((p, i) => {
        const bbox = p.getBBox();
        const [centerX, centerY] = [
            bbox.x + bbox.width / 2,
            bbox.y + bbox.height / 2
        ];

        const [startX, startY] = [
            svgCenterX + (centerX - svgCenterX) * factor,
            svgCenterY + (centerY - svgCenterY) * factor
        ];

        // drawDot(startX, startY);

        gsap.set(p, {
            x: startX - centerX,
            y: startY - centerY
        });
    });
}

const svg = document.getElementById("theSvg");

const [svgCenterX, svgCenterY] = [svg.clientWidth / 2, svg.clientHeight / 2];

const timelineDefaults = {
    defaults: {
        svgOrigin: `${svgCenterX} ${svgCenterY}`
    }
};

const confettiSettings = {
    angle: 90,
    spread: 60,
    startVelocity: 40,
    elementCount: 150,
    dragFriction: 0.12,
    duration: 6000,
    stagger: 0,
    width: "10px",
    height: "10px",
    perspective: "500px",
    colors: ["#8027a9", "#d81d52", "#dd5b1f", "#f3e229", "#aade1e", "#5b9a68"]
};

function init() {
    // #_1
    const _1 = $$("#_1 polygon");
    _1.forEach((el, i) => {
        gsap.set(el, {
            svgOrigin: `${svgCenterX} ${svgCenterY}`,
            rotation: i * -60
        });
    });
    // #_2
    const _2 = $$("#_2 polygon");
    gsap.set(_2, {
        opacity: 0
    });
    blastOut(_2, 4.5);

    // #_3
    gsap.set("#_3 polygon", { scale: 0, transformOrigin: "center" });

    // #_4
    blastOut($$("#_4 polygon"));
}

const timelines = {
    // inner star
    _1: () => {
        const timeline = gsap.timeline(timelineDefaults);
        const pieces = $$("#_1 polygon");
        pieces.forEach((d, i) => {
            timeline.to(
                d,
                {
                    duration: i * 0.5,
                    ease: "linear",
                    rotation: 0
                },
                "<"
            );
        });
        return timeline;
    },

    // inner hex
    _2: () => {
        const timeline = gsap.timeline(timelineDefaults);
        timeline.to("#_2 polygon", {
            duration: 1.5,
            opacity: 1,
            rotation: 360,
            x: 0,
            y: 0,
            stagger: {
                each: 0.1
            }
        });

        return timeline;
    },

    // outer triangles
    _3: () => {
        const timeline = gsap.timeline();
        timeline.to("#_3 polygon", {
            ease: "back.out(2)",
            scale: 1,
            stagger: {
                each: 0.2
            }
        });
        return timeline;
    },

    // outer hex
    _4: () => {
        const timeline = gsap.timeline(timelineDefaults);
        timeline.to("#_4 polygon", {
            duration: 1.7,
            ease: "bounce",
            x: 0,
            y: 0
        });

        return timeline;
    },

    party: () => {
        const timeline = gsap.timeline(timelineDefaults);

        // strobe
        timeline.to("#hexeosisStar", {
            duration: 0.05,
            ease: "linear",
            opacity: 1,
            yoyo: true,
            repeat: 10,
            onStart: () => {
                // for some reason this was sometimes double- or triple-firing
                if (!onlyOncePlease) {
                    onlyOncePlease = true;
                    // oontz
                    sound.play();

                    // poof
                    confetti($(".confetti-1"), confettiSettings);
                    confetti($(".confetti-2"), confettiSettings);
                }
            }
        });

        return timeline;
    },

    credits: () => {
        const timeline = gsap.timeline();
        timeline.set("#credits", {
            visibility: "visible"
        });
        timeline.to("#credits > *", {
            duration: 1,
            opacity: 1,
            stagger: {
                each: 0.5
            }
        });
        return timeline;
    }
};

function onSoundLoad() {
    $("#startButton").style.display = "block";
    gsap.delayedCall(0.1, () => $("#startButton").classList.add("show"));
}

function go() {
    waiter.pause();
    gsap.to(waiter, {
        progress: 0
    });

    $("#startButton").classList.remove("show");
    $("#startButton").addEventListener("transitionend", (e) => {
        e.target.style.display = "none";
        tl.play();
    });

    const tl = gsap.timeline();
    // wait until start button's fade is done
    tl.pause();

    tl.add(timelines._1());
    tl.add(timelines._2(), "-=1");
    tl.add(timelines._3());
    tl.add(timelines._4(), "-=0.5");
    tl.add(timelines.party(), "+=1");
    tl.add(timelines.credits(), "+=2");

    // ScrubGSAPTimeline(tl);
    return tl;
}

init();

const waiter = gsap.to("#_1 polygon", {
    duration: 1.25,
    ease: "sine.inOut",
    fill: "#a1cbfe",
    repeat: -1,
    yoyo: true
});

let tl;

$("#startButton").addEventListener("click", () => {
    tl = go();
});

$("#resetButton").addEventListener("click", () => {
    onlyOncePlease = false;
    sound.fade(1, 0, 1000);
    tl.pause();
    tl.seek("-=3");
    gsap.to(tl, {
        duration: 3.5,
        ease: "power2.in",
        progress: 0,
        onComplete: () => {
            gsap.delayedCall(0.5, () => tl.play());
        }
    });
});

const sound = new Howl({
    src: ["https://soma.space/gsap/partyloop_v1.mp3"],
    loop: true,
    onload: () => {
        onSoundLoad();
    },
    onfade: () => {
        sound.stop();
        sound.volume(1);
    }
});

let onlyOncePlease = false;