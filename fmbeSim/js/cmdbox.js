const cmdboxList = {};

export function initCmdbox() {
  for (const root of document.getElementsByClassName("cmdbox")) {
    root.innerHTML = "";

    const head = root.appendChild(document.createElement("div"));
    head.className = "cmdbox-head";
    const copy = head.appendChild(document.createElement("button"));
    copy.type = "button";
    copy.className = "cmdbox-copy";
    copy.textContent = "Copy";
    const count = head.appendChild(document.createElement("span"));
    count.className = "cmdbox-count";
    const body = root.appendChild(document.createElement("pre"));
    body.className = "cmdbox-body";

    const cmdbox = cmdboxList[root.id] = {count, body};

    // コピーボタン
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(body.textContent);
        copy.textContent = "Copied!";
      } catch {
        copy.textContent = "Failed";
      }
      clearTimeout(cmdbox.copyTimeoutId);
      cmdbox.copyTimeoutId = setTimeout(() => {
        copy.textContent = "Copy";
      }, 1000);
    });
  }
}

export function setCmd(id, text) {
  const cmdbox = cmdboxList[id];
  if (!cmdbox) return;

  cmdbox.body.textContent = text;
  const length = text.length;
  cmdbox.count.textContent = `${length} character${length === 1 ? "" : "s"}`;
}
