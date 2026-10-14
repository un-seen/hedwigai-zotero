# hedwigai Reference Checker for Zotero

Check the references in your Zotero library before they go into a paper. Right-click items, or a collection, and choose **Check references with hedwigai**. Each one is looked up in Crossref and comes back:

- **Found**: Crossref has it as you have it.
- **Found, but**: Crossref has it with a different year or different authors.
- **Not found**: not in Crossref. Books, theses and some conference papers are not registered there, so look these up yourself.
- **Retracted**: Crossref records a retraction, from Retraction Watch.

The check runs at [hedwigai.com/reference-checker](https://www.hedwigai.com/reference-checker). It is free, with no account: up to 25 references a check and 3 checks a day.

## Install

1. Download `hedwigai-reference-checker-0.1.0.xpi` from the [latest release](https://github.com/un-seen/hedwigai-zotero/releases/latest).
2. In Zotero 7 or 8, open **Tools → Plugins**, click the gear, choose **Install Plugin From File…**, and pick the file.

## Privacy

The plugin changes nothing in your library and sends nothing itself. It writes the chosen items as a reference list (authors, year, title, journal, DOI) and opens the checker page with that list in the URL fragment, the part after `#`, which browsers never send to a server. The page reads it, sends it to the checker once, and clears it. Nothing is kept.

## Check a whole draft

A reference can exist and still be cited for something it does not say. Signed in, [hedwigai](https://www.hedwigai.com/claim-checker) reads every sentence that cites a work against that work, with the passage that settles it.

## License

MIT
