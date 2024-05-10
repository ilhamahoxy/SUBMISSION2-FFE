import "./style/style.css";
class AppBar extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute("title") || "App Bar";
    const color = this.getAttribute("color") || "blue";
    this.innerHTML = `<h1 style="color: ${color};">${title}</h1>`;
  }
}

customElements.define("app-bar", AppBar);

class NoteInput extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="note-form">
        <input type="text" id="note-title" placeholder="Judul Catatan" required />
        <textarea id="note-body" rows="5" placeholder="Isi Catatan" required></textarea>
        <button type="submit">Tambah Catatan</button>
      </form>
    `;
  }
}

customElements.define("note-input", NoteInput);

class NoteItem extends HTMLElement {
  set note(note) {
    this.innerHTML = `
      <div class="note">
        <h2>${note.title}</h2>
        <p>${note.body}</p>
        <div class="note-date">${new Date(
          note.createdAt
        ).toLocaleDateString()}</div>
        <button class="btn-delete" data-id="${note.id}">Hapus</button>
      </div>
    `;
  }
}

customElements.define("note-item", NoteItem);

function main() {
  const baseUrl = "https://notes-api.dicoding.dev/v2";
  const loadingIndicator = document.getElementById("loading-indicator");

  const showLoadingIndicator = () => {
    loadingIndicator.style.display = "flex";
  };

  const hideLoadingIndicator = () => {
    loadingIndicator.style.display = "none";
  };

  const getNotes = async () => {
    try {
      showLoadingIndicator();
      const response = await fetch(`${baseUrl}/notes`);
      const responseData = await response.json();
      if (response.ok) {
        renderAllNotes(responseData.data);
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      showResponseMessage(error.message);
    } finally {
      hideLoadingIndicator();
    }
  };

  const addNote = async (note) => {
    try {
      showLoadingIndicator();
      const { createdAt, archived, ...noteData } = note;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
      };

      const response = await fetch(`${baseUrl}/notes`, options);
      const responseData = await response.json();
      if (response.ok) {
        showResponseMessage(responseData.message);
        getNotes();
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      showResponseMessage(error.message);
    } finally {
      hideLoadingIndicator();
    }
  };

  const removeNote = async (noteId) => {
    try {
      showLoadingIndicator();
      const options = {
        method: "DELETE",
      };

      const response = await fetch(`${baseUrl}/notes/${noteId}`, options);
      const responseData = await response.json();
      if (response.ok) {
        showResponseMessage(responseData.message);
        getNotes();
      } else {
        throw new Error(responseData.message);
      }
    } catch (error) {
      showResponseMessage(error.message);
    } finally {
      hideLoadingIndicator();
    }
  };

  const renderAllNotes = (notes) => {
    const notesListElement = document.getElementById("notes-list");
    notesListElement.innerHTML = "";

    notes.forEach((note) => {
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");

      noteElement.innerHTML = `
        <h2>${note.title}</h2>
        <p>${note.body}</p>
        <div class="note-date">${new Date(
          note.createdAt
        ).toLocaleDateString()}</div>
        <button class="btn-delete" data-id="${note.id}">Hapus</button>
      `;

      noteElement.querySelector(".btn-delete").addEventListener("click", () => {
        removeNote(note.id);
      });

      notesListElement.appendChild(noteElement);
    });
  };

  const showResponseMessage = (message = "Check your internet connection") => {
    alert(message);
  };

  const noteForm = document.getElementById("note-form");

  noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const noteTitle = document.getElementById("note-title").value;
    const noteBody = document.getElementById("note-body").value;

    if (noteTitle && noteBody) {
      const newNote = {
        title: noteTitle,
        body: noteBody,
        createdAt: new Date().toISOString(),
        archived: false,
      };

      await addNote(newNote);
    } else {
      showResponseMessage("Please fill in all fields");
    }
  });

  getNotes();
}

main();
