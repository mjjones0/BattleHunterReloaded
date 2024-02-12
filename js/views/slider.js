export default class Slider {
    constructor(scene, x, y, width, notchSize, min, max) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.notchSize = notchSize;
        this.min = min;
        this.max = max;
        this.value = min;

        // Create a container
        this.container = this.scene.add.container(x, y);

        // Create the bar
        this.bar = this.scene.add.rectangle(0, 0, width, 10, 0x888888);
        this.container.add(this.bar);

        // Create the notch
        this.notch = this.scene.add.rectangle(0, 0, notchSize, 20, 0xffffff);
        this.notch.setInteractive({ draggable: true });
        this.container.add(this.notch);

        // Dragging logic
        this.notch.on('drag', (pointer, dragX, dragY) => {
            this.setValueBasedOnNotchPosition(dragX);
        });
    }

    setValueBasedOnNotchPosition(dragX) {
        // Clamp the dragX within the bar's width
        dragX = Phaser.Math.Clamp(dragX, -this.width / 2, this.width / 2);
    
        // Set the notch's position
        this.notch.x = dragX;
    
        // Convert the position to a value
        let percent = (dragX + this.width / 2) / this.width;
        let newValue = Phaser.Math.Linear(this.min, this.max, percent);
    
        // Round the value to the nearest integer
        this.value = Math.round(newValue);
    }
    

    // Getter and setter for value
    setValue(value) {
        // Clamp and round the incoming value
        let clampedValue = Phaser.Math.Clamp(value, this.min, this.max);
        this.value = Math.round(clampedValue);
    
        let percent = (this.value - this.min) / (this.max - this.min);
        this.notch.x = Phaser.Math.Linear(-this.width / 2, this.width / 2, percent);
    }
    

    getValue() {
        return this.value;
    }

    // Setters for min and max
    setMin(min) {
        this.min = min;
        this.setValue(this.value); // Update value to reflect new min
    }

    setMax(max) {
        this.max = max;
        this.setValue(this.value); // Update value to reflect new max
    }

    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
}
