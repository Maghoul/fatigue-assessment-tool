const kssRating = document.getElementById("kss-rating");
const hours24 = document.getElementById("24-hr-sleep");
const hours48 = document.getElementById("48-hr-sleep");
const hoursAwake = document.getElementById("hours-awake");
const fatigueForm = document.getElementById("fatigue-form");
const result = document.getElementById("result");
const resources = document.getElementById("resources");
const schedURL = "https://scheduling.fdx.alpa.org/fatigue";

const overallFatigue = {
    0: { condition: 'No Fatigue', strategy: 'continue monitoring for fatigue', color: 'var(--vibrant-green)' },
    1: { condition: 'Mild Fatigue', strategy: 'try to nap or consider strategic caffeine usage', color: 'var(--yellow-green)' },
    2: { condition: 'Moderate Fatigue', strategy: 'advise the other pilot and try to nap or consider strategic caffeine usage',color: 'var(--yellow)' },
    3: { condition: 'Severe Fatigue', strategy: 'get a nap and reassess before flying', color: 'var(--orange)' },
    4: { condition: 'Extreme Fatigue', strategy: 'follow ALPA fatigue assessment', color: 'var(--red)' }
  };

  const ratingFRI = {
    1: { strategy: 'Keep an eye on yourself', color: 'var(--vibrant-green)' },
    2: { strategy: 'Have someone keep an eye on you', color: 'var(--yellow)' },
    3: { strategy: 'Go to bed',color: 'var(--red)' },
  };

  const ratingKSS = {
    1: { strategy: 'Should be alert for duty', color: 'var(--vibrant-green)' },
    2: { strategy: 'Self-monitor for fatigue, alert other pilot', color: 'var(--yellow)' },
    3: { strategy: 'Go to bed',color: 'var(--red)' },
  };

