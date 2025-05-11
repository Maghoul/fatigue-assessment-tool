const overallFatigue = {
         0: { condition: 'No Fatigue', strategy: 'continue monitoring for fatigue', color: 'var(--vibrant-green)' },
         1: { condition: 'Mild Fatigue', strategy: 'try to nap or consider strategic caffeine usage', color: 'var(--yellow-green)' },
         2: { condition: 'Moderate Fatigue', strategy: 'advise the other pilot and try to nap or consider strategic caffeine usage', color: 'var(--yellow)' },
         3: { condition: 'Severe Fatigue', strategy: 'get a nap and reassess before flying', color: 'var(--orange)' },
         4: { condition: 'Extreme Fatigue', strategy: 'follow ALPA fatigue assessment', color: 'var(--red)' }
     };


const ratingFRI = {
         1: { strategy: 'Keep an eye on yourself', color: 'var(--vibrant-green)' },
         2: { strategy: 'Have someone keep an eye on you', color: 'var(--yellow)' },
         3: { strategy: 'Go to bed', color: 'var(--red)' }
     };

const ratingKSS = {
         1: { strategy: 'Should be alert for duty', color: 'var(--vibrant-green)' },
         2: { strategy: 'Self-monitor for fatigue, alert other pilot', color: 'var(--yellow)' },
         3: { strategy: 'Go to bed', color: 'var(--red)' }
     };
    

const RESOURCES = [
    { url: "https://scheduling.fdx.alpa.org/fatigue", text: "ALPA Scheduling Committee (Fatigue)" },
    { url: "https://www.faa.gov/about/initiatives/maintenance_hf/fatigue/multimedia", text: "FAA Fatigue Risk Index Information" },
    { url: "./images/faa_fri_chart.png", text: "- FAA Fatigue Risk Index Chart", class: "image-link" },
    { url: "https://skybrary.aero/articles/karolinska-sleepiness-scale-kss", text: "Karolinska Sleepiness Scale" },
    { url: "https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod3/08.html", text: "CDC: BAC vs Fatigue" }
    
];

function createResourcesDiv() {
    const resourcesDiv = document.createElement("div");
    resourcesDiv.classList.add("resources");

    const title = document.createElement("h3");
    title.innerText = "Resources";
    resourcesDiv.appendChild(title);

    RESOURCES.forEach(resource => {
        const link = document.createElement("a");
        link.href = resource.url;
        link.target = "_blank";
        link.innerText = resource.text;
        if (resource.class) link.classList.add(resource.class);
        resourcesDiv.appendChild(link);
    });

    return resourcesDiv;
}

export {createResourcesDiv, overallFatigue, ratingFRI, ratingKSS};