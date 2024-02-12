import Phaser from 'phaser';
import io from 'socket.io-client';

export default class LobbyList extends Phaser.Scene {
  constructor() {
    super('LobbyList');
  }

  preload() {
    this.load.html('lobbyForm', 'assets/html/lobbyForm.html');
  }

  create() {
    this.socket = io();
    this.lockIcon = "🔒";

    this.createLobbyListContainer();
    this.createJoinLobbyForm();
    this.createCreateLobbyForm();
    this.listenForServerEvents();
  }

  createLobbyListContainer() {
    // Create empty slots
    for (let i = 0; i < 8; i++) {
      let slot = this.add.rectangle(0, 40 * i, this.scale.width, 40, 0xffffff);
      slot.setOrigin(0);
      let text = this.add.text(10, 40 * i + 20, '', { fontSize: '16px', color: '#000000' });
      text.setOrigin(0, 0.5);
      slot.setData('text', text);
    }

    // Update lobby list when a new list is received
    this.socket.on('updateLobbyList', (lobbyList) => {
      this.updateLobbyList(lobbyList);
    });
  }

  createJoinLobbyForm() {
    this.joinLobbyForm = this.add.dom(this.scale.width / 2, this.scale.height * 0.75).createFromCache('lobbyForm');
    this.joinLobbyForm.setPerspective(800);
    this.joinLobbyForm.addListener('click');

    this.joinLobbyForm.on('click', (event) => {
      if (event.target.name === 'joinLobbyButton') {
        const lobbyName = this.joinLobbyForm.getChildByName('lobbyName').value;
        const lobbyPassword = this.joinLobbyForm.getChildByName('lobbyPassword').value;

        if (lobbyName !== '') {
          this.socket.emit('joinLobby', { lobbyName, lobbyPassword });
        }
      }
    });
  }

  createCreateLobbyForm() {
    this.createLobbyForm = this.add.dom(this.scale.width / 2, this.scale.height * 0.85).createFromCache('lobbyForm');
    this.createLobbyForm.setPerspective(800);
    this.createLobbyForm.addListener('click');

    this.createLobbyForm.on('click', (event) => {
      if (event.target.name === 'createLobbyButton') {
        const lobbyName = this.createLobbyForm.getChildByName('lobbyName').value;
        const lobbyPassword = this.createLobbyForm.getChildByName('lobbyPassword').value;

        if (lobbyName !== '') {
          this.socket.emit('createLobby', { lobbyName, lobbyPassword });
        }
      }
    });
  }

  listenForServerEvents() {
    this.socket.on('lobbyJoined', (data) => {
      // pass data to lobby
      this.scene.start('Lobby');
    });

    this.socket.on('lobbyCreated', (data) => {
      // pass data to lobby
      this.scene.start('Lobby');
    });

    this.socket.on('joinError', (errorMessage) => {
      alert(errorMessage);
    });
  }

  updateLobbyList(lobbyList) {
    for (let i = 0; i < 8; i++) {
      const slot = this.add.rectangle(0, 40 * i, this.scale.width, 40, 0xffffff);
      const text = slot.getData('text');
      if (i < lobbyList.length) {
        const lobby = lobbyList[i];
        const displayText = lobby.passwordProtected ? `${this.lockIcon} ${lobby.name}` : lobby.name;
        text.setText(displayText);
      } else {
        text.setText('');
      }
    }
  }
}