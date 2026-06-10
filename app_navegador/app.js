const state = {
  photos: [],
  dragIndex: null,
};

const AUTH_SESSION_KEY = "ferramentasMissaoAutenticado";
const AUTH_USER_KEY = "ferramentasMissaoUsuario";
const AUTH_USERS_STORAGE_KEY = "ferramentasMissaoUsuarios";
const DEFAULT_AUTH_USERS = {
  users: [
    { id: "higor", name: "CAD PM Higor Marques", password: "1cia202617" },
    { id: "hortola", name: "CAD PM Hortol\u00e3", password: "1cia202610" },
    { id: "leonardo", name: "CAD PM Leonardo Santana", password: "1cia202604" },
    { id: "kimberly", name: "CAD PM Kimberly", password: "1cia202607" },
    { id: "vinicius", name: "CAD PM Vin\u00edcius Ramos", password: "1cia202609" },
  ],
};
let authUsers = {};

const pageSizes = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
};

const memoState = {
  xlsxFile: null,
};

const despachoState = {
  xlsxFile: null,
};

const controleState = {
  xlsxFile: null,
};

const pelotaoState = {
  xlsxFile: null,
};

const xlsxInput = document.querySelector("#xlsxInput");
const xlsxName = document.querySelector("#xlsxName");
const memoFileName = document.querySelector("#memoFileName");
const generateMemoButton = document.querySelector("#generateMemoButton");
const memoStatus = document.querySelector("#memoStatus");

const despachoXlsxInput = document.querySelector("#despachoXlsxInput");
const despachoXlsxName = document.querySelector("#despachoXlsxName");
const despachoFileName = document.querySelector("#despachoFileName");
const generateDespachoButton = document.querySelector("#generateDespachoButton");
const despachoStatus = document.querySelector("#despachoStatus");

const controleXlsxInput = document.querySelector("#controleXlsxInput");
const controleXlsxName = document.querySelector("#controleXlsxName");
const controleSheet = document.querySelector("#controleSheet");
const controleFileName = document.querySelector("#controleFileName");
const generateControleHtmlButton = document.querySelector("#generateControleHtmlButton");
const controleStatus = document.querySelector("#controleStatus");

const pelotaoXlsxInput = document.querySelector("#pelotaoXlsxInput");
const pelotaoXlsxName = document.querySelector("#pelotaoXlsxName");
const pelotaoSheet = document.querySelector("#pelotaoSheet");
const pelotaoFileName = document.querySelector("#pelotaoFileName");
const generatePelotaoButton = document.querySelector("#generatePelotaoButton");
const pelotaoStatus = document.querySelector("#pelotaoStatus");

const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const photoList = document.querySelector("#photoList");
const photoTemplate = document.querySelector("#photoTemplate");
const photoCount = document.querySelector("#photoCount");
const generateButton = document.querySelector("#generateButton");
const clearButton = document.querySelector("#clearButton");
const pdfName = document.querySelector("#pdfName");
const pageSize = document.querySelector("#pageSize");
const marginSize = document.querySelector("#marginSize");
const quality = document.querySelector("#quality");
const qualityValue = document.querySelector("#qualityValue");
const statusText = document.querySelector("#status");
const authGate = document.querySelector("#authGate");
const authForm = document.querySelector("#authForm");
const authUser = document.querySelector("#authUser");
const authPassword = document.querySelector("#authPassword");
const authStatus = document.querySelector("#authStatus");
const welcomeMessage = document.querySelector("#welcomeMessage");
const logoutButton = document.querySelector("#logoutButton");
const authButton = document.querySelector(".auth-button");
const jsonButton = document.querySelector("#jsonButton");
const jsonModal = document.querySelector("#jsonModal");
const jsonCloseButton = document.querySelector("#jsonCloseButton");
const jsonEditor = document.querySelector("#jsonEditor");
const jsonSaveButton = document.querySelector("#jsonSaveButton");
const jsonStatus = document.querySelector("#jsonStatus");

initAuth();

logoutButton?.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  document.body.classList.add("auth-locked");
  authGate?.removeAttribute("aria-hidden");
  authPassword.value = "";
  authStatus.textContent = "";
  welcomeMessage.textContent = "Bem vindo(a)!";
  jsonButton?.classList.add("hidden");
  authPassword.focus();
});

jsonButton?.addEventListener("click", openJsonEditor);
jsonCloseButton?.addEventListener("click", closeJsonEditor);
jsonSaveButton?.addEventListener("click", saveJsonEditor);

async function initAuth() {
  setAuthEnabled(false);
  authStatus.textContent = "Carregando usuários...";

  try {
    authUsers = await loadAuthUsers();
    populateAuthUsers();
    authStatus.textContent = "";
    setAuthEnabled(true);
  } catch (error) {
    console.error(error);
    authStatus.textContent = error.message;
    return;
  }

  authForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const selectedUser = authUser.value;
    const user = authUsers[selectedUser];
    if (user && await loginUser(selectedUser, authPassword.value.trim())) {
      sessionStorage.setItem(AUTH_SESSION_KEY, "true");
      sessionStorage.setItem(AUTH_USER_KEY, selectedUser);
      unlockApp(selectedUser);
      return;
    }

    authStatus.textContent = "Senha incorreta.";
    authPassword.value = "";
    authPassword.focus();
  });

  const isAuthenticated = sessionStorage.getItem(AUTH_SESSION_KEY) === "true";
  const savedUser = sessionStorage.getItem(AUTH_USER_KEY);
  if (isAuthenticated && authUsers[savedUser]) {
    unlockApp(savedUser);
    return;
  }

  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);

  authPassword?.focus();
}

async function loadAuthUsers() {
  const storedUsers = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
  let data = cloneDefaultAuthUsers();

  if (storedUsers) {
    try {
      data = JSON.parse(storedUsers);
    } catch (error) {
      console.warn("Usuarios salvos invalidos. Usando usuarios padrao.", error);
      localStorage.removeItem(AUTH_USERS_STORAGE_KEY);
    }
  }

  const users = Array.isArray(data.users) ? data.users : [];
  const mappedUsers = {};

  for (const user of users) {
    if (!user.id || !user.name || !user.password) continue;
    mappedUsers[user.id] = {
      name: String(user.name),
      password: String(user.password),
    };
  }

  if (!Object.keys(mappedUsers).length) {
    throw new Error("Nenhum usuario valido foi encontrado.");
  }

  return mappedUsers;
}

async function loginUser(userId, password) {
  return authUsers[userId]?.password === password;
}

function populateAuthUsers() {
  authUser.innerHTML = "";
  for (const [id, user] of Object.entries(authUsers)) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = user.name;
    authUser.append(option);
  }
}

function setAuthEnabled(enabled) {
  authUser.disabled = !enabled;
  authPassword.disabled = !enabled;
  authButton.disabled = !enabled;
}

function unlockApp(userKey) {
  document.body.classList.remove("auth-locked");
  authGate?.setAttribute("aria-hidden", "true");
  if (welcomeMessage && authUsers[userKey]) {
    welcomeMessage.textContent = `Bem vindo(a), ${authUsers[userKey].name}!`;
  }
  jsonButton?.classList.toggle("hidden", userKey !== "higor");
}

