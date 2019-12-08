import Constants from '../constants.js';

export default class IsometricRender
{
    constructor() {
        this.entities = [];
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    addEntities(entities) {
        entities.forEach(entity => {
            if (entity) {
                this.entities.push(entity);
            }
        });
    }

    removeEntity(entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
    }

    bind(scene) {
        scene.game.events.on('prerender', this.project, this);
        scene.game.events.on('postrender', this.unproject, this);
    }

    unbind(scene) {
        scene.game.events.off('prerender', this.project, this);
        scene.game.events.off('postrender', this.unproject, this);
    }

    depthSort() {
        this.entities.forEach(function (entity) {
            if (!entity || entity.noDepthSort) {
                return;
            }
            if (entity.setDepth) {
                entity.setDepth(Constants.Depths.ACTORS + entity.y);
            } else {
                console.log(entity);
            }
        });
    }

    project() {
        this.entities.forEach(function (entity) {
            entity.oldX = entity.x;
            entity.oldY = entity.y;

            entity.x = entity.x - entity.y;
            entity.y = (entity.oldX + entity.y) / 2;

            entity.x += Constants.Game.WIDTH / 2;
            entity.y += Constants.Game.HEIGHT / 2;

            if (entity.isoZ) {
                entity.y -= entity.isoZ;
            }
        });

        this.depthSort();
    }

    unproject() {
        this.entities.forEach(function (entity) {
            entity.x = entity.oldX;
            entity.y = entity.oldY;
        });
    }
}