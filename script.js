const canvas = document.getElementById("roulette-wheel");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spin-button");
const resultMessage = document.getElementById("result-message");
const balanceDisplay = document.getElementById("balance-display");
const chips = document.querySelectorAll(".chip");

// Insert the bonus bet spot before we query betSpots
const rouletteTable = document.querySelector(".roulette-table");
if (rouletteTable) {
  const bonusBetSpot = document.createElement("td");
  bonusBetSpot.className = "bet-spot bonus";
  bonusBetSpot.dataset.bet = "bonus";
  bonusBetSpot.textContent = "Bonus";

  const lastRow = rouletteTable.querySelector("tr:last-child");
  if (lastRow) {
    const lastRowSpots = lastRow.querySelectorAll(".bet-spot");
    let referenceSpot = null;
    lastRowSpots.forEach((spot) => {
      if (spot.dataset.bet === "19-36") {
        referenceSpot = spot;
      }
    });
    if (referenceSpot) {
      referenceSpot.insertAdjacentElement("afterend", bonusBetSpot);
    } else {
      lastRow.appendChild(bonusBetSpot);
    }
  }
}

const betSpots = document.querySelectorAll(".bet-spot");

let balance = 1000;
let selectedChipValue = 1;
let bets = {};
let spinning = false;

const wheelNumbers = [
  "0",
  "28",
  "9",
  "26",
  "11",
  "30",
  "7",
  "20",
  "17",
  "32",
  "5",
  "22",
  "15",
  "34",
  "3",
  "24",
  "13",
  "36",
  "1",
  "00",
  "10",
  "27",
  "8",
  "29",
  "12",
  "25",
  "18",
  "31",
  "6",
  "19",
  "4",
  "33",
  "16",
  "21",
  "2",
  "35",
  "14",
  "23",
];
const wheelColors = [
  "green",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "green",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "black",
  "red",
  "Black",
  "red",
  "black",
  "red",
];

// Categories
const topRow = [
  "3",
  "6",
  "9",
  "12",
  "15",
  "18",
  "21",
  "24",
  "27",
  "30",
  "33",
  "36",
];
const middleRow = [
  "2",
  "5",
  "8",
  "11",
  "14",
  "17",
  "20",
  "23",
  "26",
  "29",
  "32",
  "35",
];
const bottomRow = [
  "1",
  "4",
  "7",
  "10",
  "13",
  "16",
  "19",
  "22",
  "25",
  "28",
  "31",
  "34",
];

const firstDozen = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const secondDozen = [
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
];
const thirdDozen = [
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
];

const redNumbers = [
  "1",
  "3",
  "5",
  "7",
  "9",
  "11",
  "13",
  "15",
  "17",
  "19",
  "21",
  "23",
  "25",
  "27",
  "29",
  "31",
  "33",
  "35",
];
const blackNumbers = [
  "2",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
];

// Bonus variables
let inBonusRound = false;
let bonusStep = 0;
let bonusEligible = false;
let playerBonusChoice = null;
let waitingForPlayerChoice = false;

// Bonus payout tiers
const bonusPayouts = {
  0: 10, // bonus triggered but no correct steps
  1: 15, // round 1 correct
  2: 25, // round 2 correct
  3: 50, // round 3 correct
  4: 200, // round 4 correct
  5: "jackpot", // round 5 correct
};

// Jackpot logic
let jackpot = 10000;
let totalBonusBetThisSession = 0;

// Increment jackpot by $1 every second
setInterval(() => {
  jackpot += 1;
}, 1000);

// Create a bonus message area
const rouletteContainer = document.querySelector(".roulette-container");
let bonusMessage = document.createElement("div");
bonusMessage.id = "bonus-message";
bonusMessage.style.color = "#ffcc00";
bonusMessage.style.marginTop = "20px";
bonusMessage.style.fontFamily = "Arial, sans-serif";
bonusMessage.style.fontSize = "16px";
bonusMessage.textContent = "";
rouletteContainer.appendChild(bonusMessage);