async function openJsonEditor() {
  jsonStatus.textContent = "Carregando JSON...";
  jsonModal.classList.remove("hidden");
  try {
    const savedUser = sessionStorage.getItem(AUTH_USER_KEY);
    if (savedUser !== "higor") throw new Error("Acesso permitido apenas para CAD PM Higor Marques.");
    jsonEditor.value = JSON.stringify(getAuthUsersData(), null, 2);
    jsonStatus.textContent = "";
    jsonEditor.focus();
  } catch (error) {
    console.error(error);
    jsonStatus.textContent = error.message;
  }
}

function closeJsonEditor() {
  jsonModal.classList.add("hidden");
  jsonStatus.textContent = "";
}

async function saveJsonEditor() {
  let parsed;
  try {
    parsed = JSON.parse(jsonEditor.value);
  } catch (error) {
    jsonStatus.textContent = `JSON inválido: ${error.message}`;
    return;
  }

  jsonStatus.textContent = "Salvando...";
  try {
    validateAuthUsersData(parsed);
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(parsed));
    authUsers = await loadAuthUsers();
    populateAuthUsers();
    jsonStatus.textContent = "Usuarios e senhas salvos neste navegador.";
  } catch (error) {
    console.error(error);
    jsonStatus.textContent = error.message;
  }
}

function getAuthUsersData() {
  const storedUsers = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
  if (!storedUsers) return cloneDefaultAuthUsers();

  try {
    const parsed = JSON.parse(storedUsers);
    validateAuthUsersData(parsed);
    return parsed;
  } catch (error) {
    console.warn("Usuarios salvos invalidos. Usando usuarios padrao.", error);
    localStorage.removeItem(AUTH_USERS_STORAGE_KEY);
    return cloneDefaultAuthUsers();
  }
}

function cloneDefaultAuthUsers() {
  return JSON.parse(JSON.stringify(DEFAULT_AUTH_USERS));
}

function validateAuthUsersData(data) {
  if (!data || !Array.isArray(data.users) || !data.users.length) {
    throw new Error("O JSON precisa ter uma lista users com pelo menos um usuario.");
  }

  for (const user of data.users) {
    if (!user || !user.id || !user.name || !user.password) {
      throw new Error("Cada usuario precisa ter id, name e password.");
    }
  }

  if (!data.users.some((user) => user.id === "higor")) {
    throw new Error("O usuario higor precisa existir para administrar as senhas.");
  }
}

xlsxInput.addEventListener("change", (event) => {
  memoState.xlsxFile = event.target.files[0] || null;
  xlsxName.textContent = memoState.xlsxFile ? memoState.xlsxFile.name : "Nenhuma planilha selecionada";
  updateMemoButton();
});

generateMemoButton.addEventListener("click", async () => {
  if (!memoState.xlsxFile) return;

  generateMemoButton.disabled = true;
  setMemoStatus("Lendo planilha...");

  try {
    const cells = await readXlsxCells(memoState.xlsxFile, ["B1", "D2", "F2", "G1", "G2", "E1", "G3", "G7", "F7"]);
    setMemoStatus("Aplicando dados no modelo...");
    const template = await readMemoTemplate();
    const html = applyGeneratedHtmlFont(ensureUtf8Meta(buildMemorandoHtml(template, cells)));
    setMemoStatus("Memorando HTML gerado com sucesso.");
    downloadTextFile(normalizeHtmlName(memoFileName.value), html, "text/html;charset=utf-8", memoStatus);
  } catch (error) {
    console.error(error);
    setMemoStatus(error.message);
  } finally {
    updateMemoButton();
  }
});

despachoXlsxInput.addEventListener("change", (event) => {
  despachoState.xlsxFile = event.target.files[0] || null;
  despachoXlsxName.textContent = despachoState.xlsxFile ? despachoState.xlsxFile.name : "Nenhuma planilha selecionada";
  updateDespachoButton();
});

generateDespachoButton.addEventListener("click", async () => {
  if (!despachoState.xlsxFile) return;

  generateDespachoButton.disabled = true;
  setDespachoStatus("Lendo planilha...");

  try {
    const cells = await readXlsxCells(despachoState.xlsxFile, buildDespachoCellRefs());
    setDespachoStatus("Montando lista de processos...");
    const entries = extractDespachoEntries(cells);
    const template = await readDespachoTemplate();
    const html = applyGeneratedHtmlFont(ensureUtf8Meta(buildDespachoHtml(template, cells, entries)));
    setDespachoStatus(`Despacho gerado com ${entries.length} item(ns).`);
    downloadTextFile(normalizeHtmlName(despachoFileName.value || "despacho_geral.html"), html, "text/html;charset=utf-8", despachoStatus);
  } catch (error) {
    console.error(error);
    setDespachoStatus(error.message);
  } finally {
    updateDespachoButton();
  }
});

controleXlsxInput.addEventListener("change", (event) => {
  controleState.xlsxFile = event.target.files[0] || null;
  controleXlsxName.textContent = controleState.xlsxFile ? controleState.xlsxFile.name : "Nenhuma planilha selecionada";
  updateControleButton();
});

controleSheet.addEventListener("change", updateControleFileName);
updateControleFileName();

generateControleHtmlButton.addEventListener("click", async () => {
  if (!controleState.xlsxFile) return;

  generateControleHtmlButton.disabled = true;
  setControleStatus("Lendo planilha...");

  try {
    const sheetIndex = Number(controleSheet.value || 0);
    const cells = await readXlsxCells(controleState.xlsxFile, buildControleCellRefs(sheetIndex));
    const template = await readControleTemplate();
    const html = applyGeneratedHtmlFont(ensureUtf8Meta(buildControleHtml(template, cells, sheetIndex)));
    validateGeneratedControle(html);
    setControleStatus("Controle HTML gerado com sucesso.");
    downloadTextFile(normalizeHtmlName(controleFileName.value || "controle_preenchido"), html, "text/html;charset=utf-8", controleStatus);
  } catch (error) {
    console.error(error);
    setControleStatus(error.message);
  } finally {
    updateControleButton();
  }
});

pelotaoXlsxInput.addEventListener("change", (event) => {
  pelotaoState.xlsxFile = event.target.files[0] || null;
  pelotaoXlsxName.textContent = pelotaoState.xlsxFile ? pelotaoState.xlsxFile.name : "Nenhuma planilha selecionada";
  updatePelotaoButton();
});

pelotaoSheet.addEventListener("change", updatePelotaoFileName);
updatePelotaoFileName();

generatePelotaoButton.addEventListener("click", async () => {
  if (!pelotaoState.xlsxFile) return;

  generatePelotaoButton.disabled = true;
  setPelotaoStatus("Lendo planilha...");

  try {
    const sheetIndex = Number(pelotaoSheet.value || 0);
    const cells = await readXlsxCells(pelotaoState.xlsxFile, buildPelotaoCellRefs(sheetIndex));
    setPelotaoStatus("Montando afastamentos...");
    const entries = extractPelotaoEntries(cells, sheetIndex);
    const template = await readPelotaoTemplate();
    const html = applyGeneratedHtmlFont(ensureUtf8Meta(buildPelotaoDespachoHtml(template, entries, cells, sheetIndex)));
    setPelotaoStatus(`Despacho gerado com ${entries.length} item(ns).`);
    downloadTextFile(normalizeHtmlName(pelotaoFileName.value || "despacho_por_pelotao.html"), html, "text/html;charset=utf-8", pelotaoStatus);
  } catch (error) {
    console.error(error);
    setPelotaoStatus(error.message);
  } finally {
    updatePelotaoButton();
  }
});

