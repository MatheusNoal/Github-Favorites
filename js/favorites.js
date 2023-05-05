import { GithubUser } from "./githubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      if (!username) {
        throw new Error('Por favor, digite o nome do usuário que deseja favoritar')
      }

      const user = await GithubUser.search(username)
      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      const confirmed = await new Promise((resolve) => {
        if (confirm(`Deseja adicionar o usuário ${username}?`)) {
          const userExists = this.entries.find(entry => entry.login === username)
          if (userExists) {
            throw new Error('Usuário já cadastrado')
          }
          this.entries = [user, ...this.entries]
          this.update()
          this.save()
          resolve(true)
        } else {
          resolve(false)
        }
      })

      if (confirmed) {
        alert(`Usuário ${username} adicionado com sucesso!`)
      } else {
        alert(`Adição do usuário ${username} cancelada.`)
      }

    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry =>
      entry.login !== user.login)
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    const input = this.root.querySelector('.search input')

    const addUser = () => {
      const { value } = input
      this.add(value)
    }

    addButton.addEventListener('click', addUser)
    input.addEventListener('keypress', event => {
      if (event.keyCode === 13) {
        addUser()
      }
    })
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      row.querySelector('.remove').onclick = () => {
        const confirmDelete = confirm('Tem certeza que deseja deletar essa linha?')
        if (confirmDelete) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')
    tr.innerHTML = `
    <td class="user">
      <img src="https://github.com/matheusnoal.png" alt="Imagem de Matheus Noal">
      <a href="https://github.com/matheusnoal" target="_blank">
        <p>Matheus Noal</p>
        <span>matheusnoal</span>
      </a>
    </td>

    <td class="repositories">
      123
    </td>
    <td class="followers">
      1234
    </td>
    <td class="ação">
      <button class="remove">Remover</button>
    </td>`

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove()
    })
  }
}