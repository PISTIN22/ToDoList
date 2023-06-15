const urun = document.getElementById("item");
let items = [];

window.addEventListener("load", () => {
  const storedItems = localStorage.getItem("items");
  if (storedItems) {
    items = JSON.parse(storedItems);
    listeGuncelle();
  }
});

document.getElementById("kullaniciGiris").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    urunGirisi();
  }
});

const urunGirisi = () => {
  const girilenUrun = document.getElementById("kullaniciGiris").value;
  if (girilenUrun.trim().length > 0) {
    const item = {
      key: items.length + 1,
      value: girilenUrun,
    };
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    listeGuncelle();
    document.getElementById("kullaniciGiris").value = "";
    document.getElementById("kullaniciGiris").placeholder = "Yeni bir ürün giriniz.";
  } else {
    alert("Lütfen boş bırakmayınız ve gerçek bir ürün giriniz");
    document.getElementById("kullaniciGiris").value = "";
    document.getElementById("kullaniciGiris").placeholder =
      "Lütfen boş bir ürün adı girmeyin";
  }
};

const duzenle = (key) => {
  const index = items.findIndex((item) => item.key === key);
  document.getElementById("kullaniciGiris").placeholder =
    "Lütfen Ürününüzü düzenleyiniz (Enter) düzenle (ESC) iptal et";
  const itemInfoEl = document.querySelector(`[data-key="${key}"] .item-info`);
  const originalText = itemInfoEl.textContent;
  if (index !== -1) {
    const itemInfoEl = document.querySelector(`[data-key="${key}"] .item-info`);
    itemInfoEl.contentEditable = true;
    itemInfoEl.focus();
    document.execCommand("selectAll", false, null);
    itemInfoEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("kullaniciGiris").placeholder = "Düzenleme Tamamlandı. Yeni ürün girebilirsiniz";
        itemInfoEl.blur();
      }
      else if (event.key === "Escape") {
        event.preventDefault();
        itemInfoEl.textContent = originalText;
        document.getElementById("kullaniciGiris").placeholder = "Düzenleme iptal edildi";
        itemInfoEl.blur();
      }
    });

    itemInfoEl.addEventListener("blur", (event) => {
      const editedItem = event.target.textContent.trim();
      if (editedItem && editedItem.length > 0) {
        items[index].value = editedItem;
        localStorage.setItem("items", JSON.stringify(items));
        listeGuncelle();
      } else {
        alert("Geçerli bir ürün adı giriniz.");
        document.getElementById("kullaniciGiris").placeholder =
          "Geçerli bir ürün adı giriniz.";
        event.target.textContent = items[index].value;
      }
      itemInfoEl.contentEditable = false;
    });
  }
};

const sil = (key) => {
  const index = items.findIndex((item) => item.key === key);
  if (index !== -1) {
    items.splice(index, 1);
    localStorage.setItem("items", JSON.stringify(items));
    listeGuncelle();
  }
};