// Draw the Wheel
function drawWheel(rotation = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2;
  const sliceAngle = (2 * Math.PI) / wheelNumbers.length;

  for (let i = 0; i < wheelNumbers.length; i++) {
    const angle = i * sliceAngle + rotation;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
    ctx.fillStyle = wheelColors[i];
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.closePath();

    // Draw Numbers
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle + sliceAngle / 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.fillText(wheelNumbers[i], radius * 0.85, 10);
    ctx.restore();
  }
}

// Initialize Wheel
drawWheel();

// Chip Selection
chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    selectedChipValue = parseInt(chip.dataset.value, 10);
    console.log(`Selected chip: $${selectedChipValue}`);
  });
});

// Categories required per step
const evenMoneyBets = ["red", "black", "odd", "even", "1-18", "19-36"];
const columnBets = ["2to1-top", "2to1-middle", "2to1-bottom"];
const dozenBets = ["1st12", "2nd12", "3rd12"];
// For 4th step (line of 3), we'll reuse columnBets to represent a smaller group
// For 5th step (single number), must pick a single number

function getRequiredCategoryForStep(step) {
  switch (step) {
    case 1:
      return evenMoneyBets;
    case 2:
      return columnBets;
    case 3:
      return dozenBets;
    case 4:
      return columnBets; // stand-in for a line of 3
    case 5:
      return "singleNumber";
  }
}

// Player bet choice logic
betSpots.forEach((spot) => {
  spot.addEventListener("click", () => {
    if (
      inBonusRound &&
      bonusStep > 0 &&
      bonusStep <= 5 &&
      waitingForPlayerChoice
    ) {
      // Player chooses a bonus bet
      const betKey = spot.dataset.number || spot.dataset.bet;
      playerBonusChoice = betKey;
      console.log("Player chosen bonus bet:", playerBonusChoice);
      waitingForPlayerChoice = false;
      bonusMessage.textContent += " (Choice received)";
    }
  });
});

betSpots.forEach((spot) => {
  spot.addEventListener("click", () => {
    const betKey = spot.dataset.number || spot.dataset.bet;

    // Prevent placing additional bonus bets during the bonus round
    if (inBonusRound && betKey === "bonus") {
      alert("Bonus bets cannot be placed during the bonus round.");
      return;
    }

    // Check bonus bet limit before placing the bet
    if (betKey === "bonus" && (bets["bonus"] || 0) + selectedChipValue > 1) {
      alert("Bonus bet is capped at $1 total.");
      return;
    }

    if (balance >= selectedChipValue) {
      balance -= selectedChipValue;
      bets[betKey] = (bets[betKey] || 0) + selectedChipValue;
      updateBalanceDisplay();
      displayChipOnSpot(spot, bets[betKey]);

      // Increment jackpot for bonus bets
      if (betKey === "bonus") {
        const increment = selectedChipValue * 0.02;
        jackpot += increment;
        totalBonusBetThisSession += selectedChipValue;
      }
    } else {
      alert("Not enough balance to place this bet.");
    }
  });
});

// Update Balance Display
function updateBalanceDisplay() {
  balanceDisplay.textContent = `Balance: $${balance.toFixed(2)}`;
}

// Display Chips
function displayChipOnSpot(spot, totalBet) {
  let chipDisplay = spot.querySelector(".chip-display");
  if (!chipDisplay) {
    chipDisplay = document.createElement("div");
    chipDisplay.className = "chip-display";
    spot.appendChild(chipDisplay);
  }
  chipDisplay.textContent = `$${totalBet}`;
}

