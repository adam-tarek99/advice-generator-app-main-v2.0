const btnAdvice = document.querySelector(".btn-advice");
const quoteTitle = document.querySelector(".title span");
const quoteContent = document.querySelector(".quote p");

const history = document.querySelector(".history");
const btnSave = document.querySelector(".btn-save");

if (!btnSave.getAttribute("id")) {
  btnSave.setAttribute("disabled", "");
  btnSave.style.cursor = "default";
  btnSave.style.backgroundColor = "hsl(150, 93.10%, 28.20%)";
}

const urlApi = "https://api.adviceslip.com/advice";

const getQuote = async () => {
  try {
    const response = await fetch(urlApi);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const newQuote = await response.json();
    quoteTitle.textContent = newQuote.slip.id;
    quoteContent.textContent = JSON.stringify(newQuote.slip.advice);
    btnSave.setAttribute("id", newQuote.slip.id);
  } catch (error) {
    console.error(error.message);
  }
  loading(btnAdvice, false);
  if (btnSave.getAttribute("id")) {
    btnSave.removeAttribute("disabled");
    btnSave.style.cursor = "pointer";
    btnSave.style.backgroundColor = "hsl(51, 100%, 49%)";
  }
  return;
};

const loading = (btn, boolean) => {
  if (boolean) {
    btn.setAttribute("disabled", "");
    btn.classList.add("loading");
    btn.style.cursor = "default";
  } else {
    btn.removeAttribute("disabled");
    btn.classList.remove("loading");
    btn.style.cursor = "pointer";
  }
};

btnAdvice.addEventListener("click", async () => {
  loading(btnAdvice, true);
  await getQuote();
});


btnSave.addEventListener("click", async () => {
  saveStorage();
  getSavedApi();
});

const saveStorage = () => {
  if (btnSave.getAttribute("id")) {
    const adviceSaved = JSON.parse(localStorage.getItem("adviceSaved"));

    if (!adviceSaved) {
      localStorage.setItem("adviceSaved", [
        JSON.stringify([{ id: btnSave.getAttribute("id") }]),
      ]);
      return;
    }

    const result = adviceSaved.filter((id) => {
      if (id.id == btnSave.getAttribute("id")) return true;
    });

    if (!result[0]) {
      localStorage.setItem(
        "adviceSaved",
        JSON.stringify([...adviceSaved, { id: btnSave.getAttribute("id") }])
      );
    }
  }
};

const getSavedApi = async () => {
  loading(btnSave, true);
  const adviceSaved = await JSON.parse(localStorage.getItem("adviceSaved"));
  history.classList.add("loader");

  history.querySelectorAll("tbody tr").forEach((e) => {
    e.remove();
  });

  adviceSaved.forEach(async (id) => {
    try {
      const response = await fetch(`${urlApi}/${id.id}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const newQuote = await response.json();

      history.querySelector("tbody").innerHTML += `
      <tr>
          <td>${newQuote.slip.id}</td>
            <td>${newQuote.slip.advice}</td>
          </tr>
          `;
      history.querySelector(".scroll").classList.remove("hidden");
      history.classList.remove("loader");
      return false;
    } catch (error) {
      console.error(error.message);
    }
    loading(btnSave, false);
  });

  return;
};

window.onload = async () => {
  const adviceSaved = await JSON.parse(localStorage.getItem("adviceSaved"));
  if (adviceSaved) {
    history.classList.add("loader");
    history.querySelector(".scroll").classList.remove("hidden");

    adviceSaved.forEach(async (id) => {
      try {
        const response = await fetch(`${urlApi}/${id.id}`);
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const newQuote = await response.json();
        history.querySelector("tbody").innerHTML += `
          <tr>
              <td>${newQuote.slip.id}</td>
                <td>${newQuote.slip.advice}</td>
              </tr>
              `;
        history.classList.remove("loader");
        history.querySelector(".scroll").classList.remove("hidden");
      } catch (error) {
        console.error(error.message);
      }
      loading(btnSave, false);
    });
  }
};
