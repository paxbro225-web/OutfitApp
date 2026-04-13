let data = JSON.parse(localStorage.getItem("outfits")) || {
  shirts: [],
  bottoms: [],
  undershirts: [],
  accessories: [],
  history: []
};

if (!data.history) {
  data.history = [];
}

function save() {
  localStorage.setItem("outfits", JSON.stringify(data));
}

function getInputIds(type) {
  return {
    shirts: { text: "shirtInput", image: "shirtImage" },
    bottoms: { text: "bottomInput", image: "bottomImage" },
    undershirts: { text: "underInput", image: "underImage" },
    accessories: { text: "accessoryInput", image: "accessoryImage" }
  }[type];
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}

async function addItem(type) {
  const ids = getInputIds(type);
  const textInput = document.getElementById(ids.text);
  const imageInput = document.getElementById(ids.image);

  const name = textInput.value.trim();
  if (!name) return;

  let image = "";
  const file = imageInput.files[0];

  if (file) {
    image = await fileToDataURL(file);
  }

  data[type].push({
    id: crypto.randomUUID(),
    name,
    image
  });

  textInput.value = "";
  imageInput.value = "";
  save();
  render();
}

function removeItem(type, id) {
  data[type] = data[type].filter(item => item.id !== id);
  save();
  render();
}

function renderCategory(type) {
  const div = document.getElementById(type);
  div.innerHTML = "";

  data[type].forEach(item => {
    const el = document.createElement("div");
    el.className = "item";

    el.innerHTML = `
      ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ""}
      <div class="item-name">${item.name}</div>
      <button class="remove-btn" onclick="removeItem('${type}', '${item.id}')">Remove</button>
    `;

    div.appendChild(el);
  });
}

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeOutfitCard(label, item) {
  return `
    <div class="outfit-item">
      ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ""}
      <div class="outfit-label"><strong>${label}:</strong> ${item.name}</div>
    </div>
  `;
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function saveOutfitToHistory(outfit) {
  data.history.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    outfit
  });

  save();
}

function deleteHistoryItem(id) {
  data.history = data.history.filter(item => item.id !== id);
  save();
  renderHistory();
}

function wipeHistory() {
  const confirmed = confirm("Are you sure you want to wipe all outfit history? This cannot be undone.");
  if (!confirmed) return;

  data.history = [];
  save();
  renderHistory();
}

function renderHistory() {
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "";

  if (!data.history.length) {
    historyDiv.innerHTML = `<div class="empty-text">No saved outfits yet.</div>`;
    return;
  }

  data.history.forEach(entry => {
    const el = document.createElement("div");
    el.className = "history-item";

    el.innerHTML = `
      <div class="history-top">
        <strong>${formatDate(entry.createdAt)}</strong>
        <button class="remove-btn" onclick="deleteHistoryItem('${entry.id}')">Delete</button>
      </div>

      <div class="history-grid">
        <div class="history-piece">
          ${entry.outfit.shirt.image ? `<img src="${entry.outfit.shirt.image}" alt="${entry.outfit.shirt.name}">` : ""}
          <div><strong>Shirt:</strong> ${entry.outfit.shirt.name}</div>
        </div>

        <div class="history-piece">
          ${entry.outfit.bottom.image ? `<img src="${entry.outfit.bottom.image}" alt="${entry.outfit.bottom.name}">` : ""}
          <div><strong>Bottoms:</strong> ${entry.outfit.bottom.name}</div>
        </div>

        <div class="history-piece">
          ${entry.outfit.undershirt.image ? `<img src="${entry.outfit.undershirt.image}" alt="${entry.outfit.undershirt.name}">` : ""}
          <div><strong>Undershirt:</strong> ${entry.outfit.undershirt.name}</div>
        </div>

        <div class="history-piece">
          ${entry.outfit.accessory.image ? `<img src="${entry.outfit.accessory.image}" alt="${entry.outfit.accessory.name}">` : ""}
          <div><strong>Accessory:</strong> ${entry.outfit.accessory.name}</div>
        </div>
      </div>
    `;

    historyDiv.appendChild(el);
  });
}

function generateOutfit() {
  if (
    !data.shirts.length ||
    !data.bottoms.length ||
    !data.undershirts.length ||
    !data.accessories.length
  ) {
    alert("Add at least one item to every category first.");
    return;
  }

  const outfit = {
    shirt: random(data.shirts),
    bottom: random(data.bottoms),
    undershirt: random(data.undershirts),
    accessory: random(data.accessories)
  };

  document.getElementById("outfit").innerHTML =
    makeOutfitCard("Shirt", outfit.shirt) +
    makeOutfitCard("Bottoms", outfit.bottom) +
    makeOutfitCard("Undershirt", outfit.undershirt) +
    makeOutfitCard("Accessory", outfit.accessory);

  saveOutfitToHistory(outfit);
  renderHistory();
}

function render() {
  ["shirts", "bottoms", "undershirts", "accessories"].forEach(renderCategory);
  renderHistory();
}

render();