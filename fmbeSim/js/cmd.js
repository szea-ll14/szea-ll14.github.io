const cmdboxList = {};

export function initCmd() {
  for (const cmdboxRoot of document.getElementsByClassName("cmdbox")) {
    const id = cmdboxRoot.id;
    cmdboxList[id] = {
      copy: cmdboxRoot.children[0].children[0],
      count: cmdboxRoot.children[0].children[1],
      pre: cmdboxRoot.children[1],
    }

    const cmdbox = cmdboxList[id];

    // コピーボタン
    cmdbox.copy.addEventListener("click", () => {
      try {
        navigator.clipboard.writeText(cmdbox.pre.textContent);
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
  cmdbox.pre.textContent = text;
  const length = text.length;
  cmdbox.count.textContent = `${length} character${length === 1 ? "" : "s"}`;
}