// Spin the Wheel
spinButton.addEventListener("click", () => {
  if (spinning) return;
  spinning = true;

  if (inBonusRound && bonusStep > 0 && bonusStep <= 5) {
    // We need to ensure player has chosen a bet. If not, choose randomly.
    if (!playerBonusChoice) {
      // No player choice made, pick randomly from the required category
      const category = getRequiredCategoryForStep(bonusStep);
      if (category === "singleNumber") {
        // pick a random single number
        let randNum = (Math.floor(Math.random() * 36) + 1).toString();
        playerBonusChoice = randNum;
      } else {
        // pick a random bet from category
        let chosen = category[Math.floor(Math.random() * category.length)];
        playerBonusChoice = chosen;
      }
      console.log("No player choice, randomly chosen:", playerBonusChoice);
    }
  }

  let rotation = 0;
  let totalRotation = Math.random() * Math.PI * 20;

  // If not in bonus round, 75% chance to force green
  let forceGreen = false;
  if (!inBonusRound) {
    if (Math.random() < 0.75) {
      forceGreen = true;
    }
  }

  const spinInterval = setInterval(() => {
    rotation += Math.PI / 15;
    drawWheel(rotation);
  }, 16);

  setTimeout(() => {
    clearInterval(spinInterval);
    spinning = false;
    let winningNumber;
    if (forceGreen) {
      winningNumber = Math.random() < 0.5 ? "0" : "00";
    } else {
      const winningIndex =
        Math.floor((totalRotation / (2 * Math.PI)) * wheelNumbers.length) %
        wheelNumbers.length;
      winningNumber = wheelNumbers[winningIndex];
    }
    resultMessage.textContent = `Winning number: ${winningNumber}`;
    highlightWinningBets(winningNumber);
    resolveBets(winningNumber);
    checkForBonusTrigger(winningNumber);
    clearBets();
  }, 3000);
});

function highlightWinningBets(winningNumber) {
  betSpots.forEach((spot) => {
    const bet = spot.dataset.number || spot.dataset.bet;
    spot.classList.remove("winner");

    // Highlight spots where the bet matches the winning number
    if (isWinningBet(bet, winningNumber)) {
      spot.classList.add("winner");
    }
  });

  console.log("Winning spots highlighted.");
}

function isWinningBet(bet, winningNumber) {
  if (bet === winningNumber) return true; // Exact match for single number
  if (bet === "2to1-top" && topRow.includes(winningNumber)) return true;
  if (bet === "2to1-middle" && middleRow.includes(winningNumber)) return true;
  if (bet === "2to1-bottom" && bottomRow.includes(winningNumber)) return true;
  if (bet === "1st12" && firstDozen.includes(winningNumber)) return true;
  if (bet === "2nd12" && secondDozen.includes(winningNumber)) return true;
  if (bet === "3rd12" && thirdDozen.includes(winningNumber)) return true;
  if (bet === "red" && redNumbers.includes(winningNumber)) return true;
  if (bet === "black" && blackNumbers.includes(winningNumber)) return true;
  if (bet === "odd" && parseInt(winningNumber) % 2 !== 0) return true;
  if (
    bet === "even" &&
    parseInt(winningNumber) % 2 === 0 &&
    parseInt(winningNumber) > 0
  )
    return true;
  if (
    bet === "1-18" &&
    parseInt(winningNumber) >= 1 &&
    parseInt(winningNumber) <= 18
  )
    return true;
  if (
    bet === "19-36" &&
    parseInt(winningNumber) >= 19 &&
    parseInt(winningNumber) <= 36
  )
    return true;
  return false;
}

function checkForBonusTrigger(winningNumber) {
  if (
    !inBonusRound &&
    (winningNumber === "0" || winningNumber === "00") &&
    bets["bonus"] >= 1
  ) {
    startBonusRound();
  } else if (inBonusRound) {
    const didWin = verifyBonusChoice(winningNumber);

    if (!didWin) {
      console.log("Bonus round ended due to incorrect choice.");
      endBonusRound(false); // Player lost, end bonus round
    } else {
      console.log(`Bonus round step ${bonusStep} cleared!`);
      bonusStep++;
      playerBonusChoice = null; // Reset choice for the next step

      if (bonusStep > 5) {
        console.log("Bonus round completed successfully!");
        endBonusRound(true); // Player completed the bonus round
      } else {
        // Update message and wait for the next choice
        updateBonusMessage(true, bonusStep);
        waitingForPlayerChoice = true;
      }
    }
  }
}

