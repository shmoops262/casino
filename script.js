const casinoEl = document.getElementById("casino");
const enterButton = document.getElementById("enter-casino");
const navButtons = document.querySelectorAll(".nav__button");
const games = document.querySelectorAll(".game");
const chipCountEl = document.getElementById("chip-count");
const lifetimeWinningsEl = document.getElementById("lifetime-winnings");
const hotStreakEl = document.getElementById("hot-streak");
const eventLog = document.getElementById("event-log");
const eventTemplate = document.getElementById("event-template");

const casinoState = {
  chips: 1000,
  lifetime: 0,
  streak: 0,
};

function updateStats() {
  chipCountEl.textContent = casinoState.chips;
  lifetimeWinningsEl.textContent = casinoState.lifetime;
  hotStreakEl.textContent = casinoState.streak;
}

function addEvent(description) {
  const eventNode = eventTemplate.content.cloneNode(true);
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  eventNode.querySelector(".log__timestamp").textContent = timestamp;
  eventNode.querySelector(".log__description").textContent = description;
  eventLog.prepend(eventNode);
}

enterButton.addEventListener("click", () => {
  casinoEl.scrollIntoView({ behavior: "smooth" });
  addEvent("Entered the Neon Mirage lobby.");
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    navButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    games.forEach((game) => game.classList.toggle("active", game.id === target));
    if (target !== "vip") {
      addEvent(`Visited the ${button.textContent} tables.`);
    }
  });
});

// Slots game logic
const slotSymbols = ["🍹", "🌴", "🎰", "💿", "🦩", "🎷", "🚤", "🛼"];
const slotReels = [
  document.getElementById("reel-1"),
  document.getElementById("reel-2"),
  document.getElementById("reel-3"),
];
const spinButton = document.getElementById("spin-button");
const slotMessage = document.getElementById("slot-message");
const slotBetSelect = document.getElementById("slot-bet");

function spinReels() {
  return slotReels.map((reel) => {
    const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    reel.textContent = symbol;
    reel.classList.add("spinning");
    setTimeout(() => reel.classList.remove("spinning"), 600);
    return symbol;
  });
}

function handleSlotSpin() {
  const bet = Number(slotBetSelect.value);
  if (casinoState.chips < bet) {
    slotMessage.textContent = "Not enough chips for that spin!";
    slotMessage.style.color = "#ff6f91";
    return;
  }

  casinoState.chips -= bet;
  const results = spinReels();
  let payout = 0;

  if (new Set(results).size === 1) {
    payout = bet * 10;
    slotMessage.textContent = "JACKPOT! Triple match!";
  } else if (new Set(results).size === 2) {
    payout = bet * 2;
    slotMessage.textContent = "Nice pair! You doubled up.";
  } else if (results.includes("🦩")) {
    payout = Math.floor(bet * 1.5);
    slotMessage.textContent = "Flamingo bonus!";
  } else {
    slotMessage.textContent = "Maybe next spin...";
  }

  if (payout > 0) {
    casinoState.chips += payout;
    casinoState.lifetime += payout - bet;
    casinoState.streak += 1;
    addEvent(`Slots win! Collected ${payout} chips.`);
  } else {
    casinoState.lifetime -= bet;
    casinoState.streak = 0;
    addEvent(`Slots loss. Wagered ${bet} chips.`);
  }

  slotMessage.style.color = payout > 0 ? "#00f6ff" : "#ffb347";
  updateStats();
}

spinButton.addEventListener("click", handleSlotSpin);

// Blackjack logic
const deckSuits = ["♠", "♥", "♦", "♣"];
const deckValues = [
  { value: "A", score: [1, 11] },
  { value: "2", score: [2] },
  { value: "3", score: [3] },
  { value: "4", score: [4] },
  { value: "5", score: [5] },
  { value: "6", score: [6] },
  { value: "7", score: [7] },
  { value: "8", score: [8] },
  { value: "9", score: [9] },
  { value: "10", score: [10] },
  { value: "J", score: [10] },
  { value: "Q", score: [10] },
  { value: "K", score: [10] },
];

let deck = [];
let playerHand = [];
let dealerHand = [];
let blackjackActive = false;
const playerHandEl = document.getElementById("player-hand");
const dealerHandEl = document.getElementById("dealer-hand");
const playerTotalEl = document.getElementById("player-total");
const dealerTotalEl = document.getElementById("dealer-total");
const blackjackMessage = document.getElementById("blackjack-message");
const dealButton = document.getElementById("blackjack-deal");
const hitButton = document.getElementById("blackjack-hit");
const standButton = document.getElementById("blackjack-stand");