fileInput.addEventListener("change", (event) => {
  addFiles([...event.target.files]);
  fileInput.value = "";
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  addFiles([...event.dataTransfer.files]);
});

photoList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const item = button.closest(".photo-item");
  const index = Number(item.dataset.index);
  const action = button.dataset.action;

  if (action === "up") movePhoto(index, index - 1);
  if (action === "down") movePhoto(index, index + 1);
  if (action === "rotate") rotatePhoto(index);
  if (action === "remove") removePhoto(index);
});

photoList.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".photo-item");
  if (!item) return;
  state.dragIndex = Number(item.dataset.index);
  event.dataTransfer.effectAllowed = "move";
});

photoList.addEventListener("dragover", (event) => {
  event.preventDefault();
  const item = event.target.closest(".photo-item");
  document.querySelectorAll(".drag-over").forEach((node) => node.classList.remove("drag-over"));
  if (item) item.classList.add("drag-over");
});

photoList.addEventListener("drop", (event) => {
  event.preventDefault();
  const item = event.target.closest(".photo-item");
  document.querySelectorAll(".drag-over").forEach((node) => node.classList.remove("drag-over"));
  if (!item || state.dragIndex === null) return;
  movePhoto(state.dragIndex, Number(item.dataset.index));
  state.dragIndex = null;
});

photoList.addEventListener("dragend", () => {
  state.dragIndex = null;
  document.querySelectorAll(".drag-over").forEach((node) => node.classList.remove("drag-over"));
});

quality.addEventListener("input", () => {
  qualityValue.value = `${quality.value}%`;
});

clearButton.addEventListener("click", () => {
  state.photos.forEach((photo) => URL.revokeObjectURL(photo.url));
  state.photos = [];
  render();
  setStatus("");
});

generateButton.addEventListener("click", async () => {
  if (!state.photos.length) return;

  generateButton.disabled = true;
  setStatus("Preparando imagens...");

  try {
    const pdfBytes = await createPdf();
    setStatus("PDF gerado com sucesso.");
    downloadBlob(normalizePdfName(pdfName.value), new Blob([pdfBytes], { type: "application/pdf" }), statusText);
  } catch (error) {
    console.error(error);
    setStatus(`Nao foi possivel gerar o PDF: ${error.message}`);
  } finally {
    generateButton.disabled = state.photos.length === 0;
  }
});

function updateMemoButton() {
  generateMemoButton.disabled = !memoState.xlsxFile;
}

function updateDespachoButton() {
  generateDespachoButton.disabled = !despachoState.xlsxFile;
}

function updateControleButton() {
  const disabled = !controleState.xlsxFile;
  generateControleHtmlButton.disabled = disabled;
}

function updateControleFileName() {
  const suffix = getSheetRomanSuffix(controleSheet.value);
  controleFileName.value = `controle_preenchido_planilha_${suffix}`;
}

function updatePelotaoButton() {
  generatePelotaoButton.disabled = !pelotaoState.xlsxFile;
}

function updatePelotaoFileName() {
  const suffix = getSheetRomanSuffix(pelotaoSheet.value);
  pelotaoFileName.value = `despacho_por_pelotao_planilha_${suffix}`;
}

function getSheetRomanSuffix(value) {
  const romanSheets = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  const sheetIndex = Number(value || 0);
  return romanSheets[sheetIndex] || "I";
}

async function readMemoTemplate() {
  try {
    const response = await fetch("modelos/Memorando.html");
    if (!response.ok) throw new Error("Modelo padrao nao encontrado.");
    return response.text();
  } catch (error) {
    throw new Error("Nao foi possivel carregar o modelo interno. Abra o app pelo localhost ou GitHub Pages.");
  }
}

async function readDespachoTemplate() {
  try {
    const response = await fetch("modelos/Despacho_Geral.html");
    if (!response.ok) throw new Error("Modelo Despacho_Geral.html nao encontrado.");
    return response.text();
  } catch (error) {
    throw new Error("Nao foi possivel carregar o modelo interno do despacho. Abra o app pelo localhost ou GitHub Pages.");
  }
}

async function readControleTemplate() {
  try {
    const response = await fetch("modelos/Controle.html");
    if (!response.ok) throw new Error("Modelo Controle.html nao encontrado.");
    return response.text();
  } catch (error) {
    throw new Error("Nao foi possivel carregar o modelo Controle.html. Abra o app pelo localhost ou GitHub Pages.");
  }
}

async function readPelotaoTemplate() {
  try {
    const response = await fetch("modelos/Despacho_por_pelotoes.html");
    if (!response.ok) throw new Error("Modelo Despacho_por_pelotoes.html nao encontrado.");
    return response.text();
  } catch (error) {
    throw new Error("Nao foi possivel carregar o modelo interno do despacho por pelotoes. Abra o app pelo localhost.");
  }
}

function buildMemorandoHtml(template, cells) {
  const dateText = formatDatePtBr(cells.B1);
  const memoNumber = formatDocumentNumber(cells.D2);
  const dispatchNumber = formatDocumentNumber(cells.F2);
  const worksheetCount = formatWorksheetCount(cells.G2 || cells.G1);
  const platoons = valueText(cells.E1);
  const month = valueText(cells.G3).toLowerCase();
  const signer = valueText(cells.G7);
  const signerRole = valueText(cells.F7);

  let html = removeSeiHeaderLines(template);
  html = replaceAll(html, "20 de maio de 2026", escapeHtml(dateText));
  html = replaceAll(html, "108/31/26", escapeHtml(memoNumber));
  html = replaceAll(html, "015/31/26", escapeHtml(dispatchNumber));
  html = replaceAll(html, "07 (sete) planilhas de controle mensal.", worksheetCount);
  html = replaceAll(html, "outubro", escapeHtml(month));
  html = replaceAll(html, "GEAZI DOS SANTOS RODRIGUES", escapeHtml(signer));
  html = replaceAll(html, "1&ordm; Ten PM Cmt 1&ordf; Cia Es", escapeHtml(signerRole));
  return replaceVisiblePlatoons(html, platoons);
}

function replaceVisiblePlatoons(html, platoons) {
  if (!platoons) return html;

  const rawPattern = /Restri&ccedil;&otilde;es([\s\S]*?)1&ordm; CFO &ldquo;A&rdquo;/;
  return html.replace(rawPattern, (match) => {
    const beforePlatoons = match.replace(/3&ordm; CFO &ldquo;A&rdquo;[\s\S]*$/, "");
    return `${beforePlatoons}${escapeHtml(platoons)}`;
  });
}

function formatDocumentNumber(value) {
  const raw = valueText(value).trim();
  if (!raw) return "";
  return formatNumericText(raw);
}