const colorKSS = (num) => {
    // Set the background color based on the KSS value
    if (num >= 1 && num <= 2) {
      kssRating.style.backgroundColor = "var(--vibrant-green)";
    } else if (num >= 3 && num <= 4) {
      kssRating.style.backgroundColor = "var(--yellow-green)";
    } else if (num ===5) {
      kssRating.style.backgroundColor = "var(--yellow)";
    } else if (num >= 6 && num <= 7) {
      kssRating.style.backgroundColor = "var(--orange)";
    } else if (num >= 8 && num <= 9) {
      kssRating.style.backgroundColor = "var(--red)";
    } else {
      kssRating.style.backgroundColor = "darkgray"; // Fallback for unexpected values
    }
  };

  const createModal = (message) => {
    // Create modal overlay
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");

    // Create modal content
    const modal = document.createElement("div");
    modal.classList.add("modal");

    // Add warning title
    const title = document.createElement("h2");
    title.textContent = "Warning";
    modal.appendChild(title);

    // Add message
    const msg = document.createElement("p");
    msg.textContent = message;
    modal.appendChild(msg);

    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    modal.appendChild(closeBtn);

    // Append modal to overlay
    overlay.appendChild(modal);

    // Append overlay to body
    document.body.appendChild(overlay);

    // Event listeners to close modal
    closeBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        setTimeout(() => overlay.remove(), 300); // Remove after fade-out
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
        step3Score = 0; // No fatigue if 48-hour sleep is greater than hours awake
    } else {
        step3Score = hoursAwakeValue - hours48Value; 
    }

    if (hoursAwakeValue >= 17) {
        const modal = createModal("WARNING: Studies suggest decision making after being awake 17 hrs equates to BAC of  0.05% and after 24 hrs equates to a BAC of 0.10%");
        modal.classList.remove("hidden"); // Show modal
    }
    fatigueRiskIndex = step1Score + step2Score + step3Score; // Calculate total fatigue score

    return fatigueRiskIndex;
  }

  const assessFatigue = (fatigueRiskIndex, kssRatingValue) => {
    // Assess fatigue based on the fatigue score and KSS rating
    // KSS and FRI 1 means 0, KSS and FRI 2 means 2, KSS and FRI 3 means 4
    // KSS 1 and FRI 2 || FRI 1 and KSS 2 means 1, KSS 2 and FRI 3 || FRI 2 and KSS 3 means 3

    let adjustedFRI = 0;
    let adjustedKSS = 0;

    if (fatigueRiskIndex <= 4) {
        adjustedFRI = 1;
    } else if (fatigueRiskIndex > 4 && fatigueRiskIndex <= 8) {
        adjustedFRI = 2;
    } else {
        adjustedFRI = 3;
    };

    if (kssRatingValue < 6) {
        adjustedKSS = 1;
    } else if (kssRatingValue >= 6 && kssRatingValue <= 7) {
        adjustedKSS = 2;
    } else {
        adjustedKSS = 3;
    };

    let combinedFatigue = 0;
    if (adjustedFRI === 1 && adjustedKSS === 1) {
        combinedFatigue = 0; // No Fatigue
    } else if (adjustedFRI === 2 && adjustedKSS === 2) {
        combinedFatigue = 2; // Moderate Fatigue
    } else if (adjustedFRI === 3 && adjustedKSS === 3) {
        combinedFatigue = 4; // Extreme Fatigue
    } else if ((adjustedFRI === 1 && adjustedKSS === 2) || (adjustedFRI === 2 && adjustedKSS === 1)) {
        combinedFatigue = 1; // Mild Fatigue
    } else if (adjustedFRI === 3 || adjustedKSS === 3) {
        combinedFatigue = 3; // Severe Fatigue
    }

    let overallFatigue = [adjustedFRI, adjustedKSS, combinedFatigue]; // Create an array to hold the adjusted values

    return overallFatigue; // Return the overall fatigue ID
  }

  kssRating.addEventListener("change", (e) => {
    const kssValue = parseInt(e.target.value, 10);
    colorKSS(kssValue);
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
    e.preventDefault(); // Prevent form submission
    const hoursAwakeValue = parseFloat(hoursAwake.value); // Use parseFloat for decimal values
    const hours48Value = parseFloat(hours48.value); // Use parseFloat for decimal values
    const hours24Value = parseFloat(hours24.value); // Use parseFloat for decimal values
    const kssRatingValue = parseInt(kssRating.value, 10);
    
    let formResults = document.querySelector(".form-results"); // Select the form results div
    if (formResults) {
        formResults.remove(); // Remove previous results if any
    }

    //document.querySelector(".form-results").innerHTML = ""; // Remove previous results if any

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
    const fatigueRiskIndex = calculateFatigue(hoursAwakeValue, hours48Value, hours24Value); // Call the calculateFatigue function with the input values
    const fatigueAssessment = assessFatigue(fatigueRiskIndex, kssRatingValue); // Call the assessFatigue function with the fatigue risk index and KSS rating
    document.querySelector(".info").classList.add("hidden"); // hide the info section
    document.querySelector(".reset-btn").classList.remove("hidden"); // show the reset button

    const div = document.createElement("div");
    div.classList.add("form-results"); // Add a class to the div for styling
    div.innerHTML = `<p>FRI (Objective): ${fatigueRiskIndex} - <span style="color: ${ratingFRI[fatigueAssessment[0]].color}">${ratingFRI[fatigueAssessment[0]].strategy}</span></p>
    <p>KSS (Subjective): ${kssRatingValue} - <span style="color: ${ratingKSS[fatigueAssessment[1]].color}">${ratingKSS[fatigueAssessment[1]].strategy}.</span></p>`;
    fatigueForm.appendChild(div);

    result.innerHTML = `<div class="final-results"><p>Your answers indicate <span style="color: ${overallFatigue[fatigueAssessment[2]].color}">${overallFatigue[fatigueAssessment[2]].condition}.</span>
   You should ${overallFatigue[fatigueAssessment[2]].strategy}.</p>`;
     
    resources.innerHTML = `<p>For more information, please visit <a href="${schedURL}" target="_blank">ALPA Scheduling</a>.</p>`; // Add a link to the ALPA Scheduling page
    
    console.log("FRI: " + fatigueRiskIndex);
    console.log("KSS: " + kssRatingValue);
    console.log("Fatigue Assessment: " + fatigueAssessment);
    
});

fatigueForm.addEventListener("reset", (e) => {
    e.preventDefault(); // Prevent form submission
    document.querySelector(".info").classList.remove("hidden"); // show the info section
    document.querySelector(".reset-btn").classList.add("hidden"); // hide the reset button
    const formResults = document.querySelector(".form-results");
    if (formResults) formResults.remove();
    result.innerText = ""; // Clear the result text
    resources.innerText = ""; // Clear the resources text
    kssRating.style.backgroundColor = ""; // Reset background color
    kssRating.value = 5; // Reset input value
    hoursAwake.value = 16; // Reset input value
    hours48.value = 15; // Reset input value
    hours24.value = 7; // Reset input value
});