function buildDeck() {
  deck = [];
  deckSuits.forEach((suit) => {
    deckValues.forEach((card) => {
      deck.push({ value: card.value, suit, score: card.score });
    });
  });
}

function drawCard() {
  if (deck.length === 0) buildDeck();
  const index = Math.floor(Math.random() * deck.length);
  return deck.splice(index, 1)[0];
}

function calculateScore(hand) {
  let totals = [0];
  hand.forEach((card) => {
    const scores = card.score;
    const newTotals = [];
    totals.forEach((total) => {
      scores.forEach((score) => {
        newTotals.push(total + score);
      });
    });
    totals = newTotals;
  });

  const validTotals = totals.filter((total) => total <= 21);
  return validTotals.length ? Math.max(...validTotals) : Math.min(...totals);
}

function renderHand(hand, container) {
  container.innerHTML = "";
  hand.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.textContent = `${card.value}${card.suit}`;
    if (card.suit === "♥" || card.suit === "♦") {
      cardEl.style.color = "#ff5fd2";
    }
    container.appendChild(cardEl);
  });
}

function startBlackjack() {
  blackjackActive = true;
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  renderHand(playerHand, playerHandEl);
  renderHand(dealerHand, dealerHandEl);
  playerTotalEl.textContent = calculateScore(playerHand);
  dealerTotalEl.textContent = calculateScore([dealerHand[0]]);
  blackjackMessage.textContent = "Hit or stand?";
  hitButton.disabled = false;
  standButton.disabled = false;
  dealButton.disabled = true;
  addEvent("Blackjack hand dealt.");
}

function endBlackjack({ message, chipsChange = 0, lifetimeChange = 0, win = false }) {
  blackjackActive = false;
  hitButton.disabled = true;
  standButton.disabled = true;
  dealButton.disabled = false;
  dealerTotalEl.textContent = calculateScore(dealerHand);
  casinoState.chips += chipsChange;
  casinoState.lifetime += lifetimeChange;
  casinoState.streak = win ? casinoState.streak + 1 : 0;
  updateStats();
  addEvent(message);
}

function settleBlackjack() {
  const playerScore = calculateScore(playerHand);
  let dealerScore = calculateScore(dealerHand);

  while (dealerScore < 17) {
    dealerHand.push(drawCard());
    dealerScore = calculateScore(dealerHand);
  }

  renderHand(dealerHand, dealerHandEl);
  dealerTotalEl.textContent = dealerScore;

  if (playerScore > 21) {
    blackjackMessage.textContent = "Bust! Dealer wins.";
    endBlackjack({ message: "Blackjack bust. Lost 50 chips." });
  } else if (dealerScore > 21 || playerScore > dealerScore) {
    blackjackMessage.textContent = "You win!";
    endBlackjack({
      message: "Blackjack victory! Won 75 chips.",
      chipsChange: 125,
      lifetimeChange: 125,
      win: true,
    });
  } else if (playerScore === dealerScore) {
    blackjackMessage.textContent = "Push.";
    endBlackjack({ message: "Blackjack push. No chips exchanged.", chipsChange: 50, lifetimeChange: 50 });
  } else {
    blackjackMessage.textContent = "Dealer wins.";
    endBlackjack({ message: "Dealer showed no mercy. Lost 50 chips." });
  }
}

dealButton.addEventListener("click", () => {
  if (!blackjackActive) {
    if (casinoState.chips < 50) {
      blackjackMessage.textContent = "You need 50 chips to sit at this table.";
      return;
    }
    casinoState.chips -= 50;
    casinoState.lifetime -= 50;
    updateStats();
    addEvent("Placed a 50 chip blackjack bet.");
    startBlackjack();
  }
});

hitButton.addEventListener("click", () => {
  if (!blackjackActive) return;
  playerHand.push(drawCard());
  renderHand(playerHand, playerHandEl);
  const playerScore = calculateScore(playerHand);
  playerTotalEl.textContent = playerScore;
  if (playerScore > 21) {
    blackjackMessage.textContent = "Bust!";
    settleBlackjack();
  }
});

standButton.addEventListener("click", () => {
  if (!blackjackActive) return;
  settleBlackjack();
});

// Roulette logic
const rouletteBetSelect = document.getElementById("roulette-bet");
const rouletteNumberWrapper = document.getElementById("roulette-number-wrapper");
const rouletteNumberInput = document.getElementById("roulette-number");
const rouletteSpinButton = document.getElementById("roulette-spin");
const rouletteMessage = document.getElementById("roulette-message");
const rouletteWheel = document.getElementById("roulette-wheel");

rouletteBetSelect.addEventListener("change", () => {
  rouletteNumberWrapper.classList.toggle("hidden", rouletteBetSelect.value !== "straight");
});

