const appError = document.getElementById("app-error");

export function errorLog(message, log) {
  console.error(message, "\n", log ?? "");

  const box = appError.appendChild(document.createElement("div"));
  box.className = "errorbox";

  const button = box.appendChild(document.createElement("button"));
  button.type = "button";
  button.className = "errorbox-close";
  button.textContent = "✕";
  button.addEventListener("click", () => {
    box.remove();
  });

  box.appendChild(new Text(message));
}
