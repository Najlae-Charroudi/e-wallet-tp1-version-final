import { getbeneficiaries, finduserbyaccount, findbeneficiarieByid } from "../controllers/database.js";

const user = JSON.parse(sessionStorage.getItem("currentUser"));

// DOM
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");

const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");
const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const submitTransferBtn = document.getElementById("submitTransferBtn");

// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// Events
transferBtn.addEventListener("click", () => {
  transferSection.classList.add("active");
});

closeTransferBtn.addEventListener("click", closeTransfer);
cancelTransferBtn.addEventListener("click", closeTransfer);
submitTransferBtn.addEventListener("click", handleTransfer);

// Dashboard
function renderDashboard() {
  greetingName.textContent = user.name;
  currentDate.textContent = new Date().toLocaleDateString("fr-FR");
  solde.textContent = `${user.wallet.balance} ${user.wallet.currency}`;
  activecards.textContent = user.wallet.cards.length;

  const income = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((a, t) => a + t.amount, 0);

  const expenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((a, t) => a + t.amount, 0);

  incomeElement.textContent = income + " MAD";
  expensesElement.textContent = expenses + " MAD";

  transactionsList.innerHTML = "";
  user.wallet.transactions.forEach(t => {
    const div = document.createElement("div");
    div.innerHTML = `${t.date} - ${t.amount} MAD - ${t.type}`;
    transactionsList.appendChild(div);
  });
}
renderDashboard();

// UI
function closeTransfer() {
  transferSection.classList.remove("active");
}

// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

beneficiaries.forEach(b => {
  const option = document.createElement("option");
  option.value = b.id;
  option.textContent = b.name;
  beneficiarySelect.appendChild(option);
});

user.wallet.cards.forEach(c => {
  const option = document.createElement("option");
  option.value = c.numcards;
  option.textContent = c.type + "****" + c.numcards;
  sourceCard.appendChild(option);
});


// =================== PROMISES ===================

// checkUser
function checkUser(numcompte) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const dest = finduserbyaccount(numcompte);
      if (dest) resolve(dest);
      else reject("Destinataire non trouvé");
    }, 500);
  });
}

// checkSolde
function checkSolde(exp, amount) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (exp.wallet.balance >= amount)
        resolve("Solde suffisant");
      else reject("Solde insuffisant");
    }, 400);
  });
}

// updateSolde
function updateSolde(exp, dest, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      exp.wallet.balance -= amount;
      dest.wallet.balance += amount;
      resolve("Solde mis à jour");
    }, 300);
  });
}

// addtransactions
function addtransactions(exp, dest, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const debit = {
        id: Date.now(),
        type: "debit",
        amount,
        from: exp.name,
        to: dest.name,
        date: new Date().toLocaleDateString()
      };

      const credit = {
        id: Date.now() + 1,
        type: "credit",
        amount,
        from: exp.name,
        to: dest.name,
        date: new Date().toLocaleDateString()
      };

      exp.wallet.transactions.push(debit);
      dest.wallet.transactions.push(credit);

      renderDashboard();
      resolve("Transaction enregistrée");
    }, 200);
  });
}


// =================== TRANSFER ===================

function transfer(exp, numcompte, amount) {
  console.log("Début du transfert");

  checkUser(numcompte)
    .then(dest => {
      console.log("Étape 1:", dest.name);
      return checkSolde(exp, amount).then(() => dest);
    })
    .then(dest => {
      console.log("Étape 2: Solde OK");
      return updateSolde(exp, dest, amount).then(() => dest);
    })
    .then(dest => {
      console.log("Étape 3: Solde mis à jour");
      return addtransactions(exp, dest, amount);
    })
    .then(msg => {
      console.log("Étape 4:", msg);
      console.log("Transfert réussi !");
    })
    .catch(err => {
      console.log("Erreur:", err);
    });
}


// =================== HANDLE ===================

function handleTransfer(e) {
  e.preventDefault();

  const beneficiaryId = beneficiarySelect.value;
  const beneficiaryAccount = findbeneficiarieByid(user.id, beneficiaryId).account;
  const amount = Number(document.getElementById("amount").value);

  transfer(user, beneficiaryAccount, amount);
}