function spinRoulette() {
  const winningNumber = Math.floor(Math.random() * 37);
  const color =
    winningNumber === 0 ? "green" : winningNumber % 2 === 0 ? "black" : "red";
  rouletteWheel.style.transform = `rotate(${Math.floor(Math.random() * 900) + 720}deg)`;
  return { winningNumber, color };
}

function resolveRoulette() {
  const betType = rouletteBetSelect.value;
  const requiredChips = ["high", "low", "straight"].includes(betType) ? 25 : 20;
  if (casinoState.chips < requiredChips) {
    rouletteMessage.textContent = `You need ${requiredChips} chips for that wager.`;
    rouletteMessage.style.color = "#ff6f91";
    return;
  }
  casinoState.chips -= requiredChips;
  casinoState.lifetime -= requiredChips;
  const { winningNumber, color } = spinRoulette();
  let win = false;
  let payout = 0;
  let description = `Roulette spin landed on ${winningNumber} (${color}).`;

  switch (betType) {
    case "red":
      win = color === "red";
      payout = win ? requiredChips * 2 : 0;
      break;
    case "black":
      win = color === "black";
      payout = win ? requiredChips * 2 : 0;
      break;
    case "even":
      win = winningNumber !== 0 && winningNumber % 2 === 0;
      payout = win ? requiredChips * 2 : 0;
      break;
    case "odd":
      win = winningNumber % 2 === 1;
      payout = win ? requiredChips * 2 : 0;
      break;
    case "high":
      win = winningNumber >= 19;
      payout = win ? requiredChips * 2 : 0;
      break;
    case "low":
      win = winningNumber >= 1 && winningNumber <= 18;
      payout = win ? requiredChips * 2 : 0;
      break;
    case "straight": {
      const chosen = Number(rouletteNumberInput.value);
      win = winningNumber === chosen;
      payout = win ? 400 : 0;
      description += ` Bet on ${chosen}.`;
      break;
    }
  }

  if (payout > 0) {
    casinoState.chips += payout;
    casinoState.lifetime += payout;
  }
  const net = payout - requiredChips;
  casinoState.streak = net > 0 ? casinoState.streak + 1 : 0;
  rouletteMessage.textContent = net > 0 ? "You hit the neon!" : "House wins this round.";
  rouletteMessage.style.color = net > 0 ? "#00f6ff" : "#ffb347";
  addEvent(`${description} ${net >= 0 ? `Won ${net}` : `Lost ${Math.abs(net)}`} chips.`);
  updateStats();
}

rouletteSpinButton.addEventListener("click", resolveRoulette);

// Dice game
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const diceOne = document.getElementById("dice-one");
const diceTwo = document.getElementById("dice-two");
const diceRollButton = document.getElementById("dice-roll");
const diceMessage = document.getElementById("dice-message");

function rollDie() {
  const value = Math.floor(Math.random() * 6);
  return { face: diceFaces[value], value: value + 1 };
}

function handleDiceRoll() {
  if (casinoState.chips < 40) {
    diceMessage.textContent = "You need at least 40 chips to heat up the dice.";
    diceMessage.style.color = "#ff6f91";
    return;
  }
  const first = rollDie();
  const second = rollDie();
  diceOne.textContent = first.face;
  diceTwo.textContent = second.face;
  const sum = first.value + second.value;
  let payout = 0;

  if (sum === 7 || sum === 11) {
    payout = 30;
    diceMessage.textContent = `Natural! You rolled ${sum}.`;
    diceMessage.style.color = "#00f6ff";
  } else if (first.value === second.value) {
    payout = 40;
    diceMessage.textContent = `Doubles! ${sum} pays big.`;
    diceMessage.style.color = "#00f6ff";
  } else if (sum === 2 || sum === 12) {
    payout = -40;
    diceMessage.textContent = "Snake eyes! The house grins.";
    diceMessage.style.color = "#ff5fd2";
  } else {
    payout = -15;
    diceMessage.textContent = `You rolled ${sum}. Keep the streak alive.`;
    diceMessage.style.color = "#ffb347";
  }

  casinoState.chips += payout;
  casinoState.lifetime += payout;
  casinoState.streak = payout > 0 ? casinoState.streak + 1 : 0;
  const result = payout >= 0 ? "win" : "loss";
  addEvent(`Dice ${result}! ${payout >= 0 ? `Won ${payout}` : `Lost ${Math.abs(payout)}`} chips.`);
  updateStats();
}

diceRollButton.addEventListener("click", handleDiceRoll);

// Initialize
buildDeck();
updateStats();
addEvent("Arrived at the Neon Mirage boardwalk.");
