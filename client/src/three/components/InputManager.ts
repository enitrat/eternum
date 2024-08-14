import { SceneName } from "@/types";
import * as THREE from "three";
import { SceneManager } from "../SceneManager";

type ListenerTypes = "click" | "mousemove" | "contextmenu" | "dblclick" | "mousedown";

export class InputManager {
  private listeners: Array<{ event: ListenerTypes; handler: (e: MouseEvent) => void }> = [];
  private isDragged = false;
  private clickTimer: NodeJS.Timeout | null = null; // Add this property

  constructor(
    private sceneName: SceneName,
    private sceneManager: SceneManager,
    private raycaster: THREE.Raycaster,
    private mouse: THREE.Vector2,
    private camera: THREE.Camera,
  ) {
    window.addEventListener("mousedown", this.handleMouseDown.bind(this));
  }

  addListener(event: ListenerTypes, callback: (raycaster: THREE.Raycaster) => void): void {
    const handler = (e: MouseEvent) => {
      if (this.sceneManager.getCurrentScene() !== this.sceneName) {
        return;
      }

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (event === "click") {
        if (this.isDragged) {
          this.isDragged = false;
          return;
        }
        // Check if a double-click occurred
        if (this.clickTimer) {
          clearTimeout(this.clickTimer);
          this.clickTimer = null;
          return; // Suppress the click event
        }
        // Set a timer to check for double-click
        this.clickTimer = setTimeout(() => {
          this.clickTimer = null;
          callback(this.raycaster);
        }, 200); // Adjust the delay as needed
      } else {
        callback(this.raycaster);
      }
    };
    this.listeners.push({ event, handler });
    window.addEventListener(event, handler);
  }

  restartListeners(): void {
    for (const listener of this.listeners) {
      window.addEventListener(listener.event, listener.handler);
    }
  }

  pauseListeners(): void {
    for (const listener of this.listeners) {
      window.removeEventListener(listener.event, listener.handler);
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    this.isDragged = false;
    const checkDrag = (e: MouseEvent) => {
      if (Math.abs(mouseX - e.clientX) > 10 || Math.abs(mouseY - e.clientY) > 10) {
        this.isDragged = true;
        window.removeEventListener("mousemove", checkDrag);
      }
    };
    window.addEventListener("mousemove", checkDrag);
    window.addEventListener(
      "mouseup",
      () => {
        window.removeEventListener("mousemove", checkDrag);
      },
      { once: true },
    );
  }
}