function removeSeiHeaderLines(html) {
  const patterns = [
    /\s*<p\b[^>]*>[\s\S]*?N(?:&ordm;|º|Âº)\s+do\s+Processo:[\s\S]*?057\.00246949\/2026-28[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Interessado:[\s\S]*?Anderson\s+Alves\s+da\s+Silva[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Assunto:[\s\S]*?Restr[\s\S]*?1(?:&ordf;|ª|Âª)\s+Cia\s+Es[\s\S]*?<\/p>/i,
  ];

  return patterns.reduce((current, pattern) => current.replace(pattern, ""), html);
}

function buildDespachoCellRefs() {
  const refs = ["B1", "F2", "G4", "F5", "G5"];

  for (let baseRow = 4; baseRow <= 284; baseRow += 40) {
    refs.push(`E${baseRow}`);
  }

  for (let startRow = 10; startRow <= 290; startRow += 40) {
    for (let row = startRow; row <= startRow + 10; row += 1) {
      refs.push(`D${row}`, `E${row}`, `Q${row}`);
    }
  }

  return refs;
}

function extractDespachoEntries(cells) {
  const entries = [];

  for (let baseRow = 4; baseRow <= 284; baseRow += 40) {
    if (valueText(cells[`E${baseRow}`]) === "-") continue;

    const startRow = baseRow + 6;
    for (let row = startRow; row <= startRow + 10; row += 1) {
      const alOfPm = valueText(cells[`D${row}`]);
      const re = valueText(cells[`E${row}`]);
      const processNumber = formatProcessNumber(cells[`Q${row}`]);

      if (!alOfPm && !re && !processNumber) continue;
      entries.push({ alOfPm, re, processNumber });
    }
  }

  return entries;
}

function buildDespachoHtml(template, cells, entries) {
  const dispatchNumber = valueText(cells.F2);
  const dateText = formatCompactDatePtBr(cells.B1);
  const periodText = valueText(cells.G4);
  const signerRole = valueText(cells.F5);
  const signerName = valueText(cells.G5);
  const listHtml = buildDespachoList(entries);

  let html = cleanDespachoTemplate(template);
  html = replaceAll(html, "015/31/26", escapeHtml(dispatchNumber));
  html = replaceAll(html, "20/05/2026", escapeHtml(dateText));
  html = replaceAll(html, "01 a 30 abril de 2026", escapeHtml(periodText));
  html = replaceAll(html, "01 a abril de 2026", escapeHtml(periodText));
  html = replaceAll(html, "Higor Machado Marques", escapeHtml(signerName));
  html = replaceAll(html, "HIGOR MACHADO MARQUES", escapeHtml(signerName));
  html = replaceAll(html, "CAD PM Resp. Restr/Conval/LTS", escapeHtml(signerRole));
  html = replaceDespachoList(html, listHtml);
  return trimDespachoSignature(html);
}

function cleanDespachoTemplate(html) {
  const headerPatterns = [
    /\s*<p\b[^>]*>[\s\S]*?N(?:&ordm;|º|Âº)\s+do\s+Processo:[\s\S]*?057\.00246949\/2026-28[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Interessado:[\s\S]*?Anderson\s+Alves\s+da\s+Silva[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Assunto:[\s\S]*?Restr[\s\S]*?1(?:ª|&ordf;)\s+Cia\s+Es[\s\S]*?<\/p>/i,
  ];

  return headerPatterns.reduce((current, pattern) => current.replace(pattern, ""), html);
}

function buildDespachoList(entries) {
  return entries.map((entry, index) => {
    const suffix = index === entries.length - 1 ? "" : ";";
    const line = `${index + 1})N&ordm; do processo ${escapeHtml(entry.processNumber)}, Cad PM ${escapeHtml(entry.re)} ${escapeHtml(entry.alOfPm)}${suffix}`;
    return `<p>${line}</p>`;
  }).join("\n");
}

function formatProcessNumber(value) {
  const raw = valueText(value).replace(/\s+/g, "");
  if (!raw) return "";
  return formatNumericText(raw);
}

function replaceDespachoList(html, listHtml) {
  const samplePattern = /(<p[^>]*class="Texto_Alinhado_Esquerda_Det"[^>]*>)\s*1\)N(?:&ordm;|º) do processo\s*A260016958[\s\S]*?<\/p>\s*(?=<p style="margin-top:15px)/i;
  if (samplePattern.test(html)) {
    return html.replace(samplePattern, (match, opening) => `${opening}${listHtml}</p>\n\n`);
  }

  const paragraphPattern = /<p[^>]*>\s*1\)[\s\S]*?G\. Monteiro;?\s*<\/p>/i;
  if (paragraphPattern.test(html)) {
    return html.replace(paragraphPattern, listHtml);
  }

  throw new Error("Nao encontrei a lista modelo de processos no HTML do despacho.");
}

function trimDespachoSignature(html) {
  const markerIndex = html.search(/<div\b[^>]*unselectable=/i);
  if (markerIndex === -1) return html;

  const closing = html.match(/<\/body>[\s\S]*<\/html>\s*$/i)?.[0] || "\n</body>\n</html>";
  return `${html.slice(0, markerIndex).trimEnd()}\n${closing}`;
}

function buildControleCellRefs(sheetIndex) {
  const offset = sheetIndex * 40;
  const refs = [`E${4 + offset}`, `G${4 + offset}`, `F${5 + offset}`, `G${5 + offset}`, `F${6 + offset}`, `G${6 + offset}`, `F${7 + offset}`, `G${7 + offset}`];

  for (let row = 10 + offset; row <= 20 + offset; row += 1) {
    for (const column of ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"]) {
      refs.push(`${column}${row}`);
    }
  }

  return refs;
}

function buildControleHtml(template, cells, sheetIndex) {
  const offset = sheetIndex * 40;
  const platoon = valueText(cells[`E${4 + offset}`]);
  const period = valueText(cells[`G${4 + offset}`]) || platoon;
  const cadRole = valueText(cells[`F${5 + offset}`]);
  const cadName = valueText(cells[`G${5 + offset}`]);
  const officerRole = valueText(cells[`F${6 + offset}`]);
  const officerName = valueText(cells[`G${6 + offset}`]);
  const commanderRole = valueText(cells[`F${7 + offset}`]);
  const commanderName = valueText(cells[`G${7 + offset}`]);

  const doc = new DOMParser().parseFromString(template, "text/html");
  cleanControleDocument(doc);
  replaceDocumentText(doc.body, [
    ["3º CFO “A”", platoon],
    ["3º CFO \"A\"", platoon],
    ["3&ordm; CFO &ldquo;A&rdquo;", platoon],
    ["01 a 30 de abril de 2026", period],
    ["HIGOR MACHADO MARQUES", cadName],
    ["ANDERSON ALVES SILVA", officerName],
    ["GEAZI DOS SANTOS RODRIGUES", commanderName],
    ["Cad PM - Resp. Restr./Conval./LTS do 3º CFO “A”", cadRole],
    ["Cad PM - Resp. Restr./Conval./LTS do 3º CFO \"A\"", cadRole],
    ["Cad PM - Resp. Restr./Conval./LTS do 3&ordm; CFO &ldquo;A&rdquo;", cadRole],
    ["1º Ten PM - Oficial Responsável", officerRole],
    ["1&ordm; Ten PM - Oficial Respons&aacute;vel", officerRole],
    ["1º Ten PM - Cmt da 1ª Cia", commanderRole],
    ["1&ordm; Ten PM - Cmt da 1&ordf; Cia", commanderRole],
  ]);

  fillControleTable(doc, cells, offset);
  return `<!doctype html>\n${doc.documentElement.outerHTML}`;
}

function cleanControleDocument(doc) {
  const paragraphs = [...doc.querySelectorAll("p")];
  for (const paragraph of paragraphs) {
    const normalized = normalizeText(paragraph.textContent);
    const isProcessLine = normalized.includes("DO PROCESSO") && normalized.includes("057.00246949/2026-28");
    const isInterestedLine = normalized.includes("INTERESSADO") && normalized.includes("ANDERSON ALVES DA SILVA");
    const isSubjectLine = normalized.includes("ASSUNTO") && normalized.includes("CONTROLE DE RESTRI");
    if (isProcessLine || isInterestedLine || isSubjectLine) {
      paragraph.remove();
    }
  }

  const dateParagraph = [...doc.querySelectorAll("p")].find((paragraph) => {
    const normalized = normalizeText(paragraph.textContent);
    return normalized.includes("SAO PAULO") && normalized.includes("DATA DA ASSINATURA DIGITAL");
  });

  if (!dateParagraph) return;
  let next = dateParagraph.nextSibling;
  while (next) {
    const current = next;
    next = next.nextSibling;
    current.remove();
  }
}

function validateGeneratedControle(html) {
  if (!html || html.length < 1000) {
    throw new Error("O controle gerado ficou vazio. Verifique a planilha e tente novamente.");
  }

  if (!html.includes("<table") || !html.includes("AL OF PM")) {
    throw new Error("O controle gerado nao parece conter o documento esperado.");
  }
}

function fillControleTable(doc, cells, offset) {
  const table = [...doc.querySelectorAll("table")].find((item) => normalizeText(item.textContent).includes("AL OF PM"));
  if (!table) throw new Error("Nao encontrei a tabela principal no Controle.html.");

  const rows = [...table.querySelectorAll("tr")].slice(1);
  if (!rows.length) throw new Error("A tabela do Controle.html nao possui uma linha modelo para preenchimento.");

  const templateRow = rows[0].cloneNode(true);
  const rowParent = rows[0].parentElement;
  rows.forEach((row) => row.remove());

  let filledCount = 0;
  for (let rowNumber = 10 + offset; rowNumber <= 20 + offset; rowNumber += 1) {
    if (!valueText(cells[`D${rowNumber}`])) continue;

    const rowElement = templateRow.cloneNode(true);
    const cellsHtml = [...rowElement.children].filter((child) => child.tagName.toLowerCase() === "td");
    if (cellsHtml.length < 10) continue;

    const startDate = formatCompactDatePtBr(cells[`K${rowNumber}`]);
    const endDate = formatCompactDatePtBr(cells[`L${rowNumber}`]);
    const period = startDate || endDate ? `${startDate} ATÉ ${endDate}` : "";

    setControleCell(cellsHtml[0], valueText(cells[`D${rowNumber}`]));
    setControleCell(cellsHtml[1], valueText(cells[`E${rowNumber}`]));
    setControleCell(cellsHtml[2], restrictionTypeHtml(cells[`F${rowNumber}`]));
    setControleCell(cellsHtml[3], locationHtml(cells[`G${rowNumber}`]));
    setControleCell(cellsHtml[4], valueText(cells[`H${rowNumber}`]));
    setControleCell(cellsHtml[5], valueText(cells[`I${rowNumber}`]));
    setControleCell(cellsHtml[6], daysHtml(cells[`J${rowNumber}`]));
    setControleCell(cellsHtml[7], period);
    setControleCell(cellsHtml[8], yesNoHtml(cells[`M${rowNumber}`]));
    setControleCell(cellsHtml[9], yesNoHtml(cells[`N${rowNumber}`]));
    rowParent.append(rowElement);
    filledCount += 1;
  }

  if (!filledCount) {
    throw new Error(`Nenhum nome foi encontrado no intervalo D${10 + offset}:D${20 + offset}.`);
  }
}

function setControleCell(cell, content) {
  cell.innerHTML = `<p style="margin:0;color:#000;font-family:'Times New Roman',serif;font-size:12pt;line-height:1.15;text-align:center">${content || "&nbsp;"}</p>`;
}

function restrictionTypeHtml(value) {
  const normalized = normalizeText(value);
  const isRestriction = normalized.includes("REST");
  const isLts = normalized.includes("LTS");
  const isConval = normalized.includes("CONVAL");
  const isLicense = normalized.includes("LIC");
  return [
    `${isRestriction ? "(X)" : "( )"} RESTR.`,
    `${isLts ? "(X)" : "( )"} LTS`,
    `${isConval ? "(X)" : "( )"} CONVAL`,
    `${isLicense ? "(X)" : "( )"} LIC. COMP.`,
  ].join("<br>");
}

function locationHtml(value) {
  const normalized = normalizeText(value);
  return [
    `${normalized.includes("CASA") ? "(X)" : "( )"} CASA`,
    `${normalized.includes("QUARTEL") ? "(X)" : "( )"} QUARTEL`,
  ].join("<br>");
}

function yesNoHtml(value) {
  const normalized = normalizeText(value);
  return [
    `${normalized === "SIM" ? "(X)" : "( )"} SIM`,
    `${normalized === "NAO" || normalized === "NÃO" ? "(X)" : "( )"} NÃO`,
  ].join("<br>");
}

function daysHtml(value) {
  const text = valueText(value);
  if (!text) return "";
  return `${escapeHtml(text)}<br>DIAS`;
}

function buildPelotaoCellRefs(sheetIndex) {
  const offset = Number(sheetIndex) * 40;
  const refs = ["B1", `E${4 + offset}`, `F${5 + offset}`, `G${5 + offset}`];

  for (let row = 10 + offset; row <= 30 + offset; row += 1) {
    for (const column of ["D", "E", "F", "H", "J", "K", "O", "P"]) {
      refs.push(`${column}${row}`);
    }
  }

  return refs;
}

function extractPelotaoEntries(cells, sheetIndex) {
  const offset = Number(sheetIndex) * 40;
  const entries = [];

  for (let row = 10 + offset; row <= 30 + offset; row += 1) {
    const nome = valueText(cells[`D${row}`]);
    if (!nome) continue;

    entries.push({
      nome,
      re: valueText(cells[`E${row}`]),
      tipo: valueText(cells[`F${row}`]),
      motivo: valueText(cells[`H${row}`]),
      dias: valueText(cells[`J${row}`]),
      inicio: cells[`K${row}`],
      sexo: valueText(cells[`O${row}`]),
      destino: valueText(cells[`P${row}`]),
    });
  }

  if (!entries.length) {
    throw new Error(`Nenhum nome foi encontrado no intervalo D${10 + offset}:D${30 + offset}.`);
  }

  return entries;
}

function buildPelotaoDespachoHtml(template, entries, cells, sheetIndex) {
  const offset = Number(sheetIndex) * 40;
  const role = valueText(cells[`F${5 + offset}`]);
  const signer = valueText(cells[`G${5 + offset}`]);
  const platoon = valueText(cells[`E${4 + offset}`]);
  const dateText = formatCompactDatePtBr(cells.B1);
  const generated = entries
    .map((entry, index) => renderPelotaoEntry(entry, index + 1))
    .join("\n\n");
  const pattern = /(<p\b[^>]*>\s*1\.\s*Encaminho[\s\S]*?<\/p>)([\s\S]*?)(<p\b[^>]*>(?:(?!<p\b)[\s\S])*?2\.\s*Nada\s+mais\s+a\s+informar\.(?:(?!<p\b)[\s\S])*?<\/p>)/i;

  if (!pattern.test(template)) {
    throw new Error("Bloco dos afastamentos nao encontrado no modelo HTML.");
  }

  let html = template.replace(pattern, (_, opening, _oldItems, closing) => `${opening}\n\n${generated}\n\n${closing}`);
  html = removePelotaoHeaderLines(html);
  html = replaceAll(html, "21/05/2026", escapeHtml(dateText));
  html = replaceAll(html, "HIGOR MACHADO MARQUES", escapeHtml(signer));
  html = replaceAll(html, "Higor Machado Marques", escapeHtml(signer));
  html = replaceAll(html, "Assunto: Afastamentos do 3&ordm; CFO &quot;A&quot;", `Assunto: Afastamentos do ${escapeHtml(platoon)}`);
  html = replaceAll(html, "Assunto: Afastamentos do 3º CFO &quot;A&quot;", `Assunto: Afastamentos do ${escapeHtml(platoon)}`);
  html = replaceAll(html, "Assunto: Afastamentos do 3º CFO \"A\"", `Assunto: Afastamentos do ${escapeHtml(platoon)}`);
  html = replaceAll(html, "Cad PM Resp. Restr/Conval/LTS do 3&ordm; CFO &quot;A&quot;", escapeHtml(role));
  html = replaceAll(html, "Cad PM Resp. Restr/Conval/LTS do 3º CFO &quot;A&quot;", escapeHtml(role));
  html = replaceAll(html, "Cad PM Resp. Restr/Conval/LTS do 3º CFO \"A\"", escapeHtml(role));
  return trimAfterLastPelotaoRole(html, role);
}

function removePelotaoHeaderLines(html) {
  const patterns = [
    /\s*<p\b[^>]*>[\s\S]*?N(?:&ordm;|º|Âº)\s+do\s+Processo:[\s\S]*?057\.00246949\/2026-28[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Interessado:[\s\S]*?Anderson\s+Alves\s+da\s+Silva[\s\S]*?<\/p>/i,
    /\s*<p\b[^>]*>[\s\S]*?Assunto:[\s\S]*?Restr[\s\S]*?1(?:&ordf;|ª|Âª)\s+Cia\s+Es[\s\S]*?<\/p>/i,
  ];

  return patterns.reduce((current, pattern) => current.replace(pattern, ""), html);
}

function trimAfterLastPelotaoRole(html, role) {
  const escapedRole = escapeHtml(role);
  const searchTerms = [
    escapedRole,
    "Cad PM Resp. Restr/Conval/LTS do 3&ordm; CFO &quot;A&quot;",
    "Cad PM Resp. Restr/Conval/LTS do 3º CFO &quot;A&quot;",
    "Cad PM Resp. Restr/Conval/LTS do 3º CFO \"A\"",
  ].filter(Boolean);

  let markerIndex = -1;
  for (const term of searchTerms) {
    markerIndex = Math.max(markerIndex, html.lastIndexOf(term));
  }
  if (markerIndex === -1) return html;

  const paragraphEnd = html.indexOf("</p>", markerIndex);
  const cutIndex = paragraphEnd === -1 ? markerIndex + searchTerms[0].length : paragraphEnd + 4;
  const closing = html.match(/<\/body>\s*<\/html>\s*$/i)?.[0] || "\n</body>\n</html>";
  return `${html.slice(0, cutIndex)}\n${closing}`;
}

function renderPelotaoEntry(entry, itemNumber) {
  const feminino = isFemaleCadet(entry.sexo);
  const artigo = feminino ? "A Respectiva Cadete" : "O Respectivo Cadete";
  const encaminhado = feminino ? "encaminhada" : "encaminhado";
  const destino = entry.destino ? `${escapeHtml(entry.destino)} ` : "";

  return [
    despachoParagraph(`1.${itemNumber} CAD PM ${escapeHtml(entry.re)} ${escapeHtml(entry.nome)}.`),
    despachoParagraph(`1.${itemNumber}.1. ${artigo} foi ${encaminhado} ${destino}com ${escapeHtml(entry.motivo)};`),
    despachoParagraph(
      `1.${itemNumber}.2. Foi estabelecida ${pelotaoRestrictionLabel(entry.tipo)} de ` +
      `${escapeHtml(pelotaoDaysText(entry.dias))} a partir de ${escapeHtml(formatCompactDatePtBr(entry.inicio))}.`
    ),
  ].join("\n\n");
}

function despachoParagraph(content) {
  return `<p class="Texto_Justificado_Recuo_Primeira_Linha">${content}</p>`;
}

function isFemaleCadet(value) {
  const normalized = normalizeText(value);
  return normalized.startsWith("F") || normalized.includes("FEM");
}

function pelotaoRestrictionLabel(value) {
  const normalized = normalizeText(value).replace(/\.$/, "");
  if (normalized.includes("CONVAL")) return "convalescen&ccedil;a";
  if (normalized.includes("LTS")) return "LTS";
  if (normalized.includes("LIC")) return "licen&ccedil;a compuls&oacute;ria";
  if (normalized.includes("REST") || normalized.includes("RESTR")) return "restri&ccedil;&atilde;o";
  return escapeHtml(value);
}

function pelotaoDaysText(value) {
  const raw = valueText(value);
  const number = Number(raw);
  if (!raw || !Number.isFinite(number)) return raw;
  return `${number} ${number === 1 ? "dia" : "dias"}`;
}

function replaceDocumentText(root, replacements) {
  for (const [search, replacement] of replacements) {
    if (!replacement) continue;
    replaceTextInNode(root, decodeHtmlEntities(search), replacement);
  }
}

function replaceTextInNode(root, search, replacement) {
  const ownerDocument = root.ownerDocument || document;
  const walker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    if (node.nodeValue.includes(search)) {
      node.nodeValue = node.nodeValue.split(search).join(replacement);
    }
  }
}

function decodeHtmlEntities(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function normalizeText(value) {
  return valueText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function addFiles(files) {
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  for (const file of imageFiles) {
    state.photos.push({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      rotation: 0,
    });
  }

  render();
  if (imageFiles.length) {
    setStatus(`${imageFiles.length} foto(s) adicionada(s).`);
  }
}

function render() {
  photoList.replaceChildren();

  state.photos.forEach((photo, index) => {
    const node = photoTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = index;
    node.querySelector("img").src = photo.url;
    node.querySelector("img").alt = photo.file.name;
    node.querySelector("img").style.transform = `rotate(${photo.rotation}deg)`;
    node.querySelector(".photo-name").textContent = `${index + 1}. ${photo.file.name}`;
    node.querySelector(".photo-info").textContent = formatFileSize(photo.file.size);
    photoList.appendChild(node);
  });

  photoCount.textContent = `${state.photos.length} foto${state.photos.length === 1 ? "" : "s"}`;
  generateButton.disabled = state.photos.length === 0;
}

function movePhoto(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= state.photos.length || fromIndex === toIndex) return;
  const [photo] = state.photos.splice(fromIndex, 1);
  state.photos.splice(toIndex, 0, photo);
  render();
}

function rotatePhoto(index) {
  state.photos[index].rotation = (state.photos[index].rotation + 90) % 360;
  render();
}

function removePhoto(index) {
  const [photo] = state.photos.splice(index, 1);
  URL.revokeObjectURL(photo.url);
  render();
}

async function createPdf() {
  const selectedSize = pageSizes[pageSize.value];
  const margin = Number(marginSize.value);
  const imageQuality = Number(quality.value) / 100;
  const pages = [];

  for (let index = 0; index < state.photos.length; index += 1) {
    setStatus(`Preparando pagina ${index + 1} de ${state.photos.length}...`);
    const photo = state.photos[index];
    const image = await loadImage(photo.url);
    const jpeg = imageToJpeg(image, photo.rotation, imageQuality);
    pages.push({
      jpegBytes: base64ToBytes(jpeg.dataUrl.split(",")[1]),
      imageWidth: jpeg.width,
      imageHeight: jpeg.height,
      pageWidth: selectedSize.width,
      pageHeight: selectedSize.height,
      margin,
    });
  }

  setStatus("Montando PDF...");
  return buildPdf(pages);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Uma imagem nao pode ser carregada."));
    image.src = url;
  });
}

function imageToJpeg(image, rotation, imageQuality) {
  const sideways = rotation === 90 || rotation === 270;
  const canvas = document.createElement("canvas");
  canvas.width = sideways ? image.naturalHeight : image.naturalWidth;
  canvas.height = sideways ? image.naturalWidth : image.naturalHeight;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  context.restore();

  return {
    dataUrl: canvas.toDataURL("image/jpeg", imageQuality),
    width: canvas.width,
    height: canvas.height,
  };
}

function buildPdf(pages) {
  const encoder = new TextEncoder();
  const parts = [];
  const offsets = [0];
  let position = 0;
  let objectNumber = 1;

  function addPart(part) {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    parts.push(bytes);
    position += bytes.length;
  }

  function startObject() {
    offsets[objectNumber] = position;
    addPart(`${objectNumber} 0 obj\n`);
    return objectNumber++;
  }

  addPart("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  const catalogObj = startObject();
  addPart("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objectNumber = 3;

  const pageRefs = [];
  const pageObjects = [];

  for (let index = 0; index < pages.length; index += 1) {
    const pageObj = objectNumber++;
    const imageObj = objectNumber++;
    const contentObj = objectNumber++;
    pageRefs.push(`${pageObj} 0 R`);
    pageObjects.push({ pageObj, imageObj, contentObj, index });
  }

  offsets[2] = position;
  addPart("2 0 obj\n");
  addPart(`<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>\nendobj\n`);

  for (const pageObject of pageObjects) {
    const page = pages[pageObject.index];
    const placement = getImagePlacement(page);
    const imageName = `Im${pageObject.index + 1}`;
    const content = [
      "q",
      `${formatNumber(placement.width)} 0 0 ${formatNumber(placement.height)} ${formatNumber(placement.x)} ${formatNumber(placement.y)} cm`,
      `/${imageName} Do`,
      "Q",
      "",
    ].join("\n");

    offsets[pageObject.pageObj] = position;
    addPart(`${pageObject.pageObj} 0 obj\n`);
    addPart(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatNumber(page.pageWidth)} ${formatNumber(page.pageHeight)}] ` +
      `/Resources << /XObject << /${imageName} ${pageObject.imageObj} 0 R >> >> ` +
      `/Contents ${pageObject.contentObj} 0 R >>\nendobj\n`
    );

    offsets[pageObject.imageObj] = position;
    addPart(`${pageObject.imageObj} 0 obj\n`);
    addPart(
      `<< /Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpegBytes.length} >>\nstream\n`
    );
    addPart(page.jpegBytes);
    addPart("\nendstream\nendobj\n");

    offsets[pageObject.contentObj] = position;
    addPart(`${pageObject.contentObj} 0 obj\n`);
    addPart(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);
  }

  const xrefPosition = position;
  addPart(`xref\n0 ${objectNumber}\n`);
  addPart("0000000000 65535 f \n");
  for (let index = 1; index < objectNumber; index += 1) {
    addPart(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  addPart(`trailer\n<< /Size ${objectNumber} /Root ${catalogObj} 0 R >>\n`);
  addPart(`startxref\n${xrefPosition}\n%%EOF`);

  return concatBytes(parts);
}

function getImagePlacement(page) {
  const usableWidth = Math.max(1, page.pageWidth - page.margin * 2);
  const usableHeight = Math.max(1, page.pageHeight - page.margin * 2);
  const scale = Math.min(usableWidth / page.imageWidth, usableHeight / page.imageHeight);
  const width = page.imageWidth * scale;
  const height = page.imageHeight * scale;

  return {
    width,
    height,
    x: (page.pageWidth - width) / 2,
    y: (page.pageHeight - height) / 2,
  };
}

function concatBytes(parts) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function formatNumber(value) {
  return Number(value.toFixed(2)).toString();
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function normalizePdfName(name) {
  const trimmed = name.trim() || "documentos_unidos.pdf";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

function setStatus(message) {
  statusText.textContent = message;
}

function setMemoStatus(message) {
  memoStatus.textContent = message;
}

function setDespachoStatus(message) {
  despachoStatus.textContent = message;
}

function setControleStatus(message) {
  controleStatus.textContent = message;
}

function setPelotaoStatus(message) {
  pelotaoStatus.textContent = message;
}

async function readXlsxCells(file, refs) {
  const entries = await unzipXlsx(await file.arrayBuffer());
  const workbookXml = textEntry(entries, "xl/workbook.xml");
  const workbookRelsXml = textEntry(entries, "xl/_rels/workbook.xml.rels");
  const sharedStringsXml = entries.get("xl/sharedStrings.xml")
    ? textEntry(entries, "xl/sharedStrings.xml")
    : "";
  const strings = parseSharedStrings(sharedStringsXml);
  const sheetPath = firstSheetPath(workbookXml, workbookRelsXml);
  const sheetXml = textEntry(entries, sheetPath);
  const cells = parseSheetCells(sheetXml, strings);

  return Object.fromEntries(refs.map((ref) => [ref, cells[ref] ?? ""]));
}

async function unzipXlsx(buffer) {
  const bytes = new Uint8Array(buffer);
  const entries = new Map();
  const eocdOffset = findEndOfCentralDirectory(bytes);
  const view = new DataView(buffer);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  let cursor = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    const signature = view.getUint32(cursor, true);
    if (signature !== 0x02014b50) throw new Error("Planilha .xlsx invalida.");

    const method = view.getUint16(cursor + 10, true);
    const compressedSize = view.getUint32(cursor + 20, true);
    const fileNameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localHeaderOffset = view.getUint32(cursor + 42, true);
    const nameBytes = bytes.slice(cursor + 46, cursor + 46 + fileNameLength);
    const name = new TextDecoder().decode(nameBytes).replace(/\\/g, "/");

    const localNameLength = view.getUint16(localHeaderOffset + 26, true);
    const localExtraLength = view.getUint16(localHeaderOffset + 28, true);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.slice(dataStart, dataStart + compressedSize);
    entries.set(name, await inflateZipEntry(compressed, method));

    cursor += 46 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(bytes) {
  for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
    if (
      bytes[offset] === 0x50 &&
      bytes[offset + 1] === 0x4b &&
      bytes[offset + 2] === 0x05 &&
      bytes[offset + 3] === 0x06
    ) {
      return offset;
    }
  }
  throw new Error("Nao foi possivel ler o arquivo .xlsx.");
}

async function inflateZipEntry(bytes, method) {
  if (method === 0) return bytes;
  if (method !== 8) throw new Error("Compactacao da planilha nao suportada.");
  if (!("DecompressionStream" in window)) {
    throw new Error("Seu navegador nao suporta leitura de .xlsx neste app.");
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function textEntry(entries, path) {
  const bytes = entries.get(path);
  if (!bytes) throw new Error(`Arquivo interno ausente na planilha: ${path}`);
  return new TextDecoder("utf-8").decode(bytes);
}

function firstSheetPath(workbookXml, relsXml) {
  const parser = new DOMParser();
  const workbook = parser.parseFromString(workbookXml, "application/xml");
  const rels = parser.parseFromString(relsXml, "application/xml");
  const sheet = workbook.querySelector("sheet");
  if (!sheet) throw new Error("A planilha nao possui abas.");

  const relationshipId = sheet.getAttribute("r:id");
  const relationship = [...rels.querySelectorAll("Relationship")]
    .find((item) => item.getAttribute("Id") === relationshipId);
  if (!relationship) throw new Error("Nao foi possivel localizar a primeira aba.");

  const target = relationship.getAttribute("Target").replace(/^\/+/, "");
  return target.startsWith("xl/") ? target : `xl/${target}`;
}

function parseSharedStrings(xml) {
  if (!xml) return [];
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  return [...doc.querySelectorAll("si")].map((node) => {
    const textNodes = [...node.querySelectorAll("t")];
    return textNodes.map((item) => item.textContent || "").join("");
  });
}

function parseSheetCells(xml, sharedStrings) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const cells = {};

  for (const cell of doc.querySelectorAll("c[r]")) {
    const ref = cell.getAttribute("r");
    const type = cell.getAttribute("t");
    const valueNode = cell.querySelector("v");
    const inlineNode = cell.querySelector("is t");
    const raw = valueNode ? valueNode.textContent : inlineNode ? inlineNode.textContent : "";

    if (type === "s") {
      cells[ref] = sharedStrings[Number(raw)] || "";
    } else if (type === "inlineStr") {
      cells[ref] = raw || "";
    } else if (type === "b") {
      cells[ref] = raw === "1";
    } else {
      cells[ref] = formatNumericText(raw || "");
    }
  }

  return cells;
}

function formatNumericText(value) {
  const text = String(value || "");
  if (!text) return "";

  if (/^[+-]?\d+(?:\.\d+)?[eE][+-]?\d+$/.test(text)) {
    const number = Number(text);
    if (Number.isFinite(number) && Number.isInteger(number) && Math.abs(number) <= Number.MAX_SAFE_INTEGER) {
      return String(number);
    }
  }

  if (/^[+-]?\d+\.0+$/.test(text)) {
    return text.replace(/\.0+$/, "");
  }

  return text;
}

function formatDatePtBr(value) {
  if (value instanceof Date) return formatDateObject(value);
  if (typeof value === "number" || /^[0-9]+(\.[0-9]+)?$/.test(String(value))) {
    const date = excelSerialToDate(Number(value));
    if (date) return formatDateObject(date);
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return formatDateObject(parsed);
  return valueText(value);
}

function formatCompactDatePtBr(value) {
  const date = dateFromValue(value);
  if (!date) return valueText(value);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

function dateFromValue(value) {
  if (value instanceof Date) return value;
  if (typeof value === "number" || /^[0-9]+(\.[0-9]+)?$/.test(String(value))) {
    return excelSerialToDate(Number(value));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function excelSerialToDate(serial) {
  if (!serial) return null;
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

function formatDateObject(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatWorksheetCount(value) {
  if (value === "" || value === null || value === undefined) return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return `${escapeHtml(valueText(value))} planilhas de controle mensal.`;
  const padded = String(number).padStart(2, "0");
  return `${padded} (${escapeHtml(numberToPortuguese(number))}) planilhas de controle mensal.`;
}

function numberToPortuguese(number) {
  const words = {
    0: "zero",
    1: "uma",
    2: "duas",
    3: "três",
    4: "quatro",
    5: "cinco",
    6: "seis",
    7: "sete",
    8: "oito",
    9: "nove",
    10: "dez",
    11: "onze",
    12: "doze",
    13: "treze",
    14: "quatorze",
    15: "quinze",
    16: "dezesseis",
    17: "dezessete",
    18: "dezoito",
    19: "dezenove",
    20: "vinte",
  };
  return words[number] || String(number);
}

function replaceAll(text, search, replacement) {
  return text.split(search).join(replacement);
}

function valueText(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function escapeHtml(value) {
  return valueText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replace(/[^\x20-\x7E]/g, (char) => `&#${char.codePointAt(0)};`);
}

function ensureUtf8Meta(html) {
  if (/<meta[^>]+charset=/i.test(html)) {
    return html.replace(/<meta[^>]+charset=["']?[^"'>\s]+["']?[^>]*>/i, '<meta charset="utf-8">');
  }

  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (match) => `${match}\n<meta charset="utf-8">`);
  }

  return `<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n</head>\n<body>\n${html}\n</body>\n</html>`;
}

function applyGeneratedHtmlFont(html) {
  const style = [
    "<style id=\"generated-output-font\">",
    "body, body *:not(img):not(svg):not(path) {",
    "  font-family: \"Times New Roman\", Times, serif !important;",
    "  font-size: 11pt !important;",
    "}",
    "</style>",
  ].join("\n");

  if (/<style[^>]+id=["']generated-output-font["'][^>]*>/i.test(html)) {
    return html;
  }

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `${style}\n</head>`);
  }

  return `${style}\n${html}`;
}

