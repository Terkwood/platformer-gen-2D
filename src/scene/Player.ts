import {vec2, vec3} from 'gl-matrix';
import GameObject from '../engine/GameObject';
import sceneAttributes from './SceneAttributes';
import Particle from './Particle';
import {spriteCoordinates} from '../constants';

const WALK_CYCLE_LENGTH: number = 10;

class Player extends GameObject {

    // Whether or not the player is affecting their jump by holding the jump button
    jumping: boolean;

    // The amount of time the player has been holding the jump button
    jumpTime: number;

    // Prevents the player from regrounding the frist frame of a jump
    groundedImmunity: boolean;

    // The direction the player is currently facing: 1 for right, -1 for left
    direction: number;

    // The current frame of the player's walk cycle
    walkFrame: number;

    // Whether or not the player is moving horizontally
    moving: boolean;

    aPressed: boolean;
    dPressed: boolean;
    sPressed: boolean;

    private idleTime: number;
    private zTime: number;

    constructor() {
        super(true);
        this.jumping = false;
        this.groundedImmunity = false;
        this.direction = 1;
        this.walkFrame = 0;
        this.moving = false;
        this.aPressed = false;
        this.dPressed = false;
        this.sPressed = false;
        this.setPosition([0, 0]);
        this.idleTime = 0;
        this.zTime = 0;
    }

    onUpdate(delta: number) {
        if (this.jumping) {
            // I have decided to perform this operation in units of frames instead of seconds to ensure
            // that the jump height is consistent. It makes geometry generator calculations easier too
            this.jumpTime -= 0.016;
            let t = Math.max(0, this.jumpTime / 0.4);
            this.inputVelocity[1] = t * sceneAttributes.playerJump;
        }
        if (this.jumpTime <= 0 || (this.isGrounded && !this.groundedImmunity)) {
            this.jumping = false;
        }
        this.groundedImmunity = false;

        if (!this.aPressed && !this.dPressed || (this.aPressed && this.dPressed)) {
            this.moving = false;
        } 

        if (this.moving) {
            this.walkFrame++;
        }
        else {
            this.walkFrame = 0;
        };

        if (this.getPosition()[1] < sceneAttributes.deathHeight) {
            this.setPosition([0, 0]);
        }

        if (!this.isGrounded || this.sPressed || this.moving) {
            this.idleTime = 0;
        }
        else {
            this.idleTime += delta;
        }

        if (this.idleTime > 20) {
            if (this.zTime > 2) {
                let z: Particle = new Particle(
                    spriteCoordinates.SPRITE_Z,
                    vec2.fromValues(this.getPosition()[0], this.getPosition()[1]),
                    3.5
                )
                z.setMovement((time: number) => {
                    if (time > 1) {
                        z.scale(0.99);
                    }
                    return vec2.fromValues(time, Math.sin(time * 3) * 0.3 + time);
                })
                this.zTime = 0;
            }
            this.zTime += delta;
        }
        else {
            this.zTime = 0;
        }
    }

    onKeyPress(key: string) {
        let playerMovement = this.isGrounded ? sceneAttributes.playerSpeed : sceneAttributes.playerSpeed;
        if (key === "a") {
            vec2.add(this.inputVelocity, this.inputVelocity, vec2.fromValues(-playerMovement, 0));
            this.direction = -1;
            this.moving = true;
        }
        else if (key === "d") {
            vec2.add(this.inputVelocity, this.inputVelocity, vec2.fromValues(playerMovement, 0));
            this.direction = 1;
            this.moving = true;
        }
    }

    onKeyDown(key: string) {
        if (key === 'w' && this.isGrounded) {
            this.jumping = true;
            this.jumpTime = sceneAttributes.maxJumpHold;
            this.groundedImmunity = true;
        }
        else if (key === 'a') {
            this.aPressed = true;
        }
        else if (key === 'd') {
            this.dPressed = true;
        }
        else if (key === 's') {
            this.sPressed = true;
        }
    }

    onKeyUp(key: string) {
        if (key === 'w') {
            this.jumping = false;
            this.jumpTime = 0;
        }
        else if (key === 'a') {
            this.aPressed = false;
        }
        else if (key === 'd') {
            this.dPressed = false;
        }
        else if (key === 's') {
            this.sPressed = false;
        }
    }

    getSpriteUv() {
        if (!this.isGrounded) {
            return spriteCoordinates.SPRITE_PLAYER_JUMP;
        }
        else if (this.moving) {
            return this.walkFrame % WALK_CYCLE_LENGTH < WALK_CYCLE_LENGTH / 2 ?
                spriteCoordinates.SPRITE_PLAYER_WALK_1 : 
                spriteCoordinates.SPRITE_PLAYER_WALK_2;
        }
        else if (this.sPressed) {
            return spriteCoordinates.SPRITE_PLAYER_CROUCH;
        }
        else if (this.idleTime >= 20) {
            return spriteCoordinates.SPRITE_PLAYER_IDLE2;
        }
        else if (this.idleTime >= 10) {
            return spriteCoordinates.SPRITE_PLAYER_IDLE1;
        }
        return spriteCoordinates.SPRITE_PLAYER_STAND;
    }
}

export default Player;