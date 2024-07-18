export class githubUser {
  static async search(username) {
    const endpoint = `https://api.github.com/users/${username}`;
    return fetch(endpoint)
      .then((data) => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }));
  }
}

export class favorites {
  entries = [];
  constructor(page) {
    this.page = document.querySelector(page);
    this.load();
  }

  updateEmptyPage() {
    this.emptyPage = this.page.querySelector("#empty");
    if (this.entries.length === 0) {
      this.emptyPage.classList.remove("hide");
    } else {
      this.emptyPage.classList.add("hide");
    }
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@gitfav:")) || [];
  }

  save() {
    localStorage.setItem("@gitfav:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("Usuário já cadastrado");
      }

      const user = await githubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}

export class favoritesView extends favorites {
  constructor(page) {
    super(page);

    this.tbody = this.page.querySelector("table tbody");

    this.update();
    this.onadd();
  }

  onadd() {
    const favButton = this.page.querySelector(".git-search button");
    favButton.onclick = () => {
      const { value } = this.page.querySelector(".git-search input");

      this.add(value);
    };
  }

  update() {
    this.removeAlltr();
    this.updateEmptyPage();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("deseja deletar essa linha?");

        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="user">
        <img src="https://github.com/chiquettomat.png" alt="" />
        <a href="https://github.com/chiquettomat" target="_blank">
          <p>Matheus Chiquetto</p>
          <span>/ChiquettoMat</span>
        </a>
      </td>
      <td class="repositories">33</td>
      <td class="followers">200</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `;

    return tr;
  }

  removeAlltr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