function downloadTextFile(fileName, text, type, statusElement) {
  downloadBlob(fileName, new Blob(["\uFEFF", text], { type }), statusElement);
}

async function saveOrDownloadTextFile(fileName, text, type, statusElement, saveHandle) {
  const blob = new Blob(["\uFEFF", text], { type });

  if (saveHandle) {
    const writable = await saveHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }

  downloadBlob(fileName, blob, statusElement);
}

async function requestSaveHandle(suggestedName, mimeType) {
  if (!window.showSaveFilePicker) return null;

  return window.showSaveFilePicker({
    suggestedName,
    types: [
      {
        description: "Arquivo HTML",
        accept: { [mimeType]: [".html"] },
      },
    ],
  });
}

function downloadBlob(fileName, blob, statusElement) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  if (statusElement) {
    const fallback = document.createElement("a");
    fallback.href = url;
    fallback.download = fileName;
    fallback.textContent = "Clique aqui se o download nao iniciar.";
    fallback.className = "download-fallback";
    statusElement.append(" ");
    statusElement.appendChild(fallback);
  }

  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function normalizeHtmlName(name) {
  const trimmed = name.trim() || "Memorando_gerado.html";
  return trimmed.toLowerCase().endsWith(".html") ? trimmed : `${trimmed}.html`;
}

render();