function startBonusRound() {
  if (!bets["bonus"] || bets["bonus"] < 1) {
    console.error("No active bonus bet to trigger the bonus round.");
    return;
  }

  inBonusRound = true;
  bonusEligible = true;
  bonusStep = 1;
  updateBonusMessage(true, bonusStep);
  addGlowingEffect(true);
  waitingForPlayerChoice = true;
  playerBonusChoice = null;

  console.log("Bonus round started. Bonus bet remains active.");
}

function verifyBonusChoice(winningNumber) {
  if (!playerBonusChoice) {
    console.error("No player choice made during bonus round.");
    return false;
  }

  const requiredCategory = getRequiredCategoryForStep(bonusStep);

  // Check if chosen bet is valid for the required category
  let isValidChoice = false;
  if (Array.isArray(requiredCategory)) {
    // Categories like even-money bets or dozens
    isValidChoice = requiredCategory.includes(playerBonusChoice);
  } else if (requiredCategory === "singleNumber") {
    // For single number step
    isValidChoice = !isNaN(parseInt(playerBonusChoice));
  }

  if (!isValidChoice) {
    console.error(
      `Invalid choice: ${playerBonusChoice} for step ${bonusStep}.`
    );
    return false;
  }

  // Check if the player's chosen bet actually won
  const didWin = isWinningBet(playerBonusChoice, winningNumber);

  // Log details for debugging
  console.log(
    `Step: ${bonusStep}, Player choice: ${playerBonusChoice}, Winning number: ${winningNumber}, Did win: ${didWin}`
  );

  return didWin;
}

// Update bonus message
function updateBonusMessage(show, step = 0) {
  if (!show) {
    bonusMessage.textContent = "";
    return;
  }

  let instructions = "";
  switch (step) {
    case 1:
      instructions =
        "Round 1: Pick an even-money bet (Red/Black/Even/Odd/1–18/19–36).";
      break;
    case 2:
      instructions =
        "Round 2: Pick the correct column (2to1-top/middle/bottom).";
      break;
    case 3:
      instructions =
        "Round 3: Pick a dozen bet (1st12, 2nd12, or 3rd12) as stand-in for block of 6.";
      break;
    case 4:
      instructions =
        "Round 4: Pick a column bet (2to1-top/middle/bottom) as stand-in for a line of 3.";
      break;
    case 5:
      instructions = "Round 5: Pick a single number for the jackpot!";
      break;
  }

  bonusMessage.innerHTML = `<strong>Bonus Round Step ${step}:</strong> ${instructions}`;
}

function endBonusRound(success) {
  const achievedStep = success ? bonusStep : bonusStep - 1;

  if (achievedStep === 0) {
    balance += bonusPayouts[0];
    console.log("Bonus round ended at step 0. Awarded: $10.");
  } else {
    const payout = bonusPayouts[achievedStep];
    if (payout === "jackpot") {
      balance += jackpot;
      console.log(`Jackpot awarded: $${jackpot}`);
      jackpot = 10000; // Reset jackpot
    } else {
      balance += payout;
      console.log(
        `Bonus round ended at step ${achievedStep}. Awarded: $${payout}.`
      );
    }
  }

  // Reset bonus round state
  inBonusRound = false;
  bonusEligible = false;
  bonusStep = 0;
  playerBonusChoice = null;
  waitingForPlayerChoice = false;

  // Clear bonus bet
  bets["bonus"] = 0;

  updateBonusMessage(false);
  addGlowingEffect(false);
  updateBalanceDisplay();
}

