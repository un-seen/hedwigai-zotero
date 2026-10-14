/* hedwigai Reference Checker for Zotero 7 and 8.
 *
 * Adds "Check references with hedwigai" to the item menu and the collection
 * menu. It writes the chosen items as a reference list — authors, year,
 * title, venue, DOI — and opens hedwigai.com/reference-checker with that list
 * in the URL fragment, where it is checked against Crossref. A fragment is
 * never sent to a server; the page reads it and clears it. Nothing in your
 * library is changed.
 */

var MENU_IDS = ["hedwigai-refcheck-items", "hedwigai-refcheck-collection"];
var PAGE = "https://www.hedwigai.com/reference-checker";
var FREE_LIMIT = 25;

function install() {}
function uninstall() {}

async function startup() {
  await Zotero.initializationPromise;
  for (const win of Zotero.getMainWindows()) addMenus(win);
}

function shutdown() {
  for (const win of Zotero.getMainWindows()) removeMenus(win);
}

function onMainWindowLoad({ window }) {
  addMenus(window);
}

function onMainWindowUnload({ window }) {
  removeMenus(window);
}

function addMenus(win) {
  const doc = win.document;
  const places = [
    ["zotero-itemmenu", MENU_IDS[0], () => win.ZoteroPane.getSelectedItems()],
    ["zotero-collectionmenu", MENU_IDS[1], () => {
      const c = win.ZoteroPane.getSelectedCollection();
      return c ? c.getChildItems() : [];
    }],
  ];
  for (const [menuId, id, items] of places) {
    const menu = doc.getElementById(menuId);
    if (!menu || doc.getElementById(id)) continue;
    const item = doc.createXULElement("menuitem");
    item.id = id;
    item.setAttribute("label", "Check references with hedwigai");
    item.addEventListener("command", () => check(win, items()));
    menu.appendChild(item);
  }
}

function removeMenus(win) {
  for (const id of MENU_IDS) win.document.getElementById(id)?.remove();
}

function field(item, name) {
  try {
    return (item.getField(name) || "").trim();
  } catch (e) {
    return "";
  }
}

/** One item as a line the checker reads: "Family, Family (2015). Title. Venue. doi:…" */
function line(item, n) {
  const names = item
    .getCreators()
    .filter((c) => c.creatorType === "author" || c.creatorType === "editor")
    .map((c) => c.lastName || c.name || "")
    .filter(Boolean);
  const authors = names.length > 3 ? names.slice(0, 3).join(", ") + " et al." : names.join(", ");
  const parsed = Zotero.Date.strToDate(field(item, "date"));
  const year = parsed && parsed.year ? ` (${parsed.year})` : "";
  const venue =
    field(item, "publicationTitle") || field(item, "proceedingsTitle") || field(item, "bookTitle") || field(item, "publisher");
  const doi = field(item, "DOI");
  return `${n}. ${authors}${year}. ${field(item, "title")}.${venue ? ` ${venue}.` : ""}${doi ? ` doi:${doi}` : ""}`;
}

function check(win, items) {
  const regular = items.filter((i) => i.isRegularItem() && field(i, "title"));
  if (regular.length === 0) {
    Services.prompt.alert(win, "hedwigai Reference Checker", "Select items that have a title, or a collection that holds some.");
    return;
  }
  if (regular.length > FREE_LIMIT) {
    const go = Services.prompt.confirm(
      win,
      "hedwigai Reference Checker",
      `The free check reads the first ${FREE_LIMIT} of these ${regular.length} items. Check them?`,
    );
    if (!go) return;
  }
  const text = regular.slice(0, FREE_LIMIT).map((item, i) => line(item, i + 1)).join("\n");
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  Zotero.launchURL(`${PAGE}?utm_source=zotero&utm_medium=plugin#refs=${b64}`);
}
