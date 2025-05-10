     const kssRating = document.getElementById("kss-rating");
     const hours24 = document.getElementById("24-hr-sleep");
     const hours48 = document.getElementById("48-hr-sleep");
     const hoursAwake = document.getElementById("hours-awake");
     const fatigueForm = document.getElementById("fatigue-form");
     const result = document.getElementById("result");
     const schedURL = "https://scheduling.fdx.alpa.org/fatigue";
     const alcoholURL = "https://www.cdc.gov/niosh/work-hour-training-for-nurses/longhours/mod3/08.html";
     const kssURL = "https://skybrary.aero/articles/karolinska-sleepiness-scale-kss";
     const friURL = "https://www.faa.gov/about/initiatives/maintenance_hf/fatigue/multimedia";

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
         3: { strategy: 'Go to bed', color: 'var(--red)' },
     };

     const ratingKSS = {
         1: { strategy: 'Should be alert for duty', color: 'var(--vibrant-green)' },
         2: { strategy: 'Self-monitor for fatigue, alert other pilot', color: 'var(--yellow)' },
         3: { strategy: 'Go to bed', color: 'var(--red)' },
     };

     const colorKSS = (num) => {
         if (num >= 1 && num <= 2) {
             kssRating.style.backgroundColor = "var(--vibrant-green)";
         } else if (num >= 3 && num <= 4) {
             kssRating.style.backgroundColor = "var(--yellow-green)";
         } else if (num === 5) {
             kssRating.style.backgroundColor = "var(--yellow)";
         } else if (num >= 6 && num <= 7) {
             kssRating.style.backgroundColor = "var(--orange)";
         } else if (num >= 8 && num <= 9) {
             kssRating.style.backgroundColor = "var(--red)";
         } else {
             kssRating.style.backgroundColor = "darkgray";
         }
     };
     colorKSS(kssRating.value);

     const createModal = (message) => {
         const overlay = document.createElement("div");
         overlay.classList.add("modal-overlay");
         const modal = document.createElement("div");
         modal.classList.add("modal");
         const title = document.createElement("h2");
         title.textContent = "Warning";
         modal.appendChild(title);
         const msg = document.createElement("p");
         msg.textContent = message;
         modal.appendChild(msg);
         const closeBtn = document.createElement("button");
         closeBtn.textContent = "Close";
         modal.appendChild(closeBtn);
         overlay.appendChild(modal);
         document.body.appendChild(overlay);
         closeBtn.addEventListener("click", () => {
             overlay.classList.add("hidden");
             setTimeout(() => overlay.remove(), 300);
         });
         overlay.addEventListener("click", (e) => {
             if (e.target === overlay) {
                 overlay.classList.add("hidden");
                 setTimeout(() => overlay.remove(), 300);
             }
         });
         return overlay;
     };

     const calculateFatigue = (hoursAwakeValue, hours48Value, hours24Value) => {
         let step1Score = 0;
         let step2Score = 0;
         let step3Score = 0;
         let fatigueRiskIndex = 0;
         if (hours24Value < 2) {
             step1Score = 12;
         } else if (hours24Value <= 5) {
             step1Score = -4 * hours24Value + 20;
         } else {
             step1Score = 0;
         }
         if (hours48Value < 8) {
             step2Score = 8;
         } else if (hours48Value <= 12) {
             step2Score = -2 * hours48Value + 24;
         } else {
             step2Score = 0;
         }
         if (hours48Value > hoursAwakeValue) {
             step3Score = 0;
         } else {
             step3Score = hoursAwakeValue - hours48Value;
         }
         if (hoursAwakeValue >= 17) {
             const modal = createModal("Studies suggest decision making after being awake 17 hrs equates to a BAC of 0.05% and after 24 hrs equates to a BAC of 0.10%");
             modal.classList.remove("hidden");
         }
         fatigueRiskIndex = step1Score + step2Score + step3Score;
         return fatigueRiskIndex;
     };

     const assessFatigue = (fatigueRiskIndex, kssRatingValue) => {
         let adjustedFRI = 0;
         let adjustedKSS = 0;
         if (fatigueRiskIndex <= 4) {
             adjustedFRI = 1;
         } else if (fatigueRiskIndex > 4 && fatigueRiskIndex <= 8) {
             adjustedFRI = 2;
         } else {
             adjustedFRI = 3;
         }
         if (kssRatingValue < 6) {
             adjustedKSS = 1;
         } else if (kssRatingValue >= 6 && kssRatingValue <= 7) {
             adjustedKSS = 2;
         } else {
             adjustedKSS = 3;
         }
         let combinedFatigue = 0;
         if (adjustedFRI === 1 && adjustedKSS === 1) {
             combinedFatigue = 0;
         } else if (adjustedFRI === 2 && adjustedKSS === 2) {
             combinedFatigue = 2;
         } else if (adjustedFRI === 3 && adjustedKSS === 3) {
             combinedFatigue = 4;
         } else if ((adjustedFRI === 1 && adjustedKSS === 2) || (adjustedFRI === 2 && adjustedKSS === 1)) {
             combinedFatigue = 1;
         } else if (adjustedFRI === 3 || adjustedKSS === 3) {
             combinedFatigue = 3;
         }
         return [adjustedFRI, adjustedKSS, combinedFatigue];
     };

     kssRating.addEventListener("change", (e) => {
         const kssValue = parseInt(e.target.value, 10);
         colorKSS(kssValue);
     });

     hours24.addEventListener("focus", function() {
         this.select();
     });

     hours48.addEventListener("focus", function() {
         this.select();
     });

     hoursAwake.addEventListener("focus", function() {
         this.select();
     });

     hoursAwake.addEventListener("input", (e) => {
         const hoursValue = parseFloat(e.target.value);
         if (isNaN(hoursValue) || hoursValue < 0) {
             hoursAwake.style.backgroundColor = "var(--red)";
         } else if (hoursValue >= 24) {
             hoursAwake.style.backgroundColor = "var(--red)";
         } else if (hoursValue >= 17) {
             hoursAwake.style.backgroundColor = "var(--yellow)";
         } else {
             hoursAwake.style.backgroundColor = "var(--primary-color)";
         }
     });

     fatigueForm.addEventListener("submit", (e) => {
         e.preventDefault();
         const hoursAwakeValue = parseFloat(hoursAwake.value);
         const hours48Value = parseFloat(hours48.value);
         const hours24Value = parseFloat(hours24.value);
         const kssRatingValue = parseInt(kssRating.value, 10);

         const existingResults = document.querySelector(".form-results");
         if (existingResults) {
             existingResults.remove();
         }

         if (isNaN(hoursAwakeValue) || isNaN(hours48Value) || isNaN(hours24Value)) {
             alert("Please enter valid numbers for all fields.");
             return;
         }

         if (hoursAwakeValue < 0 || hours48Value < 0 || hours24Value < 0) {
             alert("Please enter positive numbers for all fields.");
             return;
         }

         if (hours48Value < hours24Value) {
             alert("48-hour sleep value should include the 24-hour sleep value.");
             return;
         }

         if (hours24Value > 24 || hoursAwakeValue > 24) {
             alert("Hours awake or sleep in 24 hours cannot exceed 24.");
             return;
         }

         const fatigueRiskIndex = calculateFatigue(hoursAwakeValue, hours48Value, hours24Value);
         const fatigueAssessment = assessFatigue(fatigueRiskIndex, kssRatingValue);
         document.querySelector(".info").classList.add("hidden");
         fatigueForm.classList.add("hidden");
         const strFRI = Math.round(fatigueRiskIndex);

         const div = document.createElement("div");
         div.classList.add("form-results");
         const divH2 = document.createElement("h2");
         divH2.innerText = "Fatigue Assessment Results";
         div.appendChild(divH2);

        // Add graphical display
         const graphsDiv = document.createElement("div");
         graphsDiv.classList.add("fatigue-graphs");

         // FRI Graph
         const friGraph = document.createElement("div");
         friGraph.classList.add("graph-container");
         const friLabel = document.createElement("div");
         friLabel.classList.add("graph-label");
         friLabel.innerText = "Fatigue Risk Index";
         friGraph.appendChild(friLabel);
         const friBar = document.createElement("div");
         friBar.classList.add("graph-bar");
         const friFill = document.createElement("div");
         friFill.classList.add("graph-fill");
         const friValue = Math.min(Math.round(fatigueRiskIndex), 9);
         friFill.style.width = `${(friValue / 9) * 100}%`;
         friFill.style.backgroundColor = ratingFRI[fatigueAssessment[0]].color;
         friBar.appendChild(friFill);
         friGraph.appendChild(friBar);
         graphsDiv.appendChild(friGraph);

         // KSS Graph
         const kssGraph = document.createElement("div");
         kssGraph.classList.add("graph-container");
         const kssLabel = document.createElement("div");
         kssLabel.classList.add("graph-label");
         kssLabel.innerText = "Karolinska Sleepiness Scale";
         kssGraph.appendChild(kssLabel);
         const kssBar = document.createElement("div");
         kssBar.classList.add("graph-bar");
         const kssFill = document.createElement("div");
         kssFill.classList.add("graph-fill");
         kssFill.style.width = `${(kssRatingValue / 9) * 100}%`;
         kssFill.style.backgroundColor = ratingKSS[fatigueAssessment[1]].color;
         kssBar.appendChild(kssFill);
         kssGraph.appendChild(kssBar);
         graphsDiv.appendChild(kssGraph);

         div.appendChild(graphsDiv);
         div.appendChild(document.createElement("hr"));


         const divFriP = document.createElement("p");
         divFriP.innerText = `FRI (Objective): ${strFRI} - `;
         const divFriSpan = document.createElement("span");
         divFriSpan.style.color = ratingFRI[fatigueAssessment[0]].color;
         divFriSpan.innerText = ` ${ratingFRI[fatigueAssessment[0]].strategy}`;
         divFriP.appendChild(divFriSpan);
         div.appendChild(divFriP);
         const divKssP = document.createElement("p");
         divKssP.innerText = `KSS (Subjective): ${kssRatingValue} - `;
         const divKssSpan = document.createElement("span");
         divKssSpan.style.color = ratingKSS[fatigueAssessment[1]].color;
         divKssSpan.innerText = ` ${ratingKSS[fatigueAssessment[1]].strategy}.`;
         divKssP.appendChild(divKssSpan);
         div.appendChild(divKssP);
         div.appendChild(document.createElement("hr"));
         const analysisP = document.createElement("p");
         const analysisSpan = document.createElement("span");
         analysisSpan.style.color = overallFatigue[fatigueAssessment[2]].color;
         analysisSpan.innerText = overallFatigue[fatigueAssessment[2]].condition;
         analysisP.innerText = "Your answers indicate ";
         analysisP.appendChild(analysisSpan);
         analysisP.innerHTML += `. You should ${overallFatigue[fatigueAssessment[2]].strategy}.`;
         div.appendChild(analysisP);

         const buttonContainer = document.createElement("div");
         buttonContainer.classList.add("button-container");
         const resetBtn = document.createElement("button");
         resetBtn.classList.add("reset-btn");
         resetBtn.innerText = "Return";
         resetBtn.addEventListener("click", () => {
             document.querySelector(".info").classList.remove("hidden");
             fatigueForm.classList.remove("hidden");
             const formResults = document.querySelector(".form-results");
             if (formResults) formResults.remove();
             if (result) result.innerHTML = "";
             
            // For now retain previous values
            //kssRating.style.backgroundColor = "";
            //  kssRating.value = 5;
            //  hoursAwake.value = 16;
            //  hoursAwake.style.backgroundColor = "var(--primary-color)"
            //  hours48.value = 15;
            //  hours24.value = 7;
         });
         buttonContainer.appendChild(resetBtn);
         div.appendChild(buttonContainer);
         
         result.appendChild(div);

         const resourcesDiv = document.createElement("div");
         resourcesDiv.classList.add("resources");
         const title = document.createElement("h3");
         title.innerText = "Resources";
         resourcesDiv.appendChild(title);
         const alpaLink = document.createElement("a");
         alpaLink.href = schedURL;
         alpaLink.target = "_blank";
         alpaLink.innerText = "ALPA Scheduling Committee (Fatigue)";
         resourcesDiv.appendChild(alpaLink);
         const friLink = document.createElement("a");
         friLink.href = friURL;
         friLink.target = "_blank";
         friLink.innerText = "FAA Fatigue Risk Index";
         resourcesDiv.appendChild(friLink);
         const alcoholLink = document.createElement("a");
         alcoholLink.href = alcoholURL;
         alcoholLink.target = "_blank";
         alcoholLink.innerText = "CDC: BAC vs Fatigue";
         resourcesDiv.appendChild(alcoholLink);
         const kssLink = document.createElement("a");
         kssLink.href = kssURL;
         kssLink.target = "_blank";
         kssLink.innerText = "Karolinska Sleepiness Scale";
         resourcesDiv.appendChild(kssLink);

         result.appendChild(resourcesDiv);
     });

    fatigueForm.addEventListener("reset", (e) => {
      e.preventDefault(); // Prevent form submission
      document.querySelector(".info").classList.remove("hidden"); // show the info section
      //document.querySelector(".reset-btn").classList.add("hidden"); // hide the reset button
      const formResults = document.querySelector(".form-results");
      if (formResults) formResults.remove();
      result.innerText = ""; // Clear the result text
      kssRating.value = 6; // Reset input value
      colorKSS(kssRating.value); // Reset color
      hoursAwake.value = 16; // Reset input value
      hoursAwake.style.backgroundColor = "var(--primary-color)"
      hours48.value = 15; // Reset input value
      hours24.value = 7; // Reset input value
});