// Add glowing effect during bonus
function addGlowingEffect(enable) {
  if (enable) {
    canvas.classList.add("bonus-glow");
  } else {
    canvas.classList.remove("bonus-glow");
  }
}

function resolveBets(winningNumber) {
  console.log("Resolving bets for winning number:", winningNumber);

  for (let betKey in bets) {
    let amount = bets[betKey];
    if (betKey === "bonus") continue; // Bonus payout handled separately

    if (isWinningBet(betKey, winningNumber)) {
      let payoutMultiplier = getPayoutMultiplier(betKey);
      let payout = amount * payoutMultiplier;
      console.log(
        `Bet on ${betKey}: Won $${payout} (Payout multiplier: ${payoutMultiplier})`
      );
      balance += payout;
    }
  }
  updateBalanceDisplay();
}

function getPayoutMultiplier(betKey) {
  if (!isNaN(parseInt(betKey))) {
    return 35; // single number
  }

  if (["red", "black", "odd", "even", "1-18", "19-36"].includes(betKey)) {
    return 1; // even money
  }

  if (
    [
      "1st12",
      "2nd12",
      "3rd12",
      "2to1-top",
      "2to1-middle",
      "2to1-bottom",
    ].includes(betKey)
  ) {
    return 2; // dozens/columns
  }

  return 0;
}

// Clear bets after resolution and checking bonus
function clearBets() {
  bets = {};
  betSpots.forEach((spot) => {
    let chipDisplay = spot.querySelector(".chip-display");
    if (chipDisplay) {
      chipDisplay.remove();
    }
    spot.classList.remove("winner");
  });
}

// Initial state
drawWheel();
updateBalanceDisplay();
resultMessage.textContent = "Place your bets and spin!";
// After all your existing code, add these lines (no lines removed, only added):

// Create a toggle button for the rules
const rulesToggleButton = document.createElement("button");
rulesToggleButton.id = "rules-toggle-button";
rulesToggleButton.textContent = "Show Rules";
rouletteContainer.appendChild(rulesToggleButton);

// Create a container for the rules
const rulesContainer = document.createElement("div");
rulesContainer.id = "rules-container";
rulesContainer.style.display = "none";
rulesContainer.style.color = "white";
rulesContainer.style.fontSize = "14px";
rulesContainer.style.background = "rgba(0,0,0,0.7)";
rulesContainer.style.padding = "10px";
rulesContainer.style.marginTop = "10px";
rulesContainer.style.textAlign = "left"; // Ensure text alignment is left
rulesContainer.innerHTML = `
  <h3>Game Rules</h3>
  <p>
    The odds prior to the bonus round are skewed in order to enter the bonus round. Within the bonus rounds, the odds are true to traditional roulette.<br> 
    </p>
    <h3>Getting Started</h3>
  
    - Place your bets on the layout.<br>
    - Press "Spin" to spin the wheel.<br>
    - If you placed a bonus bet and the result is green (0 or 00), you enter the bonus round.<br>
    - In the bonus round, follow the instructions for each step to advance.<br>
    - Click "Show Rules" to toggle these rules at any time.
  </p>
  <h3>Round Payouts</h3>
  <ul>
    <li>Bonus Started: $10</li>
    <li>Round 1: $15</li>
    <li>Round 2: $25</li>
    <li>Round 3: $50</li>
    <li>Round 4: $200</li>
    <li>Round 5: Jackpot</li>
  </ul>
`;
rouletteContainer.appendChild(rulesContainer);

// Add event listener for the toggle button
rulesToggleButton.addEventListener("click", () => {
  if (rulesContainer.style.display === "none") {
    rulesContainer.style.display = "block";
    rulesToggleButton.textContent = "Hide Rules";
  } else {
    rulesContainer.style.display = "none";
    rulesToggleButton.textContent = "Show Rules";
  }
});
