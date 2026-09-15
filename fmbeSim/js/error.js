const appError = document.getElementById("app-error");

export function errorLog(message, log) {
  console.error(message, "\n", log ?? "");

  const errorMessage = appError.appendChild(document.createElement("div"));
  errorMessage.className = "error-message";

  const errorButton = errorMessage.appendChild(document.createElement("button"));
  errorButton.type = "button";
  errorButton.className = "error-close";
  errorButton.textContent = "✕";
  errorButton.addEventListener("click", () => {
    appError.removeChild(errorMessage);
  })

  errorMessage.appendChild(new Text(message));

}
