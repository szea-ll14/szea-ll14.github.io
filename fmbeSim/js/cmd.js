const cmdboxList = {};

export function initCmd() {
  for (const cmdboxRoot of document.getElementsByClassName("cmdbox")) {
    const id = cmdboxRoot.id;
    cmdboxList[id] = {
      copy: cmdboxRoot.querySelector(".cmdbox-copy"),
      count: cmdboxRoot.querySelector(".cmdbox-count"),
      body: cmdboxRoot.querySelector(".cmdbox-body"),
    }

    const cmdbox = cmdboxList[id];

    // コピーボタン
    cmdbox.copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(cmdbox.body.textContent);
        cmdbox.copy.textContent = "Copied!";
      } catch {
        cmdbox.copy.textContent = "Failed";
      }
      clearTimeout(cmdbox.copyTimeoutId);
      cmdbox.copyTimeoutId = setTimeout(() => {
        cmdbox.copy.textContent = "Copy";
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
