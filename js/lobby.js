import Phaser from 'phaser';
import io from 'socket.io-client';

export default class Lobby extends Phaser.Scene {
  constructor() {
    super('Lobby');
  }

  init(data) {
    this.lobbyData = data;
  }

  preload() {
    this.load.html('playerSlot', 'assets/html/playerSlot.html');
  }

  create() {
    this.socket = io();
    this.createLobbyInfo();
    this.createPlayerSlots();
    this.createBottomButtons();
    this.listenForServerEvents();
  }

  createLobbyInfo() {
    this.add.text(10, 10, `Lobby Name: ${this.lobbyData.name}`, { fontSize: '16px' });
    this.add.text(this.scale.width / 2, 10, `Pass: ${this.lobbyData.password || 'None'}`, { fontSize: '16px' }).setOrigin(0.5, 0);
    this.playerCountText = this.add.text(this.scale.width - 10, 10, `${this.lobbyData.players.length}/4`, { fontSize: '16px' });
    this.playerCountText.setOrigin(1, 0);
  }

  createPlayerSlots() {
    this.playerSlots = [];

    for (let i = 0; i < 4; i++) {
      const slotY = 50 + i * 40;
      const slot = this.add.dom(10, slotY).createFromCache('playerSlot');
      this.playerSlots.push(slot);

      if (i < this.lobbyData.players.length) {
        this.updatePlayerSlot(i, this.lobbyData.players[i]);
      }
    }
  }

  createBottomButtons() {
    this.readyButton = this.add.text(10, this.scale.height - 30, '[Unready]', { fontSize: '16px' });
    this.readyButton.setInteractive();
    this.readyButton.on('pointerdown', () => {
      this.socket.emit('toggleReady');
    });

    this.startGameButton = this.add.text(this.scale.width / 2, this.scale.height - 30, '[Start Game]', { fontSize: '16px' });
    this.startGameButton.setOrigin(0.5, 0);
    this.startGameButton.setInteractive();
    this.startGameButton.on('pointerdown', () => {
      this.socket.emit('startGame');
    });

    this.leaveLobbyButton = this.add.text(this.scale.width - 10, this.scale.height - 30, '[Leave Lobby]', { fontSize: '16px' });
    this.leaveLobbyButton.setOrigin(1, 0);
    this.leaveLobbyButton.setInteractive();
    this.leaveLobbyButton.on('pointerdown', () => {
      this.socket.emit('leaveLobby');
    });
  }

  listenForServerEvents() {
    this.socket.on('updateLobby', (lobbyData) => {
      this.lobbyData = lobbyData;
      this.updateLobbyDisplay();
    });

    this.socket.on('kicked', () => {
      this.scene.start('LobbyList');
    });

    this.socket.on('lobbyClosed', () => {
      this.scene.start('LobbyList');
    });

    this.socket.on('gameStarting', () => {
      this.scene.start('Gameplay');
    });
  }

  updateLobbyDisplay() {
    this.playerCountText.setText(`${this.lobbyData.players.length}/4`);
    for (let i = 0; i < 4; i++) {
        if (i < this.lobbyData.players.length) {
          this.updatePlayerSlot(i, this.lobbyData.players[i]);
        } else {
          this.clearPlayerSlot(i);
        }
      }
    }

  updatePlayerSlot(index, playerData) {
    const slot = this.playerSlots[index];
    slot.getChildByID('playerName').innerText = playerData.name;
    slot.getChildByID('playerStatus').innerText = playerData.ready ? '[Ready]' : '[Not Ready]';
    const kickButton = slot.getChildByID('kickButton');
    if (playerData.host && playerData.id === this.socket.id) {
        kickButton.style.display = 'none';
    } else {
        kickButton.style.display = playerData.host ? 'none' : 'inline';
        kickButton.onclick = () => {
            this.socket.emit('kickPlayer', playerData.id);
        };
    }
  }

  clearPlayerSlot(index) {
    const slot = this.playerSlots[index];
    slot.getChildByID('playerName').innerText = '---------';
    slot.getChildByID('playerStatus').innerText = '-----';
    slot.getChildByID('kickButton').style.display = 'none';
  }
}