const listeGuncelle = () => {
  urun.textContent = "";
  items.forEach((item) => {
    const listElemani = document.createElement("li");
    /* sürükle bırak */
    listElemani.draggable = true;
    listElemani.setAttribute("data-key", item.key);
    listElemani.classList.add("drag-over");
    listElemani.addEventListener("dragstart", dragStart);
    listElemani.addEventListener("dragover", dragOver);
    listElemani.addEventListener("dragenter", dragEnter);
    listElemani.addEventListener("dragleave", dragLeave);
    listElemani.addEventListener("drop", drop);
    listElemani.setAttribute("draggable", "true");
    listElemani.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", item.key);
      event.currentTarget.classList.add("dragging");
    });

    listElemani.addEventListener("dragend", (event) => {
      event.currentTarget.classList.remove("dragging");
    });

    listElemani.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    listElemani.addEventListener("dragenter", (event) => {
      event.currentTarget.classList.add("drag-over");
    });

    listElemani.addEventListener("dragleave", (event) => {
      event.currentTarget.classList.remove("drag-over");
    });

    listElemani.addEventListener("drop", (event) => {
      event.preventDefault();
      const droppedItemId = event.dataTransfer.getData("text/plain");
      const droppedItemIndex = items.findIndex((item) => item.key === parseInt(droppedItemId));
      const targetItemId = event.currentTarget.getAttribute("data-key");
      const targetItemIndex = items.findIndex((item) => item.key === parseInt(targetItemId));

      if (droppedItemIndex > -1 && targetItemIndex > -1 && droppedItemIndex !== targetItemIndex) {
        const [droppedItem] = items.splice(droppedItemIndex, 1);
        items.splice(targetItemIndex, 0, droppedItem);
        localStorage.setItem("items", JSON.stringify(items));
        listeGuncelle();
      }
      event.currentTarget.classList.remove("drag-over");
    });
    // style
    listElemani.classList.add("item-list");
    listElemani.style.borderBottom = "1px solid";
    listElemani.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
    listElemani.style.borderRadius = "15px";
    listElemani.style.margin = "5px";

    const itemInfoEl = document.createElement("div");
    itemInfoEl.classList.add("item-info");
    itemInfoEl.textContent = item.value;
    listElemani.appendChild(itemInfoEl);

    const itemIconsEl = document.createElement("div");
    itemIconsEl.classList.add("item-icons");
    // edit item
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-regular", "fa-pen-to-square");
    editIcon.style.color = "green";
    editIcon.onclick = () => duzenle(item.key);
    itemIconsEl.appendChild(editIcon);
    // delete item
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-trash-can");
    deleteIcon.style.color = "red";
    deleteIcon.onclick = () => sil(item.key);
    itemIconsEl.appendChild(deleteIcon);

    listElemani.appendChild(itemIconsEl);
    urun.appendChild(listElemani);
  });

  urun.style.overflow = "auto";
  urun.style.maxHeight = "200px";
};

/* sürükle bırak fonksiyonlar başlangıç */
let draggedItem;
const dragStart = (event) => {
  draggedItem = event.target;
  setTimeout(() => {
    event.target.classList.add("hide");
  }, 0);
};

const dragOver = (event) => {
  event.preventDefault();
};

const dragEnter = (event) => {
  event.preventDefault();
  event.target.classList.add("drag-over");
};

const dragLeave = (event) => {
  event.target.classList.remove("drag-over");
};

const drop = (event) => {
  event.preventDefault();
  event.target.classList.remove("drag-over");
  const droppedItemId = draggedItem.getAttribute("data-key");
  const droppedItemIndex = items.findIndex((item) => item.key === parseInt(droppedItemId));
  const targetItemId = event.target.getAttribute("data-key");
  const targetItemIndex = items.findIndex((item) => item.key === parseInt(targetItemId));

  if (droppedItemIndex > -1 && targetItemIndex > -1 && droppedItemIndex !== targetItemIndex) {
    const [droppedItem] = items.splice(droppedItemIndex, 1);
    items.splice(targetItemIndex, 0, droppedItem);
    localStorage.setItem("items", JSON.stringify(items));
    listeGuncelle();
  }
};
/* sürükle bırak fonksiyonlar bitiş */


const sepetiTemizle = () => {
  const confirmed = confirm("Sepetinizi temizlemek istediğinize emin misiniz?");
  if (confirmed) {
    if (items.length === 0) {
      alert("Sepetiniz zaten boş.");
      document.getElementById("kullaniciGiris").placeholder =
        "Lütfen boş bir ürün adı girmeyin";
      return;
    }

    items = [];
    localStorage.removeItem("items");
    urun.textContent = "";
    alert("Sepetiniz başarıyla temizlendi...");
    document.getElementById("kullaniciGiris").placeholder =
      "Sepetiniz başarıyla temizlendi. Yeni ürünler girebilirsiniz.";

    document.getElementById("kullaniciGiris").value = "";
  } else {
    alert("Silme işleminiz iptal edildi.");
  }
};